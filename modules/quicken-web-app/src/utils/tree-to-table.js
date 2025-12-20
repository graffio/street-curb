// ABOUTME: Adapter for using @functional TreeNode with TanStack Table
// ABOUTME: Provides helpers for hierarchical reports with expand/collapse

// TanStack Table integration for TreeNode:
//
// TreeNode from @functional has shape:
//   { key: String, value: [a], children: [TreeNode], aggregate: { ... } }
//
// TanStack Table expects:
//   - Data array at root level
//   - getSubRows accessor for children
//   - Column accessors for display values
//
// Usage with TanStack Table:
//   const table = useReactTable({
//       data: aggregatedTree,           // [TreeNode] from aggregateTree
//       columns: reportColumns,
//       getSubRows: row => row.children,
//       getRowId: row => row.key,
//       getRowCanExpand: row => row.children.length > 0,
//   })

// Prepare tree for TanStack Table display
// Flattens aggregate fields to top level for easier column access
// @sig prepareForTable :: [TreeNode] -> [TableRow]
const prepareForTable = tree => {
    const processNode = node => ({
        ...node,
        ...node.aggregate, // Flatten { total, count } to top level
        children: node.children.map(processNode),
    })
    return tree.map(processNode)
}

// Get TanStack Table options for tree data
// @sig getTreeTableOptions :: () -> { getSubRows, getRowId, getRowCanExpand }
const getTreeTableOptions = () => ({
    getSubRows: row => row.children,
    getRowId: row => row.key,
    getRowCanExpand: row => row.children?.length > 0,
})

export { prepareForTable, getTreeTableOptions }
