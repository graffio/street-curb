// ABOUTME: Parses QIF file content into structured data groups
// ABOUTME: Converts line-oriented QIF format into typed Entry objects by context

/*
 * QIF is a line-oriented format where each row of a file is a single-line entry or a multi-line "LineGroup" (my name)
 * Each row of a LineGroup specifies some attribute of the LineGroup, and the LineGroup as a whole is within some
 * overarching "context".
 *
 *   !Type:Prices                       <- set the current context to 'Prices'
 *   "ZS",184.45," 6/14'24"             <- Z indicates this is a Price, because it's in a 'Prices' context
 *   ^                                  <- ^ ends a LineGroup
 *
 * In this simple example, there are 2 LineGroups:
 *
 *   !Type:Prices                       <- First just sets context
 *   ["ZS",184.45," 6/14'24"]           <- Second has data
 *
 *
 * A LineGroup gets converted into an Entity based on the context; there are many Entities
 */

import { groupBy } from '@graffio/functional'
import { LineGroupToEntry } from '../line-group-to-entry.js'
import { QifEntry } from '../types/index.js'

const { lineGroupToEntry } = LineGroupToEntry

/*
 * These lines in a QIF file define the current context for lines that follow it; if you're in the Security context
 * you can expect that each lineGroup thereafter will have entries for a security until the context changes
 * Sometimes the context is set for a single LineGroup (Security and Prices) and sometimes for a slew of LineGroups
 */
const CONTEXTS = {
    '!Type:Bank': 'Bank',
    '!Type:Cash': 'Cash',
    '!Type:Cat': 'Category',
    '!Type:CCard': 'Credit Card',
    '!Type:Class': 'Class',
    '!Type:Invst': 'Investment',
    '!Type:Memorized': 'Memorized',
    '!Type:Oth A': 'Other Asset',
    '!Type:Oth L': 'Other Liability',
    '!Type:Payee': 'Payees',
    '!Type:Port': 'Investment',
    '!Type:Prices': 'Prices',
    '!Type:Security': 'Security',
    '!Type:Tag': 'Tag',

    // probably not in Quicken Premier
    '!Type:Bill': 'Bill',
    '!Type:Budget': 'Budget',
    '!Type:Invitem': 'Invoice Item',
    '!Type:Invoice': 'Invoice Transactions',
    '!Type:Tax': 'Tax-related',
    '!Type:Template': 'Business Template',
}

// prettier-ignore
const TRANSACTION_CONTEXTS = [
    'Bank', 'Cash', 'Credit Card', 'Investment', 'Invoice', 'Other Asset', 'Other Liability'
]

const { Account, Category, Class: QifClass, Payee, Price, Security, Tag } = QifEntry
const { TransactionBank, TransactionInvestment } = QifEntry

const P = {
    // Checks if line is a context directive (!Type, !Option, !Clear)
    // @sig isContextDirective :: String -> Boolean
    isContextDirective: line => line.startsWith('!Type') || line.startsWith('!Option') || line.startsWith('!Clear'),
}

