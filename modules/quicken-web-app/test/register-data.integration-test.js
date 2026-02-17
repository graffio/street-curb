// ABOUTME: covers account list, balances, register navigation
// ABOUTME: Run with: yarn tap:file test/register-data.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('register-data-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)
})

tap.teardown(() => session.close())

tap.test('register-data: account list shows all accounts', async t => {
    const snapshot = session.browser('snapshot', ['-i'])
    const expected = loadExpected()

    expected.accounts.forEach(account => t.ok(snapshot.includes(account.name), `shows account: ${account.name}`))
})

tap.test('register-data: account balances match expected values', async t => {
    const snapshot = session.browser('snapshot', ['-i'])
    const expected = loadExpected()

    // Bank and credit card accounts show balance
    const bankAccounts = expected.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card')
    bankAccounts.forEach(account => {
        const expectedBalance = Math.abs(account.balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(snapshot.includes(expectedBalance), `${account.name} shows balance $${expectedBalance}`)
    })

    // Investment accounts show marketValue
    const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
    investmentAccounts.forEach(account => {
        const expectedValue = account.marketValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(snapshot.includes(expectedValue), `${account.name} shows market value $${expectedValue}`)
    })
})

tap.test('register-data: clicking bank account opens register with correct data', async t => {
    const expected = loadExpected()

    session.clickByRef('Primary Checking')
    await wait(500)

    const afterClick = session.browser('snapshot')
    t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking account')

    // Verify transaction count
    const primaryAccount = expected.accounts.find(a => a.name === 'Primary Checking')
    t.ok(
        afterClick.includes(`${primaryAccount.transactionCount} transactions`),
        `shows ${primaryAccount.transactionCount} transactions`,
    )

    // Verify spot-check payees
    const checkingTxns = expected.spotChecks.filter(s => s.account === 'Primary Checking')
    checkingTxns.forEach(txn => {
        if (txn.payee) t.ok(afterClick.includes(txn.payee), `shows payee: ${txn.payee}`)
    })

    // Navigate back to Overview
    session.clickByRef('Overview')
    await wait(200)
})

tap.test('register-data: clicking investment account opens register with correct data', async t => {
    const expected = loadExpected()

    session.clickByRef('Fidelity Brokerage')
    await wait(500)

    const afterClick = session.browser('snapshot')
    t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking investment account')

    // Verify transaction count
    const fidelityAccount = expected.accounts.find(a => a.name === 'Fidelity Brokerage')
    t.ok(
        afterClick.includes(`${fidelityAccount.transactionCount} transactions`),
        `shows ${fidelityAccount.transactionCount} transactions`,
    )

    // Verify securities and actions
    const investTxns = expected.spotChecks.filter(s => s.account === 'Fidelity Brokerage' && s.symbol)
    const symbols = [...new Set(investTxns.map(txn => txn.symbol))]
    symbols.forEach(sym => t.ok(afterClick.includes(sym), `shows security: ${sym}`))
    t.ok(afterClick.includes('Buy'), 'shows Buy transactions')
    t.ok(afterClick.includes('Sell'), 'shows Sell transactions')

    // Navigate back to Overview
    session.clickByRef('Overview')
    await wait(200)
})
