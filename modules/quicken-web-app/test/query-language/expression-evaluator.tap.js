import { test } from 'tap'
import { IRExpression } from '../../src/query-language/types/index.js'
import { resolveExpression } from '../../src/query-language/resolve-expression.js'

const evaluate = resolveExpression

// AST node constructors using IRExpression TaggedSum
const literal = value => IRExpression.Literal(value)
const ref = (source, field) => IRExpression.Reference(source, field)
const binary = (op, left, right) => IRExpression.Binary(op, left, right)
const call = (fn, args) => IRExpression.Call(fn, args)

// ═════════════════════════════════════════════════
// (a) Literal numbers
// ═════════════════════════════════════════════════

test('Literal numbers', t => {
    t.test('Given an integer literal', t => {
        t.test('When evaluating', t => {
            const result = evaluate(literal(42), {})
            t.equal(result, 42, 'Then it returns the number')
            t.end()
        })
        t.end()
    })

    t.test('Given a decimal literal', t => {
        t.test('When evaluating', t => {
            const result = evaluate(literal(3.14), {})
            t.equal(result, 3.14, 'Then it returns the decimal')
            t.end()
        })
        t.end()
    })

    t.test('Given a zero literal', t => {
        t.test('When evaluating', t => {
            const result = evaluate(literal(0), {})
            t.equal(result, 0, 'Then it returns zero')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Binary operations
// ═════════════════════════════════════════════════

test('Binary operations', t => {
    t.test('Given an addition expression', t => {
        t.test('When evaluating 2 + 3', t => {
            const result = evaluate(binary('+', literal(2), literal(3)), {})
            t.equal(result, 5, 'Then it returns 5')
            t.end()
        })
        t.end()
    })

    t.test('Given a subtraction expression', t => {
        t.test('When evaluating 10 - 3', t => {
            const result = evaluate(binary('-', literal(10), literal(3)), {})
            t.equal(result, 7, 'Then it returns 7')
            t.end()
        })
        t.end()
    })

    t.test('Given a multiplication expression', t => {
        t.test('When evaluating 4 * 5', t => {
            const result = evaluate(binary('*', literal(4), literal(5)), {})
            t.equal(result, 20, 'Then it returns 20')
            t.end()
        })
        t.end()
    })

    t.test('Given a division expression', t => {
        t.test('When evaluating 10 / 2', t => {
            const result = evaluate(binary('/', literal(10), literal(2)), {})
            t.equal(result, 5, 'Then it returns 5')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Operator precedence
// ═════════════════════════════════════════════════

test('Operator precedence', t => {
    t.test('Given 2 + 3 * 4 (multiplication binds tighter)', t => {
        t.test('When evaluating', t => {
            // AST reflects correct precedence: 2 + (3 * 4)
            const ast = binary('+', literal(2), binary('*', literal(3), literal(4)))
            const result = evaluate(ast, {})
            t.equal(result, 14, 'Then it returns 14')
            t.end()
        })
        t.end()
    })

    t.test('Given (2 + 3) * 4 (parenthesized addition)', t => {
        t.test('When evaluating', t => {
            // AST reflects parens: (2 + 3) * 4
            const ast = binary('*', binary('+', literal(2), literal(3)), literal(4))
            const result = evaluate(ast, {})
            t.equal(result, 20, 'Then it returns 20')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) abs() function
// ═════════════════════════════════════════════════

test('abs() function', t => {
    t.test('Given abs() of a negative number', t => {
        t.test('When evaluating abs(-5)', t => {
            const ast = call('abs', [binary('-', literal(0), literal(5))])
            const result = evaluate(ast, {})
            t.equal(result, 5, 'Then it returns 5')
            t.end()
        })
        t.end()
    })

    t.test('Given abs() of a positive number', t => {
        t.test('When evaluating abs(5)', t => {
            const ast = call('abs', [literal(5)])
            const result = evaluate(ast, {})
            t.equal(result, 5, 'Then it returns 5')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (e) Source.field references
// ═════════════════════════════════════════════════

test('Source.field references', t => {
    t.test('Given a ref to income.total with bound values', t => {
        t.test('When evaluating', t => {
            const boundValues = { income: { total: 5000 } }
            const result = evaluate(ref('income', 'total'), boundValues)
            t.equal(result, 5000, 'Then it resolves to 5000')
            t.end()
        })
        t.end()
    })

    t.test('Given a ref to expenses.total with bound values', t => {
        t.test('When evaluating', t => {
            const boundValues = { expenses: { total: 3200 } }
            const result = evaluate(ref('expenses', 'total'), boundValues)
            t.equal(result, 3200, 'Then it resolves to 3200')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (f) Nested / complex expressions
// ═════════════════════════════════════════════════

test('Nested expressions', t => {
    t.test('Given abs(income.total - expenses.total) / income.total * 100', t => {
        t.test('When evaluating with income=5000 and expenses=3200', t => {
            // abs(income.total - expenses.total) / income.total * 100
            const ast = binary(
                '*',
                binary(
                    '/',
                    call('abs', [binary('-', ref('income', 'total'), ref('expenses', 'total'))]),
                    ref('income', 'total'),
                ),
                literal(100),
            )
            const boundValues = { income: { total: 5000 }, expenses: { total: 3200 } }
            const result = evaluate(ast, boundValues)
            t.equal(result, 36, 'Then it computes the savings rate as 36')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (g) Division by zero
// ═════════════════════════════════════════════════

test('Division by zero', t => {
    t.test('Given a division where divisor is zero', t => {
        t.test('When evaluating 10 / 0', t => {
            t.throws(
                () => evaluate(binary('/', literal(10), literal(0)), {}),
                { message: /division by zero/i },
                'Then it throws a division by zero error',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (h) Unknown source reference
// ═════════════════════════════════════════════════

test('Unknown source reference', t => {
    t.test('Given a ref to a source not in bound values', t => {
        t.test('When evaluating', t => {
            const boundValues = { income: { total: 5000 } }
            t.throws(
                () => evaluate(ref('savings', 'total'), boundValues),
                { message: /savings/i },
                'Then it throws naming the unknown source',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (i) Unknown function name
// ═════════════════════════════════════════════════

test('Unknown function name', t => {
    t.test('Given a call to an unsupported function', t => {
        t.test('When evaluating sqrt(4)', t => {
            t.throws(
                () => evaluate(call('sqrt', [literal(4)]), {}),
                { message: /sqrt/i },
                'Then it throws naming the unknown function',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (j) Depth limit
// ═════════════════════════════════════════════════

test('Depth limit', t => {
    t.test('Given an expression nested 101 levels deep', t => {
        t.test('When evaluating', t => {
            // Build a deeply nested binary tree: ((((... + 1) + 1) + 1) ...)
            const deepAst = Array.from({ length: 101 }).reduce(acc => binary('+', acc, literal(1)), literal(0))
            t.throws(() => evaluate(deepAst, {}), { message: /depth/i }, 'Then it throws a depth limit error')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (k) Invalid AST node — non-IRExpression object
// ═════════════════════════════════════════════════

test('Invalid AST node', t => {
    t.test('Given a plain object instead of an IRExpression', t => {
        t.test('When evaluating', t => {
            t.throws(() => evaluate({ type: 'unknown_node' }, {}), 'Then it throws because .match() is not available')
            t.end()
        })
        t.end()
    })

    t.end()
})
