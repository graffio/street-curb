// ABOUTME: Tests for ir-filter-evaluator — pre-compiled boolean filter tree evaluation
// ABOUTME: Run with: yarn tap:file test/query-language/ir-filter-evaluation.tap.js

import { test } from 'tap'
import { IRFilter } from '../../src/query-language/types/ir-filter.js'
import { buildFilterPredicate as compileFilter } from '../../src/query-language/build-filter-predicate.js'

// ═════════════════════════════════════════════════
// Test entities — minimal objects with fields the evaluator reads
// ═════════════════════════════════════════════════

const dining = { category: 'Food:Dining', account: 'Checking', payee: 'Chipotle', amount: 45 }
const groceries = { category: 'Food:Groceries', account: 'Savings', payee: 'Costco', amount: 200 }
const rent = { category: 'Housing:Rent', account: 'Checking', payee: 'Landlord', amount: 1500 }
const transfer = { category: 'Transfer', account: 'Checking', payee: 'Savings', amount: 500 }
const walmart = { category: 'Shopping', account: 'Credit Card', payee: 'Walmart', amount: 75 }
const walgreens = { category: 'Shopping', account: 'Checking', payee: 'Walgreens', amount: 30 }

// ═════════════════════════════════════════════════
// Leaf predicates
// ═════════════════════════════════════════════════

