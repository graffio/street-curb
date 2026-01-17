// ABOUTME: HoldingsTreeNode TaggedSum for hierarchical portfolio display
// ABOUTME: Group variant for aggregated groups, Holding variant for individual positions

export const HoldingsTreeNode = {
    name: 'HoldingsTreeNode',
    kind: 'taggedSum',
    variants: {
        Group: { key: 'String', children: '[HoldingsTreeNode]', aggregate: 'HoldingsAggregate' },
        Holding: { key: 'String', children: '[HoldingsTreeNode]', holding: 'Holding' },
    },
}
