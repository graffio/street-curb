// ABOUTME: FIFO lot tracking computed from investment transactions
// ABOUTME: Extracted from import.js per D12 because it's algorithmically distinct

import { StableIdentity } from './stable-identity.js'
import { Signatures as SigT } from './signatures.js'

// Investment action categories for lot processing
const BUY_ACTIONS = ['Buy', 'BuyX', 'CvrShrt']
const REINVEST_ACTIONS = ['ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvSh', 'ReinvMd']
const SHARES_IN_ACTIONS = ['ShrsIn']
const SELL_ACTIONS = ['Sell', 'SellX', 'ShtSell']
const SHARES_OUT_ACTIONS = ['ShrsOut']
const SPLIT_ACTIONS = ['StkSplit']
const OPTION_ACTIONS = ['Grant', 'Vest', 'Exercise']
const CASH_ONLY_ACTIONS = [
    'Div',
    'DivX',
    'IntInc',
    'MiscInc',
    'MiscIncX',
    'MiscExp',
    'MargInt',
    'Cash',
    'CGShort',
    'CGLong',
    'ContribX',
    'WithdrwX',
    'RtrnCapX',
    'Reminder',
    'Expire',
]
const TRANSFER_ACTIONS = ['XOut', 'XIn']

// Threshold for floating-point comparisons
const EPSILON = 1e-10

const P = {
    // Check if quantity is significant (not effectively zero)
    // @sig isSignificantQuantity :: Number -> Boolean
    isSignificantQuantity: quantity => Math.abs(quantity) > EPSILON,

    // Check if action is a buy operation (Buy, BuyX, CvrShrt)
    // @sig isBuyAction :: String -> Boolean
    isBuyAction: action => BUY_ACTIONS.includes(action),

    // Check if action is a dividend reinvestment
    // @sig isReinvestAction :: String -> Boolean
    isReinvestAction: action => REINVEST_ACTIONS.includes(action),

    // Check if action transfers shares into account
    // @sig isSharesInAction :: String -> Boolean
    isSharesInAction: action => SHARES_IN_ACTIONS.includes(action),

    // Check if action is a sell operation (Sell, SellX, ShtSell)
    // @sig isSellAction :: String -> Boolean
    isSellAction: action => SELL_ACTIONS.includes(action),

    // Check if action transfers shares out of account
    // @sig isSharesOutAction :: String -> Boolean
    isSharesOutAction: action => SHARES_OUT_ACTIONS.includes(action),

    // Check if action is a stock split
    // @sig isSplitAction :: String -> Boolean
    isSplitAction: action => SPLIT_ACTIONS.includes(action),

    // Check if action is an option operation (Grant, Vest, Exercise)
    // @sig isOptionAction :: String -> Boolean
    isOptionAction: action => OPTION_ACTIONS.includes(action),

    // Check if action affects only cash (dividends, interest, fees)
    // @sig isCashOnlyAction :: String -> Boolean
    isCashOnlyAction: action => CASH_ONLY_ACTIONS.includes(action),

    // Check if action is an account transfer (XIn, XOut)
    // @sig isTransferAction :: String -> Boolean
    isTransferAction: action => TRANSFER_ACTIONS.includes(action),

    // Check if action affects lot positions (excludes cash-only and transfers)
    // @sig isRelevantAction :: String -> Boolean
    isRelevantAction: action => action && !P.isCashOnlyAction(action) && !P.isTransferAction(action),
}

