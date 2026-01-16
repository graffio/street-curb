// ABOUTME: Holdings selectors with price enrichment
// ABOUTME: Computes market values, gains/losses, and staleness indicators

import { groupBy, LookupTable, memoizeReduxState, memoizeReduxStatePerKey } from '@graffio/functional'
import { Price } from '../../types/price.js'
import {
    asOfDate as asOfDateSelector,
    filterQuery as filterQuerySelector,
    selectedAccounts as selectedAccountsSelector,
} from './ui.js'

// Number of days before a price is considered stale
const STALE_DAYS = 1

const P = {
    // Checks if a price is stale relative to target date
    // @sig isStalePrice :: (String, String) -> Boolean
    isStalePrice: (priceDate, targetDate) => {
        const priceDateObj = new Date(priceDate)
        const targetDateObj = new Date(targetDate)
        const diffMs = targetDateObj - priceDateObj
        const diffDays = diffMs / (1000 * 60 * 60 * 24)
        return diffDays > STALE_DAYS
    },

    // Checks if a lot was open on a specific date
    // @sig isLotOpenOnDate :: (Lot, String) -> Boolean
    isLotOpenOnDate: (lot, date) => {
        const { closedDate, purchaseDate } = lot
        const isOpen = !closedDate || closedDate > date
        return purchaseDate <= date && isOpen
    },

    // Checks if holding matches search query
    // @sig matchesSearch :: (EnrichedHolding, String) -> Boolean
    matchesSearch: (holding, query) => {
        if (!query) return true
        const lowerQuery = query.toLowerCase()
        const { accountName, securityName, securitySymbol } = holding
        return (
            securityName.toLowerCase().includes(lowerQuery) ||
            securitySymbol.toLowerCase().includes(lowerQuery) ||
            accountName.toLowerCase().includes(lowerQuery)
        )
    },
}

const T = {
    // Gets the previous day as ISO date string
    // @sig toPreviousDay :: String -> String
    toPreviousDay: dateStr => {
        const d = new Date(dateStr)
        d.setDate(d.getDate() - 1)
        return d.toISOString().slice(0, 10)
    },

    // Gets allocations for a lot up to a date from the index
    // @sig toAllocationsAsOf :: (Map, String, String) -> [LotAllocation]
    toAllocationsAsOf: (allocationIndex, lotId, date) => {
        const lotAllocs = allocationIndex.get(lotId) ?? []
        return lotAllocs.filter(a => a.date <= date)
    },

    // Computes remaining quantity for a lot after allocations up to date
    // @sig toRemainingQuantity :: (Lot, [LotAllocation]) -> Number
    toRemainingQuantity: (lot, allocsAsOf) => {
        const totalAllocated = allocsAsOf.reduce((sum, a) => sum + a.sharesAllocated, 0)
        return lot.quantity - totalAllocated
    },

    // Computes remaining cost basis for a lot after allocations up to date
    // @sig toRemainingCostBasis :: (Lot, [LotAllocation]) -> Number
    toRemainingCostBasis: (lot, allocsAsOf) => {
        const totalAllocatedCost = allocsAsOf.reduce((sum, a) => sum + a.costBasisAllocated, 0)
        return lot.costBasis - totalAllocatedCost
    },

    // Creates a unique key for grouping lots by account and security
    // @sig toLotKey :: Lot -> String
    toLotKey: lot => `${lot.accountId}|${lot.securityId}`,

    // Computes remaining qty and cost for a lot, returning accumulated totals
    // @sig toLotTotals :: ({qty, cost}, Lot, Map, String) -> {qty, cost}
    toLotTotals: (acc, lot, allocationIndex, date) => {
        const allocsAsOf = T.toAllocationsAsOf(allocationIndex, lot.id, date)
        return {
            qty: acc.qty + T.toRemainingQuantity(lot, allocsAsOf),
            cost: acc.cost + T.toRemainingCostBasis(lot, allocsAsOf),
        }
    },

    // Aggregates a group of lots into a single holding using allocation index
    // @sig toAggregatedHolding :: ([Lot], Map, String) -> Holding
    toAggregatedHolding: (groupLots, allocationIndex, date) => {
        const { accountId, securityId } = groupLots[0]
        const init = { qty: 0, cost: 0 }
        const { qty, cost } = groupLots.reduce((acc, lot) => T.toLotTotals(acc, lot, allocationIndex, date), init)
        const avg = qty !== 0 ? cost / qty : 0
        return { accountId, securityId, quantity: qty, costBasis: cost, avgCostPerShare: avg }
    },

    // Gets cash balance from transactions as of a specific date using transaction index
    // @sig toCashBalanceAsOf :: (Map, String, String) -> Number
    toCashBalanceAsOf: (transactionIndex, accountId, date) => {
        const accountTx = transactionIndex.get(accountId) ?? []

        // Transactions are sorted by date from SQL, find last one <= date
        const asOf = accountTx.filter(t => t.date <= date)
        if (asOf.length === 0) return 0
        return asOf[asOf.length - 1].runningBalance ?? 0
    },

    // Creates cash holding for account if balance is non-zero, else null
    // @sig toCashHoldingOrNull :: (Map, LookupTable<Account>, String, String) -> EnrichedHolding?
    toCashHoldingOrNull: (transactionIndex, accounts, accountId, date) => {
        const cashBalance = T.toCashBalanceAsOf(transactionIndex, accountId, date)
        return cashBalance !== 0
            ? F.createCashHolding(accountId, accounts.get(accountId)?.name ?? '', cashBalance)
            : null
    },

    // Enriches a holding with market value and gain/loss calculations
    // @sig toEnrichedHolding :: (Holding, State, Map, String) -> EnrichedHolding
    toEnrichedHolding: (holding, state, priceIndex, date) => {
        const { accountId, avgCostPerShare, costBasis, quantity, securityId } = holding
        const { accounts, securities } = state

        const security = securities.get(securityId)
        const account = accounts.get(accountId)
        const priceOnDate = A.findPriceAsOf(priceIndex, securityId, date)
        const previousDayPrice = A.findPriceAsOf(priceIndex, securityId, T.toPreviousDay(date))

        const { goal, name, symbol, type } = security ?? {}

        const quotePrice = priceOnDate?.price ?? 0
        const priceDt = priceOnDate?.date ?? null
        const isStale = priceDt ? P.isStalePrice(priceDt, date) : true

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
    },
}

