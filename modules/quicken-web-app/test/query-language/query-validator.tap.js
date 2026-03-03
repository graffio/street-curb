import { test } from 'tap'
import { queryParser } from '../../src/query-language/query-parser.js'
import { queryValidator } from '../../src/query-language/query-validator.js'
import { AccountSummary } from '../../src/types/account-summary.js'
import { DataSummary } from '../../src/types/data-summary.js'

const parse = queryParser

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
            const { ir } = parse(`
                query food_trend "Monthly food spending" {
                  from transactions
                  where category = "Food"
                  date last 6 months
                  group by month
                  show total
                }
            `)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.equal(result.errors.length, 0, 'Then there are no errors')
            t.end()
        })
        t.end()
    })

    t.test('Given a query with a full subcategory path', t => {
        t.test('When validating', t => {
            const { ir } = parse(`
query dining "Dining only" {
  from transactions
  where category = "Food:Dining"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query bad "Bad category" {
  from transactions
  where category = "Fod"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query dining "Dining spending" {
  from transactions
  where category = "Dining"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query food "All food" {
  from transactions
  where category = "Food"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query acct "Account query" {
  from transactions
  where account = "Checking"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query by_type "By type" {
  from transactions
  where account type = "Brokerage"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query amazon "Amazon spending" {
  from transactions
  where payee = "Amazn"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query multi "Multiple errors" {
  food: from transactions
        where category = "Groceries"
        where account = "My Checking"
        date 2025
  income: from transactions
          where category = "Salary"
          date 2025
  compute abs(food.total) / abs(income.total)
  format percent
}
`)
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
// (i) Computation source refs — undefined source → error
// ═════════════════════════════════════════════════

test('Expression referencing undefined source', t => {
    t.test('Given an expression referencing a source name not defined in the query', t => {
        t.test('When validating', t => {
            const { ir } = parse(`
query bad_ref "Bad source ref" {
  income: from transactions
          where category = "Income"
          date 2025
  compute abs(income.total) - abs(savings.total)
  format number
}
`)
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
            const { ir } = parse(`
query test "Test" {
  from transactions
  where category = "In"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query test "Test" {
  from transactions
  where category = "Zzzqqqxxx"
  date 2025
  show total
}
`)
            const result = queryValidator(ir, SUMMARY)
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
            const { ir } = parse(`
query compare "Q1 vs Q4" {
  q1: from transactions
      where category = "Food:Dining"
      date Q1 2025
  q4: from transactions
      where category = "Food:Dining"
      date Q4 2025
  compare q1 vs q4
  show total
}
`)
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
            const { ir } = parse(`
query savings "Savings rate" {
  income: from transactions
          where category = "Income"
          date 2025
  expenses: from transactions
            where category = "Food"
            date 2025
  compute abs(income.total - expenses.total) / abs(income.total) * 100
  format percent
}
`)
            const result = queryValidator(ir, SUMMARY)
            t.equal(result.valid, true, 'Then the query is valid')
            t.end()
        })
        t.end()
    })

    t.end()
})
