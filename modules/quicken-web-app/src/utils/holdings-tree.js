// ABOUTME: Holdings tree building utility for investment reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree for hierarchical display by dimension

import { groupBy as groupByFn, buildTree, aggregateTree } from '@graffio/functional'
import { HoldingsAggregate } from '../types/holdings-aggregate.js'
import { HoldingsTreeNode } from '../types/holdings-tree-node.js'

// Configuration for each groupBy dimension
const dimensionConfig = {
    account: { getKey: h => h.accountName || 'Unknown Account', getParent: () => undefined },
    security: { getKey: h => h.securityName || 'Unknown Security', getParent: () => undefined },
    securityType: { getKey: h => h.securityType || 'Unknown Type', getParent: () => undefined },
    goal: { getKey: h => h.securityGoal || 'No Goal', getParent: () => undefined },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Transforms a plain aggregate object into HoldingsAggregate instance
    // @sig toHoldingsAggregate :: Object -> HoldingsAggregate
    toHoldingsAggregate: agg => {
        const { shares, costBasis, marketValue, averageCostPerShare } = agg
        const { dayGainLoss, dayGainLossPercent, unrealizedGainLoss, unrealizedGainLossPercent, count } = agg
        return HoldingsAggregate(
            shares,
            costBasis,
            marketValue,
            averageCostPerShare,
            dayGainLoss,
            dayGainLossPercent,
            unrealizedGainLoss,
            unrealizedGainLossPercent,
            count,
        )
    },

    // Transforms a Holding into HoldingsTreeNode.Holding (leaf node)
    // @sig toHoldingNode :: Holding -> HoldingsTreeNode.Holding
    toHoldingNode: holding => HoldingsTreeNode.Holding(holding.securityName || 'Unknown', [], holding),

    // Transforms an aggregated tree node into HoldingsTreeNode.Group
    // @sig toGroupNode :: TreeNode -> HoldingsTreeNode.Group
    toGroupNode: node => {
        const { key, value, children, aggregate } = node
        const holdingNodes = value.map(T.toHoldingNode)
        const groupNodes = children.map(T.toGroupNode)
        const allChildren = [...groupNodes, ...holdingNodes]
        return HoldingsTreeNode.Group(key, allChildren, T.toHoldingsAggregate(aggregate))
    },
}

/*
 * Aggregate holdings: sum quantities, cost basis, market value, and gains
 * @sig sumHoldings :: ([Holding], [Object]) -> Object
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

    const averageCostPerShare = shares !== 0 ? costBasis / shares : 0
    const unrealizedGainLossPercent = costBasis !== 0 ? unrealizedGainLoss / costBasis : 0
    const dayGainLossPercent = marketValue !== 0 ? dayGainLoss / (marketValue - dayGainLoss) : 0

    return {
        shares,
        costBasis,
        marketValue,
        averageCostPerShare,
        dayGainLoss,
        dayGainLossPercent,
        unrealizedGainLoss,
        unrealizedGainLossPercent,
        count,
    }
}

/*
 * Build aggregated holdings tree by dimension, returning HoldingsTreeNode instances
 * @sig buildHoldingsTree :: (String?, [Holding]) -> [HoldingsTreeNode]
 */
const buildHoldingsTree = (dimension, holdings) => {
    const config = dimensionConfig[dimension] || dimensionConfig.account
    const groups = groupByFn(config.getKey, holdings)
    const tree = buildTree(config.getParent, groups)
    const aggregated = aggregateTree(sumHoldings, tree)
    return aggregated.map(T.toGroupNode)
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const HoldingsTree = { buildHoldingsTree, dimensionConfig, sumHoldings }

export { HoldingsTree }
