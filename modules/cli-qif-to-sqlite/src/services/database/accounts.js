// ABOUTME: Account database operations for QIF import
// ABOUTME: Handles account CRUD, balance calculations, and register queries

import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Account, Entry } from '../../types/index.js'

/*
 * Insert account into database
 * @sig insertAccount :: (Database, Entry.Account) -> String
 */
const insertAccount = (db, accountEntry) => {
    const generateId = n => `acc_${hashFields({ name: n })}`

    // @sig checkConflicts :: (Object, Entry.Account) -> [String]
    const checkConflicts = (existing, entry) => {
        const { creditLimit: exCL, description: exDesc, type: exType } = existing
        const { creditLimit: newCL, description: newDesc, type: newType } = entry
        const conflicts = []

        if (newType && exType !== newType) conflicts.push(`type: existing="${exType}", new="${newType}"`)
        if (newDesc && exDesc !== newDesc) conflicts.push(`description: existing="${exDesc}", new="${newDesc}"`)
        if (newCL !== undefined && exCL !== newCL) conflicts.push(`creditLimit: existing=${exCL}, new=${newCL}`)

        return conflicts
    }

    if (!Entry.Account.is(accountEntry))
        throw new Error(`Expected Entry.Account; found: ${JSON.stringify(accountEntry)}`)

    const id = generateId(accountEntry.name)
    const existing = db.prepare('SELECT id, type, description, creditLimit FROM accounts WHERE id = ?').get(id)

    if (!existing) {
        const { name, type, description = null, creditLimit = null } = accountEntry
        const stmt = db.prepare(
            `INSERT INTO accounts (id, name, type, description, creditLimit) VALUES (?, ?, ?, ?, ?)`,
        )
        stmt.run(id, name, type, description, creditLimit)
        return id
    }

    const conflicts = checkConflicts(existing, accountEntry)
    if (conflicts.length > 0) throw new Error(`Account "${accountEntry.name}" already exists: ${conflicts.join(', ')}`)
    return existing.id
}

/*
 * Import accounts into database
 * @sig importAccounts :: (Database, [Entry.Account]) -> [String]
 */
const importAccounts = (db, accounts) => map(account => insertAccount(db, account), accounts)

/*
 * Find account by name
 * @sig findAccountByName :: (Database, String) -> Account?
 */
const findAccountByName = (db, accountName) => {
    const record = db
        .prepare('SELECT id, name, type, description, creditLimit FROM accounts WHERE name = ?')
        .get(accountName)
    return record ? Account.from(record) : null
}

/*
 * Get all accounts from database
 * @sig getAllAccounts :: (Database) -> [Account]
 */
const getAllAccounts = db => {
    const records = db.prepare('SELECT id, name, type, description, creditLimit FROM accounts ORDER BY name').all()
    return map(Account.from, records)
}

/*
 * Get account count
 * @sig getAccountCount :: (Database) -> Number
 */
const getAccountCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM accounts').get()
    return result.count
}

/*
 * Clear all accounts from database
 * @sig clearAccounts :: (Database) -> void
 */
const clearAccounts = db => db.prepare('DELETE FROM accounts').run()

/*
 * Get all accounts with computed cash and investment balances
 * @sig getAccountsWithBalances :: Database -> [AccountWithBalance]
 */
