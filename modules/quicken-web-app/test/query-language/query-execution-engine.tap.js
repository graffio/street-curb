import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { Account, Category, QueryResult, ResultTree, Security, Transaction } from '../../src/types/index.js'
import { queryParser } from '../../src/query-language/query-parser.js'
import { queryExecutionEngine } from '../../src/query-language/query-execution-engine.js'

const parse = queryParser

// ═════════════════════════════════════════════════
// Helper: build a Bank transaction with minimal boilerplate
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

// ═════════════════════════════════════════════════
// Test fixture: mock Redux state with LookupTables
// ═════════════════════════════════════════════════

const ACCOUNTS = LookupTable(
    [
        Account('acc_000000000001', 'Chase Checking', 'Bank'),
        Account('acc_000000000002', 'Amex Platinum', 'Credit Card'),
        Account('acc_000000000003', 'Vanguard 401k', 'Investment'),
    ],
    Account,
    'id',
)

const CATEGORIES = LookupTable(
    [
        Category('cat_food', 'Food'),
        Category('cat_dining', 'Food:Dining'),
        Category('cat_groceries', 'Food:Groceries'),
        Category('cat_income', 'Income'),
        Category('cat_salary', 'Income:Salary'),
        Category('cat_housing', 'Housing'),
        Category('cat_rent', 'Housing:Rent'),
    ],
    Category,
    'id',
)

const TRANSACTIONS = LookupTable(
    [
        // Income (Jan-Mar 2025)
        bankTx('tx01', 'acc_000000000001', '2025-01-01', 5000, 'cat_salary', 'Employer'),
        bankTx('tx02', 'acc_000000000001', '2025-02-01', 5000, 'cat_salary', 'Employer'),
        bankTx('tx03', 'acc_000000000001', '2025-03-01', 5000, 'cat_salary', 'Employer'),

        // Food:Dining (across accounts and months)
        bankTx('tx04', 'acc_000000000001', '2025-01-15', -50, 'cat_dining', 'Chipotle'),
        bankTx('tx05', 'acc_000000000002', '2025-02-10', -75, 'cat_dining', 'Olive Garden'),
        bankTx('tx06', 'acc_000000000001', '2025-03-20', -60, 'cat_dining', 'Chipotle'),

        // Food:Groceries
        bankTx('tx07', 'acc_000000000001', '2025-01-20', -200, 'cat_groceries', 'Costco'),
        bankTx('tx08', 'acc_000000000001', '2025-02-20', -180, 'cat_groceries', 'Costco'),

        // Housing:Rent
        bankTx('tx09', 'acc_000000000001', '2025-01-05', -1500, 'cat_rent', 'Landlord'),
        bankTx('tx10', 'acc_000000000001', '2025-02-05', -1500, 'cat_rent', 'Landlord'),
        bankTx('tx11', 'acc_000000000001', '2025-03-05', -1500, 'cat_rent', 'Landlord'),
    ],
    Transaction,
    'id',
)

const STATE = {
    accounts: ACCOUNTS,
    categories: CATEGORIES,
    transactions: TRANSACTIONS,
    securities: LookupTable([], Security, 'id'),
}

// ═════════════════════════════════════════════════
// (a) Identity — transaction source with category filter
// ═════════════════════════════════════════════════

