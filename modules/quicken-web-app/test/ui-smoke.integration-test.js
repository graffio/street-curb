// ABOUTME: UI smoke tests using agent-browser for critical path verification
// ABOUTME: Run with: node --test test/ui-smoke.integration-test.js (HEADED=1 for visible browser)

import { execFileSync } from 'child_process'
import { readFileSync, rmSync } from 'fs'
import { homedir } from 'os'
import { dirname, resolve } from 'path'
import { test } from 'tap'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_PATH = resolve(__dirname, '../../cli-qif-to-sqlite/test/fixtures')
const EXPECTED_PATH = resolve(FIXTURES_PATH, 'seed-12345.expected.json')
const TEST_URL = 'http://localhost:3000?testFile=seed-12345'
const HEADED = process.env.HEADED === '1'
const SESSION = 'ui-smoke-test'

// Helper to run agent-browser commands with isolated session
// Uses execFileSync with args array to avoid shell parsing issues
// @sig browser :: (String, [String]) -> String
const browser = (cmd, args = []) => {
    const allArgs = HEADED ? ['--headed', cmd, ...args] : [cmd, ...args]
    const env = { ...process.env, AGENT_BROWSER_SESSION: SESSION }
    return execFileSync('agent-browser', allArgs, { encoding: 'utf-8', timeout: 30000, env }).trim()
}

// Helper to parse snapshot into structured data
// @sig parseSnapshot :: String -> [{ type: String, text: String, ref: String? }]
const parseSnapshot = output => {
    const lines = output.split('\n').filter(line => line.startsWith('- '))
    return lines.map(line => {
        const refMatch = line.match(/\[ref=(\w+)\]/)
        const text = line
            .replace(/- /, '')
            .replace(/\[ref=\w+\]/g, '')
            .trim()
        return { text, ref: refMatch?.[1] || null }
    })
}

// Load expected values from fixtures
// @sig loadExpected :: () -> Object
const loadExpected = () => JSON.parse(readFileSync(EXPECTED_PATH, 'utf-8'))

test('setup: launch browser with test data', async t => {
    // Remove stale session files from a previous run (e.g. HEADED mode leaves browser open)
    const sessionDir = resolve(homedir(), '.agent-browser')
    rmSync(resolve(sessionDir, `${SESSION}.pid`), { force: true })
    rmSync(resolve(sessionDir, `${SESSION}.sock`), { force: true })

    const result = browser('open', [TEST_URL])
    console.log(TEST_URL)
    t.ok(result.includes('Graffio Finance'), 'app loads with title')

    // Set viewport for consistent testing
    browser('set', ['viewport', '1280', '1600'])

    // Wait for data to load
    await new Promise(resolve => setTimeout(resolve, 3000))
})

test('account list shows all accounts', async t => {
    const snapshot = browser('snapshot', ['-i'])
    const expected = loadExpected()

    expected.accounts.forEach(account => t.ok(snapshot.includes(account.name), `shows account: ${account.name}`))
})

