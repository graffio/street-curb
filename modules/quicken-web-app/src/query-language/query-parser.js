// ABOUTME: Recursive descent parser for the financial query language
// ABOUTME: Transforms query string → QueryIR with Computation type constructors

import { LookupTable } from '@graffio/functional'
import { Computation } from '../types/computation.js'
import { DateRange } from '../types/date-range.js'
import { Domain } from '../types/domain.js'
import { ExpressionNode } from '../types/expression-node.js'
import { QueryFilter } from '../types/query-filter.js'
import { QueryOutput } from '../types/query-output.js'
import { QuerySource } from '../types/query-source.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    isWhitespace: ch => /\s/.test(ch),
    isDigit: ch => /[0-9]/.test(ch),
    isWordStart: ch => /[a-zA-Z_]/.test(ch),
    isWordContinue: ch => /[a-zA-Z0-9_]/.test(ch),
    isSymbolChar: ch => '{}(),./*+->:='.includes(ch),
    isQuarterToken: value => /^Q[1-4]$/i.test(value),
    isMonthName: value => MONTHS[value.toLowerCase()] !== undefined,
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

// Recursive descent parser uses closured functions that share mutable cursor state (pos, line, col).
// This is the standard architecture for hand-written parsers — inner functions cannot be extracted
// to top-level cohesion groups without threading all shared state as parameters.

