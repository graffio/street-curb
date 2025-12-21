// ABOUTME: Tree utilities for hierarchical data with bottom-up aggregation
// ABOUTME: Build trees from flat groups, aggregate recursively, flatten to arrays

// TreeNode type (parameterized by value type):
//   TreeNode a = { key: String, value: a, children: [TreeNode a], aggregate?: b }
//
// After buildTree:  { key, value, children } - no aggregate yet
// After aggregateTree: { key, value, children, aggregate } - aggregate computed bottom-up
//
// Pipeline for hierarchical reports:
//   1. Group source data by leaf key: groupBy(t => t.category, transactions)
//   2. Build tree with caller-provided getParent: buildTree(getParent, groups)
//   3. Compute aggregates bottom-up: aggregateTree(aggregateFn, tree)
//   4. Adapt for display: pass tree to TanStack Table with getSubRows: n => n.children

// Build tree from flat groups, auto-creating parent nodes as needed
// @sig buildTree :: ((String -> String?), {String: a}) -> [TreeNode a]
const buildTree = (getParent, groups) => {
    // @sig ensureNode :: String -> TreeNode
    const ensureNode = key => {
        if (nodes[key]) return nodes[key]
        nodes[key] = { key, value: groups[key] ?? [], children: [] }
        const parentKey = getParent(key)
        if (parentKey) ensureNode(parentKey).children.push(nodes[key])
        else roots.push(nodes[key])
        return nodes[key]
    }

    const sortChildren = node => {
        node.children.sort((a, b) => a.key.localeCompare(b.key))
        node.children.forEach(sortChildren)
    }

    const nodes = {}
    const roots = []

    Object.keys(groups).forEach(ensureNode)
    roots.sort((a, b) => a.key.localeCompare(b.key))
    roots.forEach(sortChildren)

    return roots
}

// Compute aggregates bottom-up, returns new tree with .aggregate on each node
// @sig aggregateTree :: ((a, [b]) -> b, [TreeNode a]) -> [TreeNode a]
const aggregateTree = (aggregateFn, roots) => {
    const processNode = node => {
        const processedChildren = node.children.map(processNode)
        const childAggregates = processedChildren.map(c => c.aggregate)
        return { ...node, children: processedChildren, aggregate: aggregateFn(node.value, childAggregates) }
    }
    return roots.map(processNode)
}

// Flatten tree depth-first, applying transform to each node
// @sig flattenTree :: ((TreeNode a, Number) -> b, [TreeNode a]) -> [b]
const flattenTree = (transform, roots) => {
    const flatten = (node, depth) => [transform(node, depth), ...node.children.flatMap(c => flatten(c, depth + 1))]
    return roots.flatMap(root => flatten(root, 1))
}

export { buildTree, aggregateTree, flattenTree }
