// ABOUTME: PositionAggregate type for grouped portfolio totals
// ABOUTME: Represents summed values for a group of positions (by account, security, type, or goal)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const PositionAggregate = {
    name: 'PositionAggregate',
    kind: 'tagged',
    fields: {
        shares: 'Number',
        costBasis: 'Number',
        marketValue: 'Number',
        averageCostPerShare: 'Number',
        dayGainLoss: 'Number',
        dayGainLossPercent: 'Number',
        unrealizedGainLoss: 'Number',
        unrealizedGainLossPercent: 'Number',
        count: 'Number',
    },
}
