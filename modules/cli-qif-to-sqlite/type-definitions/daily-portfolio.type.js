export const DailyPortfolio = {
    name: 'DailyPortfolio',
    kind: 'tagged',
    fields: {
        accountId: /^acc_[a-f0-9]{12}$/,
        accountName: 'String',
        date: 'String',
        cashBalance: 'Number',
        totalMarketValue: 'Number',
        totalCostBasis: 'Number',
        unrealizedGainLoss: 'Number',
        holdings: '[Object]',
    },
}
