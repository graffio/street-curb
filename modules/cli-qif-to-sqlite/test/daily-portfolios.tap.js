import Database from 'better-sqlite3'
import { test } from 'tap'
import { initializeSchema } from '../src/services/database-service.js'
import { findAccountByName, insertAccount } from '../src/services/database/accounts.js'

import {
    countDailyPortfolios,
    findSecurityBySymbol,
    getAllDailyPortfolios,
    getAllDailyPortfoliosForAccount,
    getDailyPortfolio,
    getDailyPortfoliosByDate,
    insertBankTransaction,
    insertInvestmentTransaction,
    insertLot,
    insertPrice,
    insertSecurity,
} from '../src/services/database/index.js'

import { Entry, Lot } from '../src/types/index.js'

test('Daily Portfolios', t => {
    t.test('Given a fresh database', t => {
        const db = new Database(':memory:')

        // Use the actual database service to set up schema
        initializeSchema(db)

        t.test('When I insert a bank transaction', t => {
            const account = Entry.Account.from({
                name: 'Checking Account',
                type: 'Bank',
                description: 'Main checking account',
            })
            insertAccount(db, account)
            const accountObj = findAccountByName(db, 'Checking Account')

            const transaction = Entry.TransactionBank.from({
                account: 'Checking Account',
                date: new Date('2024-01-15'),
                amount: 1000,
                payee: 'Employer',
                memo: 'Salary deposit',
                transactionType: 'Bank',
            })
            insertBankTransaction(db, transaction, accountObj)

            t.test('Then I can get the daily portfolio', t => {
                const portfolio = getDailyPortfolio(db, accountObj.id, '2024-01-15')
                t.ok(portfolio, 'Portfolio should exist')
                t.same(portfolio.accountName, 'Checking Account', 'Account name should match')
                t.same(portfolio.date, '2024-01-15', 'Date should match')
                t.same(portfolio.cashBalance, 1000, 'Cash balance should be 1000')
                t.same(
                    portfolio.totalMarketValue,
                    1000,
                    'Total market value should equal cash balance when no holdings',
                )
                t.same(portfolio.holdings, [], 'Holdings should be empty')
                t.end()
            })

            t.test('And I can get all daily portfolios', t => {
                const portfolios = getAllDailyPortfolios(db)
                t.same(portfolios.length, 1, 'Should have one portfolio')
                t.same(portfolios[0].accountName, 'Checking Account', 'Account name should match')
                t.end()
            })

            t.test('And I can get portfolios by account', t => {
                const portfolios = getAllDailyPortfoliosForAccount(db, accountObj.id)
                t.same(portfolios.length, 1, 'Should have one portfolio for this account')
                t.same(portfolios[0].accountName, 'Checking Account', 'Account name should match')
                t.end()
            })

            t.test('And I can get portfolios by date', t => {
                const portfolios = getDailyPortfoliosByDate(db, '2024-01-15')
                t.same(portfolios.length, 1, 'Should have one portfolio for this date')
                t.same(portfolios[0].date, '2024-01-15', 'Date should match')
                t.end()
            })

            t.test('And I can count portfolios', t => {
                const count = countDailyPortfolios(db)
                t.same(count, 1, 'Should have one portfolio total')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.test('Given a database with investment transactions and lots', t => {
        const db = new Database(':memory:')

        // Use the actual database service to set up schema
        initializeSchema(db)

        t.test('When I insert investment data', t => {
            // Create account
            const account = Entry.Account.from({
                name: 'Investment Account',
                type: 'Investment',
                description: 'Stock portfolio',
            })
            insertAccount(db, account)
            const accountObj = findAccountByName(db, 'Investment Account')

            // Create security
            const security = Entry.Security.from({ name: 'Apple Inc', symbol: 'AAPL', type: 'Stock' })
            insertSecurity(db, security)
            const securityObj = findSecurityBySymbol(db, 'AAPL')

            // Insert buy transaction
            const buyTransaction = Entry.TransactionInvestment.from({
                account: 'Investment Account',
                date: new Date('2024-01-16'),
                amount: -5000,
                security: 'Apple Inc',
                quantity: 25,
                price: 200,
                investmentAction: 'Buy',
                transactionType: 'Buy',
            })
            const buyTransactionId = insertInvestmentTransaction(db, buyTransaction, accountObj, securityObj)

            // Create lot
            const lot = Lot.from({
                id: 1,
                accountId: accountObj.id,
                securityId: securityObj.id,
                purchaseDate: '2024-01-16',
                quantity: 25,
                costBasis: 5000,
                remainingQuantity: 25,
                createdByTransactionId: buyTransactionId,
                createdAt: new Date().toISOString(),
            })
            insertLot(db, lot)

            // Add initial price
            const price1 = Entry.Price.from({
                security: 'Apple Inc',
                symbol: 'AAPL',
                date: new Date('2024-01-16'),
                price: 200,
            })
            insertPrice(db, price1, securityObj)

            // Add later price
            const price2 = Entry.Price.from({
                security: 'Apple Inc',
                symbol: 'AAPL',
                date: new Date('2024-01-20'),
                price: 220,
            })
            insertPrice(db, price2, securityObj)

            // Add dummy transaction on 2024-01-20 to generate a portfolio row
            const dummyTxn = Entry.TransactionBank.from({
                account: 'Investment Account',
                date: new Date('2024-01-20'),
                amount: 0,
                payee: 'Dummy',
                memo: 'Dummy transaction for portfolio view',
                transactionType: 'Bank',
            })
            insertBankTransaction(db, dummyTxn, accountObj)

            t.test('Then I can get the portfolio for the buy date', t => {
                const portfolio = getDailyPortfolio(db, accountObj.id, '2024-01-16')
                t.ok(portfolio, 'Portfolio should exist')
                t.same(portfolio.accountName, 'Investment Account', 'Account name should match')
                t.same(portfolio.date, '2024-01-16', 'Date should match')
                t.same(portfolio.cashBalance, -5000, 'Cash balance should be -5000')
                t.same(portfolio.holdings.length, 1, 'Should have one holding')
                t.same(portfolio.holdings[0].securityName, 'Apple Inc', 'Security name should match')
                t.same(portfolio.holdings[0].quantity, 25, 'Quantity should be 25')
                t.same(portfolio.holdings[0].costBasis, 5000, 'Cost basis should be 5000')
                t.same(portfolio.holdings[0].marketValue, 5000, 'Market value should be 5000')

                t.same(portfolio.totalMarketValue, 0, 'Total market value should be 0 (cash + holdings)')
                t.end()
            })

            t.test('And market value uses the price on that date', t => {
                const portfolio = getDailyPortfolio(db, accountObj.id, '2024-01-20')
                t.ok(portfolio, 'Portfolio should exist')
                t.same(portfolio.holdings[0].marketValue, 5500, 'Market value should be 5500 (25 * 220)')
                t.same(portfolio.totalMarketValue, 500, 'Total market value should be 500 (cash -5000 + holdings 5500)')
                t.end()
            })

            t.test('And I can get a portfolio for a later date', t => {
                const portfolio = getDailyPortfolio(db, accountObj.id, '2024-01-20')
                t.ok(portfolio, 'Portfolio should exist')
                t.same(portfolio.totalMarketValue, 500, 'Total market value should be 500')
                t.end()
            })

            t.end()
        })

        t.end()
    })

    t.end()
})
