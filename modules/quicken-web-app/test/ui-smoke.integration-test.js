// ABOUTME: UI smoke tests using agent-browser for critical path verification
// ABOUTME: Run with: node --test test/ui-smoke.integration-test.js (HEADED=1 for visible browser)

import { execFileSync } from 'child_process'
import { readFileSync, rmSync } from 'fs'
import { homedir } from 'os'
import { dirname, resolve } from 'path'
import tap from 'tap'
import { fileURLToPath } from 'url'

const { test } = tap
tap.setTimeout(120_000)

const __dirname = dirname(fileURLToPath(import.meta.url))
const FIXTURES_PATH = resolve(__dirname, '../../cli-qif-to-sqlite/test/fixtures')
const EXPECTED_PATH = resolve(FIXTURES_PATH, 'seed-12345.expected.json')
const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`
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

// Delay helper — DRY replacement for `await new Promise(r => setTimeout(r, ms))`
// @sig wait :: Number -> Promise
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

// Clicks an element by its visible text content using Playwright text locator
// @sig clickByText :: String -> String
const clickByText = text => browser('find', ['text', text, 'click'])

// Clicks an item inside an open Radix popover, scoped to avoid ambiguity with page content
// Uses nth=0 to handle substring matches that resolve to multiple elements (text in parent + child)
// @sig clickPopoverItem :: String -> String
const clickPopoverItem = text => browser('click', [`[data-radix-popper-content-wrapper] >> text=${text} >> nth=0`])

// Clicks the chip clear × button (the circular div, not any other × button on the page)
// @sig clickClear :: () -> String
const clickClear = () => browser('click', ['[style*="border-radius: 50%"]'])

// Enters a date into KeyboardDateInput using keyboard-mode key presses
// Click focuses the input → enters keyboard mode → hidden input captures keyDown events
// Digits go through handleNumberTyping, '/' applies buffer and advances to next segment
// After all digits, wait for the year buffer timeout (800ms) to auto-apply
// @sig enterDate :: (String, String) -> Promise
const enterDate = async (selector, dateString) => {
    browser('click', [selector])
    await wait(200)
    dateString.split('').forEach(c => browser('press', [c]))
    await wait(850)
}

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
    await wait(1500)
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
        await wait(500)

        const afterClick = browser('snapshot')

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking account')

        // Verify transaction count from expected.accounts
        const primaryAccount = expected.accounts.find(a => a.name === 'Primary Checking')
        t.ok(
            afterClick.includes(`${primaryAccount.transactionCount} transactions`),
            `shows ${primaryAccount.transactionCount} transactions`,
        )

        // Verify transactions from spotChecks appear (filter to Primary Checking)
        const checkingTxns = expected.spotChecks.filter(s => s.account === 'Primary Checking')
        checkingTxns.forEach(txn => {
            if (txn.payee) t.ok(afterClick.includes(txn.payee), `shows payee: ${txn.payee}`)
        })
    } else {
        t.fail('Primary Checking not clickable')
    }
})

test('transaction register: filter chip interactions', async t => {
    // We're already on Primary Checking register from previous test
    const beforeSnap = browser('snapshot')

    // --- DateFilterChip: select "This Year", then clear ---
    clickByText('Date:')
    await wait(200)
    clickPopoverItem('This Year')
    await wait(200)

    const afterDateFilter = browser('snapshot')
    t.notOk(afterDateFilter.includes('Something went wrong'), 'no crash after date filter')
    t.ok(afterDateFilter.includes('This Year'), 'chip shows "This Year"')
    t.not(afterDateFilter, beforeSnap, 'date filter changes visible content')

    // Clear date filter via × button
    clickClear()
    await wait(200)
    const afterDateClear = browser('snapshot')
    t.notOk(afterDateClear.includes('Something went wrong'), 'no crash after clearing date filter')
    t.ok(afterDateClear.includes('Include all dates'), 'chip restored to "Include all dates"')

    // --- CategoryFilterChip: select a category, then clear ---
    clickByText('Categories:')
    await wait(200)
    clickPopoverItem('Food')
    await wait(200)
    browser('press', ['Escape'])
    await wait(200)

    const afterCategoryFilter = browser('snapshot')
    t.notOk(afterCategoryFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterCategoryFilter.includes('1 selected'), 'category chip shows "1 selected"')

    // Clear category filter via × button
    clickClear()
    await wait(200)
    const afterCategoryClear = browser('snapshot')
    t.notOk(afterCategoryClear.includes('Something went wrong'), 'no crash after clearing category filter')

    // --- SearchFilterChip: type search, then clear ---
    browser('click', ['text="Filter"'])
    await wait(200)
    browser('find', ['placeholder', 'Type to filter...', 'fill', 'Acme'])
    await wait(200)

    const afterSearch = browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search filter')
    t.ok(afterSearch.includes('Acme'), 'search results contain "Acme"')

    // handleClear stopPropagation blocks Escape from reaching Radix — use × button to clear search
    clickClear()
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing search')
})

test('clicking investment account opens register with correct transactions', async t => {
    // Navigate back to account list first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await wait(200)

    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const expected = loadExpected()

    const fidelity = elements.find(e => e.text.includes('Fidelity Brokerage'))
    t.ok(fidelity, 'Fidelity Brokerage is visible')

    if (fidelity?.ref) {
        browser('click', [`@${fidelity.ref}`])
        await wait(500)

        const afterClick = browser('snapshot')

        t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking investment account')

        // Verify transaction count from expected.accounts
        const fidelityAccount = expected.accounts.find(a => a.name === 'Fidelity Brokerage')
        t.ok(
            afterClick.includes(`${fidelityAccount.transactionCount} transactions`),
            `shows ${fidelityAccount.transactionCount} transactions`,
        )

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

test('investment register: filter chip interactions', async t => {
    // We're already on Fidelity Brokerage register from previous test

    // --- SecurityFilterChip: select "VTI", then clear ---
    clickByText('Securities:')
    await wait(200)
    clickPopoverItem('VTI')
    await wait(200)
    browser('press', ['Escape'])
    await wait(200)

    const afterSecurityFilter = browser('snapshot')
    t.notOk(afterSecurityFilter.includes('Something went wrong'), 'no crash after security filter')
    t.ok(afterSecurityFilter.includes('1 selected'), 'security chip shows "1 selected"')
    t.ok(afterSecurityFilter.includes('VTI'), 'VTI visible in filtered results')

    // Verify VTI transaction count from expected.perSecurityCounts
    const expected = loadExpected()
    const vtiCount = expected.perSecurityCounts.VTI
    t.ok(afterSecurityFilter.includes(`${vtiCount} transactions`), `shows ${vtiCount} VTI transactions`)

    // Clear security filter
    clickClear()
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing security filter')

    // --- ActionFilterChip: select "Buy", then clear ---
    clickByText('Actions:')
    await wait(200)
    clickPopoverItem('Buy')
    await wait(200)
    browser('press', ['Escape'])
    await wait(200)

    const afterActionFilter = browser('snapshot')
    t.notOk(afterActionFilter.includes('Something went wrong'), 'no crash after action filter')
    t.ok(afterActionFilter.includes('1 selected'), 'action chip shows "1 selected"')

    // Clear action filter
    clickClear()
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing action filter')

    // --- SearchFilterChip: type "AAPL" ---
    browser('click', ['text="Filter"'])
    await wait(200)
    browser('find', ['placeholder', 'Type to filter...', 'fill', 'AAPL'])
    await wait(200)

    const afterSearch = browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search filter')
    t.ok(afterSearch.includes('AAPL'), 'search results contain "AAPL"')

    // handleClear stopPropagation blocks Escape from closing Radix popover.
    // Click × to clear search text, then click trigger again to toggle popover closed.
    clickClear()
    await wait(200)
    browser('click', ['text="Filter"'])
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing search')
})

test('investment register: custom date filter shows correct values', async t => {
    const expected = loadExpected()
    const fidelityCount = expected.accounts.find(a => a.name === 'Fidelity Brokerage').transactionCount

    // Open date filter and select "Custom dates..."
    clickByText('Date:')
    await wait(200)
    clickPopoverItem('Custom dates')
    await wait(200)

    // Enter Feb 2024 date range
    await enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')

    browser('press', ['Escape'])
    await wait(200)

    const afterDateFilter = browser('snapshot')
    const fidelityDateFiltered = expected.dateFiltered.accountCounts.find(a => a.account === 'Fidelity Brokerage').count
    t.ok(
        afterDateFilter.includes(`${fidelityDateFiltered} transactions`),
        `shows ${fidelityDateFiltered} transactions for Feb 2024`,
    )
    t.ok(afterDateFilter.includes(`filtered from ${fidelityCount}`), `shows "filtered from ${fidelityCount}"`)

    // Clear filter and verify original count returns
    clickClear()
    await wait(200)
    const afterClear = browser('snapshot')
    t.ok(afterClear.includes(`${fidelityCount} transactions`), `shows ${fidelityCount} transactions after clearing`)
})

test('bank register: custom date filter shows correct values', async t => {
    // Navigate back to Overview, then click Primary Checking by ref (text matches sidebar + list)
    const beforeSnap = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnap)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await wait(200)

    const overviewSnap = browser('snapshot', ['-i'])
    const overviewElements = parseSnapshot(overviewSnap)
    const primaryChecking = overviewElements.find(e => e.text.includes('Primary Checking'))
    if (primaryChecking?.ref) browser('click', [`@${primaryChecking.ref}`])
    await wait(500)

    const expected = loadExpected()
    const primaryCount = expected.accounts.find(a => a.name === 'Primary Checking').transactionCount

    // Open date filter and select "Custom dates..."
    clickByText('Date:')
    await wait(200)
    clickPopoverItem('Custom dates')
    await wait(200)

    // Enter dates via key presses (fill/type don't trigger KeyboardDateInput onChange)
    await enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')

    // Close popover (Escape bubbles from hidden input to popover)
    browser('press', ['Escape'])
    await wait(200)

    const afterDateFilter = browser('snapshot')
    const filteredCount = expected.dateFiltered.accountCounts.find(a => a.account === 'Primary Checking').count

    // Assert filtered transaction count
    t.ok(afterDateFilter.includes(`${filteredCount} transactions`), `shows ${filteredCount} transactions (filtered)`)
    t.ok(afterDateFilter.includes(`filtered from ${primaryCount}`), `shows "filtered from ${primaryCount}"`)

    // Clear date filter and verify original count returns
    clickClear()
    await wait(200)
    const afterClear = browser('snapshot')
    t.ok(
        afterClear.includes(`${primaryCount} transactions`),
        `shows ${primaryCount} transactions after clearing filter`,
    )
})

test('clicking Investment Holdings opens holdings report with correct values', async t => {
    // Navigate back to overview first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await wait(200)

    // Click Investment Holdings in Reports section
    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)
    const expected = loadExpected()

    const holdingsReport = elements.find(e => e.text.includes('Investment Holdings'))
    t.ok(holdingsReport, 'Investment Holdings button is visible')

    if (holdingsReport?.ref) {
        browser('click', [`@${holdingsReport.ref}`])
        await wait(500)

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

        // Switch to "by Security" grouping to verify individual holdings without tree expansion
        clickByText('Group by:')
        await wait(200)
        clickPopoverItem('Security')
        await wait(200)

        const securityView = browser('snapshot')

        // Verify at least 3 individual securities: shares and market values
        const spotCheckSecurities = expected.holdings.filter(h => h.account === 'Fidelity Brokerage').slice(0, 3)
        spotCheckSecurities.forEach(({ marketValue, shares, symbol }) => {
            t.ok(securityView.includes(symbol), `shows security: ${symbol}`)
            const isWhole = Number.isInteger(shares)
            const formattedShares = isWhole
                ? shares.toLocaleString('en-US')
                : shares.toLocaleString('en-US', { minimumFractionDigits: 3 })
            const formattedValue = marketValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })
            t.ok(securityView.includes(formattedShares), `${symbol} shows ${formattedShares} shares`)
            t.ok(securityView.includes(formattedValue), `${symbol} shows market value $${formattedValue}`)
        })

        // Switch back to Account grouping for subsequent tests
        clickByText('Group by:')
        await wait(200)
        clickPopoverItem('Account')
        await wait(200)
    } else {
        t.fail('Investment Holdings not clickable')
    }
})

test('investment holdings: filter chip interactions', async t => {
    // We're already on Investment Holdings report from previous test
    const beforeGroupBy = browser('snapshot')

    // --- GroupByFilterChip: switch to "Security", then back to "Account" ---
    clickByText('Group by:')
    await wait(200)
    clickPopoverItem('Security')
    await wait(200)

    const afterSecurityGroup = browser('snapshot')
    t.notOk(afterSecurityGroup.includes('Something went wrong'), 'no crash after group by Security')
    t.ok(afterSecurityGroup.includes('Security'), 'group by chip shows Security')
    t.not(afterSecurityGroup, beforeGroupBy, 'display changes after group by switch')

    // Switch back to Account
    clickByText('Group by:')
    await wait(200)
    clickPopoverItem('Account')
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after group by Account')

    // --- AccountFilterChip: select "Fidelity Brokerage" ---
    clickByText('Accounts:')
    await wait(200)
    clickPopoverItem('Fidelity Brokerage')
    await wait(200)
    browser('press', ['Escape'])
    await wait(200)

    const afterAccountFilter = browser('snapshot')
    t.notOk(afterAccountFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterAccountFilter.includes('1 selected'), 'account chip shows "1 selected"')
    t.ok(afterAccountFilter.includes('Fidelity'), 'filtered to Fidelity holdings')

    // Clear account filter
    clickClear()
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing account filter')
})

test('investment holdings: as-of date shows correct historical values', async t => {
    // We're on Investment Holdings report from previous test
    const expected = loadExpected()

    // Click "As of:" chip to open date picker popover
    clickByText('As of:')
    await wait(200)

    // AsOfDateChip auto-focuses month field on open — press keys directly (no click needed)
    // Digits go through handleNumberTyping, '/' advances segment
    '07/15/2024'.split('').forEach(c => browser('press', [c]))
    await wait(850)

    // Close popover
    browser('press', ['Escape'])
    await wait(500)

    const afterAsOf = browser('snapshot')
    t.notOk(afterAsOf.includes('Something went wrong'), 'no crash after as-of date change')

    // Verify account totals from holdingsAsOf
    const { accountTotals } = expected.holdingsAsOf
    Object.entries(accountTotals).forEach(([name, total]) => {
        const formatted = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        t.ok(afterAsOf.includes(formatted), `${name} shows historical total $${formatted}`)
    })

    // Verify historical totals differ from current (proves as-of date took effect)
    const currentFidelity = expected.accounts.find(a => a.name === 'Fidelity Brokerage').marketValue
    t.not(accountTotals['Fidelity Brokerage'], currentFidelity, 'historical total differs from current')
})

test('clicking Spending by Category opens report with correct values', async t => {
    // Navigate back to account list first
    const beforeSnapshot = browser('snapshot', ['-i'])
    const beforeElements = parseSnapshot(beforeSnapshot)
    const overview = beforeElements.find(e => e.text.includes('Overview'))
    if (overview?.ref) browser('click', [`@${overview.ref}`])
    await wait(200)

    const snapshot = browser('snapshot', ['-i'])
    const elements = parseSnapshot(snapshot)

    const categoryReport = elements.find(e => e.text.includes('Spending by Category'))
    t.ok(categoryReport, 'Spending by Category button is visible')

    if (categoryReport?.ref) {
        browser('click', [`@${categoryReport.ref}`])
        await wait(500)

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

test('category report: filter chip interactions', async t => {
    // We're already on Spending by Category report from previous test
    const beforeGroupBy = browser('snapshot')

    // --- GroupByFilterChip: switch to "Account" ---
    clickByText('Group by:')
    await wait(200)
    clickPopoverItem('Account')
    await wait(200)

    const afterAccountGroup = browser('snapshot')
    t.notOk(afterAccountGroup.includes('Something went wrong'), 'no crash after group by Account')
    t.not(afterAccountGroup, beforeGroupBy, 'display changes after group by switch')

    // Switch back to Category (default)
    clickByText('Group by:')
    await wait(200)
    clickPopoverItem('Category')
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after switching back to Category')

    // --- AccountFilterChip: select "Primary Checking", then clear ---
    clickByText('Accounts:')
    await wait(200)
    clickPopoverItem('Primary Checking')
    await wait(200)
    browser('press', ['Escape'])
    await wait(200)

    const afterAccountFilter = browser('snapshot')
    t.notOk(afterAccountFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterAccountFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Clear account filter
    clickClear()
    await wait(200)
    t.notOk(browser('snapshot').includes('Something went wrong'), 'no crash after clearing account filter')
})

test('category report: custom date filter shows correct values', async t => {
    // We're already on Spending by Category from previous test
    const expected = loadExpected()
    const originalFoodTotal = Math.abs(expected.categoryTotals.find(c => c.category === 'Food').total).toLocaleString(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    )

    // Open date filter and select "Custom dates..."
    clickByText('Date:')
    await wait(200)
    clickPopoverItem('Custom dates')
    await wait(200)

    // Enter dates via key presses (KeyboardDateInput requires keyboard-mode interaction)
    await enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')

    // Close popover
    browser('press', ['Escape'])
    await wait(200)

    const afterDateFilter = browser('snapshot')

    // Verify date-filtered category totals from expected.dateFiltered.categoryTotals
    const filteredFood = Math.abs(
        expected.dateFiltered.categoryTotals.find(c => c.category === 'Food').total,
    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const filteredIncome = expected.dateFiltered.categoryTotals
        .find(c => c.category === 'Income')
        .total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    t.ok(afterDateFilter.includes(filteredFood), `Food shows filtered total $${filteredFood}`)
    t.ok(afterDateFilter.includes(filteredIncome), `Income shows filtered total $${filteredIncome}`)

    // Clear date filter and verify original totals return
    clickClear()
    await wait(200)
    const afterClear = browser('snapshot')
    t.ok(afterClear.includes(originalFoodTotal), `Food shows original total $${originalFoodTotal} after clearing`)
})

test('cleanup: close browser', async t => {
    browser('close')
    t.pass('browser closed')
})
