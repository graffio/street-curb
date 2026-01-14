// ABOUTME: Tests for complex lot tracking scenarios
// ABOUTME: Verifies stock splits, short sales, and option exercises (Grant/Vest/Exercise)

import { test } from 'tap'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { Import } from '../src/import.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(__dirname, '../schema.sql')
const schema = readFileSync(schemaPath, 'utf-8')

const createTestDb = () => {
    const db = new Database(':memory:')
    db.exec(schema)
    return db
}

const emptyImportData = { accounts: [], categories: [], tags: [], securities: [], transactions: [], prices: [] }

const createTransaction = (accountName, date, action, quantity, price, amount = null) => ({
    accountName,
    date,
    amount: amount ?? -(quantity * price),
    transactionType: 'investment',
    payee: null,
    memo: null,
    number: null,
    cleared: null,
    categoryId: null,
    address: null,
    runningBalance: null,
    securitySignature: 'AAPL',
    quantity,
    price,
    commission: 0,
    investmentAction: action,
    splits: [],
})

test('Stock split adjusts all open lots proportionally', async t =>
    t.test('Given an account with a buy transaction', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'Buy', 10, 100),

                // Stock split: quantity / 10 = split ratio. 20 / 10 = 2.0 = 2:1 split
                { ...createTransaction('Brokerage', '2024-01-15', 'StkSplit', 20, 0), amount: 0 },
            ],
        }

        t.test('When a 2:1 stock split occurs', async t => {
            Import.processImport(db, data)

            t.test('Then the lot quantity doubles', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, 20, 'Original 10 shares become 20 after 2:1 split')
                t.equal(lots[0].remainingQuantity, 20, 'Remaining quantity also doubles')
            })

            t.test('Then the cost basis is unchanged', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots[0].costBasis, 1000, 'Cost basis stays at $1000')
            })
        })
    }))

test('Short sale creates negative quantity lot', async t =>
    t.test('Given an account with no existing position', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [createTransaction('Brokerage', '2024-01-15', 'ShtSell', 10, 100, 1000)],
        }

        t.test('When a short sale is executed', async t => {
            Import.processImport(db, data)

            t.test('Then a lot with negative quantity is created', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, -10, 'Short position has negative quantity')
                t.equal(lots[0].remainingQuantity, -10, 'Remaining quantity is also negative')
            })

            t.test('Then short position has zero cost basis', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots[0].costBasis, 0, 'Short position has no cost basis until covered')
            })
        })
    }))

test('Cover short closes negative lot FIFO', async t =>
    t.test('Given an account with a short position', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'ShtSell', 10, 100, 1000),
                createTransaction('Brokerage', '2024-01-15', 'CvrShrt', 10, 90),
            ],
        }

        t.test('When covering the short position', async t => {
            Import.processImport(db, data)

            t.test('Then the short lot is closed', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].remainingQuantity, 0, 'Short position fully covered')
                t.ok(lots[0].closedDate, 'Short lot has closed date')
            })

            t.test('Then allocation records the cover', async t => {
                const allocations = db.prepare('SELECT * FROM lotAllocations').all()
                t.equal(allocations.length, 1)
                t.equal(allocations[0].sharesAllocated, 10)
            })
        })
    }))

test('Overselling creates short position', async t =>
    t.test('Given an account with 10 shares', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'Buy', 10, 100),
                createTransaction('Brokerage', '2024-01-15', 'Sell', 15, 100, 1500),
            ],
        }

        t.test('When selling more shares than owned', async t => {
            Import.processImport(db, data)

            t.test('Then original lot is closed and short lot is created', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots.length, 2)
                t.equal(lots[0].remainingQuantity, 0, 'Original lot fully consumed')
                t.ok(lots[0].closedDate, 'Original lot closed')
                t.equal(lots[1].quantity, -5, 'Short position for 5 shares')
                t.equal(lots[1].remainingQuantity, -5, 'Short position open')
            })
        })
    }))

