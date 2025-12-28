// ABOUTME: Tests for price database operations
// ABOUTME: Validates price import, querying, and historical price lookups

import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'
import {
    clearPrices,
    getAllPrices,
    getPriceCount,
    importPrices,
    insertPrice,
    populatePricesFromTransactions,
} from '../src/services/database/prices.js'
import { insertAccount, insertSecurity, findAccountByName, findSecurityByName } from '../src/services/database/index.js'
import { Entry, Price } from '../src/types/index.js'

const { Price: EntryPrice } = Entry

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const createTestDatabase = () => {
    const db = Database(':memory:')
    const schemaPath = join(__dirname, '..', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')
    db.exec(schema)
    return db
}

const createSecurityInDb = (db, security) => {
    const securityEntry = Entry.Security.from(security)
    insertSecurity(db, securityEntry)
    return findSecurityByName(db, security.name)
}

const createAccountInDb = (db, account) => {
    const accountEntry = Entry.Account.from(account)
    insertAccount(db, accountEntry)
    return findAccountByName(db, account.name)
}

const createInvestmentTransactionInDb = (db, transaction) => {
    const { accountId, date, amount, payee, memo, cleared, securityId, quantity, price, commission, investmentAction } =
        transaction
    const cols = `accountId, date, amount, transactionType, payee, memo, cleared,
            categoryId, securityId, quantity, price, commission, investmentAction, address`
    const stmt = db.prepare(
        `INSERT INTO transactions (${cols}) VALUES (?, ?, ?, 'investment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    const result = stmt.run(
        accountId,
        date,
        amount || null,
        payee || null,
        memo || null,
        cleared || null,
        null,
        securityId,
        quantity || null,
        price || null,
        commission || null,
        investmentAction || null,
        null,
    )
    return result.lastInsertRowid
}

test('Prices Repository', t => {
    t.test('Given a fresh database', t => {
        t.test('When I insert a basic price', t => {
            const db = createTestDatabase()
            const security = createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' })
            const priceEntry = EntryPrice.from({ symbol: 'AAPL', price: 150.25, date: new Date('2024-01-15') })

            const priceId = insertPrice(db, priceEntry, security)

            t.test('Then the price is inserted with a valid ID', t => {
                t.match(priceId, /^prc_[a-f0-9]{12}$/, 'Price ID should match pattern')
                t.end()
            })

            t.test('And I can find the price in the database', t => {
                const allPrices = getAllPrices(db)

                t.same(allPrices.length, 1, 'Should have one price')
                t.match(allPrices[0].securityId, /^sec_[a-f0-9]{12}$/, 'Security ID should match pattern')
                t.same(allPrices[0].price, 150.25, 'Price should match')
                t.same(allPrices[0].date, '2024-01-15', 'Date should match')
                t.end()
            })

            t.end()
        })

        t.test('When I insert a price with minimal data', t => {
            const db = createTestDatabase()
            const security = createSecurityInDb(db, { name: 'Microsoft Corp.', symbol: 'MSFT' })
            const priceEntry = EntryPrice.from({ symbol: 'MSFT', price: 300.5, date: new Date('2024-01-16') })

            const priceId = insertPrice(db, priceEntry, security)

            t.test('Then the price is inserted successfully', t => {
                t.match(priceId, /^prc_[a-f0-9]{12}$/, 'Price ID should match pattern')
                t.end()
            })

            t.test('And I can find the price with default values', t => {
                const allPrices = getAllPrices(db)

                t.same(allPrices.length, 1, 'Should have one price')
                t.match(allPrices[0].securityId, /^sec_[a-f0-9]{12}$/, 'Security ID should match pattern')
                t.same(allPrices[0].price, 300.5, 'Price should match')
                t.same(allPrices[0].date, '2024-01-16', 'Date should match')
                t.end()
            })

            t.end()
        })

        t.test('When I get all prices on a fresh database', t => {
            const db = createTestDatabase()
            const allPrices = getAllPrices(db)

            t.test('Then I get an empty array', t => {
                t.same(allPrices, [], 'Should return empty array for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I get the price count on a fresh database', t => {
            const db = createTestDatabase()
            const count = getPriceCount(db)

            t.test('Then the count is zero', t => {
                t.same(count, 0, 'Price count should be zero for fresh database')
                t.end()
            })

            t.end()
        })

        t.test('When I clear prices', t => {
            const db = createTestDatabase()
            clearPrices(db)

            t.test('Then the operation completes without error', t => {
                t.pass('Clear prices should not throw an error')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with existing prices', t => {
        const db = createTestDatabase()

        // Insert some test securities and prices
        const securities = [
            createSecurityInDb(db, { name: 'Apple Inc.', symbol: 'AAPL' }),
            createSecurityInDb(db, { name: 'Microsoft Corp.', symbol: 'MSFT' }),
            createSecurityInDb(db, { name: 'Tesla Inc.', symbol: 'TSLA' }),
        ]

        const prices = [
            EntryPrice.from({ symbol: 'AAPL', price: 150.25, date: new Date('2024-01-15') }),
            EntryPrice.from({ symbol: 'MSFT', price: 300.5, date: new Date('2024-01-16') }),
            EntryPrice.from({ symbol: 'TSLA', price: 250.75, date: new Date('2024-01-17') }),
        ]

        prices.forEach((price, index) => insertPrice(db, price, securities[index]))

        t.test('When I get all prices', t => {
            const allPrices = getAllPrices(db)

            t.test('Then I get all prices in reverse chronological order', t => {
                t.same(allPrices.length, 3, 'Should return all 3 prices')
                t.same(allPrices[0].date, '2024-01-17', 'First price should be most recent')
                t.same(allPrices[1].date, '2024-01-16', 'Second price should be middle date')
                t.same(allPrices[2].date, '2024-01-15', 'Third price should be oldest')
                t.end()
            })

            t.test('And each price has the correct structure', t => {
                allPrices.forEach(p => {
                    const { id, securityId, price: priceValue, date } = p
                    t.ok(Price.is(p), 'Each item should be a Price type')
                    t.match(id, /^prc_[a-f0-9]{12}$/, 'Each price should have a valid ID')
                    t.match(securityId, /^sec_[a-f0-9]{12}$/, 'Each price should have a valid security ID')
                    t.ok(typeof priceValue === 'number', 'Each price should have a numeric price')
                    t.ok(typeof date === 'string', 'Each price should have a string date')
                })
                t.end()
            })

            t.end()
        })

        t.test('When I get the price count', t => {
            const count = getPriceCount(db)

            t.test('Then the count matches the number of prices', t => {
                t.same(count, 3, 'Price count should be 3')
                t.end()
            })

            t.end()
        })

        t.test('When I import additional prices', t => {
            const newSecurities = [
                createSecurityInDb(db, { name: 'Google Inc.', symbol: 'GOOGL' }),
                createSecurityInDb(db, { name: 'Amazon.com Inc.', symbol: 'AMZN' }),
            ]

            const newPrices = [
                EntryPrice.from({ symbol: 'GOOGL', price: 2800.0, date: new Date('2024-01-18') }),
                EntryPrice.from({ symbol: 'AMZN', price: 3200.5, date: new Date('2024-01-19') }),
            ]

            const priceIds = importPrices(db, newPrices, newSecurities)

            t.test('Then all prices are imported successfully', t => {
                t.same(priceIds.length, 2, 'Should return 2 price IDs')
                priceIds.forEach(id => t.match(id, /^prc_[a-f0-9]{12}$/, 'Each ID should match pattern'))
                t.end()
            })

            t.test('And I can find the new prices', t => {
                const allPrices = getAllPrices(db)
                const googlPrice = allPrices.find(p => p.securityId === newSecurities[0].id)
                const amznPrice = allPrices.find(p => p.securityId === newSecurities[1].id)

                t.ok(googlPrice, 'Google price should be found')
                t.ok(amznPrice, 'Amazon price should be found')
                t.same(googlPrice.price, 2800.0, 'Google price should match')
                t.same(amznPrice.price, 3200.5, 'Amazon price should match')
                t.end()
            })

            t.test('And the total count is updated', t => {
                const count = getPriceCount(db)
                t.same(count, 5, 'Total price count should be 5')
                t.end()
            })

            t.end()
        })

        t.test('When I clear all prices', t => {
            clearPrices(db)

            t.test('Then all prices are removed', t => {
                const count = getPriceCount(db)
                t.same(count, 0, 'Price count should be zero after clearing')
                t.end()
            })

            t.test('And I cannot find any prices', t => {
                const allPrices = getAllPrices(db)
                t.same(allPrices, [], 'All prices should return empty array')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        t.test('When I try to insert a non-Price entry', t => {
            const db = createTestDatabase()
            const invalidEntry = { symbol: 'INVALID', price: 100, date: new Date() }
            const security = createSecurityInDb(db, { name: 'Test Security', symbol: 'TEST' })

            t.test('Then an error is thrown', t => {
                t.throws(() => insertPrice(db, invalidEntry, security), 'Should throw error for invalid entry type')
                t.end()
            })

            t.end()
        })

        t.test('When I try to import prices with missing security', t => {
            const db = createTestDatabase()
            const prices = [EntryPrice.from({ symbol: 'MISSING', price: 100, date: new Date() })]
            const securities = [createSecurityInDb(db, { name: 'Test Security', symbol: 'TEST' })]

            t.test('Then it throws an error for missing security', t => {
                t.throws(() => importPrices(db, prices, securities), 'Should throw error for missing security')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with investment transactions containing price data', t => {
        t.test('When I have transactions with price information', t => {
            const db = createTestDatabase()

            // Create test data
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const { id: securityId } = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })

            // Create transactions with prices (similar to user's example)
            const transactions = [
                {
                    accountId,
                    securityId,
                    date: '2017-08-25',
                    investmentAction: 'ShrsIn',
                    quantity: 6000.0,
                    price: 10.0,
                    amount: 60000.0,
                },
                {
                    accountId,
                    securityId,
                    date: '2020-12-31',
                    investmentAction: 'ShrsIn',
                    quantity: 618.7051,
                    price: 10.0,
                    amount: 6187.05,
                },
                {
                    accountId,
                    securityId,
                    date: '2021-12-09',
                    investmentAction: 'ShrsIn',
                    quantity: 1647.4425,
                    price: 13.49,
                    amount: 22224.0,
                },
                {
                    accountId,
                    securityId,
                    date: '2023-08-27',
                    investmentAction: 'ShrsIn',
                    quantity: 3200.0,
                    price: 12.5,
                    amount: 40000.0,
                },
            ]

            // Insert transactions
            transactions.forEach(tx => createInvestmentTransactionInDb(db, tx))

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then price records are created for all transaction dates', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 4, 'Should have four price records (one per date)')
                    t.ok(
                        allPrices.every(p => p.securityId === securityId),
                        'All prices should match security ID',
                    )
                    t.end()
                })

                t.test('And the latest price is from the most recent transaction', t => {
                    const allPrices = getAllPrices(db)
                    const latestPrice = allPrices[0] // Already sorted DESC by date
                    t.same(latestPrice.price, 12.5, 'Price should be from latest transaction (2023-08-27)')
                    t.same(latestPrice.date, '2023-08-27', 'Date should be from latest transaction')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have multiple securities with transactions', t => {
            const db = createTestDatabase()

            // Create test data
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security1 = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })
            const security2 = createSecurityInDb(db, { name: 'BAR Inc', symbol: 'BAR' })

            // Create transactions for both securities
            const transactions = [
                {
                    accountId,
                    securityId: security1.id,
                    date: '2023-01-15',
                    investmentAction: 'Buy',
                    quantity: 100,
                    price: 25.0,
                    amount: 2500.0,
                },
                {
                    accountId,
                    securityId: security1.id,
                    date: '2023-06-15',
                    investmentAction: 'Buy',
                    quantity: 50,
                    price: 30.0,
                    amount: 1500.0,
                },
                {
                    accountId,
                    securityId: security2.id,
                    date: '2023-02-15',
                    investmentAction: 'Buy',
                    quantity: 200,
                    price: 15.0,
                    amount: 3000.0,
                },
                {
                    accountId,
                    securityId: security2.id,
                    date: '2023-08-15',
                    investmentAction: 'Sell',
                    quantity: 100,
                    price: 18.0,
                    amount: 1800.0,
                },
            ]

            // Insert transactions
            transactions.forEach(tx => createInvestmentTransactionInDb(db, tx))

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then price records are created for all transaction dates', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 4, 'Should have four price records (2 dates per security)')
                    t.end()
                })

                t.test('And each security has the latest price', t => {
                    const allPrices = getAllPrices(db)
                    const fooPrices = allPrices.filter(p => p.securityId === security1.id)
                    const barPrices = allPrices.filter(p => p.securityId === security2.id)
                    const fooPrice = fooPrices.find(p => p.date === '2023-06-15') // Latest FOO price
                    const barPrice = barPrices.find(p => p.date === '2023-08-15') // Latest BAR price

                    t.ok(fooPrice, 'FOO price should exist')
                    t.ok(barPrice, 'BAR price should exist')
                    t.same(fooPrice.price, 30.0, 'FOO price should be from latest transaction (30.00)')
                    t.same(barPrice.price, 18.0, 'BAR price should be from latest transaction (18.00)')
                    t.same(fooPrice.date, '2023-06-15', 'FOO date should be from latest transaction')
                    t.same(barPrice.date, '2023-08-15', 'BAR date should be from latest transaction')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have transactions without price information', t => {
            const db = createTestDatabase()

            // Create test data
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const { id: securityId } = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })

            // Create transactions without prices
            const transactions = [
                {
                    accountId,
                    securityId,
                    date: '2023-01-15',
                    investmentAction: 'Div',
                    amount: 100.0,

                    // No price or quantity
                },
                {
                    accountId,
                    securityId,
                    date: '2023-06-15',
                    investmentAction: 'Buy',
                    quantity: 100,
                    price: 25.0,
                    amount: 2500.0,
                },
            ]

            // Insert transactions
            transactions.forEach(tx => createInvestmentTransactionInDb(db, tx))

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then only transactions with prices are used', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 1, 'Should have one price record (from transaction with price)')
                    t.same(allPrices[0].price, 25.0, 'Price should be from transaction with price')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have existing prices and populate from transactions', t => {
            const db = createTestDatabase()

            // Create test data
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })
            const { id: securityId } = security

            // Insert an existing price
            const existingPrice = EntryPrice.from({ symbol: 'FOO', price: 20.0, date: new Date('2023-01-01') })
            insertPrice(db, existingPrice, security)

            // Create a transaction with a newer price
            const transaction = {
                accountId,
                securityId,
                date: '2023-06-15',
                investmentAction: 'Buy',
                quantity: 100,
                price: 25.0,
                amount: 2500.0,
            }

            createInvestmentTransactionInDb(db, transaction)

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then the transaction price overwrites the existing price', t => {
                    const allPrices = getAllPrices(db)
                    t.ok(
                        allPrices.some(p => p.price === 25.0 && p.date === '2023-06-15'),
                        'Should have a price record for 2023-06-15 from transaction',
                    )
                    t.ok(
                        allPrices.some(p => p.price === 20.0 && p.date === '2023-01-01'),
                        'Should retain the original price record for 2023-01-01',
                    )
                    t.same(allPrices.length, 2, 'Should have two price records (one per date)')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have no investment transactions', t => {
            const db = createTestDatabase()

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then no prices are created', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 0, 'Should have no price records')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have transactions with zero or negative prices', t => {
            const db = createTestDatabase()

            // Create test data
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const { id: securityId } = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })

            // Create transactions with invalid prices
            const transactions = [
                {
                    accountId,
                    securityId,
                    date: '2023-01-15',
                    investmentAction: 'Buy',
                    quantity: 100,
                    price: 0,
                    amount: 0,
                },
                {
                    accountId,
                    securityId,
                    date: '2023-06-15',
                    investmentAction: 'Buy',
                    quantity: 100,
                    price: -10.0,
                    amount: -1000.0,
                },
                {
                    accountId,
                    securityId,
                    date: '2023-12-15',
                    investmentAction: 'Buy',
                    quantity: 100,
                    price: 25.0,
                    amount: 2500.0,
                },
            ]

            // Insert transactions
            transactions.forEach(tx => createInvestmentTransactionInDb(db, tx))

            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)

                t.test('Then only valid prices are used', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 1, 'Should have one price record (from valid price)')
                    t.same(allPrices[0].price, 25.0, 'Price should be from transaction with valid price')
                    t.end()
                })

                t.end()
            })

            t.end()
        })

        t.test('When I have an existing price and a transaction on the same day', t => {
            const db = createTestDatabase()
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })
            const { id: securityId } = security

            // Insert an existing price for 2023-06-15
            const existingPrice = EntryPrice.from({ symbol: 'FOO', price: 20.0, date: new Date('2023-06-15') })
            insertPrice(db, existingPrice, security)

            // Insert a transaction for the same day with a different price
            const transaction = {
                accountId,
                securityId,
                date: '2023-06-15',
                investmentAction: 'Buy',
                quantity: 100,
                price: 25.0,
                amount: 2500.0,
            }
            createInvestmentTransactionInDb(db, transaction)
            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)
                t.test('Then the price is updated to the transaction price', t => {
                    const allPrices = getAllPrices(db)
                    t.same(allPrices.length, 1, 'Should have one price record')
                    t.same(allPrices[0].price, 25.0, 'Price should be updated to transaction price')
                    t.same(allPrices[0].date, '2023-06-15', 'Date should match transaction')
                    t.end()
                })
                t.end()
            })
            t.end()
        })

        t.test('When I have an existing price and a transaction on a different day', t => {
            const db = createTestDatabase()
            const { id: accountId } = createAccountInDb(db, { name: 'Investment Account', type: 'Investment' })
            const security = createSecurityInDb(db, { name: 'FOO Corp', symbol: 'FOO' })
            const { id: securityId } = security

            // Insert an existing price for 2023-01-01
            const existingPrice = EntryPrice.from({ symbol: 'FOO', price: 20.0, date: new Date('2023-01-01') })
            insertPrice(db, existingPrice, security)

            // Insert a transaction for a later day
            const transaction = {
                accountId,
                securityId,
                date: '2023-12-31',
                investmentAction: 'Buy',
                quantity: 100,
                price: 30.0,
                amount: 3000.0,
            }
            createInvestmentTransactionInDb(db, transaction)
            t.test('And I populate prices from transactions', t => {
                populatePricesFromTransactions(db)
                t.test('Then the price is updated to the latest transaction price and date', t => {
                    const allPrices = getAllPrices(db)
                    t.ok(
                        allPrices.some(p => p.price === 30.0 && p.date === '2023-12-31'),
                        'Should have a price record for 2023-12-31 from transaction',
                    )
                    t.ok(
                        allPrices.some(p => p.price === 20.0 && p.date === '2023-01-01'),
                        'Should retain the original price record for 2023-01-01',
                    )
                    t.same(allPrices.length, 2, 'Should have two price records (one per date)')
                    t.end()
                })
                t.end()
            })
            t.end()
        })

        t.end()
    })

    t.end()
})