const T = {
    // Get open lots for an account/security (sorted by openDate for FIFO)
    // @sig toOpenLots :: (Map, String, String) -> [Lot]
    toOpenLots: (lotsMap, accountId, securityId) => {
        const key = `${accountId}|${securityId}`
        return (lotsMap.get(key) || []).filter(lot => lot.remainingQuantity !== 0)
    },

    // FIFO lot reduction - process sell/cover transactions against existing lots
    // @sig toLotReduction :: ([Lot], Number, String, Boolean) -> { modifiedLots, allocations, remainingShares }
    toLotReduction: (openLots, sharesToReduce, transactionDate, isSellingLong = true) => {
        // Reduce a single lot by the remaining shares needed, updating allocations and modified lots
        // @sig reduceOneLot :: (State, Lot) -> State
        const reduceOneLot = (state, lot) => {
            const { allocations, modifiedLots, remaining } = state
            if (remaining <= EPSILON) return state
            const { costBasis, quantity, remainingQuantity } = lot

            const lotQuantity = Math.abs(remainingQuantity)
            const toReduce = Math.min(lotQuantity, remaining)
            const newRemaining = remainingQuantity - Math.sign(remainingQuantity) * toReduce
            const costBasisPerShare = costBasis / Math.abs(quantity)
            const allocatedCostBasis = toReduce * costBasisPerShare
            const isClosed = Math.abs(newRemaining) <= EPSILON

            return {
                remaining: remaining - toReduce,
                modifiedLots: [
                    ...modifiedLots,
                    {
                        lot,
                        newRemainingQuantity: isClosed ? 0 : newRemaining,
                        closedDate: isClosed ? transactionDate : null,
                    },
                ],
                allocations: [
                    ...allocations,
                    { lot, sharesAllocated: toReduce, costBasisAllocated: allocatedCostBasis },
                ],
            }
        }

        // For selling long positions: filter to positive remainingQuantity
        // For covering shorts: filter to negative remainingQuantity
        const relevantLots = isSellingLong
            ? openLots.filter(lot => lot.remainingQuantity > EPSILON)
            : openLots.filter(lot => lot.remainingQuantity < -EPSILON)

        const initial = { remaining: Math.abs(sharesToReduce), modifiedLots: [], allocations: [] }
        const { allocations, modifiedLots, remaining } = relevantLots.reduce(reduceOneLot, initial)
        return { modifiedLots, allocations, remainingShares: remaining }
    },

    // Process buy transaction - first covers any shorts, then creates new lot for remaining
    // @sig toLotFromBuy :: (Transaction, [Lot], String, String) -> { newLot, modifiedLots, allocations }
    toLotFromBuy: (transaction, openLots, accountId, securityId) => {
        const { amount, date, quantity } = transaction
        if (!P.isSignificantQuantity(quantity)) return { newLot: null, modifiedLots: [], allocations: [] }

        // First, try to cover any short positions (isSellingLong = false means we're covering shorts)
        const { modifiedLots, allocations, remainingShares } = T.toLotReduction(openLots, quantity, date, false)

        // Create new lot for any remaining shares
        const newLot =
            remainingShares > EPSILON
                ? F.createLotFromTransaction(
                      { ...transaction, quantity: remainingShares, amount: (amount / quantity) * remainingShares },
                      accountId,
                      securityId,
                  )
                : null

        return { newLot, modifiedLots, allocations }
    },

    // Process sell transaction - reduces long lots FIFO, creates short lot if oversold
    // @sig toLotFromSell :: (Transaction, [Lot], String, String) -> { newLot, modifiedLots, allocations }
    toLotFromSell: (transaction, openLots, accountId, securityId) => {
        const { date, quantity, id } = transaction
        if (!P.isSignificantQuantity(quantity)) return { newLot: null, modifiedLots: [], allocations: [] }

        // Reduce existing long positions FIFO
        const { modifiedLots, allocations, remainingShares } = T.toLotReduction(openLots, quantity, date, true)

        // If shares remain after all lots consumed, create short position (negative quantity)
        const newLot =
            remainingShares > EPSILON
                ? {
                      accountId,
                      securityId,
                      openDate: date,
                      openTransactionId: id,
                      quantity: -remainingShares,
                      remainingQuantity: -remainingShares,
                      costBasis: 0, // Short position has no cost basis until covered
                  }
                : null

        return { newLot, modifiedLots, allocations }
    },

    // Determine cost basis for dividend reinvestment (priority: amount > price*qty > historical price)
    // @sig toDividendCostBasis :: (Transaction, Database, String) -> Number | null
    toDividendCostBasis: (transaction, db, securityId) => {
        const { amount, date, price, quantity } = transaction

        // Priority 1: Transaction amount if present
        if (amount && Math.abs(amount) > EPSILON) return Math.abs(amount)

        // Priority 2: Price * quantity if price present
        if (price && Math.abs(price) > EPSILON) return price * quantity

        // Priority 3: Historical price lookup (most recent price <= transaction date)
        const historicalPrice = db
            .prepare('SELECT price FROM prices WHERE securityId = ? AND date <= ? ORDER BY date DESC LIMIT 1')
            .get(securityId, date)

        if (historicalPrice) return historicalPrice.price * quantity

        // No price found
        return null
    },

    // Process dividend reinvestment - creates lot with derived cost basis
    // @sig toLotFromDividend :: (Transaction, Database, String, String) -> { newLot, warning }
    toLotFromDividend: (transaction, db, accountId, securityId) => {
        const { date, quantity, id } = transaction
        if (!P.isSignificantQuantity(quantity)) return { newLot: null, warning: null }

        const costBasis = T.toDividendCostBasis(transaction, db, securityId)
        if (costBasis === null)
            return { newLot: null, warning: `No cost basis found for reinvestment: ${date} ${quantity} shares` }

        const newLot = {
            accountId,
            securityId,
            openDate: date,
            openTransactionId: id,
            quantity,
            remainingQuantity: quantity,
            costBasis,
        }

        return { newLot, warning: null }
    },

    // Apply split ratio to a single lot
    // @sig toSplitAdjustedLot :: (Number, Lot) -> SplitAdjustedLot
    toSplitAdjustedLot: (splitRatio, lot) => {
        const { quantity, remainingQuantity } = lot
        return { lot, newQuantity: quantity * splitRatio, newRemainingQuantity: remainingQuantity * splitRatio }
    },

    // Process stock split - adjusts quantity and remainingQuantity of all open lots
    // QIF convention: quantity / 10 = split ratio (e.g., 20 = 2:1 split)
    // @sig toSplitAdjustedLots :: (Transaction, [Lot]) -> { modifiedLots }
    toSplitAdjustedLots: (transaction, openLots) => {
        const splitRatio = transaction.quantity / 10
        const modifiedLots = openLots.map(lot => T.toSplitAdjustedLot(splitRatio, lot))
        return { modifiedLots }
    },

    // Process Grant/Vest - creates option lot with zero cost basis
    // @sig toLotFromVest :: (Transaction, String, String) -> { newLot }
    toLotFromVest: (transaction, accountId, securityId) => {
        const { date, quantity, id } = transaction
        if (!P.isSignificantQuantity(quantity)) return { newLot: null }

        const newLot = {
            accountId,
            securityId,
            openDate: date,
            openTransactionId: id,
            quantity,
            remainingQuantity: quantity,
            costBasis: 0, // Vested options have zero cost basis
        }

        return { newLot }
    },

    // Process Exercise - closes option lots FIFO (stock lots tracked separately by broker, not here)
    // @sig toLotFromExercise :: (Transaction, [Lot]) -> { modifiedLots, allocations }
    toLotFromExercise: (transaction, openLots) => {
        const { date, quantity } = transaction
        if (!P.isSignificantQuantity(quantity)) return { modifiedLots: [], allocations: [] }

        // Close option lots FIFO - same algorithm as sells
        const { modifiedLots, allocations } = T.toLotReduction(openLots, quantity, date, true)

        return { modifiedLots, allocations }
    },
}

