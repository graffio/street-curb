// ABOUTME: Computes benchmark return (e.g., SPY) from position inception to as-of date
// ABOUTME: Pure function — (Position, Context) → Number

import { groupBy, LookupTable } from '@graffio/functional'
import { Price } from '../types/index.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Builds a Map of securityId -> LookupTable for O(1) price lookups
    // @sig toPriceIndex :: LookupTable<Price> -> Map<String, LookupTable<Price, 'date'>>
    toPriceIndex: prices => {
        const grouped = groupBy(p => p.securityId, prices)
        return new Map(Object.entries(grouped).map(([secId, arr]) => [secId, LookupTable(arr, Price, 'date')]))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Finds the most recent price for a security as of a date
    // @sig findPriceAsOf :: (Map<String, LookupTable<Price>>, String, String) -> Price?
    findPriceAsOf: (priceIndex, securityId, date) => {
        const secPrices = priceIndex.get(securityId)
        if (!secPrices) return undefined
        return secPrices.get(date) ?? secPrices.find(p => p.date <= date)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig computeBenchmarkReturn :: (Position, Context) -> Number
const computeBenchmarkReturn = (position, context) => {
    const { lots, prices, asOfDate, benchmarkSecurityId } = context
    if (!benchmarkSecurityId) return 0

    const priceIndex = T.toPriceIndex(prices)
    const positionLots = lots.filter(
        lot => lot.accountId === position.accountId && lot.securityId === position.securityId,
    )
    const earliestDate = positionLots.reduce(
        (earliest, lot) => (lot.purchaseDate < earliest ? lot.purchaseDate : earliest),
        positionLots[0]?.purchaseDate ?? asOfDate,
    )

    const inceptionPrice = A.findPriceAsOf(priceIndex, benchmarkSecurityId, earliestDate)
    const currentPrice = A.findPriceAsOf(priceIndex, benchmarkSecurityId, asOfDate)

    if (!inceptionPrice || !currentPrice) return 0
    return (currentPrice.price - inceptionPrice.price) / inceptionPrice.price
}

export { computeBenchmarkReturn }
