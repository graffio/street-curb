import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import {
    Account,
    Category,
    Lot,
    LotAllocation,
    Price,
    QueryResult,
    QueryResultTree,
    Security,
    Transaction,
} from '../../src/types/index.js'
import {
    IRComputation,
    IRDateRange,
    IRDomain,
    IRExpression,
    IRFilter,
    IROutput,
    IRSource,
    Query,
} from '../../src/query-language/types/index.js'
import { queryExecutionEngine } from '../../src/query-language/query-execution-engine.js'

// ═════════════════════════════════════════════════
// Helper: build a Bank transaction with minimal boilerplate
// ═════════════════════════════════════════════════

const bankTx = (id, accountId, date, amount, categoryId, payee) =>
    Transaction.Bank(accountId, amount, date, id, 'bank', undefined, categoryId, undefined, undefined, undefined, payee)

// ═════════════════════════════════════════════════
// Helper: build IR objects for common patterns
// ═════════════════════════════════════════════════

const txnSource = (name, filters, dateRange, groupBy) =>
    IRSource(name, IRDomain.Transactions(), filters, dateRange, groupBy)

const catFilter = category => IRFilter.Equals('category', category)

const simpleQuery = (name, source) =>
    Query(name, name, LookupTable([source], IRSource, 'name'), IRComputation.Identity(source.name), IROutput(['total']))

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
        Category('cat_000000000001', 'Food'),
        Category('cat_000000000002', 'Food:Dining'),
        Category('cat_000000000003', 'Food:Groceries'),
        Category('cat_000000000004', 'Income'),
        Category('cat_000000000005', 'Income:Salary'),
        Category('cat_000000000006', 'Housing'),
        Category('cat_000000000007', 'Housing:Rent'),
    ],
    Category,
    'id',
)