const F = {
    // Create lot data from a buy/reinvest transaction
    // For buys, amount is negative in QIF (money out), but costBasis should be positive
    // @sig createLotFromTransaction :: (Transaction, String, String) -> LotData
    createLotFromTransaction: (transaction, accountId, securityId) => {
        const { amount, date, price, quantity, id } = transaction
        return {
            accountId,
            securityId,
            openDate: date,
            openTransactionId: id,
            quantity,
            remainingQuantity: quantity,
            costBasis: Math.abs(amount) || price * quantity,
        }
    },

    // Create or retrieve lot ID (lot_ prefix per D15)
    // Returns {id, isNew}
    // @sig createLotId :: (Database, LotData, Map) -> {id, isNew}
    createLotId: (db, lotData, existingLookup) => {
        const { accountId, openDate, openTransactionId, securityId } = lotData
        const sig = SigT.lotSignature(securityId, accountId, openDate, openTransactionId)
        const existingEntries = existingLookup.get(sig)
        if (existingEntries && existingEntries.length > 0) {
            const entry = existingEntries[0]
            const id = typeof entry === 'string' ? entry : entry.id
            StableIdentity.restoreEntity(db, id)
            return { id, isNew: false }
        }
        const id = StableIdentity.createStableId(db, 'Lot')
        StableIdentity.insertStableIdentity(db, { id, entityType: 'Lot', signature: sig })
        return { id, isNew: true }
    },

    // Create or retrieve lot allocation ID (la_ prefix)
    // Returns {id, isNew}
    // @sig createAllocationId :: (Database, String, String, Map) -> {id, isNew}
    createAllocationId: (db, lotId, transactionId, existingLookup) => {
        const sig = SigT.lotAllocationSignature(lotId, transactionId)
        const existingEntries = existingLookup.get(sig)
        if (existingEntries && existingEntries.length > 0) {
            const entry = existingEntries[0]
            const id = typeof entry === 'string' ? entry : entry.id
            StableIdentity.restoreEntity(db, id)
            return { id, isNew: false }
        }
        const id = StableIdentity.createStableId(db, 'LotAllocation')
        StableIdentity.insertStableIdentity(db, { id, entityType: 'LotAllocation', signature: sig })
        return { id, isNew: true }
    },
}

