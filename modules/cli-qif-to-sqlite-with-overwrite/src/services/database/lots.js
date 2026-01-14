// ABOUTME: Database operations for investment lots (FIFO cost basis tracking)
// ABOUTME: Creates, updates, and queries lots from investment transactions

import { filter, map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Lot, LotAllocation } from '../../types/index.js'

const EPSILON = 1e-10

/*
 * Insert lot into database
 * @sig insertLot :: (Database, Object) -> String
 */
const insertLot = (db, lotData) => {
    /*
     * Generate unique ID for lot based on key fields
     * @sig generateLotId :: () -> String
     */
    const generateLotId = () => {
        const { accountId, createdByTransactionId, purchaseDate, securityId } = lotData
        return `lot_${hashFields({ accountId, securityId, purchaseDate, createdByTransactionId })}`
    }

    const id = generateLotId()
    const lot = Lot.from({ ...lotData, id })

    if (!Lot.is(lot)) throw new Error(`Expected Lot; found: ${JSON.stringify(lot)}`)

    const {
        accountId: lotAccountId,
        closedDate,
        costBasis,
        createdAt,
        createdByTransactionId: lotCreatedByTxnId,
        purchaseDate: lotPurchaseDate,
        quantity,
        remainingQuantity,
        securityId: lotSecurityId,
    } = lot

    const statement = `
        INSERT INTO lots (id, accountId, securityId, purchaseDate, quantity, costBasis,
            remainingQuantity, closedDate, createdByTransactionId, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(
        id,
        lotAccountId,
        lotSecurityId,
        lotPurchaseDate,
        quantity,
        costBasis,
        remainingQuantity,
        closedDate || null,
        lotCreatedByTxnId,
        createdAt,
    )

    return id
}

/*
 * Get all lots from database
 * @sig getAllLots :: Database -> [Lot]
 */
const getAllLots = db => {
    const statement = `
        SELECT id, accountId, securityId, purchaseDate, quantity, costBasis,
            remainingQuantity, closedDate, createdByTransactionId, createdAt
        FROM lots
        ORDER BY purchaseDate ASC, id ASC
    `
    return map(Lot.from, db.prepare(statement).all())
}

/*
 * Get lots by account and security
 * @sig getLotsByAccountAndSecurity :: (Database, String, String) -> [Lot]
 */
const getLotsByAccountAndSecurity = (db, accountId, securityId) => {
    const statement = `
        SELECT id, accountId, securityId, purchaseDate, quantity, costBasis,
            remainingQuantity, closedDate, createdByTransactionId, createdAt
        FROM lots
        WHERE accountId = ? AND securityId = ?
        ORDER BY purchaseDate ASC, id ASC
    `
    return map(Lot.from, db.prepare(statement).all(accountId, securityId))
}

/*
 * Get open lots by account and security (for FIFO processing)
 * @sig getOpenLotsByAccountAndSecurity :: (Database, String, String) -> [Lot]
 */
const getOpenLotsByAccountAndSecurity = (db, accountId, securityId) => {
    const statement = `
        SELECT id, accountId, securityId, purchaseDate, quantity, costBasis,
            remainingQuantity, closedDate, createdByTransactionId, createdAt
        FROM lots
        WHERE accountId = ? AND securityId = ? AND closedDate IS NULL AND remainingQuantity != 0
        ORDER BY purchaseDate ASC, id ASC
    `
    return map(Lot.from, db.prepare(statement).all(accountId, securityId))
}

/*
 * Update lot remaining quantity and closed status
 * @sig updateLotQuantity :: (Database, String, Number, String?) -> void
 */
const updateLotQuantity = (db, lotId, remainingQuantity, closedDate = null) =>
    db
        .prepare('UPDATE lots SET remainingQuantity = ?, closedDate = ? WHERE id = ?')
        .run(remainingQuantity, closedDate, lotId)

/*
 * Get lot count
 * @sig getLotCount :: Database -> Number
 */
const getLotCount = db => db.prepare('SELECT COUNT(*) as count FROM lots').get().count

/*
 * Clear all lots from database
 * @sig clearLots :: Database -> void
 */
const clearLots = db => db.prepare('DELETE FROM lots').run()

/*
 * Clear all lot allocations from database
 * @sig clearLotAllocations :: Database -> void
 */
const clearLotAllocations = db => db.prepare('DELETE FROM lotAllocations').run()

/*
 * Insert lot allocation into database
 * @sig insertLotAllocation :: (Database, Object) -> String
 */
const insertLotAllocation = (db, allocationData) => {
    /*
     * Generate unique ID for allocation based on key fields
     * @sig generateId :: () -> String
     */
    const generateId = () => {
        const { lotId: lid, sharesAllocated: sa, transactionId: tid } = allocationData
        return `la_${hashFields({ lotId: lid, transactionId: tid, sharesAllocated: sa })}`
    }

    const id = generateId()
    const allocation = LotAllocation.from({ ...allocationData, id })

    if (!LotAllocation.is(allocation)) throw new Error(`Expected LotAllocation; found: ${JSON.stringify(allocation)}`)

    const { costBasisAllocated, date, lotId, sharesAllocated, transactionId } = allocation

    const statement = `
        INSERT INTO lotAllocations (id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
        VALUES (?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(id, lotId, transactionId, sharesAllocated, costBasisAllocated, date)
    return id
}

/*
 * Get all lot allocations from database
 * @sig getAllLotAllocations :: Database -> [LotAllocation]
 */
const getAllLotAllocations = db => {
    const statement = `
        SELECT id, lotId, transactionId, sharesAllocated, costBasisAllocated, date
        FROM lotAllocations
        ORDER BY date ASC, id ASC
    `
    return map(LotAllocation.from, db.prepare(statement).all())
}

/*
 * Import lots from investment transactions
 * @sig importLots :: Database -> void
 */
const importLots = db => {
    /*
     * Check if quantity is significant (above epsilon threshold)
     * @sig isSignificantQuantity :: Number -> Boolean
     */
    const isSignificantQuantity = quantity => Math.abs(quantity) > EPSILON

    /*
     * Format date object or string to ISO date string
     * @sig formatDate :: (Date | String) -> String
     */
    const formatDate = date => {
        if (typeof date === 'string') return date
        if (date instanceof Date) return date.toISOString().split('T')[0]
        throw new Error(`Invalid date format: ${date}`)
    }

    /*
     * Create new lot data from transaction (raw object, not typed)
     * @sig createLotFromTransaction :: (Object, Object, Object, Number, Number) -> Object
     */
    const createLotFromTransaction = (transaction, account, security, qty, basis) => ({
        accountId: account.id,
        securityId: security.id,
        purchaseDate: formatDate(transaction.date),
        quantity: qty,
        costBasis: basis,
        remainingQuantity: qty,
        closedDate: null,
        createdByTransactionId: transaction.id,
        createdAt: new Date().toISOString(),
    })

    /*
     * Define action categories for investment transactions
     * @sig getActionCategories :: () -> Object
     */
    const getActionCategories = () => ({
        buyActions: ['Buy', 'BuyX', 'CvrShrt'],
        reinvestActions: ['ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvSh', 'ReinvMd'],
        sharesInActions: ['ShrsIn'],
        sellActions: ['Sell', 'SellX', 'ShtSell'],
        sharesOutActions: ['ShrsOut'],
        splitActions: ['StkSplit'],
        optionActions: ['Grant', 'Vest', 'Exercise'],
        cashOnlyActions: [
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
        ],
        transferActions: ['XOut', 'XIn'],
    })

    /*
     * Helper to process lots in either direction (long or short)
     * @sig processLotReduction :: (Object, Object, Object, Boolean) -> void
     */
    const processLotReduction = (transaction, account, security, isBuy) => {
        /*
         * Record allocation when shares are taken from a lot
         * @sig recordAllocation :: (Lot, Number) -> void
         */
        const recordAllocation = (lot, sharesToReduce) => {
            const { costBasis, id: lotId, quantity } = lot
            const costBasisPerShare = costBasis / quantity
            const costBasisAllocated = sharesToReduce * costBasisPerShare
            insertLotAllocation(db, {
                lotId,
                transactionId: transaction.id,
                sharesAllocated: sharesToReduce,
                costBasisAllocated,
                date: formatDate(transaction.date),
            })
        }

        /*
         * Process a single lot for FIFO reduction
         * @sig processLot :: Lot -> void
         */
        const processLot = lot => {
            if (!isSignificantQuantity(remainingShares)) return

            const { id, remainingQuantity } = lot
            const sharesToReduce = Math.min(Math.abs(remainingQuantity), Math.abs(remainingShares))
            const newRemainingQuantity = remainingQuantity - Math.sign(remainingQuantity) * sharesToReduce

            const shouldClose = Math.abs(newRemainingQuantity) <= EPSILON
            const closedDate = shouldClose ? formatDate(transaction.date) : null
            const finalQuantity = shouldClose ? 0 : newRemainingQuantity

            recordAllocation(lot, sharesToReduce)
            updateLotQuantity(db, id, finalQuantity, closedDate)
            remainingShares -= Math.sign(remainingShares) * sharesToReduce
        }

        /*
         * Create new lot if shares remain after FIFO processing
         * @sig createNewLotIfNeeded :: () -> void
         */
        const createNewLotIfNeeded = () => {
            if (!isSignificantQuantity(remainingShares)) return
            const lotQty = isBuy ? remainingShares : -remainingShares
            if (!isSignificantQuantity(lotQty)) return
            if (!isBuy && Math.abs(remainingShares) <= EPSILON * 10) return

            // Pro-rate cost basis when only part of transaction creates a new lot (e.g., buy covers short first)
            const { price } = transaction
            const costBasis = Math.abs(remainingShares) * price
            const newLot = createLotFromTransaction(transaction, account, security, lotQty, costBasis)
            insertLot(db, newLot)
        }

        const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
        let remainingShares = transaction.quantity
        const lotSign = isBuy ? -1 : 1
        const relevantLots = filter(lot => lotSign * lot.remainingQuantity > 0, openLots)

        relevantLots.forEach(processLot)
        createNewLotIfNeeded()
    }

    /*
     * Check if action should be skipped (cash only or transfer)
     * @sig shouldSkipAction :: String -> Boolean
     */
    const shouldSkipAction = action => {
        const { cashOnlyActions, transferActions } = getActionCategories()
        return cashOnlyActions.includes(action) || transferActions.includes(action)
    }

    /*
     * Get all non-cash/transfer actions
     * @sig getNonCashActions :: () -> [String]
     */
    const getNonCashActions = () => {
        const categories = getActionCategories()
        const {
            buyActions,
            optionActions,
            reinvestActions,
            sellActions,
            sharesInActions,
            sharesOutActions,
            splitActions,
        } = categories
        return [
            ...buyActions,
            ...reinvestActions,
            ...sharesInActions,
            ...sellActions,
            ...sharesOutActions,
            ...splitActions,
            ...optionActions,
        ]
    }

    /*
     * Get cost basis for dividend reinvestment
     * @sig getDividendCostBasis :: (Object, Object) -> Number?
     */
    const getDividendCostBasis = (transaction, security) => {
        const { amount, date, price, quantity } = transaction
        if (amount && Math.abs(amount) > EPSILON) return amount
        if (price && Math.abs(price) > EPSILON) return price * quantity

        const { id: secId, name, symbol } = security
        const row = db
            .prepare('SELECT price FROM prices WHERE securityId = ? AND date <= ? ORDER BY date DESC LIMIT 1')
            .get(secId, date)
        const { price: histPrice } = row || {}
        if (histPrice && Math.abs(histPrice) > EPSILON) return histPrice * quantity

        console.warn(
            `WARNING: Skipping reinvested dividend for security ${symbol || name} due to missing amount and price`,
        )
        return null
    }

    /*
     * Process buy transaction - create new lot or close short
     * @sig processBuyTransaction :: (Object, Object, Object) -> void
     */
    const processBuyTransaction = (transaction, account, security) => {
        if (!isSignificantQuantity(transaction.quantity)) return
        processLotReduction(transaction, account, security, true)
    }

    /*
     * Process sell transaction - reduce existing lots (FIFO)
     * @sig processSellTransaction :: (Object, Object, Object) -> void
     */
    const processSellTransaction = (transaction, account, security) => {
        if (!isSignificantQuantity(transaction.quantity)) return
        processLotReduction(transaction, account, security, false)
    }

    /*
     * Process dividend reinvestment - create new lot
     * @sig processDividendTransaction :: (Object, Object, Object) -> void
     */
    const processDividendTransaction = (transaction, account, security) => {
        const { quantity } = transaction
        if (!quantity || !isSignificantQuantity(quantity)) return
        if (quantity <= 0) return processLotReduction(transaction, account, security, false)

        const costBasis = getDividendCostBasis(transaction, security)
        if (costBasis === null) return

        insertLot(db, createLotFromTransaction(transaction, account, security, quantity, costBasis))
    }

    /*
     * Process stock split - adjust all existing lots proportionally
     * @sig processStockSplitTransaction :: (Object, Object, Object) -> void
     */
    const processStockSplitTransaction = (transaction, account, security) => {
        /*
         * Update a single lot with new split-adjusted quantities
         * @sig updateLot :: Lot -> void
         */
        const updateLot = lot => {
            const { id, quantity, remainingQuantity } = lot
            const newQuantity = quantity * splitRatio
            const newRemainingQuantity = remainingQuantity * splitRatio
            db.prepare('UPDATE lots SET quantity = ?, remainingQuantity = ? WHERE id = ?').run(
                newQuantity,
                newRemainingQuantity,
                id,
            )
        }

        const allLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
        if (allLots.length === 0) return

        const splitRatio = transaction.quantity / 10
        if (!splitRatio || splitRatio <= 0) return

        allLots.forEach(updateLot)
    }

    /*
     * Process shares out transaction - reduce lots
     * @sig processSharesOutTransaction :: (Object, Object, Object) -> void
     */
    const processSharesOutTransaction = (transaction, account, security) => {
        if (!isSignificantQuantity(transaction.quantity)) return
        processLotReduction(transaction, account, security, false)
    }

    /*
     * Vest creates option lots with the vested quantity
     * @sig processVestOptions :: (Object, Object, Object) -> void
     */
    const processVestOptions = (transaction, account, security) => {
        const { quantity } = transaction
        if (!quantity || !isSignificantQuantity(quantity)) return
        insertLot(db, createLotFromTransaction(transaction, account, security, quantity, 0))
    }

    /*
     * Process option exercise - close option lots and create stock lots
     * @sig processExerciseOptions :: (Object, Object, Object) -> void
     */
    const processExerciseOptions = (transaction, account, security) => {
        /*
         * Process a single option lot for exercise
         * @sig processOptionLot :: Object -> void
         */
        const processOptionLot = lot => {
            if (!isSignificantQuantity(remainingToExercise)) return

            const { id, remainingQuantity } = lot
            const sharesToExercise = Math.min(remainingQuantity, remainingToExercise)
            const newRemainingQuantity = remainingQuantity - sharesToExercise
            const shouldClose = Math.abs(newRemainingQuantity) <= EPSILON
            const closedDate = shouldClose ? formatDate(transaction.date) : null

            updateLotQuantity(db, id, shouldClose ? 0 : newRemainingQuantity, closedDate)
            remainingToExercise -= sharesToExercise
        }

        const { quantity } = transaction
        if (!quantity || !isSignificantQuantity(quantity)) return

        const statement = `
            SELECT id, remainingQuantity, costBasis
            FROM lots
            WHERE accountId = ? AND securityId = ? AND closedDate IS NULL AND remainingQuantity > 0
            ORDER BY purchaseDate ASC, id ASC
        `

        const openOptionLots = db.prepare(statement).all(account.id, security.id)
        let remainingToExercise = quantity
        openOptionLots.forEach(processOptionLot)
    }

    /*
     * Process a single investment transaction to create/update lots
     * @sig processInvestmentTransaction :: Object -> void
     */
    const processInvestmentTransaction = transaction => {
        /*
         * Look up account and security from database
         * @sig getAccountAndSecurity :: () -> [Object, Object]
         */
        const getAccountAndSecurity = () => {
            const account = db.prepare('SELECT id, name, type FROM accounts WHERE id = ?').get(accountId)
            if (!account) throw new Error(`Account not found with ID: ${accountId}`)

            const security = db.prepare('SELECT id, name, symbol FROM securities WHERE id = ?').get(securityId)
            if (!security) throw new Error(`Security not found with ID: ${securityId}`)

            return [account, security]
        }

        const { accountId, investmentAction, securityId } = transaction

        if (shouldSkipAction(investmentAction)) return

        const nonCashActions = getNonCashActions()
        if (!nonCashActions.includes(investmentAction))
            throw new Error(`Unhandled investment action: ${investmentAction}`)

        const [account, security] = getAccountAndSecurity()
        const { buyActions, optionActions, reinvestActions, sellActions, sharesOutActions, splitActions } =
            getActionCategories()

        if (buyActions.includes(investmentAction) || getActionCategories().sharesInActions.includes(investmentAction))
            return processBuyTransaction(transaction, account, security)
        if (reinvestActions.includes(investmentAction))
            return processDividendTransaction(transaction, account, security)
        if (sellActions.includes(investmentAction)) return processSellTransaction(transaction, account, security)
        if (sharesOutActions.includes(investmentAction))
            return processSharesOutTransaction(transaction, account, security)
        if (splitActions.includes(investmentAction)) return processStockSplitTransaction(transaction, account, security)
        if (optionActions.includes(investmentAction) && (investmentAction === 'Grant' || investmentAction === 'Vest'))
            return processVestOptions(transaction, account, security)
        if (investmentAction === 'Exercise') return processExerciseOptions(transaction, account, security)
    }

    const statement = `
        SELECT id, accountId, date, amount, investmentAction, securityId, quantity, price, commission
        FROM transactions
        WHERE transactionType = 'investment'
        ORDER BY date ASC, id ASC
    `

    const transactions = db.prepare(statement).all()
    clearLotAllocations(db)
    clearLots(db)
    transactions.forEach(processInvestmentTransaction)
}

export {
    clearLotAllocations,
    clearLots,
    getAllLotAllocations,
    getAllLots,
    getLotCount,
    getLotsByAccountAndSecurity,
    getOpenLotsByAccountAndSecurity,
    importLots,
    insertLot,
    insertLotAllocation,
    updateLotQuantity,
}
