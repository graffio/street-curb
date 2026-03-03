// ABOUTME: Safe expression evaluator — walks ExpressionNode AST via .match() against bound source values
// ABOUTME: Replaces eval() with constrained arithmetic: literals, refs, binary ops, abs()

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Resolve a source.field reference against bound values
    // @sig resolveReference :: ({source, field}, Object) -> Number
    resolveReference: ({ source, field }, boundValues) => {
        V.checkSourceExists(source, boundValues)
        const sourceObject = boundValues[source]
        V.checkFieldExists(field, source, sourceObject)
        return sourceObject[field]
    },

    // Resolve a binary operation (+, -, *, /) on two sub-expressions
    // @sig resolveBinary :: ({op, left, right}, Object, Number) -> Number
    resolveBinary: ({ op, left, right }, boundValues, depth) => {
        V.checkOperator(op)
        const leftVal = T.resolveNode(left, boundValues, depth + 1)
        const rightVal = T.resolveNode(right, boundValues, depth + 1)
        if (op === '/') V.checkDivisor(rightVal)
        return OPERATORS[op](leftVal, rightVal)
    },

    // Resolve a function call (e.g., abs) on its arguments
    // @sig resolveCall :: ({fn, args}, Object, Number) -> Number
    resolveCall: ({ fn, args }, boundValues, depth) => {
        V.checkFunctionName(fn)
        const resolvedArgs = args.map(arg => T.resolveNode(arg, boundValues, depth + 1))
        return FUNCTIONS[fn](...resolvedArgs)
    },

    // Recursively resolve an ExpressionNode against bound source values
    // @sig resolveNode :: (ExpressionNode, Object, Number) -> Number
    resolveNode: (node, boundValues, depth) => {
        V.checkDepth(depth)

        return node.match({
            Literal: ({ value }) => value,
            Reference: variant => T.resolveReference(variant, boundValues),
            Binary: variant => T.resolveBinary(variant, boundValues, depth),
            Call: variant => T.resolveCall(variant, boundValues, depth),
        })
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Ensure recursion depth has not exceeded the limit
    // @sig checkDepth :: Number -> undefined
    checkDepth: depth => {
        if (depth > MAX_DEPTH) throw new Error(`Expression evaluation exceeded maximum depth of ${MAX_DEPTH}`)
    },

    // Ensure divisor is not zero
    // @sig checkDivisor :: Number -> undefined
    checkDivisor: value => {
        if (value === 0) throw new Error('Division by zero in expression')
    },

    // Ensure source exists in bound values
    // @sig checkSourceExists :: (String, Object) -> undefined
    checkSourceExists: (source, boundValues) => {
        if (!(source in boundValues)) {
            const available = Object.keys(boundValues).join(', ')
            throw new Error(`Unknown source reference '${source}' — available sources: ${available || 'none'}`)
        }
    },

    // Ensure field exists on source object
    // @sig checkFieldExists :: (String, String, Object) -> undefined
    checkFieldExists: (field, source, sourceObject) => {
        if (!(field in sourceObject)) {
            const available = Object.keys(sourceObject).join(', ')
            throw new Error(`Unknown field '${field}' on source '${source}' — available fields: ${available || 'none'}`)
        }
    },

    // Ensure operator is supported
    // @sig checkOperator :: String -> undefined
    checkOperator: op => {
        if (!(op in OPERATORS)) {
            const supported = Object.keys(OPERATORS).join(', ')
            throw new Error(`Unknown operator '${op}' — supported: ${supported}`)
        }
    },

    // Ensure function name is supported
    // @sig checkFunctionName :: String -> undefined
    checkFunctionName: name => {
        if (!(name in FUNCTIONS)) {
            const supported = Object.keys(FUNCTIONS).join(', ')
            throw new Error(`Unknown function '${name}' — supported functions: ${supported}`)
        }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MAX_DEPTH = 100

const OPERATORS = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => a / b }

const FUNCTIONS = { abs: Math.abs }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Evaluate an ExpressionNode AST against a map of source values
// @sig resolveExpression :: (ExpressionNode, Object) -> Number
const resolveExpression = (ast, boundValues) => T.resolveNode(ast, boundValues, 0)
export { resolveExpression }
