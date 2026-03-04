// ABOUTME: TaggedSum for domain-specific query result trees
// ABOUTME: Separates data shape (Category vs Holdings) from computation shape (Identity vs Comparison)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const ResultTree = {
    name: 'ResultTree',
    kind: 'taggedSum',
    variants: {
        Category: { nodes: '[CategoryTreeNode]' },
        Holdings: { nodes: '[HoldingsTreeNode]' },
    },
}
