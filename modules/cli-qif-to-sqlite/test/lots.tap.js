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
import { Lot } from '../src/types/index.js'

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
    const stmt = db.prepare('INSERT INTO accounts (name, type, description) VALUES (?, ?, ?)')
    const result = stmt.run(accountData.name, accountData.type, accountData.description || null)

    return {
        id: result.lastInsertRowid,
        name: accountData.name,
        type: accountData.type,
        description: accountData.description,
    }
}

/*
 * Create test security in database
 * @sig createSecurityInDb :: (Database, Object) -> Object
 */
const createSecurityInDb = (db, securityData) => {
    const stmt = db.prepare('INSERT INTO securities (name, symbol, type, goal) VALUES (?, ?, ?, ?)')
    const result = stmt.run(
        securityData.name,
        securityData.symbol,
        securityData.type || null,
        securityData.goal || null,
    )

    return {
        id: result.lastInsertRowid,
        name: securityData.name,
        symbol: securityData.symbol,
        type: securityData.type,
        goal: securityData.goal,
    }
}

/*
 * Create test transaction in database
 * @sig createTransactionInDb :: (Database, Object) -> Object
 */
const createTransactionInDb = (db, transactionData) => {
    const stmt = db.prepare(`
        INSERT INTO transactions (account_id, date, amount, transaction_type, security_id,
                                 quantity, price, investment_action)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
        transactionData.accountId,
        transactionData.date,
        transactionData.amount,
        transactionData.transactionType,
        transactionData.securityId,
        transactionData.quantity,
        transactionData.price,
        transactionData.investmentAction,
    )

    return {
        id: result.lastInsertRowid,
        accountId: transactionData.accountId,
        date: transactionData.date,
        amount: transactionData.amount,
        transactionType: transactionData.transactionType,
        securityId: transactionData.securityId,
        quantity: transactionData.quantity,
        price: transactionData.price,
        investmentAction: transactionData.investmentAction,
    }
}

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
                transactionType: 'investment',
                securityId: security.id,
                quantity: 10,
                price: 150.0,
                investmentAction: 'Buy',
            })

            const lot = Lot.from({
                id: 0,
                accountId: account.id,
                securityId: security.id,
                purchaseDate: '2024-01-15',
                quantity: 10,
                costBasis: 1500.0,
                remainingQuantity: 10,
                closedDate: null,
                createdByTransactionId: transaction.id,
                createdAt: '2024-01-15T10:00:00Z',
            })

            const lotId = insertLot(db, lot)

            await t.test('Then the lot is inserted with a valid ID', t => {
                assert.ok(lotId > 0, 'Lot ID should be positive')
            })

            await t.test('And I can find the lot in the database', t => {
                const allLots = getAllLots(db)

                assert.strictEqual(allLots.length, 1, 'Should have one lot')
                assert.ok(Lot.is(allLots[0]), 'Should be a Lot type')
                assert.strictEqual(allLots[0].accountId, account.id, 'Account ID should match')
                assert.strictEqual(allLots[0].securityId, security.id, 'Security ID should match')
                assert.strictEqual(allLots[0].quantity, 10, 'Quantity should match')
                assert.strictEqual(allLots[0].costBasis, 1500.0, 'Cost basis should match')
                assert.strictEqual(allLots[0].remainingQuantity, 10, 'Remaining quantity should match')

                // For optional fields, the tagged type library omits null values
                // So we check that closedDate is undefined (not present) when it should be null
                assert.strictEqual(
                    allLots[0].closedDate,
                    undefined,
                    'Closed date should be undefined (not present) when null',
                )
            })
        })

        await t.test('When I get all lots on a fresh database', async t => {
            const db = createTestDatabase()
            const allLots = getAllLots(db)

            await t.test('Then I get an empty array', t => {
                assert.deepStrictEqual(allLots, [], 'Should return empty array for fresh database')
            })
        })

        await t.test('When I get the lot count on a fresh database', async t => {
            const db = createTestDatabase()
            const count = getLotCount(db)

            await t.test('Then the count is zero', t => {
                assert.strictEqual(count, 0, 'Lot count should be zero for fresh database')
            })
        })

        await t.test('When I clear lots', async t => {
            const db = createTestDatabase()
            clearLots(db)

            await t.test('Then the operation completes without error', t => {
                assert.ok(true, 'Clear lots should not throw an error')
            })
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
            transactionType: 'investment',
            securityId: security.id,
            quantity: 10,
            price: 150.0,
            investmentAction: 'Buy',
        })
        const transaction2 = createTransactionInDb(db, {
            accountId: account.id,
            date: '2024-02-01',
            amount: -800.0,
            transactionType: 'investment',
            securityId: security.id,
            quantity: 5,
            price: 160.0,
            investmentAction: 'Buy',
        })

        // Insert test lots
        const lot1 = Lot.from({
            id: 0,
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

        const lot2 = Lot.from({
            id: 0,
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

        insertLot(db, lot1)
        insertLot(db, lot2)

        await t.test('When I get all lots', async t => {
            const allLots = getAllLots(db)

            await t.test('Then I get all lots in chronological order', t => {
                assert.strictEqual(allLots.length, 2, 'Should return all 2 lots')
                assert.strictEqual(allLots[0].purchaseDate, '2024-01-15', 'First lot should be oldest')
                assert.strictEqual(allLots[1].purchaseDate, '2024-02-01', 'Second lot should be newest')
            })

            await t.test('And each lot has the correct structure', t => {
                allLots.forEach(lot => {
                    assert.ok(Lot.is(lot), 'Each item should be a Lot type')
                    assert.ok(typeof lot.id === 'number', 'Each lot should have a numeric ID')
                    assert.ok(typeof lot.accountId === 'number', 'Each lot should have a numeric account ID')
                    assert.ok(typeof lot.securityId === 'number', 'Each lot should have a numeric security ID')
                    assert.ok(typeof lot.purchaseDate === 'string', 'Each lot should have a string purchase date')
                    assert.ok(typeof lot.quantity === 'number', 'Each lot should have a numeric quantity')
                    assert.ok(typeof lot.costBasis === 'number', 'Each lot should have a numeric cost basis')
                    assert.ok(
                        typeof lot.remainingQuantity === 'number',
                        'Each lot should have a numeric remaining quantity',
                    )
                })
            })
        })

        await t.test('When I get lots by account and security', async t => {
            const lots = getLotsByAccountAndSecurity(db, account.id, security.id)

            await t.test('Then I get the correct lots', t => {
                assert.strictEqual(lots.length, 2, 'Should return 2 lots')
                assert.strictEqual(lots[0].accountId, account.id, 'First lot account ID should match')
                assert.strictEqual(lots[0].securityId, security.id, 'First lot security ID should match')
            })
        })

        await t.test('When I get open lots by account and security', async t => {
            const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)

            await t.test('Then I get only open lots', t => {
                assert.strictEqual(openLots.length, 1, 'Should return 1 open lot')
                assert.strictEqual(openLots[0].closedDate, undefined, 'Lot should be open (closedDate undefined)')
                assert.strictEqual(openLots[0].remainingQuantity, 5, 'Remaining quantity should be 5')
            })
        })

        await t.test('When I update lot quantity', async t => {
            const openLots = getOpenLotsByAccountAndSecurity(db, account.id, security.id)
            const lot = openLots[0]

            updateLotQuantity(db, lot.id, 0, '2024-04-01')

            await t.test('Then the lot is updated correctly', t => {
                const updatedLots = getLotsByAccountAndSecurity(db, account.id, security.id)
                const updatedLot = updatedLots.find(l => l.id === lot.id)

                assert.strictEqual(updatedLot.remainingQuantity, 0, 'Remaining quantity should be 0')
                assert.strictEqual(updatedLot.closedDate, '2024-04-01', 'Closed date should be set')
            })
        })

        await t.test('When I get the lot count', async t => {
            const count = getLotCount(db)

            await t.test('Then the count matches the number of lots', t => {
                assert.strictEqual(count, 2, 'Lot count should be 2')
            })
        })

        await t.test('When I clear all lots', async t => {
            clearLots(db)

            await t.test('Then all lots are removed', t => {
                const count = getLotCount(db)
                assert.strictEqual(count, 0, 'Lot count should be zero after clearing')

                const allLots = getAllLots(db)
                assert.deepStrictEqual(allLots, [], 'All lots should return empty array')
            })
        })
    })

    await t.test('Given invalid input', async t => {
        await t.test('When I try to insert a non-Lot entry', async t => {
            const db = createTestDatabase()
            const invalidEntry = { accountId: 1, securityId: 1 }

            await t.test('Then an error is thrown', t => {
                assert.throws(
                    () => {
                        insertLot(db, invalidEntry)
                    },
                    /Expected Lot/,
                    'Should throw error for invalid entry type',
                )
            })
        })
    })
})

test('Lot Processing Service', async t => {
    await t.test('Given investment transactions', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
        const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

        // Insert test transactions
        const buyTransaction = {
            id: 1,
            account_id: account.id,
            date: '2024-01-15',
            amount: -1500.0,
            transaction_type: 'investment',
            investment_action: 'Buy',
            security_id: security.id,
            quantity: 10,
            price: 150.0,
        }

        const sellTransaction = {
            id: 2,
            account_id: account.id,
            date: '2024-02-15',
            amount: 800.0,
            transaction_type: 'investment',
            investment_action: 'Sell',
            security_id: security.id,
            quantity: 5,
            price: 160.0,
        }

        db.prepare(
            'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(
            buyTransaction.id,
            buyTransaction.account_id,
            buyTransaction.date,
            buyTransaction.amount,
            buyTransaction.transaction_type,
            buyTransaction.investment_action,
            buyTransaction.security_id,
            buyTransaction.quantity,
            buyTransaction.price,
        )

        db.prepare(
            'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(
            sellTransaction.id,
            sellTransaction.account_id,
            sellTransaction.date,
            sellTransaction.amount,
            sellTransaction.transaction_type,
            sellTransaction.investment_action,
            sellTransaction.security_id,
            sellTransaction.quantity,
            sellTransaction.price,
        )

        await t.test('When I import lots from transactions', async t => {
            importLots(db)

            await t.test('Then lots are created correctly', t => {
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have 1 lot after buy and sell transactions')

                const lot = allLots[0]
                assert.strictEqual(lot.quantity, 10, 'Lot quantity should be 10')
                assert.strictEqual(lot.costBasis, 1500.0, 'Lot cost basis should be 1500.0')
                assert.strictEqual(lot.remainingQuantity, 5, 'Lot remaining quantity should be 5 after sell')
                assert.strictEqual(lot.closedDate, undefined, 'Lot should be open (closedDate undefined)')
            })
        })
    })

    await t.test('Given investment transactions with new actions', async t => {
        const db = createTestDatabase()
        const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
        const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

        // Insert test transactions
        const buyTransaction = {
            id: 1,
            account_id: account.id,
            date: '2024-01-15',
            amount: -1500.0,
            transaction_type: 'investment',
            investment_action: 'Buy',
            security_id: security.id,
            quantity: 10,
            price: 150.0,
        }

        const sellTransaction = {
            id: 2,
            account_id: account.id,
            date: '2024-02-15',
            amount: 800.0,
            transaction_type: 'investment',
            investment_action: 'Sell',
            security_id: security.id,
            quantity: 5,
            price: 160.0,
        }

        db.prepare(
            'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(
            buyTransaction.id,
            buyTransaction.account_id,
            buyTransaction.date,
            buyTransaction.amount,
            buyTransaction.transaction_type,
            buyTransaction.investment_action,
            buyTransaction.security_id,
            buyTransaction.quantity,
            buyTransaction.price,
        )

        db.prepare(
            'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ).run(
            sellTransaction.id,
            sellTransaction.account_id,
            sellTransaction.date,
            sellTransaction.amount,
            sellTransaction.transaction_type,
            sellTransaction.investment_action,
            sellTransaction.security_id,
            sellTransaction.quantity,
            sellTransaction.price,
        )

        await t.test('When I import lots from transactions with new actions', async t => {
            importLots(db)

            await t.test('Then new investment actions are handled correctly', t => {
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have 1 lot after new investment actions')

                const lot = allLots[0]
                assert.strictEqual(lot.quantity, 10, 'Lot quantity should be 10')
                assert.strictEqual(lot.costBasis, 1500.0, 'Lot cost basis should be 1500.0')
                assert.strictEqual(
                    lot.remainingQuantity,
                    5,
                    'Lot remaining quantity should be 5 after new investment actions',
                )
                assert.strictEqual(lot.closedDate, undefined, 'Lot should be open (closedDate undefined)')
            })
        })
    })

    await t.test('Given floating-point precision issues', async t => {
        await t.test('When I have very small remaining shares', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            // Insert test transactions with floating-point precision
            const buyTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: -1500.0,
                transaction_type: 'investment',
                investment_action: 'Buy',
                security_id: security.id,
                quantity: 10.00000000000001,
                price: 150.0,
            }

            const sellTransaction = {
                id: 2,
                account_id: account.id,
                date: '2024-02-15',
                amount: 1500.0,
                transaction_type: 'investment',
                investment_action: 'Sell',
                security_id: security.id,
                quantity: 10,
                price: 150.0,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                buyTransaction.id,
                buyTransaction.account_id,
                buyTransaction.date,
                buyTransaction.amount,
                buyTransaction.transaction_type,
                buyTransaction.investment_action,
                buyTransaction.security_id,
                buyTransaction.quantity,
                buyTransaction.price,
            )

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                sellTransaction.id,
                sellTransaction.account_id,
                sellTransaction.date,
                sellTransaction.amount,
                sellTransaction.transaction_type,
                sellTransaction.investment_action,
                sellTransaction.security_id,
                sellTransaction.quantity,
                sellTransaction.price,
            )

            importLots(db)
            const allLots = getAllLots(db)
            console.log('DEBUG allLots:', allLots)
            assert.strictEqual(allLots.length, 1, 'Should have 1 lot after buy and sell transactions')
            const lot = allLots[0]
            assert.ok(Math.abs(lot.quantity - 10) < 1e-8, 'Lot quantity should be approximately 10')
            assert.strictEqual(lot.remainingQuantity, 0, 'Lot remaining quantity should be 0 after sell (epsilon)')
            assert.ok(lot.closedDate, 'Lot should be closed (closedDate set)')
        })
    })

    await t.test('Given transfer actions without security_id', async t => {
        await t.test('When I import lots from transfer transactions', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })

            // Insert transfer transactions without security_id
            const xOutTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: 1000.0,
                transaction_type: 'investment',
                investment_action: 'XOut',
                security_id: null,
                quantity: null,
                price: null,
            }

            const xInTransaction = {
                id: 2,
                account_id: account.id,
                date: '2024-01-16',
                amount: -1000.0,
                transaction_type: 'investment',
                investment_action: 'XIn',
                security_id: null,
                quantity: null,
                price: null,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                xOutTransaction.id,
                xOutTransaction.account_id,
                xOutTransaction.date,
                xOutTransaction.amount,
                xOutTransaction.transaction_type,
                xOutTransaction.investment_action,
                xOutTransaction.security_id,
                xOutTransaction.quantity,
                xOutTransaction.price,
            )

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                xInTransaction.id,
                xInTransaction.account_id,
                xInTransaction.date,
                xInTransaction.amount,
                xInTransaction.transaction_type,
                xInTransaction.investment_action,
                xInTransaction.security_id,
                xInTransaction.quantity,
                xInTransaction.price,
            )

            await t.test('Then transfer actions are handled without security_id', t => {
                // Process the transactions
                importLots(db)

                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 0, 'Should have 0 lots after transfer transactions (no security_id)')
            })
        })
    })

    await t.test('Given dividend transactions', async t => {
        await t.test('When I import lots from dividend transactions', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            // Insert dividend transactions
            const dividendTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: 100.0,
                transaction_type: 'investment',
                investment_action: 'Div',
                security_id: security.id,
                quantity: null,
                price: null,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                dividendTransaction.id,
                dividendTransaction.account_id,
                dividendTransaction.date,
                dividendTransaction.amount,
                dividendTransaction.transaction_type,
                dividendTransaction.investment_action,
                dividendTransaction.security_id,
                dividendTransaction.quantity,
                dividendTransaction.price,
            )

            await t.test('Then regular dividends are cash-only (no lots)', t => {
                importLots(db)
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 0, 'Should have 0 lots after dividend transactions')
            })
        })

        await t.test('When I import lots from dividend transactions with reinvested dividends', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            // Insert dividend transactions with reinvested dividends
            const dividendTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: 100.0,
                transaction_type: 'investment',
                investment_action: 'ReinvDiv',
                security_id: security.id,
                quantity: 0.5,
                price: 200.0,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                dividendTransaction.id,
                dividendTransaction.account_id,
                dividendTransaction.date,
                dividendTransaction.amount,
                dividendTransaction.transaction_type,
                dividendTransaction.investment_action,
                dividendTransaction.security_id,
                dividendTransaction.quantity,
                dividendTransaction.price,
            )

            await t.test('Then reinvested dividends create new lots', t => {
                importLots(db)
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have 1 lot after reinvested dividend transaction')

                const lot = allLots[0]
                assert.strictEqual(lot.quantity, 0.5, 'Lot quantity should be 0.5')
                assert.strictEqual(lot.costBasis, 100.0, 'Lot cost basis should be 100.0')
                assert.strictEqual(
                    lot.remainingQuantity,
                    0.5,
                    'Lot remaining quantity should be 0.5 after reinvested dividend',
                )
                assert.strictEqual(lot.closedDate, undefined, 'Lot should be open (closedDate undefined)')
            })
        })
    })

    await t.test('Given short positions', async t => {
        await t.test('When I import lots from short selling transactions', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            // Insert a short sell transaction (selling more than we own)
            const shortSellTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: 1500.0,
                transaction_type: 'investment',
                investment_action: 'Sell',
                security_id: security.id,
                quantity: 10,
                price: 150.0,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                shortSellTransaction.id,
                shortSellTransaction.account_id,
                shortSellTransaction.date,
                shortSellTransaction.amount,
                shortSellTransaction.transaction_type,
                shortSellTransaction.investment_action,
                shortSellTransaction.security_id,
                shortSellTransaction.quantity,
                shortSellTransaction.price,
            )

            await t.test('Then short positions are created with negative quantities', t => {
                importLots(db)
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have 1 lot after short sale')

                // The lot should be the open short position
                const shortLot = allLots[0]
                assert.strictEqual(shortLot.quantity, -10, 'Short lot quantity should be -10')
                assert.strictEqual(shortLot.remainingQuantity, -10, 'Short lot remaining quantity should be -10 (open)')
                assert.strictEqual(shortLot.closedDate, undefined, 'Short lot should be open (closedDate undefined)')
            })
        })

        await t.test('When I have a short position and then buy to cover', async t => {
            const db = createTestDatabase()
            const account = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })

            // Insert a short sell transaction
            const shortSellTransaction = {
                id: 1,
                account_id: account.id,
                date: '2024-01-15',
                amount: 1500.0,
                transaction_type: 'investment',
                investment_action: 'Sell',
                security_id: security.id,
                quantity: 10,
                price: 150.0,
            }

            // Insert a buy to cover transaction
            const buyToCoverTransaction = {
                id: 2,
                account_id: account.id,
                date: '2024-01-20',
                amount: -1400.0,
                transaction_type: 'investment',
                investment_action: 'Buy',
                security_id: security.id,
                quantity: 10,
                price: 140.0,
            }

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                shortSellTransaction.id,
                shortSellTransaction.account_id,
                shortSellTransaction.date,
                shortSellTransaction.amount,
                shortSellTransaction.transaction_type,
                shortSellTransaction.investment_action,
                shortSellTransaction.security_id,
                shortSellTransaction.quantity,
                shortSellTransaction.price,
            )

            db.prepare(
                'INSERT INTO transactions (id, account_id, date, amount, transaction_type, investment_action, security_id, quantity, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            ).run(
                buyToCoverTransaction.id,
                buyToCoverTransaction.account_id,
                buyToCoverTransaction.date,
                buyToCoverTransaction.amount,
                buyToCoverTransaction.transaction_type,
                buyToCoverTransaction.investment_action,
                buyToCoverTransaction.security_id,
                buyToCoverTransaction.quantity,
                buyToCoverTransaction.price,
            )

            await t.test('Then the short position is closed after buy to cover', t => {
                importLots(db)
                const allLots = getAllLots(db)
                assert.strictEqual(allLots.length, 1, 'Should have 1 lot after short sell and buy to cover')

                // The lot should be the closed short position
                const shortLot = allLots[0]
                assert.strictEqual(shortLot.quantity, -10, 'Short lot quantity should be -10')
                assert.strictEqual(shortLot.remainingQuantity, 0, 'Short lot remaining quantity should be 0 (closed)')
                assert.ok(shortLot.closedDate, 'Short lot should be closed')
            })
        })
    })
})
