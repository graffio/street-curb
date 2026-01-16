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

    // Computes remaining quantity for a lot after allocations up to date
    // @sig toRemainingQuantity :: (Lot, [LotAllocation], String) -> Number
    toRemainingQuantity: (lot, allocations, date) => {
        const lotAllocs = allocations.filter(a => a.lotId === lot.id && a.date <= date)
        const totalAllocated = lotAllocs.reduce((sum, a) => sum + a.sharesAllocated, 0)
        return lot.quantity - totalAllocated
    },

    // Computes remaining cost basis for a lot after allocations up to date
    // @sig toRemainingCostBasis :: (Lot, [LotAllocation], String) -> Number
    toRemainingCostBasis: (lot, allocations, date) => {
        const lotAllocs = allocations.filter(a => a.lotId === lot.id && a.date <= date)
        const totalAllocatedCost = lotAllocs.reduce((sum, a) => sum + a.costBasisAllocated, 0)
        return lot.costBasis - totalAllocatedCost
    },

    // Creates a unique key for grouping lots by account and security
    // @sig toLotKey :: Lot -> String
    toLotKey: lot => `${lot.accountId}|${lot.securityId}`,

    // Aggregates a group of lots into a single holding
    // @sig toAggregatedHolding :: ([Lot], [LotAllocation], String) -> Holding
    toAggregatedHolding: (groupLots, allocations, date) => {
        const { accountId, securityId } = groupLots[0]
        const qty = groupLots.reduce((sum, lot) => sum + T.toRemainingQuantity(lot, allocations, date), 0)
        const cost = groupLots.reduce((sum, lot) => sum + T.toRemainingCostBasis(lot, allocations, date), 0)
        const avg = qty !== 0 ? cost / qty : 0
        return { accountId, securityId, quantity: qty, costBasis: cost, avgCostPerShare: avg }
    },

    // Gets cash balance from transactions as of a specific date
    // @sig toCashBalanceAsOf :: ([Transaction], String, String) -> Number
    toCashBalanceAsOf: (transactions, accountId, date) => {
        const accountTx = transactions.filter(t => t.accountId === accountId && t.date <= date)
        if (accountTx.length === 0) return 0
        const lastTx = accountTx[accountTx.length - 1]
        return lastTx.runningBalance ?? 0
    },

    // Creates cash holding for account if balance is non-zero, else null
    // @sig toCashHoldingOrNull :: ([Transaction], LookupTable<Account>, String, String) -> EnrichedHolding?
    toCashHoldingOrNull: (transactions, accounts, accountId, date) => {
        const cashBalance = T.toCashBalanceAsOf(transactions, accountId, date)
        return cashBalance !== 0
            ? F.createCashHolding(accountId, accounts.get(accountId)?.name ?? '', cashBalance)
            : null
    },

    // Enriches a holding with market value and gain/loss calculations
    // @sig toEnrichedHolding :: (Holding, State, String) -> EnrichedHolding
    toEnrichedHolding: (holding, state, date) => {
        const { accountId, avgCostPerShare, costBasis, quantity, securityId } = holding
        const { accounts, prices, securities } = state

        const security = securities.get(securityId)
        const account = accounts.get(accountId)
        const priceOnDate = A.findPriceAsOf(prices, securityId, date)
        const previousDayPrice = A.findPriceAsOf(prices, securityId, T.toPreviousDay(date))

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
    // Finds the most recent price for a security as of a date
    // @sig findPriceAsOf :: (LookupTable<Price>, String, String) -> Price?
    findPriceAsOf: (prices, securityId, date) => {
        const secPrices = filter(p => p.securityId === securityId, prices)
        return secPrices.find(p => p.date <= date) ?? null
    },

    // Filters lots to those open on a specific date
    // @sig filterLotsAsOf :: ([Lot], String) -> [Lot]
    filterLotsAsOf: (allLots, date) => allLots.filter(lot => P.isLotOpenOnDate(lot, date)),

    // Computes holdings from lots and allocations as of a specific date
    // @sig collectHoldingsFromLots :: ([Lot], [LotAllocation], String) -> [Holding]
    collectHoldingsFromLots: (allLots, allocations, date) => {
        const openLots = A.filterLotsAsOf(allLots, date)
        const grouped = groupBy(T.toLotKey, openLots)
        return Object.values(grouped)
            .map(groupLots => T.toAggregatedHolding(groupLots, allocations, date))
            .filter(h => h.quantity > 0)
    },

    // Collects enriched holdings as of a specific date (unmemoized, for memoization wrapper)
    // @sig collectEnrichedHoldingsAsOfCore :: (State, String) -> [EnrichedHolding]
    collectEnrichedHoldingsAsOfCore: (state, viewId) => {
        const asOfDate = asOfDateSelector(state, viewId)
        const selectedAccounts = selectedAccountsSelector(state, viewId)
        const filterQuery = filterQuerySelector(state, viewId)
        const { accounts, lotAllocations, lots, transactions } = state

        // Return empty if no lots loaded yet
        if (!lots || lots.length === 0) return []

        // Filter lots by selected accounts if any are selected
        const filteredLots =
            selectedAccounts.length > 0 ? lots.filter(l => selectedAccounts.includes(l.accountId)) : lots

        const holdings = A.collectHoldingsFromLots(filteredLots, lotAllocations, asOfDate)
        const enriched = holdings.map(h => T.toEnrichedHolding(h, state, asOfDate))

        // Get cash balances for investment accounts with holdings
        const accountIdsWithHoldings = [...new Set(enriched.map(h => h.accountId))]
        const cashHoldings = accountIdsWithHoldings
            .map(accId => T.toCashHoldingOrNull(transactions, accounts, accId, asOfDate))
            .filter(h => h !== null)

        const allHoldings = [...enriched, ...cashHoldings]

        // Filter by search query
        const searched = filterQuery ? allHoldings.filter(h => P.matchesSearch(h, filterQuery)) : allHoldings

        const total = searched.reduce((sum, h) => sum + h.marketValue, 0)
        return searched.map(h => ({ ...h, marketValuePct: total !== 0 ? h.marketValue / total : 0 }))
    },
}

// Collects enriched holdings as of a specific date (memoized per viewId)
// @sig collectEnrichedHoldingsAsOf :: (State, String) -> [EnrichedHolding]
const collectEnrichedHoldingsAsOf = memoizeReduxStatePerKey(
    ['lots', 'lotAllocations', 'prices', 'accounts', 'securities', 'transactions'],
    'transactionFilters',
    A.collectEnrichedHoldingsAsOfCore,
)

const HoldingsSelectors = { collectEnrichedHoldingsAsOf }

export { HoldingsSelectors }
