// ABOUTME: Holding type definition for portfolio positions
// ABOUTME: Represents a security position with market data and gain/loss calculations

export const Holding = {
    name: 'Holding',
    kind: 'tagged',
    fields: {
        accountId: /^acc_[a-f0-9]{12}$/,
        accountName: 'String',
        securityId: /^sec_[a-f0-9]{12}$/,
        securityName: 'String',
        securitySymbol: 'String',
        securityType: 'String',
        securityGoal: 'String?',
        quantity: 'Number',
        costBasis: 'Number',
        averageCostPerShare: 'Number',
        quotePrice: 'Number',
        marketValue: 'Number',
        unrealizedGainLoss: 'Number',
        unrealizedGainLossPercent: 'Number',
        dayGainLoss: 'Number',
        dayGainLossPercent: 'Number',
        isStale: 'Boolean',
    },
}
