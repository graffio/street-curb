// ABOUTME: Position tree building utility for investment reports
// ABOUTME: Composes groupBy -> buildTree -> aggregateTree for hierarchical display by dimension

import { groupBy as groupByFn, buildTree, aggregateTree, map, sumCompensated } from '@graffio/functional'
import { PositionAggregate } from '../types/position-aggregate.js'
import { PositionTreeNode } from '../types/position-tree-node.js'

// Configuration for each groupBy dimension
const dimensionConfig = {
    account: { getKey: p => p.accountName || 'Unknown Account', getParent: () => undefined },
    security: { getKey: p => p.securityName || 'Unknown Security', getParent: () => undefined },
    securityType: { getKey: p => p.securityType || 'Unknown Type', getParent: () => undefined },
    goal: { getKey: p => p.securityGoal || 'No Goal', getParent: () => undefined },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Transforms a plain aggregate object into PositionAggregate instance
    // @sig toPositionAggregate :: Object -> PositionAggregate
    toPositionAggregate: agg => {
        const { shares, costBasis, marketValue, averageCostPerShare } = agg
        const { dayGainLoss, dayGainLossPercent, unrealizedGainLoss, unrealizedGainLossPercent, count } = agg
        return PositionAggregate(
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

    // Transforms a Position into PositionTreeNode.Position (leaf node)
    // @sig toPositionNode :: Position -> PositionTreeNode.Position
    toPositionNode: position => PositionTreeNode.Position(`${position.accountId}|${position.securityId}`, [], position),

    // Transforms an aggregated tree node into PositionTreeNode.Group
    // @sig toGroupNode :: TreeNode -> PositionTreeNode.Group
    toGroupNode: node => {
        const { key, value, children, aggregate } = node
        const positionNodes = value.map(T.toPositionNode)
        const groupNodes = children.map(T.toGroupNode)
        const allChildren = [...groupNodes, ...positionNodes]
        return PositionTreeNode.Group(key, allChildren, T.toPositionAggregate(aggregate))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Sum quantities, cost basis, market value, and gains across positions and child aggregates
    // @sig sumPositions :: ([Position], [Object]) -> Object
    sumPositions: (positions, childAggregates) => {
        const sumField = field => sumCompensated(map(p => p[field] ?? 0, positions))
        const sumChildField = field => sumCompensated(map(a => a[field] ?? 0, childAggregates))

        const shares = sumField('quantity') + sumChildField('shares')
        const costBasis = sumField('costBasis') + sumChildField('costBasis')
        const marketValue = sumField('marketValue') + sumChildField('marketValue')
        const dayGainLoss = sumField('dayGainLoss') + sumChildField('dayGainLoss')
        const unrealizedGainLoss = sumField('unrealizedGainLoss') + sumChildField('unrealizedGainLoss')
        const count = positions.length + childAggregates.reduce((sum, a) => sum + a.count, 0)

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
    },
}

/*
 * Build aggregated position tree by dimension, returning PositionTreeNode instances
 * @sig buildPositionsTree :: (String?, [Position]) -> [PositionTreeNode]
 */
const buildPositionsTree = (dimension, positions) => {
    const config = dimensionConfig[dimension] || dimensionConfig.account
    const groups = groupByFn(config.getKey, positions)
    const tree = buildTree(config.getParent, groups)
    const aggregated = aggregateTree(A.sumPositions, tree)
    return aggregated.map(T.toGroupNode)
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { buildPositionsTree }
