export const DailyPortfolio = {
    name: 'DailyPortfolio',
    kind: 'tagged',
    fields: {
        accountId: 'Number',
        accountName: 'String',
        date: 'String',
        cashBalance: 'Number',
        totalMarketValue: 'Number',
        totalCostBasis: 'Number',
        unrealizedGainLoss: 'Number',
        holdings: '[Object]',
    },
}
