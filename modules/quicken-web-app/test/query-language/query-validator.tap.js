import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    AccountSummary,
    DataSummary,
    IRComputation,
    IRDateRange,
    IRDomain,
    IRExpression,
    IRFilter,
    IROutput,
    IRSource,
    Query,
} from '../../src/types/index.js'
import { queryValidator } from '../../src/query-language/query-validator.js'

// ═════════════════════════════════════════════════
// Helpers: build IR objects for common patterns
// ═════════════════════════════════════════════════

const txnSource = (name, filters, dateRange, groupBy) =>
    IRSource(name, IRDomain.Transactions(), filters, dateRange, groupBy)

const catFilter = category => IRFilter.Equals('category', category)
const acctFilter = account => IRFilter.Equals('account', account)
const payeeFilter = payee => IRFilter.Equals('payee', payee)
const typeFilter = accountType => IRFilter.Equals('accountType', accountType)

const simpleQuery = source =>
    Query(
        'test',
        'Test',
        LookupTable([source], IRSource, 'name'),
        IRComputation.Identity(source.name),
        IROutput(['total']),
    )

// ═════════════════════════════════════════════════
// Test fixture: realistic data summary (~10 categories, ~5 accounts, ~5 payees)
// ═════════════════════════════════════════════════

const SUMMARY = DataSummary(
    // categories — hierarchical paths
    [
        'Income',
        'Income:Salary',
        'Income:Bonus',
        'Income:Dividends',
        'Food',
        'Food:Dining',
        'Food:Groceries',
        'Food:Coffee',
        'Housing',
        'Housing:Rent',
        'Housing:Utilities',
        'Entertainment',
        'Entertainment:Streaming',
    ],

    // accounts — AccountSummary instances
    [
        AccountSummary('Chase Checking', 'Bank'),
        AccountSummary('Chase Savings', 'Bank'),
        AccountSummary('Amex Platinum', 'Credit Card'),
        AccountSummary('Vanguard 401k', '401(k)/403(b)'),
        AccountSummary('Fidelity Brokerage', 'Investment'),
    ],

    // accountTypes
    ['Bank', 'Cash', 'Credit Card', 'Investment', 'Other Asset', 'Other Liability', '401(k)/403(b)'],

    // payees
    ['Costco', 'Trader Joes', 'Amazon', 'Netflix', 'Starbucks'],
)

// ═════════════════════════════════════════════════
// (a) Valid query passes with no errors
// ═════════════════════════════════════════════════

