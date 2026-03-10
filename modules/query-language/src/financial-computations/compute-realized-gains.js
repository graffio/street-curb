// ABOUTME: Computes realized gains from lot allocations with long-term/short-term tax classification
// ABOUTME: Pure function — (Position, Context) → { totalRealizedGain, longTermGain, shortTermGain }

import { groupBy } from '@graffio/functional'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Checks if an allocation is within a date range (undefined range = all dates)
    // @sig isInDateRange :: ({ date: String }, Object?) -> Boolean
    isInDateRange: (record, dateRange) => {
        if (!dateRange) return true
        const { start, end } = dateRange
        if (start && record.date < start) return false
        if (end && record.date > end) return false
        return true
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Computes holding period in days between two ISO date strings
    // @sig toHoldingPeriodDays :: (String, String) -> Number
    toHoldingPeriodDays: (purchaseDate, sellDate) => {
        const purchase = new Date(purchaseDate)
        const sell = new Date(sellDate)
        return Math.round((sell - purchase) / (1000 * 60 * 60 * 24))
    },

    // Computes proceeds allocated to a single lot allocation via proration
    // Uses proceedsAllocated if pre-computed, otherwise prorates from sell transaction
    // @sig toProceedsAllocated :: (LotAllocation, Transaction) -> Number
    toProceedsAllocated: (alloc, sellTxn) => {
        const { proceedsAllocated, sharesAllocated } = alloc
        if (proceedsAllocated !== undefined) return proceedsAllocated
        const totalShares = Math.abs(sellTxn.quantity)
        return (sharesAllocated / totalShares) * Math.abs(sellTxn.amount)
    },

    // Classifies a realized gain as long-term or short-term (> 365 days = long-term)
    // @sig toGainClassification :: (Number, Number) -> { longTermGain: Number, shortTermGain: Number }
    toGainClassification: (gain, holdingPeriodDays) => ({
        longTermGain: holdingPeriodDays > 365 ? gain : 0,
        shortTermGain: holdingPeriodDays > 365 ? 0 : gain,
    }),

    // Accumulates one allocation's realized gain into the running totals
    // @sig toGainFromAllocation :: (Object, LotAllocation, Lot, Map) -> Object
    toGainFromAllocation: (acc, alloc, lot, sellTxnIndex) => {
        const { costBasisAllocated, date, transactionId } = alloc
        const sellTxn = sellTxnIndex.get(transactionId)
        if (!sellTxn) return acc

        const proceeds = T.toProceedsAllocated(alloc, sellTxn)
        const gain = proceeds - costBasisAllocated
        const holdingDays = T.toHoldingPeriodDays(lot.purchaseDate, date)
        const classified = T.toGainClassification(gain, holdingDays)
        const { longTermGain, shortTermGain, totalRealizedGain } = acc

        return {
            totalRealizedGain: totalRealizedGain + gain,
            longTermGain: longTermGain + classified.longTermGain,
            shortTermGain: shortTermGain + classified.shortTermGain,
        }
    },

    // Accumulates gains from all allocations for one lot
    // @sig toGainsForLot :: (Object, String, LookupTable, Object, Map, Object?) -> Object
    toGainsForLot: (acc, lotId, lots, allocationsByLot, sellTxnIndex, dateRange) => {
        const lot = lots.get(lotId)
        const allocs = (allocationsByLot[lotId] ?? []).filter(a => P.isInDateRange(a, dateRange))
        return allocs.reduce((inner, alloc) => T.toGainFromAllocation(inner, alloc, lot, sellTxnIndex), acc)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// @sig computeRealizedGains :: (Position, Context) -> { totalRealizedGain, longTermGain, shortTermGain }
const computeRealizedGains = (position, context) => {
    const { lots, lotAllocations, transactions, dateRange } = context
    const positionLots = lots.filter(
        lot => lot.accountId === position.accountId && lot.securityId === position.securityId,
    )
    const lotIds = positionLots.map(lot => lot.id)
    const allocationsByLot = groupBy(a => a.lotId, [...lotAllocations])
    const sellTxnIndex = new Map(
        transactions.filter(t => t.investmentAction === 'Sell' || t.investmentAction === 'SellX').map(t => [t.id, t]),
    )
    const init = { totalRealizedGain: 0, longTermGain: 0, shortTermGain: 0 }
    return lotIds.reduce(
        (acc, lotId) => T.toGainsForLot(acc, lotId, lots, allocationsByLot, sellTxnIndex, dateRange),
        init,
    )
}

export { computeRealizedGains }
