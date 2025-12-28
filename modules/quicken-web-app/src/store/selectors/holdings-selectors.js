// ABOUTME: Holdings selectors with price enrichment
// ABOUTME: Computes market values, gains/losses, and staleness indicators

import { filter, groupBy, memoizeReduxStatePerKey } from '@graffio/functional'
import {
    asOfDate as asOfDateSelector,
    filterQuery as filterQuerySelector,
    selectedAccounts as selectedAccountsSelector,
} from './ui.js'

// Number of days before a price is considered stale
const STALE_DAYS = 1

/*
 * Get holdings as of a specific date with enrichment (unmemoized)
 * Uses lots + allocations for accurate FIFO cost basis
 * @sig _enrichedHoldingsAsOf :: (State, String) -> [EnrichedHolding]
 */
const _enrichedHoldingsAsOf = (state, viewId) => {
    /*
     * Get the price for a security as of a specific date (most recent price <= date)
     * @sig priceAsOf :: (LookupTable<Price>, String, String) -> Price?
     */
    const priceAsOf = (prices, securityId, date) => {
        const secPrices = filter(p => p.securityId === securityId, prices)
        return secPrices.find(p => p.date <= date) ?? null
    }

    /*
     * Filter lots to those that were open on a specific date
     * A lot is open on date if: purchaseDate <= date AND (closedDate IS NULL OR closedDate > date)
     * @sig lotsAsOf :: ([Lot], String) -> [Lot]
     */
    const lotsAsOf = (allLots, date) => {
        // @sig isOpenOnDate :: Lot -> Boolean
        const isOpenOnDate = lot => {
            const { closedDate, purchaseDate } = lot
            const isOpen = !closedDate || closedDate > date
            return purchaseDate <= date && isOpen
        }

        return allLots.filter(isOpenOnDate)
    }

    /*
     * Enrich a holding with computed fields using historical price
     * @sig enrichHoldingAsOf :: (Holding, State, String) -> EnrichedHolding
     */
    const enrichHoldingAsOf = (holding, st, date) => {
        // @sig isStalePrice :: (String, String) -> Boolean
        const isStalePrice = (priceDate, targetDate) => {
            const priceDateObj = new Date(priceDate)
            const targetDateObj = new Date(targetDate)
            const diffMs = targetDateObj - priceDateObj
            const diffDays = diffMs / (1000 * 60 * 60 * 24)
            return diffDays > STALE_DAYS
        }

        // @sig getPreviousDay :: String -> String
        const getPreviousDay = dateStr => {
            const d = new Date(dateStr)
            d.setDate(d.getDate() - 1)
            return d.toISOString().slice(0, 10)
        }

        const { accountId, avgCostPerShare, costBasis, quantity, securityId } = holding
        const { accounts, prices, securities } = st

        const security = securities.get(securityId)
        const account = accounts.get(accountId)
        const priceOnDate = priceAsOf(prices, securityId, date)
        const previousDayPrice = priceAsOf(prices, securityId, getPreviousDay(date))

        const { goal, name, symbol, type } = security ?? {}

        const quotePrice = priceOnDate?.price ?? 0
        const priceDt = priceOnDate?.date ?? null
        const isStale = priceDt ? isStalePrice(priceDt, date) : true

        const marketValue = quantity * quotePrice
        const unrealizedGainLoss = marketValue - costBasis
        const unrealizedGainLossPct = costBasis !== 0 ? unrealizedGainLoss / costBasis : 0

        const previousQuotePrice = previousDayPrice?.price ?? quotePrice
        const dayGainLoss = quantity * (quotePrice - previousQuotePrice)
        const dayGainLossPct = previousQuotePrice !== 0 ? (quotePrice - previousQuotePrice) / previousQuotePrice : 0

        return {
            ...holding,
            avgCostPerShare,
            securityName: name ?? '',
            securitySymbol: symbol ?? '',
            securityType: type ?? null,
            securityGoal: goal ?? null,
            accountName: account?.name ?? '',
            quotePrice,
            priceDate: priceDt,
            isStale,
            marketValue,
            unrealizedGainLoss,
            unrealizedGainLossPct,
            dayGainLoss,
            dayGainLossPct,
        }
    }

    // @sig lotRemainingQuantityAsOf :: (Lot, [LotAllocation], String) -> Number
    const lotRemainingQuantityAsOf = (lot, allocations, date) => {
        const lotAllocs = allocations.filter(a => a.lotId === lot.id && a.date <= date)
        const totalAllocated = lotAllocs.reduce((sum, a) => sum + a.sharesAllocated, 0)
        return lot.quantity - totalAllocated
    }

    // @sig lotCostBasisAsOf :: (Lot, [LotAllocation], String) -> Number
    const lotCostBasisAsOf = (lot, allocations, date) => {
        const lotAllocs = allocations.filter(a => a.lotId === lot.id && a.date <= date)
        const totalAllocatedCost = lotAllocs.reduce((sum, a) => sum + a.costBasisAllocated, 0)
        return lot.costBasis - totalAllocatedCost
    }

    /*
     * Compute holdings from lots and allocations as of a specific date
     * @sig holdingsFromLotsAsOf :: ([Lot], [LotAllocation], String) -> [{ accountId, securityId, quantity, costBasis }]
     */
    const holdingsFromLotsAsOf = (allLots, allocations, date) => {
        // @sig makeKey :: Lot -> String
        const makeKey = lot => `${lot.accountId}|${lot.securityId}`

        // @sig aggregateLotGroup :: [Lot] -> { accountId, securityId, quantity, costBasis, avgCostPerShare }
        const aggregateLotGroup = groupLots => {
            const { accountId, securityId } = groupLots[0]
            const qty = groupLots.reduce((sum, lot) => sum + lotRemainingQuantityAsOf(lot, allocations, date), 0)
            const cost = groupLots.reduce((sum, lot) => sum + lotCostBasisAsOf(lot, allocations, date), 0)
            const avg = qty !== 0 ? cost / qty : 0
            return { accountId, securityId, quantity: qty, costBasis: cost, avgCostPerShare: avg }
        }

        const openLots = lotsAsOf(allLots, date)
        const grouped = groupBy(makeKey, openLots)
        return Object.entries(grouped)
            .map(([, groupLots]) => aggregateLotGroup(groupLots))
            .filter(h => h.quantity > 0)
    }

    // @sig matchesSearch :: (EnrichedHolding, String) -> Boolean
    const matchesSearch = (holding, query) => {
        if (!query) return true
        const lowerQuery = query.toLowerCase()
        const { securityName, securitySymbol, accountName } = holding
        return (
            securityName.toLowerCase().includes(lowerQuery) ||
            securitySymbol.toLowerCase().includes(lowerQuery) ||
            accountName.toLowerCase().includes(lowerQuery)
        )
    }

    const asOfDate = asOfDateSelector(state, viewId)
    const selectedAccounts = selectedAccountsSelector(state, viewId)
    const filterQuery = filterQuerySelector(state, viewId)
    const { lotAllocations, lots } = state

    // Filter lots by selected accounts if any are selected
    const filteredLots = selectedAccounts.length > 0 ? lots.filter(l => selectedAccounts.includes(l.accountId)) : lots

    const holdings = holdingsFromLotsAsOf(filteredLots, lotAllocations, asOfDate)
    const enriched = holdings.map(h => enrichHoldingAsOf(h, state, asOfDate))

    // Filter by search query
    const searched = filterQuery ? enriched.filter(h => matchesSearch(h, filterQuery)) : enriched

    const total = searched.reduce((sum, h) => sum + h.marketValue, 0)
    return searched.map(h => ({ ...h, marketValuePct: total !== 0 ? h.marketValue / total : 0 }))
}

/*
 * Get holdings as of a specific date with enrichment (memoized per viewId)
 * @sig enrichedHoldingsAsOf :: (State, String) -> [EnrichedHolding]
 */
const enrichedHoldingsAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities'],
    'transactionFilters',
    _enrichedHoldingsAsOf,
)

export { enrichedHoldingsAsOf }
