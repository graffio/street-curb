import { map } from '@graffio/functional'
import { Account, Entry } from '../../types/index.js'

/*
 * Insert account into database
 * @sig insertAccount :: (Database, Entry.Account) -> Number
 */
const insertAccount = (db, accountEntry) => {
    if (!Entry.Account.is(accountEntry))
        throw new Error(`Expected Entry.Account; found: ${JSON.stringify(accountEntry)}`)

    // Check if account already exists
    const existing = db
        .prepare('SELECT id, type, description, credit_limit FROM accounts WHERE name = ?')
        .get(accountEntry.name)

    // prettier-ignore
    if (existing) {
        const { type, creditLimit, description } = accountEntry
        const conflicts = []
        
        if (type                      && existing.type         !== type)        conflicts.push(`type: existing="${existing.type}", new="${type}"`)
        if (description               && existing.description  !== description) conflicts.push(`description: existing="${existing.description}", new="${description}"`)
        if (creditLimit !== undefined && existing.credit_limit !== creditLimit) conflicts.push(`credit_limit: existing=${existing.credit_limit}, new=${creditLimit}`)

        if (conflicts.length > 0) throw new Error(`Account "${accountEntry.name}" already exists: ${conflicts.join(', ')}`)
        return existing.id // No conflicts, return existing account ID
    }

    const { name, type, description = null, creditLimit = null } = accountEntry
    const stmt = db.prepare(`INSERT INTO accounts (name, type, description, credit_limit) VALUES (?, ?, ?, ?)`)
    const result = stmt.run(name, type, description, creditLimit)
    return result.lastInsertRowid
}

/*
 * Import accounts into database
 * @sig importAccounts :: (Database, [Entry.Account]) -> [Number]
 */
const importAccounts = (db, accounts) => map(account => insertAccount(db, account), accounts)

/*
 * Find account by name
 * @sig findAccountByName :: (Database, String) -> Account?
 */
const findAccountByName = (db, accountName) => {
    const record = db
        .prepare('SELECT id, name, type, description, credit_limit AS creditLimit FROM accounts WHERE name = ?')
        .get(accountName)

    return record ? Account.from(record) : null
}

/*
 * Get all accounts from database
 * @sig getAllAccounts :: (Database) -> [Account]
 */
const getAllAccounts = db => {
    const records = db
        .prepare('SELECT id, name, type, description, credit_limit AS creditLimit FROM accounts ORDER BY name')
        .all()

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

const getAccountsWithBalances = db =>
    db
        .prepare(
            `
            WITH

                -- CTE: Latest price per security
                latest_price_per_security AS (
                    SELECT security_id, price
                    FROM (
                        SELECT security_id,price,ROW_NUMBER()
                        OVER (PARTITION BY security_id ORDER BY date DESC) AS rn
                        FROM prices
                    )
                    WHERE rn = 1
                ),
               
                -- CTE: Cash balances by account
                cash_balances AS (
                    SELECT account_id, SUM(
                        CASE
                            -- Cash inflows (positive amounts)
                            WHEN transaction_type = 'bank' THEN amount
                            WHEN investment_action IN ('Cash', 'CGLong', 'CGShort', 'ContribX', 'Div', 'DivX', 'IntInc', 'MiscInc', 'MiscIncX', 'Sell', 'ShtSell', 'XIn') THEN (amount)
                            -- Cash outflows (negative amounts) - these should reduce cash balance
                            WHEN investment_action IN ('Buy', 'CvrShrt', 'MargInt', 'MiscExp', 'XOut', 'WithdrwX') THEN -amount
                            -- No cash impact (zero amounts) - includes reinvestments
                            WHEN investment_action IN ('BuyX', 'ReinvDiv', 'ReinvInt', 'ReinvLg', 'ReinvMd', 'ReinvSh', 'SellX', 'ShrsIn', 'ShrsOut', 'StkSplit', 'RtrnCapX') THEN 0
                            -- No cash impact
                            ELSE 0
                        END
                    ) AS cash_balance
                    FROM transactions
                    WHERE transaction_type = 'bank'
                       OR transaction_type = 'investment'
                    GROUP BY account_id
                ),
               
                -- CTE: Open lots (active investments)
                open_lots AS (SELECT * FROM lots WHERE closed_date IS NULL AND remaining_quantity > 0),
               
                -- CTE: Investment balances by account
                investment_balances AS (
                    SELECT l.account_id, SUM(l.remaining_quantity * COALESCE(p.price, 0)) AS investment_balance
                    FROM open_lots l LEFT JOIN latest_price_per_security p ON l.security_id = p.security_id
                    GROUP BY l.account_id
                )
               
            -- Final query: Accounts with balances
            SELECT
                a.id,
                a.name,
                a.type,
                a.description,
                a.credit_limit AS creditLimit,
                COALESCE(cb.cash_balance, 0) AS cashBalance,
                COALESCE(ib.investment_balance, 0) AS investmentBalance,
                COALESCE(cb.cash_balance, 0) + COALESCE(ib.investment_balance, 0) AS totalBalance
            FROM accounts a
                LEFT JOIN cash_balances cb ON a.id = cb.account_id
                LEFT JOIN investment_balances ib ON a.id = ib.account_id
            WHERE COALESCE(cb.cash_balance, 0) != 0 OR COALESCE(ib.investment_balance, 0) != 0
            ORDER BY a.name;
        `,
        )
        .all()

/*
 * Get account register with running cash balances
 * @sig getAccountRegister :: (Database, String) -> [RegisterEntry]
 * RegisterEntry = {date: String, transactionType: String, investmentAction: String?, amount: Number, payee: String?, memo: String?, cashImpact: Number, runningBalance: Number}
 */
const getAccountRegister = (db, accountName) => {
    const account = db.prepare('SELECT id FROM accounts WHERE name = ?').get(accountName)
    if (!account) throw new Error(`Account not found: ${accountName}`)

    const statement = `
        WITH account_transactions AS (
            SELECT
                t.id,
                t.date,
                t.transaction_type,
                t.investment_action,
                t.amount,
                t.payee,
                t.memo,
                t.commission,
                -- Calculate cash impact based on transaction type
                CASE
                    WHEN t.transaction_type = 'bank' THEN t.amount
                    WHEN t.transaction_type = 'investment' THEN
                        CASE t.investment_action
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
                END as cash_impact
            FROM transactions t
            WHERE t.account_id = ?
            ORDER BY t.date, t.id
        )
        SELECT
            date,
            transaction_type,
            investment_action,
            amount,
            payee,
            memo,
            cash_impact,
            SUM(cash_impact) OVER (ORDER BY date, id) as running_balance
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
