// ABOUTME: CategoryTreeNode TaggedSum for hierarchical spending report display
// ABOUTME: Group variant for aggregated categories, Transaction variant for individual transactions
// NOTE: Transaction.transaction is Object (not Transaction) because enriched transactions are plain objects

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const CategoryTreeNode = {
    name: 'CategoryTreeNode',
    kind: 'taggedSum',
    variants: {
        Group: { key: 'String', children: '[CategoryTreeNode]', aggregate: 'CategoryAggregate' },
        Transaction: { key: 'String', children: '[CategoryTreeNode]', transaction: 'Object' },
    },
}