const T = {
    // Tokenize input string into typed token objects with position tracking
    // @sig parseTokens :: String -> [Object]
    parseTokens: input => {
        const peek = () => input[pos]
        const peekAt = offset => input[pos + offset]

        // Consume current character, updating line/col tracking
        // @sig advance :: () -> String
        const advance = () => {
            const ch = input[pos++]
            if (ch === '\n') {
                line++
                col = 1
            } else {
                col++
            }
            return ch
        }

        const skipComment = () => {
            if (pos >= input.length || peek() === '\n') return
            advance()
            skipComment()
        }

        // Process backslash escape sequence, validating against whitelist
        // @sig handleEscape :: (Number, Number) -> String
        const handleEscape = (startLine, startCol) => {
            advance()
            if (pos >= input.length)
                throw F.makeError('Unterminated string literal', F.token(undefined, undefined, startLine, startCol))
            const ch = peek()
            const mapped = ESCAPE_SEQUENCES[ch]
            if (mapped === undefined)
                throw F.makeError(`Unknown escape sequence '\\${ch}'`, F.token(undefined, undefined, line, col - 1))
            advance()
            return mapped
        }

        // Scan a quoted string literal with escape handling
        // @sig scanString :: (Number, Number) -> String
        const scanString = (startLine, startCol) => {
            // Accumulate characters until closing quote
            // @sig collectChars :: String -> String
            const collectChars = chars => {
                if (pos >= input.length)
                    throw F.makeError('Unterminated string literal', F.token(undefined, undefined, startLine, startCol))
                if (peek() === '"') {
                    advance()
                    return chars
                }
                if (peek() === '\\') return collectChars(chars + handleEscape(startLine, startCol))
                return collectChars(chars + advance())
            }
            return collectChars('')
        }

        const scanNumber = value => {
            if (pos >= input.length || !P.isDigit(peek())) return parseInt(value, 10)
            return scanNumber(value + advance())
        }

        const scanWord = value => {
            if (pos >= input.length || !P.isWordContinue(peek())) return value
            return scanWord(value + advance())
        }

        // Recursively consume input characters, dispatching to type-specific scanners
        // @sig scanTokens :: () -> [Token]
        const scanTokens = () => {
            if (pos >= input.length) {
                tokens.push(F.token('EOF', undefined, line, col))
                return tokens
            }

            if (P.isWhitespace(peek())) {
                advance()
                return scanTokens()
            }

            // Comment: -- to end of line
            if (peek() === '-' && peekAt(1) === '-') {
                skipComment()
                return scanTokens()
            }

            const startLine = line
            const startCol = col

            // String literal
            if (peek() === '"') {
                advance()
                const value = scanString(startLine, startCol)
                tokens.push(F.token('STRING', value, startLine, startCol))
                return scanTokens()
            }

            // Number
            if (P.isDigit(peek())) {
                const value = scanNumber(advance())
                tokens.push(F.token('NUMBER', value, startLine, startCol))
                return scanTokens()
            }

            // Word
            if (P.isWordStart(peek())) {
                const value = scanWord(advance())
                tokens.push(F.token('WORD', value, startLine, startCol))
                return scanTokens()
            }

            // Symbols
            if (P.isSymbolChar(peek())) {
                tokens.push(F.token('SYMBOL', advance(), startLine, startCol))
                return scanTokens()
            }

            throw F.makeError(`Unexpected character '${peek()}'`, F.token(undefined, undefined, line, col))
        }

        const tokens = []
        let pos = 0
        let line = 1
        let col = 1

        return scanTokens()
    },

    // Parse token stream into QueryIR structure
    // @sig parseQueryString :: String -> QueryIR
    parseQueryString: input => {
        // ── Token navigation ──

        const current = () => tokens[pos]
        const peek = (offset = 0) => tokens[pos + offset]
        const advance = () => tokens[pos++]
        const isEOF = () => current().type === 'EOF'

        const isWord = value => current().type === 'WORD' && (value === undefined || current().value === value)
        const isSymbol = value => current().type === 'SYMBOL' && (value === undefined || current().value === value)
        const isNumber = () => current().type === 'NUMBER'
        const isString = () => current().type === 'STRING'

        // ── Expect helpers ──

        // Consume expected word token or throw with position
        // @sig expectWord :: String? -> String
        const expectWord = value => {
            if (!isWord(value)) {
                const expected = value ? `'${value}'` : 'a word'
                throw F.makeError(`Expected ${expected}, got '${current().value ?? current().type}'`, current())
            }
            return advance().value
        }

        const expectSymbol = value => {
            if (!isSymbol(value))
                throw F.makeError(`Expected '${value}', got '${current().value ?? current().type}'`, current())
            return advance().value
        }

        const expectNumber = () => {
            if (!isNumber())
                throw F.makeError(`Expected a number, got '${current().value ?? current().type}'`, current())
            return advance().value
        }

        const expectString = () => {
            if (!isString())
                throw F.makeError(`Expected a quoted string, got '${current().value ?? current().type}'`, current())
            return advance().value
        }

        // Consume and validate domain keyword (transactions, accounts, holdings)
        // @sig expectDomain :: () -> String
        const expectDomain = () => {
            const word = expectWord()
            const constructor = DOMAIN_MAP[word]
            if (!constructor)
                throw F.makeError(`Expected a domain (${Object.keys(DOMAIN_MAP).join(', ')}), got '${word}'`, peek(-1))
            return constructor()
        }

        // ── Look-ahead ──

        const isSubQueryStart = () => isWord() && peek(1).type === 'SYMBOL' && peek(1).value === ':'

        // ── Date range parsing ──

        const pad2 = n => String(n).padStart(2, '0')

        // Parse YYYY-MM-DD date literal
        // @sig parseIsoDate :: () -> String
        const parseIsoDate = () => {
            const year = expectNumber()
            expectSymbol('-')
            const month = expectNumber()
            expectSymbol('-')
            const day = expectNumber()
            return `${year}-${pad2(month)}-${pad2(day)}`
        }

        // Parse ISO range after initial year number and dash have been identified
        // @sig parseIsoRangeFromYear :: Number -> DateRange
        const parseIsoRangeFromYear = num => {
            advance()
            const month1 = expectNumber()
            expectSymbol('-')
            const day1 = expectNumber()
            const start = `${num}-${pad2(month1)}-${pad2(day1)}`
            expectWord('to')
            const end = parseIsoDate()
            return DateRange.Range(start, end)
        }

        // Parse 'last N units' or 'last name' relative date
        // @sig parseLastDateRange :: () -> DateRange
        const parseLastDateRange = () => {
            if (isNumber()) {
                const count = advance().value
                const unit = expectWord()
                return DateRange.Relative(unit, count)
            }
            const name = expectWord()
            return DateRange.Named(`last_${name}`)
        }

        // Dispatch date range parsing based on leading token
        // @sig parseDateRange :: () -> DateRange
        const parseDateRange = () => {
            if (isNumber()) {
                const num = advance().value
                return isSymbol('-') ? parseIsoRangeFromYear(num) : DateRange.Year(num)
            }

            if (!isWord()) throw F.makeError(`Expected a date range, got '${current().value}'`, current())

            const word = current().value

            if (P.isQuarterToken(word)) {
                advance()
                const quarter = parseInt(word[1], 10)
                const year = expectNumber()
                return DateRange.Quarter(quarter, year)
            }

            if (P.isMonthName(word)) {
                advance()
                const month = MONTHS[word.toLowerCase()]
                const year = expectNumber()
                return DateRange.Month(month, year)
            }

            if (word === 'last') {
                advance()
                return parseLastDateRange()
            }

            if (word === 'trailing') {
                advance()
                const count = expectNumber()
                const unit = expectWord()
                return DateRange.Relative(unit, count)
            }

            if (word === 'this') {
                advance()
                const unit = expectWord()
                return DateRange.Named(`this_${unit}`)
            }

            if (word === 'year') {
                advance()
                expectWord('to')
                expectWord('date')
                return DateRange.Named('year_to_date')
            }

            throw F.makeError(`Expected a date range, got '${word}'`, current())
        }

        // ── Filter parsing ──

        // Parse 'last activity > N days ago' filter
        // @sig parseLastActivityFilter :: () -> QueryFilter
        const parseLastActivityFilter = () => {
            advance()
            advance()
            expectSymbol('>')
            const days = expectNumber()
            expectWord('days')
            expectWord('ago')
            return QueryFilter.OlderThan('lastActivity', days)
        }

        // Parse 'account type = "value"' two-word field filter
        // @sig parseAccountTypeFilter :: () -> QueryFilter
        const parseAccountTypeFilter = () => {
            advance()
            advance()
            expectSymbol('=')
            const value = expectString()
            return QueryFilter.Equals('accountType', value)
        }

        // Dispatch filter parsing based on leading tokens
        // @sig parseFilter :: () -> QueryFilter
        const parseFilter = () => {
            if (isWord('last') && peek(1).type === 'WORD' && peek(1).value === 'activity')
                return parseLastActivityFilter()

            if (isWord('account') && peek(1).type === 'WORD' && peek(1).value === 'type')
                return parseAccountTypeFilter()

            const field = expectWord()
            expectSymbol('=')
            const value = expectString()
            return QueryFilter.Equals(field, value)
        }

        // ── Expression parsing ──

        const parseExpr = () => parseAddSub()

        // Left-recursive addition/subtraction with correct precedence
        // @sig parseAddSubRest :: ExpressionNode -> ExpressionNode
        const parseAddSubRest = left => {
            if (!isSymbol('+') && !isSymbol('-')) return left
            const op = advance().value
            const right = parseMulDiv()
            return parseAddSubRest(ExpressionNode.Binary(op, left, right))
        }

        const parseAddSub = () => parseAddSubRest(parseMulDiv())

        // Left-recursive multiplication/division with correct precedence
        // @sig parseMulDivRest :: ExpressionNode -> ExpressionNode
        const parseMulDivRest = left => {
            if (!isSymbol('*') && !isSymbol('/')) return left
            const op = advance().value
            const right = parsePrimary()
            return parseMulDivRest(ExpressionNode.Binary(op, left, right))
        }

        const parseMulDiv = () => parseMulDivRest(parsePrimary())

        const collectArgs = args => {
            if (!isSymbol(',')) return args
            advance()
            return collectArgs([...args, parseExpr()])
        }

        // Parse word-starting primary: function call or source.field ref
        // @sig parseWordPrimary :: () -> ExpressionNode
        const parseWordPrimary = () => {
            const name = advance().value

            if (isSymbol('(')) {
                advance()
                const args = isSymbol(')') ? [] : collectArgs([parseExpr()])
                expectSymbol(')')
                return ExpressionNode.Call(name, args)
            }

            if (isSymbol('.')) {
                advance()
                const field = expectWord()
                return ExpressionNode.Reference(name, field)
            }

            throw F.makeError(`Expected '(' or '.' after '${name}' in expression`, current())
        }

        // Parse primary expression: parenthesized, literal, or word-starting
        // @sig parsePrimary :: () -> ExpressionNode
        const parsePrimary = () => {
            if (isSymbol('(')) {
                advance()
                const expr = parseExpr()
                expectSymbol(')')
                return expr
            }

            if (isNumber()) return ExpressionNode.Literal(advance().value)
            if (isWord()) return parseWordPrimary()

            throw F.makeError(`Unexpected token '${current().value ?? current().type}' in expression`, current())
        }

        // ── Field list parsing ──

        const collectFields = fields => {
            if (!isSymbol(',')) return fields
            advance()
            return collectFields([...fields, expectWord()])
        }

        const parseFieldList = () => collectFields([expectWord()])

        // ── Body parsing ──

        // Parse query body: sources, clauses, computation, and output directives
        // @sig parseBody :: () -> {sources, computation, output}
        const parseBody = () => {
            // Flush current source into sources array and reset accumulator
            // @sig saveCurrentSource :: () -> ()
            const saveCurrentSource = () => {
                if (!currentSource && !currentSourceName) return
                if (!currentSource || !currentSourceName)
                    throw new Error('Parser bug: currentSource and currentSourceName out of sync')
                const { domain, filters, dateRange, groupBy } = currentSource
                sourcesArray.push(QuerySource(currentSourceName, domain, filters, dateRange, groupBy))
                currentSource = undefined
                currentSourceName = undefined
            }

            // Parse named sub-query declaration (name: from domain)
            // @sig handleSubQueryStart :: () -> ()
            const handleSubQueryStart = () => {
                saveCurrentSource()
                const name = advance().value
                expectSymbol(':')
                expectWord('from')
                const domain = expectDomain()
                currentSourceName = name
                currentSource = F.makeSource(domain)
            }

            // Parse default 'from domain' clause
            // @sig handleFromClause :: () -> ()
            const handleFromClause = () => {
                saveCurrentSource()
                advance()
                const domain = expectDomain()
                currentSourceName = '_default'
                currentSource = F.makeSource(domain)
            }

            const handleWhereClause = () => {
                if (!currentSource) throw F.makeError("'where' clause without a preceding 'from'", current())
                advance()
                currentSource.filters.push(parseFilter())
            }

            const handleDateClause = () => {
                if (!currentSource) throw F.makeError("'date' clause without a preceding 'from'", current())
                advance()
                currentSource.dateRange = parseDateRange()
            }

            // Parse 'group by dimension' clause with dimension validation
            // @sig handleGroupClause :: () -> ()
            const handleGroupClause = () => {
                if (!currentSource) throw F.makeError("'group by' clause without a preceding 'from'", current())
                advance()
                expectWord('by')
                const dimension = expectWord()
                if (!GROUP_DIMENSIONS.includes(dimension))
                    throw F.makeError(
                        `Expected a group dimension (${GROUP_DIMENSIONS.join(', ')}), got '${dimension}'`,
                        peek(-1),
                    )
                currentSource.groupBy = dimension
            }

            // Parse 'compare left vs right' clause
            // @sig handleCompareClause :: () -> ()
            const handleCompareClause = () => {
                saveCurrentSource()
                advance()
                const left = expectWord()
                expectWord('vs')
                const right = expectWord()
                computation = Computation.Compare(left, right)
            }

            const handleComputeClause = () => {
                saveCurrentSource()
                advance()
                computation = Computation.Expression(parseExpr())
            }

            // Recursively dispatch clause keywords until closing brace
            // @sig parseClauses :: () -> ()
            const parseClauses = () => {
                if (isSymbol('}') || isEOF()) return

                if (isSubQueryStart()) {
                    handleSubQueryStart()
                    return parseClauses()
                }

                if (isWord('from')) {
                    handleFromClause()
                    return parseClauses()
                }

                if (isWord('where')) {
                    handleWhereClause()
                    return parseClauses()
                }

                if (isWord('date')) {
                    handleDateClause()
                    return parseClauses()
                }

                if (isWord('group')) {
                    handleGroupClause()
                    return parseClauses()
                }

                if (isWord('compare')) {
                    handleCompareClause()
                    return parseClauses()
                }

                if (isWord('compute')) {
                    handleComputeClause()
                    return parseClauses()
                }

                if (isWord('show')) {
                    advance()
                    rawOutput.show = parseFieldList()
                    return parseClauses()
                }

                if (isWord('format')) {
                    advance()
                    rawOutput.format = expectWord()
                    return parseClauses()
                }

                throw F.makeError(`Unexpected token '${current().value}'`, current())
            }

            // Derive computation type from primary source domain when not explicit
            // @sig inferComputation :: () -> Computation
            const inferComputation = () => {
                if (sourcesArray.length === 0) throw F.makeError('Query has no data sources', current())
                const primary = sourcesArray[0]
                return primary.domain.match({
                    Transactions: () => Computation.Identity(primary.name),
                    Accounts: () => Computation.FilterEntities(primary.name),
                    Holdings: () => Computation.Identity(primary.name),
                })
            }

            const sourcesArray = []
            let currentSourceName
            let currentSource
            let computation
            const rawOutput = {}

            parseClauses()
            saveCurrentSource()

            if (!computation) computation = inferComputation()
            const sources = LookupTable(sourcesArray, QuerySource, 'name')
            const { show, format } = rawOutput
            const output = show || format ? QueryOutput(show, format) : undefined

            return { sources, computation, output }
        }

        const tokens = T.parseTokens(input)
        let pos = 0

        expectWord('query')
        const name = expectWord()
        const description = expectString()
        expectSymbol('{')
        const { sources, computation, output } = parseBody()
        expectSymbol('}')

        if (!isEOF()) throw F.makeError(`Unexpected token '${current().value}' after query block`, current())

        return { name, description, sources, computation, output }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    token: (type, value, line, col) => ({ type, value, line, col }),

    // Create parse error with line/col position from token
    // @sig makeError :: (String, Token) -> Error
    makeError: (message, token) => {
        const tokenLine = token.line
        const tokenCol = token.col
        const loc = tokenLine ? `line ${tokenLine}, col ${tokenCol}` : 'end of input'
        const error = new Error(`Parse error at ${loc}: ${message}`)
        error.line = tokenLine
        error.col = tokenCol
        return error
    },

    makeSource: domain => ({ domain, filters: [], dateRange: undefined, groupBy: undefined }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MONTHS = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
}

const DOMAIN_MAP = { transactions: Domain.Transactions, accounts: Domain.Accounts, holdings: Domain.Holdings }
const GROUP_DIMENSIONS = ['month', 'quarter', 'year', 'category', 'account', 'security']

const ESCAPE_SEQUENCES = { n: '\n', t: '\t', '\\': '\\', '"': '"' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse a query string into a QueryIR
 * @sig queryParser :: String -> {success: Boolean, ir?: QueryIR, errors?: [{message, line, col}]}
 */
const queryParser = input => {
    try {
        const ir = T.parseQueryString(input)
        return { success: true, ir }
    } catch (caught) {
        const { message, line, col } = caught
        return { success: false, errors: [{ message, line, col }] }
    }
}

export { queryParser }