test('Equals — matches exact field value', t => {
    t.test('Given an Equals filter on category', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.Equals('category', 'Food:Dining'))
            t.equal(predicate(dining), true, 'Then dining matches')
            t.equal(predicate(groceries), false, 'Then groceries does not match')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('In — matches set membership', t => {
    t.test('Given an In filter on account with two values', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.In('account', ['Checking', 'Savings']))
            t.equal(predicate(dining), true, 'Then Checking account matches')
            t.equal(predicate(groceries), true, 'Then Savings account matches')
            t.equal(predicate(walmart), false, 'Then Credit Card account does not match')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('GreaterThan — matches numeric comparison', t => {
    t.test('Given a GreaterThan filter on amount > 100', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.GreaterThan('amount', 100))
            t.equal(predicate(groceries), true, 'Then 200 > 100 matches')
            t.equal(predicate(dining), false, 'Then 45 > 100 does not match')
            t.equal(predicate(rent), true, 'Then 1500 > 100 matches')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('LessThan — matches numeric comparison', t => {
    t.test('Given a LessThan filter on amount < 100', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.LessThan('amount', 100))
            t.equal(predicate(dining), true, 'Then 45 < 100 matches')
            t.equal(predicate(walmart), true, 'Then 75 < 100 matches')
            t.equal(predicate(groceries), false, 'Then 200 < 100 does not match')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Between — matches inclusive range', t => {
    t.test('Given a Between filter on amount 50 to 500', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.Between('amount', 50, 500))
            t.equal(predicate(groceries), true, 'Then 200 in [50,500] matches')
            t.equal(predicate(transfer), true, 'Then 500 (boundary) matches')
            t.equal(predicate(dining), false, 'Then 45 below range does not match')
            t.equal(predicate(rent), false, 'Then 1500 above range does not match')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Matches — matches regex pattern', t => {
    t.test('Given a Matches filter on payee with pattern ^WAL', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.Matches('payee', '^WAL'))
            t.equal(predicate(walmart), true, 'Then Walmart matches (case insensitive)')
            t.equal(predicate(walgreens), true, 'Then Walgreens matches')
            t.equal(predicate(dining), false, 'Then Chipotle does not match')
            t.end()
        })
        t.end()
    })

    t.test('Given a Matches filter with invalid regex', t => {
        t.test('When compiling', t => {
            t.throws(
                () => compileFilter(IRFilter.Matches('payee', '(unclosed')),
                /invalid regex/i,
                'Then it throws with clear error',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// Combinators
// ═════════════════════════════════════════════════

test('And — all children must pass', t => {
    t.test('Given an And of Equals and In', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(
                IRFilter.And([IRFilter.Equals('category', 'Food:Dining'), IRFilter.In('account', ['Checking'])]),
            )
            t.equal(predicate(dining), true, 'Then dining at Checking matches both')
            t.equal(predicate(groceries), false, 'Then groceries at Savings fails category check')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Or — any child can pass', t => {
    t.test('Given an Or of two category Equals', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(
                IRFilter.Or([
                    IRFilter.Equals('category', 'Food:Dining'),
                    IRFilter.Equals('category', 'Food:Groceries'),
                ]),
            )
            t.equal(predicate(dining), true, 'Then dining matches first branch')
            t.equal(predicate(groceries), true, 'Then groceries matches second branch')
            t.equal(predicate(rent), false, 'Then rent matches neither')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Not — inverts child', t => {
    t.test('Given a Not wrapping an Equals on Transfer category', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.Not(IRFilter.Equals('category', 'Transfer')))
            t.equal(predicate(dining), true, 'Then non-transfer passes')
            t.equal(predicate(transfer), false, 'Then transfer is excluded')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Nested — And(Or(...), Not(...))', t => {
    t.test('Given a complex nested filter tree', t => {
        t.test('When compiled and applied to entities', t => {
            // (Food:Dining OR Food:Groceries) AND NOT(account = Savings)
            const predicate = compileFilter(
                IRFilter.And([
                    IRFilter.Or([
                        IRFilter.Equals('category', 'Food:Dining'),
                        IRFilter.Equals('category', 'Food:Groceries'),
                    ]),
                    IRFilter.Not(IRFilter.Equals('account', 'Savings')),
                ]),
            )
            t.equal(predicate(dining), true, 'Then dining at Checking passes both branches')
            t.equal(predicate(groceries), false, 'Then groceries at Savings fails Not check')
            t.equal(predicate(rent), false, 'Then rent fails Or check')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// Seed query patterns from task file
// ═════════════════════════════════════════════════

test('Seed query: large_transactions — amount > 500', t => {
    t.test('Given a GreaterThan filter on amount > 500', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(IRFilter.GreaterThan('amount', 500))
            t.equal(predicate(rent), true, 'Then 1500 matches')
            t.equal(predicate(groceries), false, 'Then 200 does not match')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Seed query: amount_range — And(Between, Or(Equals, Equals))', t => {
    t.test('Given the amount_range seed query filter', t => {
        t.test('When compiled and applied to entities', t => {
            const predicate = compileFilter(
                IRFilter.And([
                    IRFilter.Between('amount', 100, 1000),
                    IRFilter.Or([
                        IRFilter.Equals('category', 'Food:Groceries'),
                        IRFilter.Equals('category', 'Shopping'),
                    ]),
                ]),
            )
            t.equal(predicate(groceries), true, 'Then groceries at 200 in range and Food:Groceries')
            t.equal(predicate(dining), false, 'Then dining at 45 out of range')
            t.equal(predicate(rent), false, 'Then rent at 1500 out of range')
            t.equal(predicate(transfer), false, 'Then transfer has wrong category')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// Guard conditions
// ═════════════════════════════════════════════════

test('Empty And throws', t => {
    t.test('Given an And with empty filters array', t => {
        t.test('When compiling', t => {
            t.throws(() => compileFilter(IRFilter.And([])), /empty/, 'Then it throws with empty combinator error')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Empty Or throws', t => {
    t.test('Given an Or with empty filters array', t => {
        t.test('When compiling', t => {
            t.throws(() => compileFilter(IRFilter.Or([])), /empty/, 'Then it throws with empty combinator error')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Excessive depth throws', t => {
    t.test('Given a filter tree nested beyond MAX_FILTER_DEPTH', t => {
        t.test('When compiling', t => {
            // Build 25-deep Not chain
            let f = IRFilter.Equals('category', 'Food')
            Array.from({ length: 25 }).forEach(() => (f = IRFilter.Not(f)))
            t.throws(() => compileFilter(f), /depth/, 'Then it throws with depth exceeded error')
            t.end()
        })
        t.end()
    })
    t.end()
})
