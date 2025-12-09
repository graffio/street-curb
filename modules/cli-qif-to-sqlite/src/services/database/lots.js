import { filter, map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Lot } from '../../types/index.js'

const EPSILON = 1e-10

/*
 * Generate lot ID from key fields only (not entire object to avoid circular reference)
 * @sig generateLotId :: Object -> String
 */
const generateLotId = lotData =>
    `lot_${hashFields({
        accountId: lotData.accountId,
        securityId: lotData.securityId,
        purchaseDate: lotData.purchaseDate,
        createdByTransactionId: lotData.createdByTransactionId,
    })}`

/*
 * Insert lot into database
 * @sig insertLot :: (Database, Object) -> String
 */
const insertLot = (db, lotData) => {
    // Generate ID from key fields, then validate complete lot
    const id = generateLotId(lotData)
    const lot = Lot.from({ ...lotData, id })

    if (!Lot.is(lot)) throw new Error(`Expected Lot; found: ${JSON.stringify(lot)}`)

    const statement = `
        INSERT INTO lots (id, account_id, security_id, purchase_date, quantity, cost_basis,
            remaining_quantity, closed_date, created_by_transaction_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.prepare(statement).run(
        id,
        lot.accountId,
        lot.securityId,
        lot.purchaseDate,
        lot.quantity,
        lot.costBasis,
        lot.remainingQuantity,
        lot.closedDate || null,
        lot.createdByTransactionId,
        lot.createdAt,
    )

    return id
}

/*
 * Map database record to Lot type
 * @sig mapLotRecord :: Object -> Lot
 */
const mapLotRecord = record =>
    Lot.from({
        id: record.id,
        accountId: record.account_id,
        securityId: record.security_id,
        purchaseDate: record.purchase_date,
        quantity: record.quantity,
        costBasis: record.cost_basis,
        remainingQuantity: record.remaining_quantity,
        closedDate: record.closed_date === null ? null : record.closed_date,
        createdByTransactionId: record.created_by_transaction_id,
        createdAt: record.created_at,
    })

/*
 * Get all lots from database
 * @sig getAllLots :: Database -> [Lot]
 */
const getAllLots = db => {
    const statement = `
        SELECT id, account_id, security_id, purchase_date, quantity, cost_basis,
            remaining_quantity, closed_date, created_by_transaction_id, created_at
        FROM lots
        ORDER BY purchase_date ASC, id ASC
    `

    const records = db.prepare(statement).all()
    return map(mapLotRecord, records)
}

/*
 * Get lots by account and security
 * @sig getLotsByAccountAndSecurity :: (Database, Number, Number) -> [Lot]
 */
const getLotsByAccountAndSecurity = (db, accountId, securityId) => {
    const statement = `
        SELECT id, account_id, security_id, purchase_date, quantity, cost_basis,
            remaining_quantity, closed_date, created_by_transaction_id, created_at
        FROM lots
        WHERE account_id = ? AND security_id = ?
        ORDER BY purchase_date ASC, id ASC
    `

    const records = db.prepare(statement).all(accountId, securityId)
    return map(mapLotRecord, records)
}

/*
 * Get open lots by account and security (for FIFO processing)
 * @sig getOpenLotsByAccountAndSecurity :: (Database, Number, Number) -> [Lot]
 */
const getOpenLotsByAccountAndSecurity = (db, accountId, securityId) => {
    const statement = `
        SELECT id, account_id, security_id, purchase_date, quantity, cost_basis,
            remaining_quantity, closed_date, created_by_transaction_id, created_at
        FROM lots
        WHERE account_id = ? AND security_id = ? AND closed_date IS NULL AND remaining_quantity != 0
        ORDER BY purchase_date ASC, id ASC
    `

    const records = db.prepare(statement).all(accountId, securityId)
    return map(mapLotRecord, records)
}

/*
 * Update lot remaining quantity and closed status
 * @sig updateLotQuantity :: (Database, Number, Number, String?) -> void
 */
const updateLotQuantity = (db, lotId, remainingQuantity, closedDate = null) => {
    const statement = `
        UPDATE lots
        SET remaining_quantity = ?, closed_date = ?
        WHERE id = ?
    `

    db.prepare(statement).run(remainingQuantity, closedDate, lotId)
}

/*
 * Get lot count
 * @sig getLotCount :: Database -> Number
 */
const getLotCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM lots').get()
    return result.count
}

/*
 * Clear all lots from database
 * @sig clearLots :: Database -> void
 */
const clearLots = db => db.prepare('DELETE FROM lots').run()

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
    const { buyActions, reinvestActions, sharesInActions, sellActions, sharesOutActions, splitActions, optionActions } =
        getActionCategories()
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
 * Import lots from investment transactions
 * @sig importLots :: Database -> void
 */
const importLots = db => {
    const processTransaction = record => {
        const transaction = {
            id: record.id,
            accountId: record.account_id,
            date: record.date,
            amount: record.amount,
            investmentAction: record.investment_action,
            securityId: record.security_id,
            quantity: record.quantity,
            price: record.price,
            commission: record.commission,
            transactionType: 'investment',
        }

        processInvestmentTransaction(db, transaction)
    }

    const statement = `
        SELECT id, account_id, date, amount, investment_action, security_id,
            quantity, price, commission
        FROM transactions
        WHERE transaction_type = 'investment'
        ORDER BY date ASC, id ASC
    `

    const transactions = db.prepare(statement).all()
    clearLots(db)
    transactions.forEach(processTransaction)
}

/*
 * Process a single investment transaction to create/update lots
 * @sig processInvestmentTransaction :: (Database, Object) -> void
 */
const processInvestmentTransaction = (db, transaction) => {
    const getAccountAndSecurity = (db, transaction) => {
        const account = db.prepare('SELECT id, name, type FROM accounts WHERE id = ?').get(transaction.accountId)
        if (!account) throw new Error(`Account not found with ID: ${transaction.accountId}`)

        const security = db.prepare('SELECT id, name, symbol FROM securities WHERE id = ?').get(transaction.securityId)
        if (!security) throw new Error(`Security not found with ID: ${transaction.securityId}`)

        return [account, security]
    }

    const routeTransaction = (db, transaction, account, security) => {
        const action = transaction.investmentAction
        const { buyActions, reinvestActions, sharesInActions, sellActions, sharesOutActions, splitActions } =
            getActionCategories()

        if (buyActions.includes(action) || sharesInActions.includes(action))
            return processBuyTransaction(db, transaction, account, security)
        if (reinvestActions.includes(action)) return processDividendTransaction(db, transaction, account, security)
        if (sellActions.includes(action)) return processSellTransaction(db, transaction, account, security)
        if (sharesOutActions.includes(action)) return processSharesOutTransaction(db, transaction, account, security)
        if (splitActions.includes(action)) return processStockSplitTransaction(db, transaction, account, security)
        // Grant and Vest both create option lots (Grant at 0 cost, Vest converts to owned)
        if (action === 'Grant' || action === 'Vest') return processVestOptions(transaction, account, security, db)
        if (action === 'Exercise') return processExerciseOptions(transaction, security, account, db)
    }

    const action = transaction.investmentAction
    if (shouldSkipAction(action)) return

    const nonCashActions = getNonCashActions()
    if (!nonCashActions.includes(action)) throw new Error(`Unhandled investment action: ${action}`)

    const [account, security] = getAccountAndSecurity(db, transaction)
    routeTransaction(db, transaction, account, security)
}

/*
 * Check if quantity is significant
 * @sig isSignificantQuantity :: Number -> Boolean
 */
const isSignificantQuantity = quantity => Math.abs(quantity) > EPSILON

/*
 * Create new lot data from transaction (raw object, not typed)
 * @sig createLotFromTransaction :: (Object, Object, Object, Number, Number) -> Object
 */
const createLotFromTransaction = (transaction, account, security, quantity, costBasis) => ({
    accountId: account.id,
    securityId: security.id,
    purchaseDate: formatDate(transaction.date),
    quantity,
    costBasis,
    remainingQuantity: quantity,
    closedDate: null,
    createdByTransactionId: transaction.id,
    createdAt: new Date().toISOString(),
})

/*
 * Helper to process lots in either direction (long or short)
 * @sig processLotReduction :: (Database, Object, Object, Object, Boolean) -> void
 */
const processLotReduction = (db, transaction, account, security, isBuy) => {
    const processLot = lot => {
        if (!isSignificantQuantity(remainingShares)) return

        const sharesToReduce = Math.min(Math.abs(lot.remainingQuantity), Math.abs(remainingShares))
        const newRemainingQuantity = lot.remainingQuantity - Math.sign(lot.remainingQuantity) * sharesToReduce

        // Handle floating-point precision: if remaining quantity is very small, treat as zero
        const shouldClose = Math.abs(newRemainingQuantity) <= EPSILON
        const closedDate = shouldClose ? formatDate(transaction.date) : null
        const finalQuantity = shouldClose ? 0 : newRemainingQuantity

        updateLotQuantity(db, lot.id, finalQuantity, closedDate)
        remainingShares -= Math.sign(remainingShares) * sharesToReduce
    }

    const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
    let remainingShares = transaction.quantity
    const lotSign = isBuy ? -1 : 1
    const relevantLots = filter(lot => lotSign * lot.remainingQuantity > 0, openLots)

    relevantLots.forEach(processLot)

    // Only create new lots for buy transactions or if there are significant remaining shares
    // For sell transactions with tiny remaining shares due to floating-point precision, ignore them
    if (isSignificantQuantity(remainingShares)) {
        const lotQty = isBuy ? remainingShares : -remainingShares
        if (isSignificantQuantity(lotQty))
            if (isBuy || Math.abs(remainingShares) > EPSILON * 10) {
                // For sell transactions, only create a new lot if the remaining shares are significant
                // (not just floating-point precision errors)
                const costBasis = Math.abs(transaction.amount) || Math.abs(remainingShares) * transaction.price
                const newLot = createLotFromTransaction(transaction, account, security, lotQty, costBasis)
                insertLot(db, newLot)
            }
    }
}

/*
 * Process buy transaction - create new lot
 * @sig processBuyTransaction :: (Database, Object, Object, Object) -> void
 */
const processBuyTransaction = (db, transaction, account, security) => {
    if (!isSignificantQuantity(transaction.quantity)) return
    processLotReduction(db, transaction, account, security, true)
}

/*
 * Process sell transaction - reduce existing lots (FIFO)
 * @sig processSellTransaction :: (Database, Object, Object, Object) -> void
 */
const processSellTransaction = (db, transaction, account, security) => {
    if (!isSignificantQuantity(transaction.quantity)) return
    processLotReduction(db, transaction, account, security, false)
}

/*
 * Get cost basis for dividend reinvestment
 * @sig getDividendCostBasis :: (Database, Object, Object) -> Number?
 */
const getDividendCostBasis = (db, transaction, security) => {
    if (transaction.amount && Math.abs(transaction.amount) > EPSILON) return transaction.amount
    if (transaction.price && Math.abs(transaction.price) > EPSILON) return transaction.price * transaction.quantity

    const row = db
        .prepare('SELECT price FROM prices WHERE security_id = ? AND date <= ? ORDER BY date DESC LIMIT 1')
        .get(security.id, transaction.date)
    if (row && row.price && Math.abs(row.price) > EPSILON) return row.price * transaction.quantity

    console.warn(
        `WARNING: Skipping reinvested dividend for security ${security.symbol || security.name} due to missing amount and price`,
    )
    return null
}

/*
 * Process dividend reinvestment - create new lot
 * @sig processDividendTransaction :: (Database, Object, Object, Object) -> void
 */
const processDividendTransaction = (db, transaction, account, security) => {
    if (!transaction.quantity || !isSignificantQuantity(transaction.quantity)) return

    if (transaction.quantity <= 0) return processLotReduction(db, transaction, account, security, false)

    const costBasis = getDividendCostBasis(db, transaction, security)
    if (costBasis === null) return

    insertLot(db, createLotFromTransaction(transaction, account, security, transaction.quantity, costBasis))
}

/*
 * Process stock split - adjust all existing lots proportionally
 * @sig processStockSplitTransaction :: (Database, Object, Object, Object) -> void
 */
const processStockSplitTransaction = (db, transaction, account, security) => {
    const updateLot = lot => {
        const newQuantity = lot.quantity * splitRatio
        const newRemainingQuantity = lot.remainingQuantity * splitRatio
        const statement = 'UPDATE lots SET quantity = ?, remaining_quantity = ? WHERE id = ?'
        db.prepare(statement).run(newQuantity, newRemainingQuantity, lot.id)
    }

    const allLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
    if (allLots.length === 0) return

    const splitRatio = transaction.quantity / 10
    if (!splitRatio || splitRatio <= 0) return

    allLots.forEach(updateLot)
}

/*
 * Process shares out transaction - create new lot
 * @sig processSharesOutTransaction :: (Database, Object, Object, Object) -> void
 */
const processSharesOutTransaction = (db, transaction, account, security) => {
    if (!isSignificantQuantity(transaction.quantity)) return
    processLotReduction(db, transaction, account, security, false)
}

/*
 * Vest creates option lots with the vested quantity
 * @sig processVestOptions :: (Object, Object, Object, Database) -> void
 */
const processVestOptions = (transaction, account, security, db) => {
    if (!transaction.quantity || !isSignificantQuantity(transaction.quantity)) return
    insertLot(db, createLotFromTransaction(transaction, account, security, transaction.quantity, 0))
}

/*
 * Process option exercise - close option lots and create stock lots
 * @sig processExerciseOptions :: (Object, Object, Object, Database) -> void
 */
const processExerciseOptions = (transaction, security, account, db) => {
    const processOptionLot = lot => {
        if (!isSignificantQuantity(remainingToExercise)) return

        const sharesToExercise = Math.min(lot.remaining_quantity, remainingToExercise)
        const newRemainingQuantity = lot.remaining_quantity - sharesToExercise
        const closedDate = Math.abs(newRemainingQuantity) <= EPSILON ? formatDate(transaction.date) : null

        updateLotQuantity(db, lot.id, Math.abs(newRemainingQuantity) <= EPSILON ? 0 : newRemainingQuantity, closedDate)
        remainingToExercise -= sharesToExercise
    }

    if (!transaction.quantity || !isSignificantQuantity(transaction.quantity)) return

    const statement = `
        SELECT id, remaining_quantity, cost_basis
        FROM lots
        WHERE account_id = ? AND security_id = ? AND closed_date IS NULL
            AND remaining_quantity > 0
        ORDER BY purchase_date ASC, id ASC
    `

    const openOptionLots = db.prepare(statement).all(account.id, security.id)
    let remainingToExercise = transaction.quantity
    openOptionLots.forEach(processOptionLot)
}

export {
    insertLot,
    getAllLots,
    getLotCount,
    clearLots,
    importLots,
    getLotsByAccountAndSecurity,
    getOpenLotsByAccountAndSecurity,
    updateLotQuantity,
}