test('Grant creates option lot with zero cost basis', async t =>
    t.test('Given an account with a stock option grant', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Options', symbol: 'AAPL-OPT', type: 'Option', goal: null }],
            transactions: [
                {
                    ...createTransaction('Brokerage', '2024-01-15', 'Grant', 100, 0),
                    securitySignature: 'AAPL-OPT',
                    amount: 0,
                },
            ],
        }

        t.test('When a Grant is processed', async t => {
            Import.processImport(db, data)

            t.test('Then no lot is created (Grant only records the grant)', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()

                // Grant doesn't create lot per the old module - it just records
                // Actually checking import-lots.js: Grant/Vest DO create lots with zero cost basis
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, 100)
                t.equal(lots[0].costBasis, 0, 'Grant has zero cost basis')
            })
        })
    }))

test('Vest creates option lot with zero cost basis', async t =>
    t.test('Given an account with a stock option vest', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Options', symbol: 'AAPL-OPT', type: 'Option', goal: null }],
            transactions: [
                {
                    ...createTransaction('Brokerage', '2024-01-15', 'Vest', 100, 0),
                    securitySignature: 'AAPL-OPT',
                    amount: 0,
                },
            ],
        }

        t.test('When a Vest is processed', async t => {
            Import.processImport(db, data)

            t.test('Then a lot is created with zero cost basis', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)
                t.equal(lots[0].quantity, 100)
                t.equal(lots[0].costBasis, 0, 'Vested options have zero cost basis')
            })
        })
    }))

test('Exercise closes option lots FIFO', async t =>
    t.test('Given an account with vested options', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Options', symbol: 'AAPL-OPT', type: 'Option', goal: null }],
            transactions: [
                {
                    ...createTransaction('Brokerage', '2024-01-10', 'Vest', 50, 0),
                    securitySignature: 'AAPL-OPT',
                    amount: 0,
                },
                {
                    ...createTransaction('Brokerage', '2024-01-15', 'Vest', 50, 0),
                    securitySignature: 'AAPL-OPT',
                    amount: 0,
                },
                {
                    ...createTransaction('Brokerage', '2024-01-20', 'Exercise', 75, 0),
                    securitySignature: 'AAPL-OPT',
                    amount: 0,
                },
            ],
        }

        t.test('When exercising 75 options', async t => {
            Import.processImport(db, data)

            t.test('Then first vest lot is fully closed', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots.length, 2)
                t.equal(lots[0].remainingQuantity, 0, 'First 50 options fully exercised')
                t.ok(lots[0].closedDate, 'First lot closed')
            })

            t.test('Then second vest lot is partially consumed', async t => {
                const lots = db.prepare('SELECT * FROM lots ORDER BY purchaseDate').all()
                t.equal(lots[1].remainingQuantity, 25, 'Second lot has 25 remaining (50-25 exercised)')
                t.notOk(lots[1].closedDate, 'Second lot still open')
            })

            t.test('Then allocations track the exercise', async t => {
                const allocations = db.prepare('SELECT * FROM lotAllocations').all()
                t.equal(allocations.length, 2, 'Two allocations (one per lot touched)')
            })
        })
    }))

test('Multiple stock splits accumulate correctly', async t =>
    t.test('Given an account with a position that undergoes two splits', async t => {
        const db = createTestDb()
        t.teardown(() => db.close())

        const data = {
            ...emptyImportData,
            accounts: [{ name: 'Brokerage', type: 'Investment', description: null, creditLimit: null }],
            securities: [{ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock', goal: null }],
            transactions: [
                createTransaction('Brokerage', '2024-01-10', 'Buy', 10, 100),

                // First 2:1 split
                { ...createTransaction('Brokerage', '2024-02-15', 'StkSplit', 20, 0), amount: 0 },

                // Second 3:1 split (quantity/10 = 3.0)
                { ...createTransaction('Brokerage', '2024-03-15', 'StkSplit', 30, 0), amount: 0 },
            ],
        }

        t.test('When multiple splits occur', async t => {
            Import.processImport(db, data)

            t.test('Then the lot quantity reflects cumulative splits', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots.length, 1)

                // 10 * 2 * 3 = 60 shares
                t.equal(lots[0].quantity, 60, '10 shares * 2:1 * 3:1 = 60 shares')
                t.equal(lots[0].remainingQuantity, 60)
            })

            t.test('Then cost basis is unchanged through all splits', async t => {
                const lots = db.prepare('SELECT * FROM lots').all()
                t.equal(lots[0].costBasis, 1000, 'Original cost basis preserved')
            })
        })
    }))
