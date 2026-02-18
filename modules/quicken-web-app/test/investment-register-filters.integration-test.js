// ABOUTME: covers SecurityFilterChip, ActionFilterChip, SearchFilterChip on investment registers
// ABOUTME: Run with: yarn tap:file test/investment-register-filters.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('investment-filters-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)

    // Navigate to Fidelity Brokerage register
    session.clickByRef('Fidelity Brokerage')
    await wait(500)
})

tap.teardown(() => session.close())

tap.test('investment-filters: security filter VTI shows correct count', async t => {
    const expected = loadExpected()

    session.clickByText('Securities:')
    await wait(200)
    session.clickPopoverItem('VTI')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after security filter')
    t.ok(afterFilter.includes('1 selected'), 'security chip shows "1 selected"')
    t.ok(afterFilter.includes('VTI'), 'VTI visible in filtered results')

    const vtiCount = expected.perSecurityCounts.VTI
    t.ok(afterFilter.includes(`${vtiCount} transactions`), `shows ${vtiCount} VTI transactions`)

    // Clear security filter
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing security filter')
})

tap.test('investment-filters: action filter Buy shows correct count and symbols', async t => {
    const expected = loadExpected()
    const fidelityCount = expected.accounts.find(a => a.name === 'Fidelity Brokerage').transactionCount

    session.clickByText('Actions:')
    await wait(200)
    session.clickPopoverItem('Buy')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after action filter')
    t.ok(afterFilter.includes('1 selected'), 'action chip shows "1 selected"')

    // Verify Buy count matches expected
    const buyCount = expected.actionFiltered.Buy.count
    t.ok(afterFilter.includes(`${buyCount} transactions`), `shows ${buyCount} Buy transactions`)
    t.ok(afterFilter.includes(`filtered from ${fidelityCount}`), `shows "filtered from ${fidelityCount}"`)

    // Verify at least one expected Buy symbol appears
    const buySymbols = expected.actionFiltered.Buy.symbols
    const foundSymbol = buySymbols.find(s => afterFilter.includes(s))
    t.ok(foundSymbol, `at least one Buy symbol visible (found: ${foundSymbol})`)

    // Clear action filter
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing action filter')
})

tap.test('investment-filters: search filter AAPL shows results', async t => {
    session.browser('click', ['text="Filter"'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'AAPL'])
    await wait(200)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search filter')
    t.ok(afterSearch.includes('AAPL'), 'search results contain "AAPL"')

    // Clear search via × button, then click Filter to close popover
    session.clickClear()
    await wait(200)
    session.browser('click', ['text="Filter"'])
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing search')
})

tap.test('investment-filters: custom date filter shows correct filtered count', async t => {
    const expected = loadExpected()
    const fidelityCount = expected.accounts.find(a => a.name === 'Fidelity Brokerage').transactionCount

    // Open date filter and select "Custom dates..."
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)

    // Enter Feb 2024 date range
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')

    session.browser('press', ['Escape'])
    await wait(200)

    const afterDateFilter = session.browser('snapshot')
    const fidelityDateFiltered = expected.dateFiltered.accountCounts.find(a => a.account === 'Fidelity Brokerage').count
    t.ok(
        afterDateFilter.includes(`${fidelityDateFiltered} transactions`),
        `shows ${fidelityDateFiltered} transactions for Feb 2024`,
    )
    t.ok(afterDateFilter.includes(`filtered from ${fidelityCount}`), `shows "filtered from ${fidelityCount}"`)

    // Clear filter and verify original count returns
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes(`${fidelityCount} transactions`), `shows ${fidelityCount} transactions after clearing`)
})

tap.test('investment-filters: combined security + action filter shows intersection', async t => {
    const expected = loadExpected()
    const fidelityCount = expected.accounts.find(a => a.name === 'Fidelity Brokerage').transactionCount

    // Apply security filter (VTI)
    session.clickByText('Securities:')
    await wait(200)
    session.clickPopoverItem('VTI')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    // Apply action filter (Buy)
    session.clickByText('Actions:')
    await wait(200)
    session.clickPopoverItem('Buy')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterBothFilters = session.browser('snapshot')
    t.notOk(afterBothFilters.includes('Something went wrong'), 'no crash after combined filters')

    // Verify intersection count
    const intersectionCount = expected.securityActionIntersection.count
    t.ok(
        afterBothFilters.includes(`${intersectionCount} transactions`),
        `shows ${intersectionCount} transactions (VTI+Buy intersection)`,
    )
    t.ok(afterBothFilters.includes(`filtered from ${fidelityCount}`), `shows "filtered from ${fidelityCount}"`)

    // Clear both filters (use nth=0 since two clear buttons are visible)
    session.browser('click', ['[style*="border-radius: 50%"] >> nth=0'])
    await wait(200)
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(`${fidelityCount} transactions`),
        `shows ${fidelityCount} transactions after clearing both filters`,
    )
})

tap.test('investment-filters: keyboard x opens actions popover', async t => {
    await session.pressKey('x')
    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('Buy') || snapshot.includes('Sell'), 'action options visible')

    // Test arrow key navigation and Enter toggle
    await session.pressKey('ArrowDown')
    await wait(100)
    await session.pressKey('Enter')
    await wait(200)

    const afterToggle = session.browser('snapshot')
    t.ok(afterToggle.includes('selected'), 'action was selected via keyboard')

    session.browser('press', ['Escape'])
    await wait(200)

    // Clear the selection
    session.clickClear()
    await wait(200)
})

tap.test('investment-filters: keyboard h opens securities popover', async t => {
    await session.pressKey('h')
    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('VTI') || snapshot.includes('AAPL') || snapshot.includes('Securities'), 'securities visible')

    session.browser('press', ['Escape'])
    await wait(200)
})