const E = {
    // Add or update lot in memory map
    // @sig updateLotsMap :: (Map, Lot) -> void
    updateLotsMap: (lotsMap, lot) => {
        const key = `${lot.accountId}|${lot.securityId}`
        const existing = lotsMap.get(key) || []
        const idx = existing.findIndex(l => l.id === lot.id)
        if (idx >= 0) existing[idx] = lot
        else existing.push(lot)
        existing.sort((a, b) => a.openDate.localeCompare(b.openDate))
        lotsMap.set(key, existing)
    },

    // Insert lot into database
    // @sig persistLot :: (Database, Lot) -> void
    persistLot: (db, lot) => {
        const { accountId, closedDate, costBasis, createdByTransactionId, id } = lot
        const { openDate, quantity, remainingQuantity, securityId } = lot
        const cols = ['id', 'accountId', 'securityId', 'purchaseDate', 'quantity', 'costBasis']
        const moreCols = ['remainingQuantity', 'closedDate', 'createdByTransactionId']
        const allCols = [...cols, ...moreCols].join(', ')
        const sql = `INSERT OR REPLACE INTO lots (${allCols}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        const values = [id, accountId, securityId, openDate, quantity, costBasis]
        const moreValues = [remainingQuantity, closedDate || null, createdByTransactionId]
        db.prepare(sql).run(...values, ...moreValues)
    },

    // Insert lot allocation into database
    // @sig persistAllocation :: (Database, Object) -> void
    persistAllocation: (db, alloc) => {
        const { costBasisAllocated, date, id, lotId, sharesAllocated, transactionId } = alloc
        db.prepare(
            `INSERT OR REPLACE INTO lotAllocations (id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
            VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
    },

    // Save a single modified lot - extracted for forEach compliance
    // @sig saveModifiedLot :: (Map, Function, Object, Boolean) -> void
    saveModifiedLot: (lotsMap, persistLot, mod, includeQuantity) => {
        const { closedDate, lot, newQuantity, newRemainingQuantity } = mod
        const updatedLot = includeQuantity
            ? { ...lot, quantity: newQuantity, remainingQuantity: newRemainingQuantity }
            : { ...lot, remainingQuantity: newRemainingQuantity, closedDate }
        E.updateLotsMap(lotsMap, updatedLot)
        persistLot(updatedLot)
    },

    // Save a single allocation - extracted for forEach compliance
    // @sig saveAllocation :: (Database, Map, Object, String, Object) -> void
    saveAllocation: (db, allocationLookup, alloc, transactionId, txn) => {
        const { id } = F.createAllocationId(db, alloc.lot.id, transactionId, allocationLookup)
        E.persistAllocation(db, {
            id,
            lotId: alloc.lot.id,
            transactionId: txn.id,
            sharesAllocated: alloc.sharesAllocated,
            costBasisAllocated: alloc.costBasisAllocated,
            date: txn.date,
        })
    },
}

// Main lot import orchestration
// @sig importLots :: (Database, Object) -> { warnings }
const importLots = (db, context) => {
    // Convert database lot row to enriched lot (stable ID is already the lot id)
    // @sig toEnrichedLot :: DbLot -> Lot | null
    const toEnrichedLot = dbLot => {
        const { id, purchaseDate, accountId, securityId } = dbLot

        // Verify account and security exist in lookups (values are arrays of {id, orphanedAt})
        const hasAccount = [...accountLookup.values()].some(e => e.id === accountId)
        const hasSecurityBySymbol = [...securityLookup.bySymbol.values()].flat().some(e => e.id === securityId)
        const hasSecurityByName = [...securityLookup.byName.values()].flat().some(e => e.id === securityId)
        if (!hasAccount || (!hasSecurityBySymbol && !hasSecurityByName)) return null

        return { ...dbLot, id, openDate: purchaseDate }
    }

    // Persist a newly created lot to memory and database
    // @sig saveNewLot :: (Object, Transaction, String, String) -> void
    const saveNewLot = (result, txn, accountId, securityId) => {
        const { newLot } = result
        if (!newLot) return
        const { id } = F.createLotId(db, newLot, lotLookup)
        const lot = { ...newLot, id, accountId, securityId, createdByTransactionId: txn.id }
        E.updateLotsMap(lotsMap, lot)
        E.persistLot(db, lot)
    }

    // Helper to save modified lots
    const persistLot = lot => E.persistLot(db, lot)

    const saveModifiedLots = (modifiedLots, includeQuantity = false) =>
        modifiedLots.forEach(mod => E.saveModifiedLot(lotsMap, persistLot, mod, includeQuantity))

    // Helper to save allocations
    const saveAllocations = (allocations, transactionId, txn) =>
        allocations.forEach(alloc => E.saveAllocation(db, allocationLookup, alloc, transactionId, txn))

    // Action handlers - each returns {result, needsAllocations, needsQuantityUpdate, needsWarning}
    const handleBuyOrSharesIn = (txnWithStable, openLots, accountId, securityId) => {
        const result = T.toLotFromBuy(txnWithStable, openLots, accountId, securityId)
        return { result, needsAllocations: true, needsQuantityUpdate: false, needsWarning: false }
    }

    const handleSellOrSharesOut = (txnWithStable, openLots, accountId, securityId) => {
        const result = T.toLotFromSell(txnWithStable, openLots, accountId, securityId)
        return { result, needsAllocations: true, needsQuantityUpdate: false, needsWarning: false }
    }

    const handleReinvest = (txnWithStable, openLots, accountId, securityId) => {
        const result = T.toLotFromDividend(txnWithStable, db, accountId, securityId)
        return { result, needsAllocations: false, needsQuantityUpdate: false, needsWarning: true }
    }

    const handleSplit = (txnWithStable, openLots) => {
        const result = T.toSplitAdjustedLots(txnWithStable, openLots)
        return { result, needsAllocations: false, needsQuantityUpdate: true, needsWarning: false }
    }

    const handleGrantOrVest = (txnWithStable, openLots, accountId, securityId) => {
        const result = T.toLotFromVest(txnWithStable, accountId, securityId)
        return { result, needsAllocations: false, needsQuantityUpdate: false, needsWarning: false }
    }

    const handleExercise = (txnWithStable, openLots) => {
        const result = T.toLotFromExercise(txnWithStable, openLots)
        return { result, needsAllocations: true, needsQuantityUpdate: false, needsWarning: false }
    }

    // Select appropriate handler function for an investment action
    // @sig selectHandler :: String -> Function | null
    const selectHandler = action => {
        if (P.isBuyAction(action) || P.isSharesInAction(action)) return handleBuyOrSharesIn
        if (P.isSellAction(action) || P.isSharesOutAction(action)) return handleSellOrSharesOut
        if (P.isReinvestAction(action)) return handleReinvest
        if (P.isSplitAction(action)) return handleSplit
        if (action === 'Grant' || action === 'Vest') return handleGrantOrVest
        if (action === 'Exercise') return handleExercise
        return null
    }

    // Process a single investment transaction and update lots accordingly
    // @sig processTransaction :: Transaction -> void
    const processTransaction = txn => {
        const { accountId, id, investmentAction, securityId } = txn
        if (!P.isRelevantAction(investmentAction)) return

        // Verify account and security exist in lookups (values are {id, orphanedAt} objects)
        const hasAccount = [...accountLookup.values()].some(e => e.id === accountId)
        if (!hasAccount) return

        // Lot-creating actions require a security
        if (!securityId) return

        const hasSecurityBySymbol = [...securityLookup.bySymbol.values()].flat().some(e => e.id === securityId)
        const hasSecurityByName = [...securityLookup.byName.values()].flat().some(e => e.id === securityId)
        if (!hasSecurityBySymbol && !hasSecurityByName) return

        // Transaction id IS the stable ID now
        const transactionId = id

        const openLots = T.toOpenLots(lotsMap, accountId, securityId)
        const txnWithStable = { ...txn, id: transactionId }
        const handler = selectHandler(investmentAction)
        if (!handler) return

        const handlerResult = handler(txnWithStable, openLots, accountId, securityId)
        const { result, needsAllocations, needsQuantityUpdate, needsWarning } = handlerResult
        const { allocations, modifiedLots, newLot, warning } = result

        if (needsWarning && warning) warnings.push(warning)
        if (newLot) saveNewLot(result, txn, accountId, securityId)
        if (modifiedLots) saveModifiedLots(modifiedLots, needsQuantityUpdate)
        if (needsAllocations && allocations) saveAllocations(allocations, transactionId, txn)
    }

    const { accountLookup, securityLookup } = context
    const lotLookup = context.lotLookup || new Map()
    const allocationLookup = context.allocationLookup || new Map()
    const warnings = []

    // Get active (non-orphaned) investment transactions sorted by date
    const transactions = db
        .prepare(
            `SELECT * FROM transactions WHERE investmentAction IS NOT NULL AND orphanedAt IS NULL ORDER BY date, id`,
        )
        .all()

    // In-memory lots map: "accountId|securityId" -> [Lot]
    const lotsMap = new Map()

    // Load existing lots into memory
    db.prepare(`SELECT * FROM lots`)
        .all()
        .map(toEnrichedLot)
        .filter(lot => lot !== null)
        .forEach(lot => E.updateLotsMap(lotsMap, lot))

    transactions.forEach(processTransaction)

    return { warnings }
}

const ImportLots = { importLots }

export { ImportLots }