const T = {
    // Deduplicates array by key function, keeping first occurrence
    // @sig toUnique :: (a -> String) -> [a] -> [a]
    toUnique: keyFn => items => {
        const seen = new Set()
        return items.filter(item => !seen.has(keyFn(item)) && seen.add(keyFn(item)))
    },

    // Convert Date to ISO date string for use as dedup key
    // @sig toDateKey :: Date|String -> String
    toDateKey: date => (date instanceof Date ? date.toISOString().slice(0, 10) : String(date)),

    // Processes a single line, mutating groups and returning updated open array
    // @sig toNextOpen :: ([LineGroup], [String], String) -> [String]
    toNextOpen: (groups, open, line) => {
        if (P.isContextDirective(line)) {
            groups.push(line)
            return open
        }
        if (line === '^') {
            groups.push(open)
            return []
        }
        open.push(line)
        return open
    },

    // Classifies entry by QIF type to group key for sorting
    // @sig toEntryKey :: Entry -> String
    toEntryKey: entry => {
        if (Account.is(entry)) return 'accounts'
        if (Category.is(entry)) return 'categories'
        if (QifClass.is(entry)) return 'classes'
        if (Security.is(entry)) return 'securities'
        if (TransactionBank.is(entry)) return 'bankTransactions'
        if (TransactionInvestment.is(entry)) return 'investmentTransactions'
        if (Payee.is(entry)) return 'payees'
        if (Price.is(entry)) return 'prices'
        if (Tag.is(entry)) return 'tags'
        return 'others'
    },

    // Parses QIF text into LineGroups (mutable for performance with large files)
    // @sig groupLines :: String -> [LineGroup]
    groupLines: qifText => {
        const groups = []
        qifText
            .split('\n')
            .map(l => l.trim())
            .reduce((open, line) => T.toNextOpen(groups, open, line), [])
        return groups
    },

    // Applies !Option directive to state
    // @sig applyOption :: (State, String) -> State
    applyOption: ({ options, lineNumber, ...rest }, option) => ({
        ...rest,
        options: { ...options, [option.slice(8)]: true },
        lineNumber: lineNumber + 1,
    }),

    // Applies !Clear directive to state
    // @sig applyClear :: (State, String) -> State
    applyClear: ({ options, lineNumber, ...rest }, option) => ({
        ...rest,
        options: { ...options, [option.slice(7)]: false },
        lineNumber: lineNumber + 1,
    }),

    // Applies !Type context change to state
    // @sig applyContext :: (State, String) -> State
    applyContext: ({ lineNumber, ...rest }, header) => {
        if (!CONTEXTS[header]) throw new Error(`Don't understand context: ${header}`)
        return { ...rest, context: CONTEXTS[header], lineNumber: lineNumber + 1 }
    },

    // Applies !Account directive to state, creating account entry
    // @sig applyAccountContext :: (State, LineGroup) -> State
    applyAccountContext: (state, lineGroup) => {
        const { entries } = state
        const account = lineGroupToEntry('Account', undefined, lineGroup.slice(1))
        entries.push(account)
        return { ...state, context: 'Account', account }
    },

    // Processes a data LineGroup into entries (mutates entries array for performance)
    // @sig processDataLineGroup :: (State, LineGroup) -> State
    processDataLineGroup: (state, lineGroup) => {
        const { context, account, lineNumber, entries } = state
        if (TRANSACTION_CONTEXTS.includes(context) && !account)
            throw new Error(`Transaction in ${context} context but no current account; line ${lineNumber}`)

        const result = lineGroupToEntry(context, account, lineGroup)
        if (Array.isArray(result)) result.forEach(r => entries.push(r))
        else entries.push(result)
        return { ...state, lineNumber: lineNumber + lineGroup.length + 1 }
    },

    // Processes LineGroups into grouped entries using reduce with explicit state
    // @sig toEntries :: [LineGroup] -> GroupedEntries
    toEntries: lineGroups => {
        // Reducer that dispatches each LineGroup to appropriate state transformer
        // @sig processLineGroup :: (State, LineGroup) -> State
        const processLineGroup = (state, lineGroup) => {
            if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Option')) return T.applyOption(state, lineGroup)
            if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Clear')) return T.applyClear(state, lineGroup)
            if (!Array.isArray(lineGroup) && lineGroup.startsWith('!Type')) return T.applyContext(state, lineGroup)
            if (Array.isArray(lineGroup) && lineGroup[0] === '!Account') return T.applyAccountContext(state, lineGroup)
            if (Array.isArray(lineGroup)) return T.processDataLineGroup(state, lineGroup)

            throw new Error(`Don't understand lineGroup: ${lineGroup}`)
        }

        const initialState = { context: null, account: null, options: {}, lineNumber: 1, entries: [] }
        const finalState = lineGroups.reduce(processLineGroup, initialState)
        const entries = finalState.entries.filter(e => e)

        const grouped = groupBy(T.toEntryKey, entries)

        // prettier-ignore
        const { accounts, bankTransactions, categories, classes, investmentTransactions, others, payees, prices,
            securities, tags } = grouped

        V.validateAccountsExist(accounts, bankTransactions, investmentTransactions)

        // QIF format can have duplicates - deduplicate by appropriate key
        const uniqueByName = T.toUnique(x => x.name)
        const uniqueBySymbolDate = T.toUnique(p => `${p.symbol}|${T.toDateKey(p.date)}`)

        return {
            accounts: uniqueByName(accounts || []).sort((a, b) => a.name.localeCompare(b.name)),
            categories: uniqueByName(categories || []),
            classes: uniqueByName(classes || []),
            securities: uniqueByName(securities || []),
            bankTransactions: bankTransactions || [],
            investmentTransactions: investmentTransactions || [],
            payees: uniqueByName(payees || []),
            prices: uniqueBySymbolDate(prices || []),
            tags: uniqueByName(tags || []),
            others: others || [],
        }
    },
}

const V = {
    // Validates parsed QIF data has required relationships
    // @sig validateDataIntegrity :: (Accounts, Securities, BankTx, InvestTx) -> void
    validateDataIntegrity: (accounts, securities, bankTransactions, investmentTransactions) => {
        const hasInvestmentTx = investmentTransactions?.length > 0
        const hasBankTx = bankTransactions?.length > 0
        const hasAccounts = accounts?.length > 0
        const hasSecurities = securities?.length > 0

        if (hasInvestmentTx && !hasAccounts) throw new Error('Investment transactions found but no accounts.')
        if (hasInvestmentTx && !hasSecurities) throw new Error('Investment transactions but no securities.')
        if ((hasBankTx || hasInvestmentTx) && !hasAccounts)
            throw new Error('Transactions found but no accounts defined.')

        if (hasBankTx && bankTransactions.some(t => !t.account))
            throw new Error('Found bank transactions without account information')
        if (hasInvestmentTx && investmentTransactions.some(t => !t.account))
            throw new Error('Found investment transactions without account information')
    },

    // Validates accounts exist when transactions are present
    // @sig validateAccountsExist :: (Accounts, BankTx, InvestTx) -> void
    validateAccountsExist: (accounts, bankTransactions, investmentTransactions) => {
        if (!accounts && (bankTransactions?.length > 0 || investmentTransactions?.length > 0))
            throw new Error('QIF file contains transactions but no accounts.')
    },
}

// Parses QIF file text into structured data
// @sig parseQifData :: String -> ParsedQifData
const parseQifData = qifText => {
    const lineGroups = T.groupLines(qifText)
    const data = T.toEntries(lineGroups)
    const { accounts, securities, bankTransactions, investmentTransactions } = data
    V.validateDataIntegrity(accounts, securities, bankTransactions, investmentTransactions)
    return data
}

const ParseQifData = { parseQifData }
export { ParseQifData }
