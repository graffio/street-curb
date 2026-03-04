// ABOUTME: Position type definition for portfolio positions
// ABOUTME: Represents a security position with market data and gain/loss calculations

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const Position = {
    name: 'Position',
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

// Checks if position matches search query (case-insensitive)
// @sig matchesSearch :: (Position, String) -> Boolean
// prettier-ignore
Position.matchesSearch = (position, query) => {
    if (!query) return true
    const q = query.toLowerCase()
    const { accountName, securityName, securitySymbol } = position
    return securityName.toLowerCase().includes(q) || securitySymbol.toLowerCase().includes(q) ||
        accountName.toLowerCase().includes(q)
}
