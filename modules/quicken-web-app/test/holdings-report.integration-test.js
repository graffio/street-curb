// ABOUTME: covers Investment Holdings report, GroupByFilterChip, AccountFilterChip, AsOfDateChip, AccountFilterChip keyboard
// ABOUTME: Run with: yarn tap:file test/holdings-report.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('holdings-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)

    // Navigate to Investment Holdings report
    session.clickByRef('Investment Holdings')
    await wait(500)
})

tap.teardown(() => session.close())

tap.test('holdings: by Account shows account names and market values', async t => {
    const expected = loadExpected()
    const afterClick = session.browser('snapshot')

    t.notOk(afterClick.includes('Something went wrong'), 'no crash on holdings report')
    t.ok(afterClick.includes('Holdings by Account') || afterClick.includes('Holdings'), 'holdings report visible')

    // Verify investment accounts with market values
    const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
    investmentAccounts.forEach(({ name, marketValue }) => {
        t.ok(afterClick.includes(name), `shows account: ${name}`)
        const formattedValue = marketValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(afterClick.includes(formattedValue), `${name} shows market value $${formattedValue}`)
    })
})

tap.test('holdings: by Security shows individual securities with shares and values', async t => {
    const expected = loadExpected()

    // Switch to "by Security" grouping
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Security')
    await wait(200)

    const securityView = session.browser('snapshot')

    // Verify at least 3 individual securities
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
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(200)
})

tap.test('holdings: GroupBy toggle changes display', async t => {
    const beforeGroupBy = session.browser('snapshot')

    // Switch to Security
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Security')
    await wait(200)

    const afterSecurityGroup = session.browser('snapshot')
    t.notOk(afterSecurityGroup.includes('Something went wrong'), 'no crash after group by Security')
    t.ok(afterSecurityGroup.includes('Security'), 'group by chip shows Security')
    t.not(afterSecurityGroup, beforeGroupBy, 'display changes after group by switch')

    // Switch back to Account
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after group by Account')
})

tap.test('holdings: account filter Fidelity shows correct values and changes display', async t => {
    const expected = loadExpected()
    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Fidelity Brokerage')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Verify Fidelity account-level market value appears
    const fidelity = expected.accounts.find(a => a.name === 'Fidelity Brokerage')
    const fidelityFormatted = fidelity.marketValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    t.ok(afterFilter.includes(fidelityFormatted), `Fidelity market value $${fidelityFormatted} visible`)

    // Verify filter changed the display (content differs from unfiltered view)
    t.not(afterFilter, beforeFilter, 'display changes after account filter applied')

    // Clear account filter
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing account filter')
})

tap.test('holdings: as-of date shows correct historical values', async t => {
    const expected = loadExpected()

    // Click "As of:" chip to open date picker popover
    session.clickByText('As of:')
    await wait(200)

    // AsOfDateChip auto-focuses month field on open — press keys directly
    '07/15/2024'.split('').forEach(c => session.browser('press', [c]))
    await wait(850)

    // Close popover
    session.browser('press', ['Escape'])
    await wait(500)

    const afterAsOf = session.browser('snapshot')
    t.notOk(afterAsOf.includes('Something went wrong'), 'no crash after as-of date change')

    // Verify account totals from holdingsAsOf
    const { accountTotals } = expected.holdingsAsOf
    Object.entries(accountTotals).forEach(([name, total]) => {
        const formatted = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        t.ok(afterAsOf.includes(formatted), `${name} shows historical total $${formatted}`)
    })

    // Verify historical totals differ from current
    const currentFidelity = expected.accounts.find(a => a.name === 'Fidelity Brokerage').marketValue
    t.not(accountTotals['Fidelity Brokerage'], currentFidelity, 'historical total differs from current')

    // Note: as-of date left at 07/15/2024 — subsequent tests use AccountFilterChip only,
    // which is unaffected by the as-of date value
})

tap.test('holdings: AccountFilterChip keyboard search filters list', async t => {
    session.browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    session.browser('find', ['placeholder', 'Search...', 'fill', 'Fidelity'])
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('Fidelity Brokerage'), 'filtered list shows Fidelity Brokerage')
    t.notOk(snapshot.includes('No items match'), 'search does not show "no matches" message')

    session.browser('press', ['Escape'])
    await wait(300)
})

tap.test('holdings: AccountFilterChip keyboard Enter selects highlighted item', async t => {
    session.browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Fidelity'])
    await wait(500)

    // Fidelity Brokerage is at index 0 (only match) — Enter toggles it
    session.browser('press', ['Enter'])
    await wait(300)

    session.browser('press', ['Escape'])
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('1 selected'), 'chip shows "1 selected" after Enter toggle')

    // Clear for next test
    session.clickClear()
    await wait(300)
    t.ok(session.browser('snapshot').includes('All'), 'chip cleared back to "All"')
})

tap.test('holdings: AccountFilterChip keyboard ArrowDown navigates', async t => {
    session.browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    // ArrowDown moves highlight from 0 to 1, Enter selects
    session.browser('press', ['ArrowDown'])
    await wait(200)
    session.browser('press', ['Enter'])
    await wait(300)

    session.browser('press', ['Escape'])
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('1 selected'), 'chip shows "1 selected" after ArrowDown + Enter')

    session.clickClear()
    await wait(300)
})

tap.test('holdings: AccountFilterChip keyboard Escape dismisses without change', async t => {
    session.browser('find', ['text', 'Accounts:', 'click'])
    await wait(800)

    // Navigate but do NOT press Enter
    session.browser('press', ['ArrowDown'])
    await wait(200)

    session.browser('press', ['Escape'])
    await wait(300)

    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('All'), 'selection unchanged after Escape — still shows "All"')
})
