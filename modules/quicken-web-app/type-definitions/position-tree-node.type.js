// ABOUTME: PositionTreeNode TaggedSum for hierarchical portfolio display
// ABOUTME: Group variant for aggregated groups, Position variant for individual positions

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const PositionTreeNode = {
    name: 'PositionTreeNode',
    kind: 'taggedSum',
    variants: {
        Group: { id: 'String', children: '[PositionTreeNode]', aggregate: 'PositionAggregate' },
        Position: { id: 'String', children: '[PositionTreeNode]', position: 'Position', metrics: 'Object?' },
    },
}
