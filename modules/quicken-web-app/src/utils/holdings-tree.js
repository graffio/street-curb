// ABOUTME: Holdings tree building utility for investment reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree for hierarchical display by dimension

import { groupBy as groupByFn, buildTree, aggregateTree } from '@graffio/functional'

// Configuration for each groupBy dimension
const dimensionConfig = {
    account: { getKey: h => h.accountName || 'Unknown Account', getParent: () => null },
    security: { getKey: h => h.securityName || 'Unknown Security', getParent: () => null },
    securityType: { getKey: h => h.securityType || 'Unknown Type', getParent: () => null },
    goal: { getKey: h => h.securityGoal || 'No Goal', getParent: () => null },
}

/*
 * Aggregate holdings: sum quantities, cost basis, market value, and gains
 * @sig sumHoldings :: ([EnrichedHolding], [Aggregate]) -> Aggregate
 */
const sumHoldings = (holdings, childAggregates) => {
    const sumField = field => holdings.reduce((sum, h) => sum + (h[field] ?? 0), 0)
    const sumChildField = field => childAggregates.reduce((sum, a) => sum + (a[field] ?? 0), 0)

    const shares = sumField('quantity') + sumChildField('shares')
    const costBasis = sumField('costBasis') + sumChildField('costBasis')
    const marketValue = sumField('marketValue') + sumChildField('marketValue')
    const dayGainLoss = sumField('dayGainLoss') + sumChildField('dayGainLoss')
    const unrealizedGainLoss = sumField('unrealizedGainLoss') + sumChildField('unrealizedGainLoss')
    const count = holdings.length + childAggregates.reduce((sum, a) => sum + a.count, 0)

    const avgCostPerShare = shares !== 0 ? costBasis / shares : 0
    const unrealizedGainLossPct = costBasis !== 0 ? unrealizedGainLoss / costBasis : 0
    const dayGainLossPct = marketValue !== 0 ? dayGainLoss / (marketValue - dayGainLoss) : 0

    return {
        shares,
        costBasis,
        marketValue,
        dayGainLoss,
        dayGainLossPct,
        unrealizedGainLoss,
        unrealizedGainLossPct,
        avgCostPerShare,
        count,
    }
}

/*
 * Build aggregated holdings tree by dimension
 * @sig buildHoldingsTree :: (String?, [EnrichedHolding]) -> [TreeNode]
 */
const buildHoldingsTree = (dimension, holdings) => {
    const config = dimensionConfig[dimension] || dimensionConfig.account
    const groups = groupByFn(config.getKey, holdings)
    const tree = buildTree(config.getParent, groups)
    return aggregateTree(sumHoldings, tree)
}

export { buildHoldingsTree, dimensionConfig, sumHoldings }
