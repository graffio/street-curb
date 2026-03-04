// ABOUTME: TaggedSum for domain-specific query result trees
// ABOUTME: Separates data shape (Category vs Positions) from computation shape (Identity vs Comparison)

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
