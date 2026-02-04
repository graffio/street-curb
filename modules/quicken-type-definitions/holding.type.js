// ABOUTME: Holding type definition for portfolio positions
// ABOUTME: Represents a security position with market data and gain/loss calculations

import { FieldTypes } from './field-types.js'

export const Holding = {
    name: 'Holding',
    kind: 'tagged',
    fields: {
        accountId: FieldTypes.accountId,
        accountName: 'String',
        securityId: FieldTypes.securityId,
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

// Checks if holding matches search query (case-insensitive)
// @sig matchesSearch :: (Holding, String) -> Boolean
// prettier-ignore
Holding.matchesSearch = (holding, query) => {
    if (!query) return true
    const q = query.toLowerCase()
    const { accountName, securityName, securitySymbol } = holding
    return securityName.toLowerCase().includes(q) || securitySymbol.toLowerCase().includes(q) ||
        accountName.toLowerCase().includes(q)
}
