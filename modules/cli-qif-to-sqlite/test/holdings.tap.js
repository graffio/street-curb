import Database from 'better-sqlite3'
import { test } from 'tap'
import {
    getCurrentHoldings,
    getHoldingByAccountAndSecurity,
    getHoldingsAsOf,
    getHoldingsByAccount,
    getHoldingsBySecurity,
    getHoldingsCount,
    insertAccount,
    insertLot,
    insertSecurity,
} from '../src/services/database/index.js'

import { Entry, Lot } from '../src/types/index.js'

test('Holdings Repository', t => {
    t.test('Given a fresh database', t => {
        const db = new Database(':memory:')

        // Create schema
        db.exec(`
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                credit_limit REAL
            );
            
            CREATE TABLE securities (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT,
                type TEXT,
                goal TEXT
            );
            
            CREATE TABLE lots (
                id INTEGER PRIMARY KEY,
                account_id INTEGER NOT NULL,
                security_id INTEGER NOT NULL,
                purchase_date TEXT NOT NULL,
                quantity REAL NOT NULL,
                cost_basis REAL NOT NULL,
                remaining_quantity REAL NOT NULL,
                closed_date TEXT,
                created_by_transaction_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (account_id) REFERENCES accounts(id),
                FOREIGN KEY (security_id) REFERENCES securities(id)
            );
        `)

        t.test('When I get current holdings on a fresh database', t => {
            const holdings = getCurrentHoldings(db)
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get holdings as of a specific date on a fresh database', t => {
            const holdings = getHoldingsAsOf(db, '2024-01-15')
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get holdings count on a fresh database', t => {
            const count = getHoldingsCount(db)
            t.same(count, 0, 'Then the count is zero')
            t.end()
        })

        t.test('When I get holdings by account on a fresh database', t => {
            const holdings = getHoldingsByAccount(db, 1)
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get holdings by security on a fresh database', t => {
            const holdings = getHoldingsBySecurity(db, 1)
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get specific holding by account and security on a fresh database', t => {
            const holding = getHoldingByAccountAndSecurity(db, 1, 1)
            t.same(holding, null, 'Then I get null')
            t.end()
        })

        t.end()
    })

    t.test('Given a database with lots', t => {
        const db = new Database(':memory:')

        // Create schema
        db.exec(`
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                credit_limit REAL
            );
            
            CREATE TABLE securities (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT,
                type TEXT,
                goal TEXT
            );
            
            CREATE TABLE lots (
                id INTEGER PRIMARY KEY,
                account_id INTEGER NOT NULL,
                security_id INTEGER NOT NULL,
                purchase_date TEXT NOT NULL,
                quantity REAL NOT NULL,
                cost_basis REAL NOT NULL,
                remaining_quantity REAL NOT NULL,
                closed_date TEXT,
                created_by_transaction_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (account_id) REFERENCES accounts(id),
                FOREIGN KEY (security_id) REFERENCES securities(id)
            );
        `)

        // Insert test data
        const account1 = insertAccount(
            db,
            Entry.Account.from({ name: 'Brokerage', type: 'Investment', description: 'Main brokerage account' }),
        )
        const account2 = insertAccount(
            db,
            Entry.Account.from({ name: 'IRA', type: 'Investment', description: 'Individual retirement account' }),
        )

        const security1 = insertSecurity(db, Entry.Security.from({ name: 'Apple Inc.', symbol: 'AAPL', type: 'Stock' }))
        const security2 = insertSecurity(
            db,
            Entry.Security.from({ name: 'Microsoft Corporation', symbol: 'MSFT', type: 'Stock' }),
        )

        // Insert lots
        insertLot(
            db,
            Lot.from({
                id: 0,
                accountId: account1,
                securityId: security1,
                purchaseDate: '2024-01-15',
                quantity: 100,
                costBasis: 15000,
                remainingQuantity: 100,
                closedDate: null,
                createdByTransactionId: 1,
                createdAt: '2024-01-15T10:00:00Z',
            }),
        )

        insertLot(
            db,
            Lot.from({
                id: 0,
                accountId: account1,
                securityId: security2,
                purchaseDate: '2024-02-01',
                quantity: 50,
                costBasis: 10000,
                remainingQuantity: 50,
                closedDate: null,
                createdByTransactionId: 2,
                createdAt: '2024-02-01T10:00:00Z',
            }),
        )

        insertLot(
            db,
            Lot.from({
                id: 0,
                accountId: account2,
                securityId: security1,
                purchaseDate: '2024-03-01',
                quantity: 25,
                costBasis: 4000,
                remainingQuantity: 25,
                closedDate: null,
                createdByTransactionId: 3,
                createdAt: '2024-03-01T10:00:00Z',
            }),
        )

        t.test('When I get current holdings', t => {
            const holdings = getCurrentHoldings(db)
            t.same(holdings.length, 3, 'Then I get 3 holdings')

            const aaplInAccount1 = holdings.find(h => h.accountId === account1 && h.securityId === security1)
            t.ok(aaplInAccount1, 'And I find AAPL in account 1')
            t.same(aaplInAccount1.quantity, 100, 'And quantity is 100')
            t.same(aaplInAccount1.costBasis, 15000, 'And cost basis is 15000')
            t.same(aaplInAccount1.avgCostPerShare, 150, 'And average cost per share is 150')

            const msftInAccount1 = holdings.find(h => h.accountId === account1 && h.securityId === security2)
            t.ok(msftInAccount1, 'And I find MSFT in account 1')
            t.same(msftInAccount1.quantity, 50, 'And quantity is 50')
            t.same(msftInAccount1.costBasis, 10000, 'And cost basis is 10000')
            t.same(msftInAccount1.avgCostPerShare, 200, 'And average cost per share is 200')

            const aaplInAccount2 = holdings.find(h => h.accountId === account2 && h.securityId === security1)
            t.ok(aaplInAccount2, 'And I find AAPL in account 2')
            t.same(aaplInAccount2.quantity, 25, 'And quantity is 25')
            t.same(aaplInAccount2.costBasis, 4000, 'And cost basis is 4000')
            t.same(aaplInAccount2.avgCostPerShare, 160, 'And average cost per share is 160')

            t.end()
        })

        t.test('When I get holdings by account', t => {
            const account1Holdings = getHoldingsByAccount(db, account1)
            t.same(account1Holdings.length, 2, 'Then I get 2 holdings for account 1')

            const account2Holdings = getHoldingsByAccount(db, account2)
            t.same(account2Holdings.length, 1, 'Then I get 1 holding for account 2')

            t.end()
        })

        t.test('When I get holdings by security', t => {
            const aaplHoldings = getHoldingsBySecurity(db, security1)
            t.same(aaplHoldings.length, 2, 'Then I get 2 holdings for AAPL')

            const msftHoldings = getHoldingsBySecurity(db, security2)
            t.same(msftHoldings.length, 1, 'Then I get 1 holding for MSFT')

            t.end()
        })

        t.test('When I get specific holding by account and security', t => {
            const holding = getHoldingByAccountAndSecurity(db, account1, security1)
            t.ok(holding, 'Then I find the holding')
            t.same(holding.accountId, account1, 'And account ID matches')
            t.same(holding.securityId, security1, 'And security ID matches')
            t.same(holding.quantity, 100, 'And quantity matches')

            t.end()
        })

        t.test('When I get holdings count', t => {
            const count = getHoldingsCount(db)
            t.same(count, 3, 'Then the count is 3')
            t.end()
        })

        t.test('When I get holdings as of a specific date', t => {
            const holdingsAsOfJan = getHoldingsAsOf(db, '2024-01-31')
            t.same(holdingsAsOfJan.length, 1, 'Then I get 1 holding as of January 31')

            const holdingsAsOfFeb = getHoldingsAsOf(db, '2024-02-28')
            t.same(holdingsAsOfFeb.length, 2, 'Then I get 2 holdings as of February 28')

            const holdingsAsOfMar = getHoldingsAsOf(db, '2024-03-31')
            t.same(holdingsAsOfMar.length, 3, 'Then I get 3 holdings as of March 31')

            t.end()
        })

        t.end()
    })

    t.test('Given a database with closed lots', t => {
        const db = new Database(':memory:')

        // Create schema
        db.exec(`
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                credit_limit REAL
            );
            
            CREATE TABLE securities (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT,
                type TEXT,
                goal TEXT
            );
            
            CREATE TABLE lots (
                id INTEGER PRIMARY KEY,
                account_id INTEGER NOT NULL,
                security_id INTEGER NOT NULL,
                purchase_date TEXT NOT NULL,
                quantity REAL NOT NULL,
                cost_basis REAL NOT NULL,
                remaining_quantity REAL NOT NULL,
                closed_date TEXT,
                created_by_transaction_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (account_id) REFERENCES accounts(id),
                FOREIGN KEY (security_id) REFERENCES securities(id)
            );
        `)

        // Insert test data
        const account = insertAccount(db, Entry.Account.from({ name: 'Brokerage', type: 'Investment' }))
        const security = insertSecurity(db, Entry.Security.from({ name: 'Apple Inc.', symbol: 'AAPL' }))

        // Insert lots - one closed, one open
        insertLot(
            db,
            Lot.from({
                id: 0,
                accountId: account,
                securityId: security,
                purchaseDate: '2024-01-15',
                quantity: 100,
                costBasis: 15000,
                remainingQuantity: 0,
                closedDate: '2024-02-01',
                createdByTransactionId: 1,
                createdAt: '2024-01-15T10:00:00Z',
            }),
        )

        insertLot(
            db,
            Lot.from({
                id: 0,
                accountId: account,
                securityId: security,
                purchaseDate: '2024-03-01',
                quantity: 50,
                costBasis: 8000,
                remainingQuantity: 50,
                closedDate: null,
                createdByTransactionId: 2,
                createdAt: '2024-03-01T10:00:00Z',
            }),
        )

        t.test('When I get current holdings', t => {
            const holdings = getCurrentHoldings(db)
            t.same(holdings.length, 1, 'Then I get 1 holding')
            t.same(holdings[0].quantity, 50, 'And quantity is 50')
            t.same(holdings[0].costBasis, 8000, 'And cost basis is 8000')
            t.same(holdings[0].avgCostPerShare, 160, 'And average cost per share is 160')
            t.end()
        })

        t.test('When I get holdings as of different dates', t => {
            const holdingsAsOfJan = getHoldingsAsOf(db, '2024-01-31')
            t.same(holdingsAsOfJan.length, 1, 'Then I get 1 holding as of January 31')
            t.same(holdingsAsOfJan[0].quantity, 100, 'And quantity is 100')

            const holdingsAsOfFeb = getHoldingsAsOf(db, '2024-02-28')
            t.same(holdingsAsOfFeb.length, 0, 'Then I get 0 holdings as of February 28')

            const holdingsAsOfMar = getHoldingsAsOf(db, '2024-03-31')
            t.same(holdingsAsOfMar.length, 1, 'Then I get 1 holding as of March 31')
            t.same(holdingsAsOfMar[0].quantity, 50, 'And quantity is 50')

            t.end()
        })

        t.end()
    })

    t.test('Given invalid input', t => {
        const db = new Database(':memory:')

        // Create schema for invalid input tests
        db.exec(`
            CREATE TABLE accounts (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                description TEXT,
                credit_limit REAL
            );
            
            CREATE TABLE securities (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                symbol TEXT,
                type TEXT,
                goal TEXT
            );
            
            CREATE TABLE lots (
                id INTEGER PRIMARY KEY,
                account_id INTEGER NOT NULL,
                security_id INTEGER NOT NULL,
                purchase_date TEXT NOT NULL,
                quantity REAL NOT NULL,
                cost_basis REAL NOT NULL,
                remaining_quantity REAL NOT NULL,
                closed_date TEXT,
                created_by_transaction_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (account_id) REFERENCES accounts(id),
                FOREIGN KEY (security_id) REFERENCES securities(id)
            );
        `)

        t.test('When I get holdings by non-existent account', t => {
            const holdings = getHoldingsByAccount(db, 999)
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get holdings by non-existent security', t => {
            const holdings = getHoldingsBySecurity(db, 999)
            t.same(holdings, [], 'Then I get an empty array')
            t.end()
        })

        t.test('When I get specific holding by non-existent account and security', t => {
            const holding = getHoldingByAccountAndSecurity(db, 999, 999)
            t.same(holding, null, 'Then I get null')
            t.end()
        })

        t.end()
    })

    t.end()
})
