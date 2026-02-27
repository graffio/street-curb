// ABOUTME: HoldingsTreeNode TaggedSum for hierarchical portfolio display
// ABOUTME: Group variant for aggregated groups, Holding variant for individual positions

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const HoldingsTreeNode = {
    name: 'HoldingsTreeNode',
    kind: 'taggedSum',
    variants: {
        Group: { id: 'String', children: '[HoldingsTreeNode]', aggregate: 'HoldingsAggregate' },
        Holding: { id: 'String', children: '[HoldingsTreeNode]', holding: 'Holding' },
    },
}
