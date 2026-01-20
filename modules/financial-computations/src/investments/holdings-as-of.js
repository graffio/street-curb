// ABOUTME: Holdings computation as of a specific date
// ABOUTME: Aggregates lots, applies allocations, enriches with prices and market values

import { groupBy, LookupTable } from '@graffio/functional'
import { Holding, Price } from '../types/index.js'

// Reserved securityId for cash positions in investment accounts
const CASH_SECURITY_ID = 'sec_000000000000'

const P = {
    // Checks if a lot was open (not closed) on a given date
    // @sig isLotOpenOnDate :: (Lot, String) -> Boolean
    isLotOpenOnDate: (lot, date) => {
        const { closedDate, purchaseDate } = lot
        return purchaseDate <= date && (!closedDate || closedDate > date)
    },
}

const T = {
    // Gets the previous calendar day as ISO date string
    // @sig toPreviousDay :: String -> String
    toPreviousDay: dateStr => {
        const d = new Date(dateStr)
        d.setDate(d.getDate() - 1)
        return d.toISOString().slice(0, 10)
    },

    // Filters allocations to those on or before a date
    // @sig toAllocationsAsOf :: (Map, String, String) -> [LotAllocation]
    toAllocationsAsOf: (allocationIndex, lotId, date) => (allocationIndex.get(lotId) ?? []).filter(a => a.date <= date),

    // Computes remaining quantity after allocations
    // @sig toRemainingQuantity :: (Lot, [LotAllocation]) -> Number
    toRemainingQuantity: (lot, allocsAsOf) => lot.quantity - allocsAsOf.reduce((sum, a) => sum + a.sharesAllocated, 0),

    // Computes remaining cost basis after allocations
    // @sig toRemainingCostBasis :: (Lot, [LotAllocation]) -> Number
    toRemainingCostBasis: (lot, allocsAsOf) =>
        lot.costBasis - allocsAsOf.reduce((sum, a) => sum + a.costBasisAllocated, 0),

    // Creates a grouping key from account and security
    // @sig toLotKey :: Lot -> String
    toLotKey: lot => `${lot.accountId}|${lot.securityId}`,

    // Accumulates quantity and cost from a lot
    // @sig toLotTotals :: ({qty, cost}, Lot, Map, String) -> {qty, cost}
    toLotTotals: (acc, lot, allocationIndex, date) => {
        const allocsAsOf = T.toAllocationsAsOf(allocationIndex, lot.id, date)
        return {
            qty: acc.qty + T.toRemainingQuantity(lot, allocsAsOf),
            cost: acc.cost + T.toRemainingCostBasis(lot, allocsAsOf),
        }
    },

    // Aggregates a group of lots into summary data
    // @sig toAggregatedLots :: ([Lot], Map, String) -> LotAggregate
    toAggregatedLots: (groupLots, allocationIndex, date) => {
        const { accountId, securityId } = groupLots[0]
        const init = { qty: 0, cost: 0 }
        const { qty, cost } = groupLots.reduce((acc, lot) => T.toLotTotals(acc, lot, allocationIndex, date), init)
        return {
            accountId,
            securityId,
            quantity: qty,
            costBasis: cost,
            averageCostPerShare: qty !== 0 ? cost / qty : 0,
        }
    },

    // Gets cash balance from transactions as of a date
    // @sig toCashBalanceAsOf :: (Map, String, String) -> Number
    toCashBalanceAsOf: (transactionIndex, accountId, date) => {
        const asOf = (transactionIndex.get(accountId) ?? []).filter(t => t.date <= date)
        return asOf.length === 0 ? 0 : (asOf[asOf.length - 1].runningBalance ?? 0)
    },

    // Enriches aggregated lot data into a Holding with market values
    // @sig toHolding :: (LotAggregate, LookupTable, LookupTable, Map, String) -> Holding
    // prettier-ignore
    toHolding: (lotData, accounts, securities, priceIndex, date) => {
        const { accountId, averageCostPerShare, costBasis, quantity, securityId } = lotData
        const security = securities.get(securityId)
        const account = accounts.get(accountId)
        const priceOnDate = A.findPriceAsOf(priceIndex, securityId, date)
        const previousDayPrice = A.findPriceAsOf(priceIndex, securityId, T.toPreviousDay(date))

        const { goal, name, symbol, type } = security ?? {}
        const quotePrice = priceOnDate?.price ?? 0
        const priceDt = priceOnDate?.date ?? null
        const isStale = priceDt ? Price.isStale(priceDt, date) : true

        const marketValue = quantity * quotePrice
        const unrealizedGainLoss = marketValue - costBasis
        const unrealizedGainLossPercent = costBasis !== 0 ? unrealizedGainLoss / costBasis : 0

        const previousQuotePrice = previousDayPrice?.price ?? quotePrice
        const dayGainLoss = quantity * (quotePrice - previousQuotePrice)
        const dayGainLossPercent = previousQuotePrice !== 0 ? (quotePrice - previousQuotePrice) / previousQuotePrice : 0

        return Holding(accountId, account?.name ?? '', securityId, name ?? '', symbol ?? '', type ?? '', goal ?? null,
            quantity, costBasis, averageCostPerShare, quotePrice, marketValue, unrealizedGainLoss,
            unrealizedGainLossPercent, dayGainLoss, dayGainLossPercent, isStale)
    },
}

