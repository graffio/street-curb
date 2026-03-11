// ABOUTME: Tests for category tree building and aggregation
// ABOUTME: Verifies groupBy -> buildTree -> aggregateTree pipeline for category reports

import t from 'tap'
import { groupBy, buildTree, aggregateTree, sumCompensated } from '@graffio/functional'
import { CategoryTree } from '../src/category-tree.js'

// Test helper: derive parent from colon-delimited category path
const getParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}

// Test helper: aggregate function for category spending
const sumTransactions = (transactions, childAggregates) => {
    const ownTotal = sumCompensated(transactions.map(t => t.amount))
    const childTotal = sumCompensated(childAggregates.map(a => a.total))
    const ownCount = transactions.length
    const childCount = childAggregates.reduce((sum, a) => sum + a.count, 0)
    return { total: ownTotal + childTotal, count: ownCount + childCount }
}

t.test('Category tree building', t => {
    t.test('Given transactions with hierarchical categories', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food:Groceries', amount: -100 },
            { id: 'txn2', categoryName: 'Food:Groceries', amount: -50 },
            { id: 'txn3', categoryName: 'Food:Restaurants', amount: -75 },
            { id: 'txn4', categoryName: 'Transportation:Gas', amount: -40 },
            { id: 'txn5', categoryName: 'Transportation:Parking', amount: -10 },
        ]

        t.test('When grouping by categoryName', t => {
            const groups = groupBy(txn => txn.categoryName, transactions)

            t.equal(Object.keys(groups).length, 4, 'Then 4 category groups exist')
            t.equal(groups['Food:Groceries'].length, 2, 'And Food:Groceries has 2 transactions')
            t.equal(groups['Food:Restaurants'].length, 1, 'And Food:Restaurants has 1 transaction')
            t.end()
        })

        t.test('When building tree from groups', t => {
            const groups = groupBy(txn => txn.categoryName, transactions)
            const tree = buildTree(getParent, groups)

            t.equal(tree.length, 2, 'Then 2 root categories (Food, Transportation)')
            t.equal(tree[0].key, 'Food', 'And first root is Food')
            t.equal(tree[0].children.length, 2, 'And Food has 2 children')
            t.equal(tree[1].key, 'Transportation', 'And second root is Transportation')
            t.end()
        })

        t.test('When aggregating tree', t => {
            const groups = groupBy(txn => txn.categoryName, transactions)
            const tree = buildTree(getParent, groups)
            const aggregated = aggregateTree(sumTransactions, tree)
            const { total: foodTotal, count: foodCount } = aggregated[0].aggregate
            const { total: transTotal, count: transCount } = aggregated[1].aggregate

            // Food aggregate: Groceries (-150) + Restaurants (-75) = -225
            t.equal(foodTotal, -225, 'Then Food total is -225')
            t.equal(foodCount, 3, 'And Food count is 3')

            // Transportation aggregate: Gas (-40) + Parking (-10) = -50
            t.equal(transTotal, -50, 'And Transportation total is -50')
            t.equal(transCount, 2, 'And Transportation count is 2')

            // Leaf nodes have their own aggregates
            const groceries = aggregated[0].children.find(c => c.key === 'Food:Groceries')
            const { total: groceriesTotal, count: groceriesCount } = groceries.aggregate
            t.equal(groceriesTotal, -150, 'And Food:Groceries total is -150')
            t.equal(groceriesCount, 2, 'And Food:Groceries count is 2')
            t.end()
        })
        t.end()
    })

    t.test('Given transactions with deeply nested categories', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food:Groceries:Organic', amount: -30 },
            { id: 'txn2', categoryName: 'Food:Groceries:Conventional', amount: -20 },
        ]

        t.test('When building and aggregating tree', t => {
            const groups = groupBy(txn => txn.categoryName, transactions)
            const tree = buildTree(getParent, groups)
            const aggregated = aggregateTree(sumTransactions, tree)

            t.equal(tree.length, 1, 'Then 1 root (Food)')
            t.equal(tree[0].children.length, 1, 'And Food has 1 child (Groceries)')
            t.equal(tree[0].children[0].children.length, 2, 'And Groceries has 2 children')

            // Root aggregate bubbles up from grandchildren
            t.equal(aggregated[0].aggregate.total, -50, 'And Food total is -50')
            t.equal(aggregated[0].aggregate.count, 2, 'And Food count is 2')
            t.end()
        })
        t.end()
    })

    t.test('Given empty transaction list', t => {
        const transactions = []

        t.test('When building tree', t => {
            const groups = groupBy(txn => txn.categoryName, transactions)
            const tree = buildTree(getParent, groups)

            t.equal(tree.length, 0, 'Then empty tree')
            t.end()
        })
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// buildColumnGroupedTree — 2D tree with per-column values
// ═════════════════════════════════════════════════

t.test('buildColumnGroupedTree', t => {
    const transactions = [
        { id: 'txn1', categoryName: 'Food:Groceries', amount: -100, date: '2025-01-15' },
        { id: 'txn2', categoryName: 'Food:Groceries', amount: -50, date: '2025-01-20' },
        { id: 'txn3', categoryName: 'Food:Restaurants', amount: -75, date: '2025-04-10' },
        { id: 'txn4', categoryName: 'Housing:Rent', amount: -1500, date: '2025-01-01' },
        { id: 'txn5', categoryName: 'Housing:Rent', amount: -1500, date: '2025-07-01' },
        { id: 'txn6', categoryName: 'Food:Groceries', amount: -80, date: '2025-07-05' },
    ]

    t.test('Given category × year grouping', t => {
        t.test('When building 2D tree', t => {
            const tree = CategoryTree.buildColumnGroupedTree('category', 'year', transactions)

            t.ok(Array.isArray(tree), 'Then returns an array of nodes')
            t.ok(tree.length >= 2, 'Then at least 2 root groups (Food, Housing)')

            const food = tree.find(n => n.id === 'Food')
            t.ok(food, 'Then Food group exists')
            t.ok(food.aggregate.columns, 'Then Food has per-column values')
            t.ok(food.aggregate.columns['2025'] !== undefined, 'Then Food has 2025 column')
            t.equal(food.aggregate.total, -305, 'Then Food total is sum of all Food transactions')
            t.equal(food.aggregate.count, 4, 'Then Food count is 4')
            t.end()
        })
        t.end()
    })

    t.test('Given category × quarter grouping', t => {
        t.test('When building 2D tree', t => {
            const tree = CategoryTree.buildColumnGroupedTree('category', 'quarter', transactions)

            const food = tree.find(n => n.id === 'Food')
            t.ok(food.aggregate.columns, 'Then Food has per-column values')

            // Q1: Groceries -100 + -50 = -150, Q2: Restaurants -75, Q3: Groceries -80
            t.equal(food.aggregate.columns['2025-Q1'], -150, 'Then Food Q1 total is -150')
            t.equal(food.aggregate.columns['2025-Q2'], -75, 'Then Food Q2 total is -75')
            t.equal(food.aggregate.columns['2025-Q3'], -80, 'Then Food Q3 total is -80')
            t.end()
        })
        t.end()
    })

    t.test('Given category × month grouping', t => {
        t.test('When building 2D tree', t => {
            const tree = CategoryTree.buildColumnGroupedTree('category', 'month', transactions)

            const food = tree.find(n => n.id === 'Food')
            t.ok(food.aggregate.columns, 'Then Food has per-column values')
            t.equal(food.aggregate.columns['2025-01'], -150, 'Then Food Jan total is -150')
            t.equal(food.aggregate.columns['2025-04'], -75, 'Then Food Apr total is -75')
            t.equal(food.aggregate.columns['2025-07'], -80, 'Then Food Jul total is -80')
            t.end()
        })
        t.end()
    })

    t.test('Given parent columns roll up from children', t => {
        t.test('When building category × quarter tree', t => {
            const tree = CategoryTree.buildColumnGroupedTree('category', 'quarter', transactions)

            const food = tree.find(n => n.id === 'Food')
            const groceries = food.children.find(c => c.id === 'Food:Groceries')
            t.ok(groceries, 'Then Groceries child exists')
            t.equal(groceries.aggregate.columns['2025-Q1'], -150, 'Then Groceries Q1 is -150')
            t.equal(groceries.aggregate.columns['2025-Q3'], -80, 'Then Groceries Q3 is -80')
            t.notOk(groceries.aggregate.columns['2025-Q2'], 'Then Groceries has no Q2')

            // Parent rollup: Food Q1 = Groceries Q1 (-150)
            t.equal(food.aggregate.columns['2025-Q1'], -150, 'Then Food Q1 rolls up from Groceries')
            t.end()
        })
        t.end()
    })
    t.end()
})

t.test('buildTransactionTree utility', t => {
    t.test('Given transactions with categories', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food:Groceries', amount: -100 },
            { id: 'txn2', categoryName: 'Food:Restaurants', amount: -50 },
            { id: 'txn3', categoryName: 'Transportation:Gas', amount: -30 },
        ]

        t.test('When calling buildTransactionTree with category dimension', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)

            t.equal(tree.length, 2, 'Then returns CategoryTreeNode tree with 2 roots')
            t.equal(tree[0].aggregate.total, -150, 'And Food total is -150')
            t.equal(tree[1].aggregate.total, -30, 'And Transportation total is -30')
            t.ok(tree[0]['@@typeName'] === 'CategoryTreeNode', 'And root is CategoryTreeNode')
            t.end()
        })
        t.end()
    })

    t.test('Given category with both subcategories and direct transactions', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food:Groceries', amount: -100 },
            { id: 'txn2', categoryName: 'Food', amount: -50 },
            { id: 'txn3', categoryName: 'Food', amount: -20 },
        ]

        t.test('When calling buildTransactionTree', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)
            const food = tree[0]

            t.equal(food.id, 'Food', 'Then root is Food')
            t.equal(food.aggregate.total, -170, 'And Food total includes all transactions')

            const othersNode = food.children.find(c => c.id === 'Food:<Others>')
            t.ok(othersNode, 'And an <Others> group wraps direct transactions')
            t.equal(othersNode.aggregate.total, -70, 'And <Others> total is sum of direct transactions')
            t.equal(othersNode.aggregate.count, 2, 'And <Others> count is 2')
            t.equal(othersNode.children.length, 2, 'And <Others> has 2 transaction children')
            t.ok(
                othersNode.children.every(c => c['@@tagName'] === 'Transaction'),
                'And all <Others> children are Transaction nodes',
            )

            const groceriesNode = food.children.find(c => c.id === 'Food:Groceries')
            t.ok(groceriesNode, 'And Groceries group is still present')
            t.equal(groceriesNode.aggregate.total, -100, 'And Groceries total is unchanged')
            t.end()
        })
        t.end()
    })

    t.test('Given category with only subcategories (no direct transactions)', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food:Groceries', amount: -100 },
            { id: 'txn2', categoryName: 'Food:Restaurants', amount: -50 },
        ]

        t.test('When calling buildTransactionTree', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)
            const food = tree[0]

            const othersNode = food.children.find(c => c.id === 'Food:<Others>')
            t.notOk(othersNode, 'Then no <Others> node is created')
            t.equal(food.children.length, 2, 'And only subcategory groups exist')
            t.end()
        })
        t.end()
    })

    t.test('Given category with only direct transactions (no subcategories)', t => {
        const transactions = [
            { id: 'txn1', categoryName: 'Food', amount: -50 },
            { id: 'txn2', categoryName: 'Food', amount: -20 },
        ]

        t.test('When calling buildTransactionTree', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)
            const food = tree[0]

            const othersNode = food.children.find(c => c.id === 'Food:<Others>')
            t.notOk(othersNode, 'Then no <Others> node is created')
            t.ok(
                food.children.every(c => c['@@tagName'] === 'Transaction'),
                'And children are Transaction nodes directly',
            )
            t.equal(food.children.length, 2, 'And both transactions are direct children')
            t.end()
        })
        t.end()
    })

    t.test('Given transactions without categoryName', t => {
        const transactions = [{ id: 'txn1', amount: -25 }]

        t.test('When calling buildTransactionTree with category dimension', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)

            t.equal(tree.length, 1, 'Then returns 1 root')
            t.equal(tree[0].id, 'Uncategorized', 'And root is Uncategorized')
            t.equal(tree[0].aggregate.total, -25, 'And total is -25')
            t.end()
        })
        t.end()
    })
    t.end()
})