const getAccountsWithBalances = db => {
    const sql = `
        WITH
            latest_price_per_security AS (
                SELECT securityId, price
                FROM (
                    SELECT securityId, price,
                        ROW_NUMBER() OVER (PARTITION BY securityId ORDER BY date DESC) AS rn
                    FROM prices
                )
                WHERE rn = 1
            ),
            cash_balances AS (
                SELECT accountId, SUM(
                    CASE
                        WHEN transactionType = 'bank' THEN amount
                        WHEN investmentAction IN (
                            'Cash', 'CGLong', 'CGShort', 'ContribX', 'Div', 'DivX',
                            'IntInc', 'MiscInc', 'MiscIncX', 'Sell', 'ShtSell', 'XIn'
                        ) THEN amount
                        WHEN investmentAction IN (
                            'Buy', 'CvrShrt', 'MargInt', 'MiscExp', 'XOut', 'WithdrwX'
                        ) THEN -amount
                        WHEN investmentAction IN (
                            'BuyX', 'ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvMd', 'ReinvSh',
                            'SellX', 'ShrsIn', 'ShrsOut', 'StkSplit', 'RtrnCapX'
                        ) THEN 0
                        ELSE 0
                    END
                ) AS cashBalance
                FROM transactions
                WHERE transactionType = 'bank' OR transactionType = 'investment'
                GROUP BY accountId
            ),
            open_lots AS (
                SELECT * FROM lots WHERE closedDate IS NULL AND remainingQuantity > 0
            ),
            investment_balances AS (
                SELECT l.accountId,
                    SUM(l.remainingQuantity * COALESCE(p.price, 0)) AS investmentBalance
                FROM open_lots l
                LEFT JOIN latest_price_per_security p ON l.securityId = p.securityId
                GROUP BY l.accountId
            )
        SELECT
            a.id, a.name, a.type, a.description, a.creditLimit,
            COALESCE(cb.cashBalance, 0) AS cashBalance,
            COALESCE(ib.investmentBalance, 0) AS investmentBalance,
            COALESCE(cb.cashBalance, 0) + COALESCE(ib.investmentBalance, 0) AS totalBalance
        FROM accounts a
            LEFT JOIN cash_balances cb ON a.id = cb.accountId
            LEFT JOIN investment_balances ib ON a.id = ib.accountId
        WHERE COALESCE(cb.cashBalance, 0) != 0 OR COALESCE(ib.investmentBalance, 0) != 0
        ORDER BY a.name
    `

    return db.prepare(sql).all()
}

/*
 * Get account register with running cash balances
 * RegisterEntry = {date: String, transactionType: String, investmentAction: String?,
 *   amount: Number, payee: String?, memo: String?, cashImpact: Number, runningBalance: Number}
 * @sig getAccountRegister :: (Database, String) -> [RegisterEntry]
 */
const getAccountRegister = (db, accountName) => {
    const account = db.prepare('SELECT id FROM accounts WHERE name = ?').get(accountName)
    if (!account) throw new Error(`Account not found: ${accountName}`)

    const statement = `
        WITH account_transactions AS (
            SELECT
                t.id,
                t.date,
                t.transactionType,
                t.investmentAction,
                t.amount,
                t.payee,
                t.memo,
                t.commission,
                -- Calculate cash impact based on transaction type
                CASE
                    WHEN t.transactionType = 'bank' THEN t.amount
                    WHEN t.transactionType = 'investment' THEN
                        CASE t.investmentAction
                            -- Cash inflows
                            WHEN 'Cash' THEN COALESCE(t.amount, 0)
                            WHEN 'ContribX' THEN t.amount
                            WHEN 'Div' THEN t.amount
                            WHEN 'IntInc' THEN t.amount
                            WHEN 'CGLong' THEN t.amount
                            WHEN 'CGShort' THEN t.amount
                            WHEN 'MiscInc' THEN t.amount
                            WHEN 'Sell' THEN t.amount
                            WHEN 'ShtSell' THEN t.amount
                            WHEN 'XIn' THEN t.amount
                            -- Cash outflows
                            WHEN 'Buy' THEN -t.amount
                            WHEN 'CvrShrt' THEN -t.amount
                            WHEN 'MargInt' THEN -t.amount
                            WHEN 'MiscExp' THEN -t.amount
                            WHEN 'XOut' THEN -t.amount
                            -- Subtract commission from cash outflows
                            WHEN 'BuyX' THEN -(t.amount + COALESCE(t.commission, 0))
                            WHEN 'SellX' THEN t.amount - COALESCE(t.commission, 0)
                            ELSE 0
                        END
                    ELSE 0
                END as cashImpact
            FROM transactions t
            WHERE t.accountId = ?
            ORDER BY t.date, t.id
        )
        SELECT
            date,
            transactionType,
            investmentAction,
            amount,
            payee,
            memo,
            cashImpact,
            SUM(cashImpact) OVER (ORDER BY date, id) as runningBalance
        FROM account_transactions
        ORDER BY date, id
    `

    return db.prepare(statement).all(account.id)
}

export {
    insertAccount,
    findAccountByName,
    getAllAccounts,
    getAccountCount,
    getAccountsWithBalances,
    importAccounts,
    clearAccounts,
    getAccountRegister,
}