const F = {
    // Creates a cash pseudo-holding for an investment account
    // @sig createCashHolding :: (String, String, Number) -> Holding
    // prettier-ignore
    createCashHolding: (accountId, accountName, cashBalance) =>
        Holding(accountId, accountName, CASH_SECURITY_ID, 'Cash', 'CASH', 'Cash', null, cashBalance, cashBalance, 1, 1,
            cashBalance, 0, 0, 0, 0, false),
}

const A = {
    // Builds a Map of securityId -> LookupTable for O(1) price lookups
    // @sig buildPriceIndex :: LookupTable<Price> -> Map<String, LookupTable<Price, 'date'>>
    buildPriceIndex: prices => {
        const grouped = groupBy(p => p.securityId, prices)
        return new Map(Object.entries(grouped).map(([secId, arr]) => [secId, LookupTable(arr, Price, 'date')]))
    },

    // Builds a Map of lotId -> allocations for O(1) lookups
    // @sig buildAllocationIndex :: LookupTable<LotAllocation> -> Map<String, [LotAllocation]>
    buildAllocationIndex: allocations => new Map(Object.entries(groupBy(a => a.lotId, allocations))),

    // Builds a Map of accountId -> transactions for O(1) lookups
    // @sig buildTransactionIndex :: LookupTable<Transaction> -> Map<String, [Transaction]>
    buildTransactionIndex: transactions => new Map(Object.entries(groupBy(t => t.accountId, transactions))),

    // Finds the most recent price for a security as of a date
    // @sig findPriceAsOf :: (Map<String, LookupTable<Price>>, String, String) -> Price?
    findPriceAsOf: (priceIndex, securityId, date) => {
        const secPrices = priceIndex.get(securityId)
        if (!secPrices) return null
        return secPrices.get(date) ?? secPrices.find(p => p.date <= date) ?? null
    },

    // Filters and aggregates lots that are open on a date
    // @sig collectAggregatedLots :: ([Lot], Map, String) -> [LotAggregate]
    collectAggregatedLots: (lots, allocationIndex, date) => {
        const openLots = lots.filter(lot => P.isLotOpenOnDate(lot, date))
        const grouped = groupBy(T.toLotKey, openLots)
        return Object.values(grouped)
            .map(g => T.toAggregatedLots(g, allocationIndex, date))
            .filter(h => h.quantity > 0)
    },
}

// Computes holdings as of a specific date from raw data
// @sig computeHoldingsAsOf :: HoldingsConfig -> [Holding]
// prettier-ignore
const computeHoldingsAsOf = config => {
    const { lots, lotAllocations, prices, accounts, securities, transactions, asOfDate } = config
    const { selectedAccountIds, filterQuery } = config
    if (!lots || lots.length === 0) return []

    const allocationIndex = A.buildAllocationIndex(lotAllocations)
    const priceIndex = A.buildPriceIndex(prices)
    const transactionIndex = A.buildTransactionIndex(transactions)

    const filteredLots = selectedAccountIds?.length > 0 ? lots.filter(l => selectedAccountIds.includes(l.accountId)) : lots
    const aggregatedLots = A.collectAggregatedLots(filteredLots, allocationIndex, asOfDate)
    const holdings = aggregatedLots.map(lotData => T.toHolding(lotData, accounts, securities, priceIndex, asOfDate))

    const accountIdsWithHoldings = [...new Set(holdings.map(h => h.accountId))]
    const cashHoldings = accountIdsWithHoldings
        .map(accId => {
            const balance = T.toCashBalanceAsOf(transactionIndex, accId, asOfDate)
            return balance !== 0 ? F.createCashHolding(accId, accounts.get(accId)?.name ?? '', balance) : null
        })
        .filter(h => h !== null)

    const allHoldings = [...holdings, ...cashHoldings]
    return filterQuery ? allHoldings.filter(h => Holding.matchesSearch(h, filterQuery)) : allHoldings
}

const HoldingsAsOf = { computeHoldingsAsOf }

export { HoldingsAsOf }
