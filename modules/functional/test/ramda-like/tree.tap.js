// ABOUTME: Tests for tree utilities (parentOfPath, depthOfPath, buildTree, aggregateTree, flattenTree)
// ABOUTME: Verifies hierarchical path parsing, tree construction, bottom-up aggregation, and flattening

import t from 'tap'
import { parentOfPath, depthOfPath, buildTree, aggregateTree, flattenTree } from '../../src/ramda-like/tree.js'

// Aggregation helpers for tests
const sumAgg = (values, childAggs) => {
    const own = values.reduce((a, b) => a + b, 0)
    const children = childAggs.reduce((a, b) => a + b, 0)
    return own + children
}

const complexAgg = (txns, childAggs) => ({
    total: txns.reduce((a, t) => a + t.amount, 0) + childAggs.reduce((a, c) => a + c.total, 0),
    count: txns.length + childAggs.reduce((a, c) => a + c.count, 0),
})

t.test('parentOfPath', t => {
    t.equal(parentOfPath(':', 'food:restaurant:lunch'), 'food:restaurant', 'nested path')
    t.equal(parentOfPath(':', 'food:restaurant'), 'food', 'two-level path')
    t.equal(parentOfPath(':', 'food'), null, 'root path returns null')
    t.equal(parentOfPath('/', 'assets/bank'), 'assets', 'slash delimiter')
    t.end()
})

t.test('depthOfPath', t => {
    t.equal(depthOfPath(':', 'food'), 1, 'root is depth 1')
    t.equal(depthOfPath(':', 'food:restaurant'), 2, 'two levels is depth 2')
    t.equal(depthOfPath(':', 'food:restaurant:lunch'), 3, 'three levels is depth 3')
    t.end()
})

t.test('buildTree', t => {
    const colonParent = key => parentOfPath(':', key)

    t.test('Given groups with explicit parent and child keys', t => {
        const groups = { food: [1], 'food:restaurant': [2] }
        const tree = buildTree(colonParent, groups)

        t.equal(tree.length, 1, 'Then one root')
        t.equal(tree[0].key, 'food', 'Then root is food')
        t.same(tree[0].value, [1], 'Then root has its value')
        t.equal(tree[0].children.length, 1, 'Then root has child')
        t.equal(tree[0].children[0].key, 'food:restaurant', 'Then child is restaurant')
        t.end()
    })

    t.test('Given only child keys (no explicit parent)', t => {
        const groups = { 'food:restaurant': [1], 'food:grocery': [2] }
        const tree = buildTree(colonParent, groups)

        t.equal(tree.length, 1, 'Then parent node auto-created')
        t.equal(tree[0].key, 'food', 'Then auto-created parent is food')
        t.same(tree[0].value, [], 'Then auto-created parent has empty value')
        t.equal(tree[0].children.length, 2, 'Then parent has both children')
        t.end()
    })

    t.test('Given deeply nested child only', t => {
        const groups = { 'a:b:c': [1] }
        const tree = buildTree(colonParent, groups)

        t.equal(tree.length, 1, 'Then root auto-created')
        t.equal(tree[0].key, 'a', 'Then root is a')
        t.equal(tree[0].children[0].key, 'a:b', 'Then intermediate auto-created')
        t.equal(tree[0].children[0].children[0].key, 'a:b:c', 'Then leaf exists')
        t.same(tree[0].children[0].children[0].value, [1], 'Then leaf has value')
        t.end()
    })

    t.test('Given empty groups', t => {
        t.equal(buildTree(colonParent, {}).length, 0, 'Then empty array')
        t.end()
    })
    t.end()
})

t.test('aggregateTree', t => {
    const colonParent = key => parentOfPath(':', key)

    t.test('Given tree with values at leaves only', t => {
        const groups = { 'food:restaurant': [100], 'food:grocery': [50] }
        const tree = buildTree(colonParent, groups)
        const aggregated = aggregateTree(sumAgg, tree)

        t.equal(aggregated[0].aggregate, 150, 'Then parent aggregate sums children')
        t.equal(aggregated[0].children[0].aggregate, 50, 'Then grocery aggregate')
        t.equal(aggregated[0].children[1].aggregate, 100, 'Then restaurant aggregate')
        t.end()
    })

    t.test('Given tree with values at all levels', t => {
        const groups = { food: [10], 'food:restaurant': [100] }
        const tree = buildTree(colonParent, groups)
        const aggregated = aggregateTree(sumAgg, tree)

        t.equal(aggregated[0].aggregate, 110, 'Then parent includes own + child')
        t.equal(aggregated[0].children[0].aggregate, 100, 'Then child has own value')
        t.end()
    })

    t.test('Given complex aggregate type', t => {
        const groups = { 'food:restaurant': [{ amount: 100 }, { amount: 50 }] }
        const tree = buildTree(colonParent, groups)
        const aggregated = aggregateTree(complexAgg, tree)

        t.equal(aggregated[0].aggregate.total, 150, 'Then parent total from children')
        t.equal(aggregated[0].aggregate.count, 2, 'Then parent count from children')
        t.end()
    })
    t.end()
})

t.test('flattenTree', t => {
    const colonParent = key => parentOfPath(':', key)

    t.test('Given aggregated tree', t => {
        const groups = { 'food:restaurant': [100], 'food:grocery': [50] }
        const tree = buildTree(colonParent, groups)
        const aggregated = aggregateTree(sumAgg, tree)
        const result = flattenTree((node, depth) => ({ key: node.key, total: node.aggregate, depth }), aggregated)

        t.equal(result.length, 3, 'Then three nodes')
        t.equal(result[0].key, 'food', 'Then parent first')
        t.equal(result[0].total, 150, 'Then parent has aggregated total')
        t.equal(result[0].depth, 1, 'Then parent depth 1')
        t.equal(result[1].key, 'food:grocery', 'Then first child (alphabetical)')
        t.equal(result[1].depth, 2, 'Then child depth 2')
        t.end()
    })

    t.test('Given empty tree', t => {
        t.equal(flattenTree(n => n.key, []).length, 0, 'Then empty array')
        t.end()
    })
    t.end()
})