const TRANSACTIONS = LookupTable(
    [
        // Income (Jan-Mar 2025)
        bankTx('txn_000000000001', 'acc_000000000001', '2025-01-01', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000002', 'acc_000000000001', '2025-02-01', 5000, 'cat_000000000005', 'Employer'),
        bankTx('txn_000000000003', 'acc_000000000001', '2025-03-01', 5000, 'cat_000000000005', 'Employer'),

        // Food:Dining (across accounts and months)
        bankTx('txn_000000000004', 'acc_000000000001', '2025-01-15', -50, 'cat_000000000002', 'Chipotle'),
        bankTx('txn_000000000005', 'acc_000000000002', '2025-02-10', -75, 'cat_000000000002', 'Olive Garden'),
        bankTx('txn_000000000006', 'acc_000000000001', '2025-03-20', -60, 'cat_000000000002', 'Chipotle'),

        // Food:Groceries
        bankTx('txn_000000000007', 'acc_000000000001', '2025-01-20', -200, 'cat_000000000003', 'Costco'),
        bankTx('txn_000000000008', 'acc_000000000001', '2025-02-20', -180, 'cat_000000000003', 'Costco'),

        // Housing:Rent
        bankTx('txn_000000000009', 'acc_000000000001', '2025-01-05', -1500, 'cat_000000000007', 'Landlord'),
        bankTx('txn_00000000000a', 'acc_000000000001', '2025-02-05', -1500, 'cat_000000000007', 'Landlord'),
        bankTx('txn_00000000000b', 'acc_000000000001', '2025-03-05', -1500, 'cat_000000000007', 'Landlord'),
    ],
    Transaction,
    'id',
)

const STATE = {
    accounts: ACCOUNTS,
    categories: CATEGORIES,
    transactions: TRANSACTIONS,
    securities: LookupTable([], Security, 'id'),
    lots: LookupTable([], Lot, 'id'),
    lotAllocations: LookupTable([], LotAllocation, 'id'),
    prices: LookupTable([], Price, 'id'),
}

// ═════════════════════════════════════════════════
// (a) Identity — transaction source with category filter
// ═════════════════════════════════════════════════

test('Identity — transaction source with category filter', t => {
    t.test('Given a query filtering transactions by Food category', t => {
        t.test('When executing against state', t => {
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Year(2025))
            const result = queryExecutionEngine(simpleQuery('food', source), STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(QueryResultTree.Category.is(result.tree), 'Then result contains a category tree')
            t.ok(result.tree.nodes.length > 0, 'Then tree is not empty')
            t.equal(result.source, '_default', 'Then source is the default source name')
            t.end()
        })
        t.end()
    })

    t.end()
})

// ═════════════════════════════════════════════════
// (b) Identity — positions source (structural only)
// ═════════════════════════════════════════════════

test('Identity — positions source', t => {
    t.test('Given a positions query', t => {
        t.test('When executing against state with investment account', t => {
            const source = IRSource('_default', IRDomain.Positions(), [], IRDateRange.Year(2025))
            const ir = Query(
                'positions',
                'Positions view',
                LookupTable([source], IRSource, 'name'),
                IRComputation.Identity('_default'),
                IROutput(['total']),
            )
            const result = queryExecutionEngine(ir, STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(QueryResultTree.Positions.is(result.tree), 'Then result contains a positions tree')
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
            const source = IRSource('_default', IRDomain.Accounts(), [IRFilter.Equals('accountType', 'Bank')])
            const ir = Query(
                'banks',
                'Bank accounts',
                LookupTable([source], IRSource, 'name'),
                IRComputation.FilterEntities('_default'),
                IROutput(['total']),
            )
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
            const q1 = txnSource('q1', [catFilter('Food')], IRDateRange.Quarter(1, 2025))
            const q2 = txnSource('q2', [catFilter('Food')], IRDateRange.Quarter(2, 2025))
            const ir = Query(
                'compare',
                'Q1 vs Q2 food',
                LookupTable([q1, q2], IRSource, 'name'),
                IRComputation.Compare('q1', 'q2'),
                IROutput(['total']),
            )
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
            const income = txnSource('income', [catFilter('Income')], IRDateRange.Quarter(1, 2025))
            const food = txnSource('food', [catFilter('Food')], IRDateRange.Quarter(1, 2025))
            const expression = IRExpression.Binary(
                '*',
                IRExpression.Binary(
                    '/',
                    IRExpression.Call('abs', [IRExpression.Reference('food', 'total')]),
                    IRExpression.Call('abs', [IRExpression.Reference('income', 'total')]),
                ),
                IRExpression.Literal(100),
            )
            const ir = Query(
                'savings_rate',
                'Savings rate',
                LookupTable([income, food], IRSource, 'name'),
                IRComputation.Expression(expression),
                IROutput(undefined, 'percent'),
            )
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
            const source = IRSource('_default', IRDomain.Accounts(), [])
            const ir = Query(
                'all_accounts',
                'All accounts',
                LookupTable([source], IRSource, 'name'),
                IRComputation.FilterEntities('_default'),
                IROutput(['total']),
            )
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
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Year(2025))
            const result = queryExecutionEngine(simpleQuery('annual', source), STATE)
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
            const source = txnSource('_default', [catFilter('Food:Dining')], IRDateRange.Quarter(1, 2025))
            const result = queryExecutionEngine(simpleQuery('q1', source), STATE)
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
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Relative('months', 6))
            const result = queryExecutionEngine(simpleQuery('recent', source), STATE)
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
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Year(2025), 'month')
            const result = queryExecutionEngine(simpleQuery('monthly', source), STATE)
            t.ok(QueryResult.Identity.is(result), 'Then result is QueryResult.Identity')
            t.ok(QueryResultTree.Category.is(result.tree), 'Then tree is a category tree')

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
            const source = txnSource('_default', [catFilter('Food')], IRDateRange.Year(2025), 'category')
            const result = queryExecutionEngine(simpleQuery('by_cat', source), STATE)
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
            const source = IRSource('_default', IRDomain.Accounts(), [IRFilter.Equals('accountType', 'Credit Card')])
            const ir = Query(
                'credit',
                'Credit card accounts',
                LookupTable([source], IRSource, 'name'),
                IRComputation.FilterEntities('_default'),
                IROutput(['total']),
            )
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
            const source = IRSource('_default', IRDomain.Accounts(), [IRFilter.Equals('accountType', 'Investment')])
            const ir = Query(
                'invest',
                'Investment accounts',
                LookupTable([source], IRSource, 'name'),
                IRComputation.FilterEntities('_default'),
                IROutput(['total']),
            )
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