const F = {
    // Creates a cash pseudo-holding for an investment account
    // @sig createCashHolding :: (String, String, Number) -> EnrichedHolding
    createCashHolding: (accountId, accountName, cashBalance) => ({
        accountId,
        securityId: null,
        quantity: cashBalance,
        costBasis: cashBalance,
        avgCostPerShare: 1,
        securityName: 'Cash',
        securitySymbol: 'CASH',
        securityType: 'Cash',
        securityGoal: null,
        accountName,
        quotePrice: 1,
        priceDate: null,
        isStale: false,
        marketValue: cashBalance,
        unrealizedGainLoss: 0,
        unrealizedGainLossPct: 0,
        dayGainLoss: 0,
        dayGainLossPct: 0,
    }),
}

const A = {
    // Builds a Map of securityId -> LookupTable<Price, 'date'> for O(1) lookups
    // @sig buildPriceIndex :: LookupTable<Price> -> Map<String, LookupTable<Price, 'date'>>
    buildPriceIndex: prices => {
        // Group prices by securityId (prices are already sorted by securityId, date DESC from SQL)
        const grouped = groupBy(p => p.securityId, prices)

        // Convert to Map with LookupTables keyed by date for O(1) exact-date lookups
        const entries = Object.entries(grouped).map(([secId, arr]) => [secId, LookupTable(arr, Price, 'date')])
        return new Map(entries)
    },

    // Builds a Map of lotId -> LotAllocation[] for O(1) lookups (sorted by date from SQL)
    // @sig buildAllocationIndex :: LookupTable<LotAllocation> -> Map<String, [LotAllocation]>
    buildAllocationIndex: allocations => {
        const grouped = groupBy(a => a.lotId, allocations)
        return new Map(Object.entries(grouped))
    },

    // Builds a Map of accountId -> Transaction[] for O(1) lookups (sorted by date from SQL)
    // @sig buildTransactionIndex :: LookupTable<Transaction> -> Map<String, [Transaction]>
    buildTransactionIndex: transactions => {
        const grouped = groupBy(t => t.accountId, transactions)
        return new Map(Object.entries(grouped))
    },

    // Finds the most recent price for a security as of a date using the indexed structure
    // @sig findPriceAsOf :: (Map<String, LookupTable<Price>>, String, String) -> Price?
    findPriceAsOf: (priceIndex, securityId, date) => {
        const secPrices = priceIndex.get(securityId)
        if (!secPrices) return null

        // Try exact date match first (O(1))
        const exact = secPrices.get(date)
        if (exact) return exact

        // Otherwise find most recent before date (prices sorted DESC, so first match wins)
        return secPrices.find(p => p.date <= date) ?? null
    },

    // Filters lots to those open on a specific date
    // @sig filterLotsAsOf :: ([Lot], String) -> [Lot]
    filterLotsAsOf: (allLots, date) => allLots.filter(lot => P.isLotOpenOnDate(lot, date)),

    // Computes holdings from lots using allocation index
    // @sig collectHoldingsFromLots :: ([Lot], Map, String) -> [Holding]
    collectHoldingsFromLots: (allLots, allocationIndex, date) => {
        const openLots = A.filterLotsAsOf(allLots, date)
        const grouped = groupBy(T.toLotKey, openLots)
        return Object.values(grouped)
            .map(groupLots => T.toAggregatedHolding(groupLots, allocationIndex, date))
            .filter(h => h.quantity > 0)
    },

    // Collects enriched holdings as of a specific date (unmemoized, for memoization wrapper)
    // @sig collectEnrichedHoldingsAsOfCore :: (State, String, [Index]) -> [EnrichedHolding]
    collectEnrichedHoldingsAsOfCore: (state, viewId, indices) => {
        const [allocationIndex, priceIndex, transactionIndex] = indices
        const asOfDate = asOfDateSelector(state, viewId)
        const selectedAccounts = selectedAccountsSelector(state, viewId)
        const filterQuery = filterQuerySelector(state, viewId)
        const { accounts, lots } = state

        // Return empty if no lots loaded yet
        if (!lots || lots.length === 0) return []

        // Filter lots by selected accounts if any are selected
        const filteredLots =
            selectedAccounts.length > 0 ? lots.filter(l => selectedAccounts.includes(l.accountId)) : lots

        const holdings = A.collectHoldingsFromLots(filteredLots, allocationIndex, asOfDate)
        const enriched = holdings.map(h => T.toEnrichedHolding(h, state, priceIndex, asOfDate))

        // Get cash balances for investment accounts with holdings
        const accountIdsWithHoldings = [...new Set(enriched.map(h => h.accountId))]
        const cashHoldings = accountIdsWithHoldings
            .map(accId => T.toCashHoldingOrNull(transactionIndex, accounts, accId, asOfDate))
            .filter(h => h !== null)

        const allHoldings = [...enriched, ...cashHoldings]

        // Filter by search query
        const searched = filterQuery ? allHoldings.filter(h => P.matchesSearch(h, filterQuery)) : allHoldings

        const total = searched.reduce((sum, h) => sum + h.marketValue, 0)
        return searched.map(h => ({ ...h, marketValuePct: total !== 0 ? h.marketValue / total : 0 }))
    },
}

