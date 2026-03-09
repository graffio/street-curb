// ABOUTME: TaggedSum for domain-specific query result trees
// ABOUTME: Separates data shape (Category vs Positions) from result shape (Identity wraps a tree variant)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const QueryResultTree = {
    name: 'QueryResultTree',
    kind: 'taggedSum',
    variants: {
        Category: { nodes: '[CategoryTreeNode]' },
        Positions: { nodes: '[PositionTreeNode]' },
    },
}
