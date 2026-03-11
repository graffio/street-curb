// ABOUTME: Computes total return (unrealized + realized + dividends) for a position
// ABOUTME: Pure function — (Position, Context) → { totalReturnDollars, totalReturnPercent }

import { computeRealizedGains } from './compute-realized-gains.js'
import { computeDividendIncome } from './compute-dividend-income.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig computeTotalReturn :: (Position, Context) -> { totalReturnDollars, totalReturnPercent }
const computeTotalReturn = (position, context) => {
    const { costBasis, unrealizedGainLoss } = position
    const realized = computeRealizedGains(position, context)
    const dividends = computeDividendIncome(position, context)
    const totalReturnDollars = unrealizedGainLoss + realized.totalRealizedGain + dividends
    const totalReturnPercent = costBasis !== 0 ? totalReturnDollars / costBasis : 0
    return { totalReturnDollars, totalReturnPercent }
}

export { computeTotalReturn }