// Builds price index (memoized - only rebuilds when prices change, which is never after load)
// @sig priceIndex :: State -> Map<String, LookupTable<Price, 'date'>>
const priceIndex = memoizeReduxState(['prices'], state => A.buildPriceIndex(state.prices))

// Builds allocation index (memoized - only rebuilds when lotAllocations change)
// @sig allocationIndex :: State -> Map<String, [LotAllocation]>
const allocationIndex = memoizeReduxState(['lotAllocations'], state => A.buildAllocationIndex(state.lotAllocations))

// Builds transaction index (memoized - only rebuilds when transactions change)
// @sig transactionIndex :: State -> Map<String, [Transaction]>
const transactionIndex = memoizeReduxState(['transactions'], state => A.buildTransactionIndex(state.transactions))

// Collects enriched holdings as of a specific date (memoized per viewId)
// @sig collectEnrichedHoldingsAsOf :: (State, String) -> [EnrichedHolding]
// prettier-ignore
const collectEnrichedHoldingsAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    (state, viewId) => {
        const idx = [allocationIndex(state), priceIndex(state), transactionIndex(state)]
        return A.collectEnrichedHoldingsAsOfCore(state, viewId, idx)
    },
)

const HoldingsSelectors = { collectEnrichedHoldingsAsOf }

export { HoldingsSelectors }
