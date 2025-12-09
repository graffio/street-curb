import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'
import test from 'node:test'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import {
    clearLots,
    getAllLots,
    getLotCount,
    getLotsByAccountAndSecurity,
    getOpenLotsByAccountAndSecurity,
    importLots,
    insertLot,
    updateLotQuantity,
} from '../src/services/database/lots.js'
import {
    insertAccount,
    insertSecurity,
    insertInvestmentTransaction,
    findAccountByName,
    findSecurityByName,
} from '../src/services/database/index.js'
import { Entry } from '../src/types/index.js'

/*
 * Create test database with schema
 * @sig createTestDatabase :: () -> Database
 */
const createTestDatabase = () => {
    const db = new Database(':memory:')
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

/*
 * Create test account in database
 * @sig createAccountInDb :: (Database, Object) -> Object
 */
const createAccountInDb = (db, accountData) => {
    const accountEntry = Entry.Account.from(accountData)
    insertAccount(db, accountEntry)
    return findAccountByName(db, accountData.name)
}

/*
 * Create test security in database
 * @sig createSecurityInDb :: (Database, Object) -> Object
 */
const createSecurityInDb = (db, securityData) => {
    const securityEntry = Entry.Security.from(securityData)
    insertSecurity(db, securityEntry)
    return findSecurityByName(db, securityData.name)
}

/*
 * Create test transaction in database using service layer
 * @sig createTransactionInDb :: (Database, Object) -> Object
 */
const createTransactionInDb = (db, transactionData) => {
    const account = { id: transactionData.accountId }
    const security = transactionData.securityId ? { id: transactionData.securityId } : null
    const transactionEntry = Entry.TransactionInvestment.from({
        account: 'dummy', // not used, we pass account object
        date: new Date(transactionData.date),
        transactionType: transactionData.investmentAction,
        amount: transactionData.amount,
        security: security ? 'dummy' : null,
        quantity: transactionData.quantity,
        price: transactionData.price,
    })
    const id = insertInvestmentTransaction(db, transactionEntry, account, security)
    return { id, ...transactionData }
}

/*
 * Insert transaction directly via SQL for edge case tests (e.g., floating-point precision)
 * Uses proper txn_ prefixed IDs
 * @sig insertRawTransaction :: (Database, Object) -> void
 */
const insertRawTransaction = (db, txn) =>
    db
        .prepare(
            `INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
            txn.id,
            txn.account_id,
            txn.date,
            txn.amount,
            txn.transaction_type,
            txn.investment_action,
            txn.security_id,
            txn.quantity,
            txn.price,
        )

test('Lots Repository', async t => {
    await t.test('Given a fresh database', async t => {
        await t.test('When I insert a basic lot', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })
            const transaction = createTransactionInDb(db, {
                accountId: account.id,
                date: '2024-01-15',
                amount: -1500.0,
                securityId: security.id,
                quantity: 10,
                price: 150.0,
                investmentAction: 'Buy',
            })

            const lotData = {
                accountId: account.id,
                securityId: security.id,
                purchaseDate: '2024-01-15',
                quantity: 10,
                costBasis: 1500.0,
                remainingQuantity: 10,
                closedDate: null,
                createdByTransactionId: transaction.id,
                createdAt: '2024-01-15T10:00:00Z',
            }

            insertLot(db, lotData)

            await t.test('Then the lot is inserted and retrievable', t => {
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have one lot')
                assert.strictEqual(allLots[0].accountId, account.id, 'Account ID should match')
                assert.strictEqual(allLots[0].securityId, security.id, 'Security ID should match')
                assert.strictEqual(allLots[0].quantity, 10, 'Quantity should match')
                assert.strictEqual(allLots[0].costBasis, 1500.0, 'Cost basis should match')
                assert.strictEqual(allLots[0].remainingQuantity, 10, 'Remaining quantity should match')
            })
        })

        await t.test('When I get all lots on a fresh database', async t => {
            const db = createTestDatabase()
            const allLots = getAllLots(db)
            assert.deepStrictEqual(allLots, [], 'Should return empty array for fresh database')
        })

        await t.test('When I get the lot count on a fresh database', async t => {
            const db = createTestDatabase()
            const count = getLotCount(db)
            assert.strictEqual(count, 0, 'Lot count should be zero for fresh database')
        })
    })

    await t.test('Given a database with existing lots', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
        const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })
        const transaction1 = createTransactionInDb(db, {
            accountId: account.id,
            date: '2024-01-15',
            amount: -1500.0,
            securityId: security.id,
            quantity: 10,
            price: 150.0,
            investmentAction: 'Buy',
        })
        const transaction2 = createTransactionInDb(db, {
            accountId: account.id,
            date: '2024-02-01',
            amount: -800.0,
            securityId: security.id,
            quantity: 5,
            price: 160.0,
            investmentAction: 'Buy',
        })

        // Insert test lots - one open, one closed
        insertLot(db, {
            accountId: account.id,
            securityId: security.id,
            purchaseDate: '2024-01-15',
            quantity: 10,
            costBasis: 1500.0,
            remainingQuantity: 5,
            closedDate: null,
            createdByTransactionId: transaction1.id,
            createdAt: '2024-01-15T10:00:00Z',
        })

        insertLot(db, {
            accountId: account.id,
            securityId: security.id,
            purchaseDate: '2024-02-01',
            quantity: 5,
            costBasis: 800.0,
            remainingQuantity: 0,
            closedDate: '2024-03-01',
            createdByTransactionId: transaction2.id,
            createdAt: '2024-02-01T10:00:00Z',
        })

        await t.test('When I get all lots', async t => {
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 2, 'Should return all 2 lots')
            assert.strictEqual(allLots[0].purchaseDate, '2024-01-15', 'First lot should be oldest')
            assert.strictEqual(allLots[1].purchaseDate, '2024-02-01', 'Second lot should be newest')
        })

        await t.test('When I get lots by account and security', async t => {
            const lots = getLotsByAccountAndSecurity(db, account.id, security.id)
            assert.strictEqual(lots.length, 2, 'Should return 2 lots')
        })

        await t.test('When I get open lots by account and security', async t => {
            const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
            assert.strictEqual(openLots.length, 1, 'Should return 1 open lot')
            assert.strictEqual(openLots[0].remainingQuantity, 5, 'Remaining quantity should be 5')
        })

        await t.test('When I update lot quantity', async t => {
            const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
            const lot = openLots[0]

            updateLotQuantity(db, lot.id, 0, '2024-04-01')

            const updatedLots = getLotsByAccountAndSecurity(db, account.id, security.id)
            const updatedLot = updatedLots.find(l => l.id === lot.id)
            assert.strictEqual(updatedLot.remainingQuantity, 0, 'Remaining quantity should be 0')
            assert.strictEqual(updatedLot.closedDate, '2024-04-01', 'Closed date should be set')
        })

        await t.test('When I get the lot count', async t => {
            const count = getLotCount(db)
            assert.strictEqual(count, 2, 'Lot count should be 2')
        })

        await t.test('When I clear all lots', async t => {
            clearLots(db)
            assert.strictEqual(getLotCount(db), 0, 'Lot count should be zero after clearing')
        })
    })
})

test('Lot Processing Service', async t => {
    await t.test('Given buy and sell transactions', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
        const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

        createTransactionInDb(db, {
            accountId: account.id,
            date: '2024-01-15',
            amount: -1500.0,
            securityId: security.id,
            quantity: 10,
            price: 150.0,
            investmentAction: 'Buy',
        })

        createTransactionInDb(db, {
            accountId: account.id,
            date: '2024-02-15',
            amount: 800.0,
            securityId: security.id,
            quantity: 5,
            price: 160.0,
            investmentAction: 'Sell',
        })

        await t.test('Then importLots creates lot with correct remaining quantity', t => {
            importLots(db)
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 1, 'Should have 1 lot')
            assert.strictEqual(allLots[0].quantity, 10, 'Lot quantity should be 10')
            assert.strictEqual(allLots[0].remainingQuantity, 5, 'Remaining should be 5 after sell')
        })
    })

    await t.test('Given floating-point precision edge case', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
        const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

        // Use raw SQL to insert transactions with specific floating-point values
        insertRawTransaction(db, {
            id: 'txn_000000000001',
            account_id: account.id,
            date: '2024-01-15',
            amount: -1500.0,
            transaction_type: 'investment',
            investment_action: 'Buy',
            security_id: security.id,
            quantity: 10.00000000000001, // tiny floating-point error
            price: 150.0,
        })

        insertRawTransaction(db, {
            id: 'txn_000000000002',
            account_id: account.id,
            date: '2024-02-15',
            amount: 1500.0,
            transaction_type: 'investment',
            investment_action: 'Sell',
            security_id: security.id,
            quantity: 10,
            price: 150.0,
        })

        await t.test('Then lot is closed despite epsilon difference', t => {
            importLots(db)
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 1, 'Should have 1 lot')
            assert.strictEqual(allLots[0].remainingQuantity, 0, 'Remaining should be 0 (epsilon handled)')
            assert.ok(allLots[0].closedDate, 'Lot should be closed')
        })
    })

    await t.test('Given transfer actions without security_id', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })

        insertRawTransaction(db, {
            id: 'txn_000000000001',
            account_id: account.id,
            date: '2024-01-15',
            amount: 1000.0,
            transaction_type: 'investment',
            investment_action: 'XOut',
            security_id: null,
            quantity: null,
            price: null,
        })

        insertRawTransaction(db, {
            id: 'txn_000000000002',
            account_id: account.id,
            date: '2024-01-16',
            amount: -1000.0,
            transaction_type: 'investment',
            investment_action: 'XIn',
            security_id: null,
            quantity: null,
            price: null,
        })

        await t.test('Then transfer actions create no lots', t => {
            importLots(db)
            assert.strictEqual(getAllLots(db).length, 0, 'Transfer transactions should not create lots')
        })
    })

    await t.test('Given dividend transactions', async t => {
        await t.test('Regular dividends create no lots', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            insertRawTransaction(db, {
                id: 'txn_000000000001',
                account_id: account.id,
                date: '2024-01-15',
                amount: 100.0,
                transaction_type: 'investment',
                investment_action: 'Div',
                security_id: security.id,
                quantity: null,
                price: null,
            })

            importLots(db)
            assert.strictEqual(getAllLots(db).length, 0, 'Div transactions should not create lots')
        })

        await t.test('Reinvested dividends create lots', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            insertRawTransaction(db, {
                id: 'txn_000000000001',
                account_id: account.id,
                date: '2024-01-15',
                amount: 100.0,
                transaction_type: 'investment',
                investment_action: 'ReinvDiv',
                security_id: security.id,
                quantity: 0.5,
                price: 200.0,
            })

            importLots(db)
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 1, 'ReinvDiv should create 1 lot')
            assert.strictEqual(allLots[0].quantity, 0.5, 'Lot quantity should be 0.5')
            assert.strictEqual(allLots[0].costBasis, 100.0, 'Cost basis should be amount')
        })
    })

    await t.test('Given short positions', async t => {
        await t.test('Short sell creates negative quantity lot', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            insertRawTransaction(db, {
                id: 'txn_000000000001',
                account_id: account.id,
                date: '2024-01-15',
                amount: 1500.0,
                transaction_type: 'investment',
                investment_action: 'Sell',
                security_id: security.id,
                quantity: 10,
                price: 150.0,
            })

            importLots(db)
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 1, 'Should have 1 lot')
            assert.strictEqual(allLots[0].quantity, -10, 'Short lot quantity should be -10')
            assert.strictEqual(allLots[0].remainingQuantity, -10, 'Short lot remaining should be -10')
        })

        await t.test('Buy to cover closes short position', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            insertRawTransaction(db, {
                id: 'txn_000000000001',
                account_id: account.id,
                date: '2024-01-15',
                amount: 1500.0,
                transaction_type: 'investment',
                investment_action: 'Sell',
                security_id: security.id,
                quantity: 10,
                price: 150.0,
            })

            insertRawTransaction(db, {
                id: 'txn_000000000002',
                account_id: account.id,
                date: '2024-01-20',
                amount: -1400.0,
                transaction_type: 'investment',
                investment_action: 'Buy',
                security_id: security.id,
                quantity: 10,
                price: 140.0,
            })

            importLots(db)
            const allLots = getAllLots(db)
            assert.strictEqual(allLots.length, 1, 'Should have 1 lot')
            assert.strictEqual(allLots[0].remainingQuantity, 0, 'Short lot should be closed')
            assert.ok(allLots[0].closedDate, 'Closed date should be set')
        })
    })
})
