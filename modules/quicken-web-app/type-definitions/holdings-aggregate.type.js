// ABOUTME: HoldingsAggregate type for grouped portfolio totals
// ABOUTME: Represents summed values for a group of holdings (by account, security, type, or goal)

export const HoldingsAggregate = {
    name: 'HoldingsAggregate',
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