test('Identity — transaction source with category filter', t => {
    t.test('Given a query filtering transactions by Food category', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query food "Food spending" {
  from transactions
  where category = "Food"
  date 2025
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(ResultTree.Category.is(result.tree), 'Then result contains a category tree')
            t.ok(result.tree.nodes.length > 0, 'Then tree is not empty')
            t.equal(result.source, '_default', 'Then source is the default source name')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Identity — holdings source (structural only)
// ═════════════════════════════════════════════════

test('Identity — holdings source', t => {
    t.test('Given a holdings query', t => {
        t.test('When executing against state with investment account', t => {
            const { ir } = parse(`
query holdings "Holdings view" {
  from holdings
  date 2025
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(ResultTree.Holdings.is(result.tree), 'Then result contains a holdings tree')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (c) Accounts source with account type filter
// ═════════════════════════════════════════════════

test('Accounts source with account type filter', t => {
    t.test('Given a query filtering accounts by Bank type', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query banks "Bank accounts" {
  from accounts
  where account type = "Bank"
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.FilteredEntities.is(result), 'Then result is QueryResult.FilteredEntities')
            t.ok(Array.isArray(result.entities), 'Then result contains entities array')
            t.equal(result.entities.length, 1, 'Then only one Bank account is returned')
            t.equal(result.entities[0].name, 'Chase Checking', 'Then it is Chase Checking')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (d) Compare — two date ranges on same source
// ═════════════════════════════════════════════════

test('Compare — two date ranges', t => {
    t.test('Given a compare query with Q1 vs Q2 food spending', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query compare "Q1 vs Q2 food" {
  q1: from transactions
      where category = "Food"
      date Q1 2025
  q2: from transactions
      where category = "Food"
      date Q2 2025
  compare q1 vs q2
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Comparison.is(result), 'Then result is QueryResult.Comparison')
            t.ok(result.left !== undefined, 'Then left result is present')
            t.ok(result.right !== undefined, 'Then right result is present')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (e) Expression — arithmetic on source totals (savings rate)
// ═════════════════════════════════════════════════

test('Expression — savings rate calculation', t => {
    t.test('Given a compute expression: abs(food.total) / abs(income.total) * 100', t => {
        t.test('When executing against state with income and food transactions', t => {
            const { ir } = parse(`
query savings_rate "Savings rate" {
  income: from transactions
          where category = "Income"
          date Q1 2025
  food: from transactions
        where category = "Food"
        date Q1 2025
  compute abs(food.total) / abs(income.total) * 100
  format percent
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Scalar.is(result), 'Then result is QueryResult.Scalar')
            t.type(result.value, 'number', 'Then value is a number')
            t.ok(result.value > 0, 'Then the ratio is positive')
            t.ok(result.value < 100, 'Then the ratio is less than 100%')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (f) FilterEntities — accounts filtered by condition
// ═════════════════════════════════════════════════

test('FilterEntities — filter accounts', t => {
    t.test('Given a query for all accounts (no type filter)', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query all_accounts "All accounts" {
  from accounts
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.FilteredEntities.is(result), 'Then result is QueryResult.FilteredEntities')
            t.equal(result.entities.length, 3, 'Then all 3 accounts are returned')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (g) Relative date resolution
// ═════════════════════════════════════════════════

test('Date resolution — absolute year', t => {
    t.test('Given a query with date 2025', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query annual "Annual food" {
  from transactions
  where category = "Food"
  date 2025
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is returned')
            t.ok(result.tree.nodes.length > 0, 'Then transactions within 2025 are included')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('Date resolution — specific quarter', t => {
    t.test('Given a query with date Q1 2025', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query q1 "Q1 food" {
  from transactions
  where category = "Food:Dining"
  date Q1 2025
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is returned')

            // Q1 2025 has tx04 (Jan Food:Dining) — only 1 dining tx in Q1
            t.end()
        })
        t.end()
    })

    t.end()
})

test('Date resolution — last N months', t => {
    t.test('Given a query with date last 6 months', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query recent "Recent food" {
  from transactions
  where category = "Food"
  date last 6 months
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is returned without error')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (h) Group by — results grouped by dimension
// ═════════════════════════════════════════════════

test('Group by month', t => {
    t.test('Given a query grouped by month', t => {
        t.test('When executing against state with multi-month data', t => {
            const { ir } = parse(`
query monthly "Monthly food" {
  from transactions
  where category = "Food"
  date 2025
  group by month
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(ResultTree.Category.is(result.tree), 'Then tree is a category tree')

            // Food transactions span Jan-Mar under year 2025 parent
            t.ok(result.tree.nodes.length >= 1, 'Then tree has a year group')
            t.ok(result.tree.nodes[0].children.length >= 2, 'Then year group has at least 2 monthly children')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('Group by category', t => {
    t.test('Given a query grouped by category', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query by_cat "By category" {
  from transactions
  where category = "Food"
  date 2025
  group by category
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(result.tree.nodes.length >= 1, 'Then tree has category groups')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (i) Account type filtering in execution
// ═════════════════════════════════════════════════

test('Account type filtering — Credit Card only', t => {
    t.test('Given a query filtering by Credit Card account type', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query credit "Credit card accounts" {
  from accounts
  where account type = "Credit Card"
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.FilteredEntities.is(result), 'Then result is QueryResult.FilteredEntities')
            t.equal(result.entities.length, 1, 'Then only one Credit Card account is returned')
            t.equal(result.entities[0].name, 'Amex Platinum', 'Then it is Amex Platinum')
            t.end()
        })
        t.end()
    })

    t.end()
})

test('Account type filtering — Investment only', t => {
    t.test('Given a query filtering by Investment account type', t => {
        t.test('When executing against state', t => {
            const { ir } = parse(`
query invest "Investment accounts" {
  from accounts
  where account type = "Investment"
  show total
}
`)
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.FilteredEntities.is(result), 'Then result is QueryResult.FilteredEntities')
            t.equal(result.entities.length, 1, 'Then only one Investment account is returned')
            t.equal(result.entities[0].name, 'Vanguard 401k', 'Then it is Vanguard 401k')
            t.end()
        })
        t.end()
    })

    t.end()
})