test('Valid query', t => {
    t.test('Given a query with valid category and date', t => {
        t.test('When validating against the data summary', t => {
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Relative('months', 6), 'month')
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.equal(result.errors.length, 0, 'Then there are no errors')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a full subcategory path', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [catFilter('Food:Dining')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, true, 'Then the full path is accepted')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Misspelled category — 'Fod' → suggests 'Food'
// ═════════════════════════════════════════════════

test('Misspelled category', t => {
    t.test('Given a query with category "Fod" (typo for Food)', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [catFilter('Fod')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors.length, 1, 'Then there is one error')
            t.match(result.errors[0].message, /Fod/, 'Then the error names the bad value')
            t.ok(
                result.errors[0].suggestions.some(s => s.startsWith('Food')),
                'Then it suggests Food-related categories',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Bare subcategory — 'Dining' → suggests 'Food:Dining'
// ═════════════════════════════════════════════════

test('Bare subcategory', t => {
    t.test('Given a query with bare subcategory "Dining"', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [catFilter('Dining')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors.length, 1, 'Then there is one error')
            t.ok(result.errors[0].suggestions.includes('Food:Dining'), 'Then it suggests the full path Food:Dining')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) Category prefix valid — 'Food' accepted when children exist
// ═════════════════════════════════════════════════

test('Category prefix matching', t => {
    t.test('Given a query with parent category "Food" (children Food:Dining etc exist)', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, true, 'Then the parent category is accepted via prefix matching')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (e) Nonexistent account — suggests similar
// ═════════════════════════════════════════════════

test('Nonexistent account', t => {
    t.test('Given a query with account "Checking" (partial match for Chase Checking)', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [acctFilter('Checking')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors.length, 1, 'Then there is one error')
            t.match(result.errors[0].message, /Checking/, 'Then the error names the bad value')
            t.ok(result.errors[0].suggestions.includes('Chase Checking'), 'Then it suggests Chase Checking')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (f) Wrong account type filter value
// ═════════════════════════════════════════════════

test('Wrong account type', t => {
    t.test('Given a query with accountType "Brokerage" (not a valid type)', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [typeFilter('Brokerage')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors.length, 1, 'Then there is one error')
            t.match(result.errors[0].message, /Brokerage/, 'Then the error names the bad value')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (g) Misspelled payee — 'Amazn' → suggests 'Amazon'
// ═════════════════════════════════════════════════

test('Misspelled payee', t => {
    t.test('Given a query with payee "Amazn" (typo for Amazon)', t => {
        t.test('When validating', t => {
            const source = txnSource('_default', [payeeFilter('Amazn')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors.length, 1, 'Then there is one error')
            t.match(result.errors[0].message, /Amazn/, 'Then the error names the bad value')
            t.ok(result.errors[0].suggestions.includes('Amazon'), 'Then it suggests Amazon')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (h) Multiple errors per query all collected
// ═════════════════════════════════════════════════

test('Multiple errors collected', t => {
    t.test('Given a query with bad category, bad account, and bad payee across sources', t => {
        t.test('When validating', t => {
            const food = txnSource('food', [catFilter('Groceries'), acctFilter('My Checking')], IRDateRange.Year(2025))
            const income = txnSource('income', [catFilter('Salary')], IRDateRange.Year(2025))
            const expression = IRExpression.Binary(
                '/',
                IRExpression.Call('abs', [IRExpression.Reference('food', 'total')]),
                IRExpression.Call('abs', [IRExpression.Reference('income', 'total')]),
            )
            const ir = Query(
                'multi',
                'Multiple errors',
                LookupTable([food, income], IRSource, 'name'),
                IRComputation.Expression(expression),
                IROutput(undefined, 'percent'),
            )
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(result.errors.length >= 3, 'Then at least 3 errors are collected')
            t.ok(
                result.errors.some(e => e.message.match(/Groceries/)),
                'Then Groceries error is present',
            )
            t.ok(
                result.errors.some(e => e.message.match(/My Checking/)),
                'Then My Checking error is present',
            )
            t.ok(
                result.errors.some(e => e.message.match(/Salary/)),
                'Then Salary error is present',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (i) IRComputation source refs — undefined source → error
// ═════════════════════════════════════════════════

test('Expression referencing undefined source', t => {
    t.test('Given an expression referencing a source name not defined in the query', t => {
        t.test('When validating', t => {
            const income = txnSource('income', [catFilter('Income')], IRDateRange.Year(2025))
            const expression = IRExpression.Binary(
                '-',
                IRExpression.Call('abs', [IRExpression.Reference('income', 'total')]),
                IRExpression.Call('abs', [IRExpression.Reference('savings', 'total')]),
            )
            const ir = Query(
                'bad_ref',
                'Bad source ref',
                LookupTable([income], IRSource, 'name'),
                IRComputation.Expression(expression),
                IROutput(undefined, 'number'),
            )
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(
                result.errors.some(e => e.message.match(/savings/)),
                'Then the error names the undefined source',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (j) Max 3 suggestions per error
// ═════════════════════════════════════════════════

test('Max suggestions limit', t => {
    t.test('Given a misspelled value with many potential matches', t => {
        t.test('When validating', t => {
            // "In" is a prefix of Income, Income:Salary, Income:Bonus, Income:Dividends
            // but suggestions should be capped at 3
            const source = txnSource('_default', [catFilter('In')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.ok(result.errors[0].suggestions.length <= 3, 'Then at most 3 suggestions are returned')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (k) Levenshtein max distance 3 — distance 4+ returns no suggestion
// ═════════════════════════════════════════════════

test('Levenshtein distance threshold', t => {
    t.test('Given a value that is distance 4+ from all candidates', t => {
        t.test('When validating', t => {
            // "Zzzqqqxxx" is far from any category
            const source = txnSource('_default', [catFilter('Zzzqqqxxx')], IRDateRange.Year(2025))
            const result = queryValidator(simpleQuery(source), SUMMARY)
            t.equal(result.valid, false, 'Then the query is invalid')
            t.equal(result.errors[0].suggestions.length, 0, 'Then no suggestions are returned for distant values')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// Valid compare and expression queries
// ═════════════════════════════════════════════════

test('Valid compare query', t => {
    t.test('Given a compare query referencing two defined sources', t => {
        t.test('When validating', t => {
            const q1 = txnSource('q1', [catFilter('Food:Dining')], IRDateRange.Quarter(1, 2025))
            const q4 = txnSource('q4', [catFilter('Food:Dining')], IRDateRange.Quarter(4, 2025))
            const ir = Query(
                'compare',
                'Q1 vs Q4',
                LookupTable([q1, q4], IRSource, 'name'),
                IRComputation.Compare('q1', 'q4'),
                IROutput(['total']),
            )
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('Valid expression query', t => {
    t.test('Given an expression referencing defined sources', t => {
        t.test('When validating', t => {
            const income = txnSource('income', [catFilter('Income')], IRDateRange.Year(2025))
            const expenses = txnSource('expenses', [catFilter('Food')], IRDateRange.Year(2025))
            const expression = IRExpression.Binary(
                '*',
                IRExpression.Binary(
                    '/',
                    IRExpression.Call('abs', [
                        IRExpression.Binary(
                            '-',
                            IRExpression.Reference('income', 'total'),
                            IRExpression.Reference('expenses', 'total'),
                        ),
                    ]),
                    IRExpression.Call('abs', [IRExpression.Reference('income', 'total')]),
                ),
                IRExpression.Literal(100),
            )
            const ir = Query(
                'savings',
                'Savings rate',
                LookupTable([income, expenses], IRSource, 'name'),
                IRComputation.Expression(expression),
                IROutput(undefined, 'percent'),
            )
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })

    t.end()
})