test('account balances match expected values', async t => {
    const snapshot = browser('snapshot', ['-i'])
    const expected = loadExpected()

    // Check non-investment accounts (balance field)
    const bankAccounts = expected.accounts.filter(a => a.type === 'Bank' || a.type === 'Credit Card')
    bankAccounts.forEach(account => {
        const expectedBalance = Math.abs(account.balance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(snapshot.includes(expectedBalance), `${account.name} shows balance $${expectedBalance}`)
    })

    // Check investment accounts (marketValue field)
    const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
    investmentAccounts.forEach(account => {
        const expectedValue = account.marketValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(snapshot.includes(expectedValue), `${account.name} shows market value $${expectedValue}`)
    })
})

test('clicking bank account opens transaction register with correct data', async t => {
    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const expected = loadExpected()

    const primaryChecking = elements.find(e => e.text.includes('Primary Checking'))
    t.ok(primaryChecking, 'Primary Checking is visible')

    if (primaryChecking?.ref) {
        browser('click', [`@${primaryChecking.ref}`])
        await new Promise(resolve => setTimeout(resolve, 1000))

        const afterClick = browser('snapshot')

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking account')

        // Verify transactions from spotChecks appear (filter to Primary Checking)
        const checkingTxns = expected.spotChecks.filter(s => s.account === 'Primary Checking')
        checkingTxns.forEach(txn => {
            if (txn.payee) t.ok(afterClick.includes(txn.payee), `shows payee: ${txn.payee}`)
        })
    } else {
        t.fail('Primary Checking not clickable')
    }
})

test('clicking investment account opens register with correct transactions', async t => {
    // Navigate back to account list first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await new Promise(resolve => setTimeout(resolve, 500))

    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const expected = loadExpected()

    const fidelity = elements.find(e => e.text.includes('Fidelity Brokerage'))
    t.ok(fidelity, 'Fidelity Brokerage is visible')

    if (fidelity?.ref) {
        browser('click', [`@${fidelity.ref}`])
        await new Promise(resolve => setTimeout(resolve, 1000))

        const afterClick = browser('snapshot')

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking investment account')

        // Verify investment transactions from spotChecks appear (filter to Fidelity with symbols)
        // Only check symbols and common actions (Buy/Sell) - specialized actions like ShtSell may display differently
        const investTxns = expected.spotChecks.filter(s => s.account === 'Fidelity Brokerage' && s.symbol)
        const symbols = [...new Set(investTxns.map(t => t.symbol))]
        symbols.forEach(sym => t.ok(afterClick.includes(sym), `shows security: ${sym}`))
        t.ok(afterClick.includes('Buy'), 'shows Buy transactions')
        t.ok(afterClick.includes('Sell'), 'shows Sell transactions')
    } else {
        t.fail('Fidelity Brokerage not clickable')
    }
})

test('clicking Investment Holdings opens holdings report with correct values', async t => {
    // Navigate back to overview first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await new Promise(resolve => setTimeout(resolve, 500))

    // Click Investment Holdings in Reports section
    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const expected = loadExpected()

    const holdingsReport = elements.find(e => e.text.includes('Investment Holdings'))
    t.ok(holdingsReport, 'Investment Holdings button is visible')

    if (holdingsReport?.ref) {
        browser('click', [`@${holdingsReport.ref}`])
        await new Promise(resolve => setTimeout(resolve, 1000))

        const afterClick = browser('snapshot')

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking holdings report')
        t.ok(afterClick.includes('Holdings by Account') || afterClick.includes('Holdings'), 'holdings report opens')

        // Verify holdings grouped by account (default view) - check account names and market values
        // Use account marketValue (includes cash) from accounts array, not just holdings sum
        const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
        investmentAccounts.forEach(({ name, marketValue }) => {
            t.ok(afterClick.includes(name), `shows account: ${name}`)
            const formattedValue = marketValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            t.ok(afterClick.includes(formattedValue), `${name} shows market value $${formattedValue}`)
        })
    } else {
        t.fail('Investment Holdings not clickable')
    }
})

test('clicking Spending by Category opens report with correct values', async t => {
    // Navigate back to account list first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await new Promise(resolve => setTimeout(resolve, 500))

    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)

    const categoryReport = elements.find(e => e.text.includes('Spending by Category'))
    t.ok(categoryReport, 'Spending by Category button is visible')

    if (categoryReport?.ref) {
        browser('click', [`@${categoryReport.ref}`])
        await new Promise(resolve => setTimeout(resolve, 1000))

        const afterClick = browser('snapshot')
        const expected = loadExpected()

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking report')

        // Verify category names and totals from expected.json
        expected.categoryTotals.forEach(({ category, total }) => {
            t.ok(afterClick.includes(category), `shows category: ${category}`)
            const formattedTotal = Math.abs(total).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            t.ok(afterClick.includes(formattedTotal), `${category} shows total $${formattedTotal}`)
        })
    } else {
        t.fail('Spending by Category not clickable')
    }
})

test('cleanup: close browser', async t => {
    browser('close')
    t.pass('browser closed')
})
