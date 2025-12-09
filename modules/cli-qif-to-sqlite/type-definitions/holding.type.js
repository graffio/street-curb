export const Holding = {
    name: 'Holding',
    kind: 'tagged',
    fields: {
        accountId: /^acc_[a-f0-9]{12}$/,
        avgCostPerShare: 'Number',
        costBasis: 'Number',
        lastUpdated: 'String',
        quantity: 'Number',
        securityId: /^sec_[a-f0-9]{12}$/,
    },
}
