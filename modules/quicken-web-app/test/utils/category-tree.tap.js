// ABOUTME: Tests for category tree building and aggregation
// ABOUTME: Verifies groupBy -> buildTree -> aggregateTree pipeline for category reports

import t from 'tap'
import { groupBy, buildTree, aggregateTree } from '@graffio/functional'
import { CategoryTree } from '../../src/utils/category-tree.js'

// Test helper: derive parent from colon-delimited category path
const getParent = key => {
    const idx = key.lastIndexOf(':')
    return idx === -1 ? null : key.slice(0, idx)
}

// Test helper: aggregate function for category spending
const sumTransactions = (transactions, childAggregates) => {
    const ownTotal = transactions.reduce((sum, t) => sum + t.amount, 0)
    const childTotal = childAggregates.reduce((sum, a) => sum + a.total, 0)
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

    t.test('Given transactions without categoryName', t => {
        const transactions = [{ id: 'txn1', amount: -25 }]

        t.test('When calling buildTransactionTree with category dimension', t => {
            const tree = CategoryTree.buildTransactionTree('category', transactions)

            t.equal(tree.length, 1, 'Then returns 1 root')
            t.equal(tree[0].key, 'Uncategorized', 'And root is Uncategorized')
            t.equal(tree[0].aggregate.total, -25, 'And total is -25')
            t.end()
        })
        t.end()
    })
    t.end()
})
