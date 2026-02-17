// ABOUTME: covers DateFilterChip, CategoryFilterChip, SearchFilterChip on bank registers
// ABOUTME: Run with: yarn tap:file test/bank-register-filters.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('bank-filters-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)

    // Navigate to Primary Checking register
    session.clickByRef('Primary Checking')
    await wait(500)
})

tap.teardown(() => session.close())

tap.test('bank-filters: date filter This Year changes content', async t => {
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('This Year')
    await wait(200)

    const afterDateFilter = session.browser('snapshot')
    t.notOk(afterDateFilter.includes('Something went wrong'), 'no crash after date filter')
    t.ok(afterDateFilter.includes('This Year'), 'chip shows "This Year"')

    // Clear date filter
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.notOk(afterClear.includes('Something went wrong'), 'no crash after clearing date filter')
    t.ok(afterClear.includes('Include all dates'), 'chip restored to "Include all dates"')
})

tap.test('bank-filters: category filter Food shows correct payees', async t => {
    const expected = loadExpected()

    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterFilter.includes('1 selected'), 'category chip shows "1 selected"')

    // Verify Food payees appear in filtered results
    const foodPayees = expected.categoryFiltered.Food.payees
    const foundPayee = foodPayees.find(p => afterFilter.includes(p))
    t.ok(foundPayee, `at least one Food payee visible (found: ${foundPayee})`)

    // Verify non-Food payee is absent
    const nonFoodPayee = expected.categoryFiltered.nonFoodPayee
    t.notOk(afterFilter.includes(nonFoodPayee), `non-Food payee "${nonFoodPayee}" not visible`)

    // Clear category filter
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing category')
})

tap.test('bank-filters: search filter Acme shows results', async t => {
    session.browser('click', ['text="Filter"'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Acme'])
    await wait(200)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search filter')
    t.ok(afterSearch.includes('Acme'), 'search results contain "Acme"')

    // Clear search via × button
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing search')
})

tap.test('bank-filters: custom date filter shows correct filtered count', async t => {
    const expected = loadExpected()
    const primaryCount = expected.accounts.find(a => a.name === 'Primary Checking').transactionCount

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
    const filteredCount = expected.dateFiltered.accountCounts.find(a => a.account === 'Primary Checking').count

    t.ok(afterDateFilter.includes(`${filteredCount} transactions`), `shows ${filteredCount} transactions (filtered)`)
    t.ok(afterDateFilter.includes(`filtered from ${primaryCount}`), `shows "filtered from ${primaryCount}"`)

    // Clear date filter and verify original count returns
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(`${primaryCount} transactions`),
        `shows ${primaryCount} transactions after clearing filter`,
    )
})

tap.test('bank-filters: combined date + category filter shows intersection', async t => {
    const expected = loadExpected()
    const primaryCount = expected.accounts.find(a => a.name === 'Primary Checking').transactionCount

    // Apply date filter (Custom dates, Feb 2024)
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')
    session.browser('press', ['Escape'])
    await wait(200)

    // Apply category filter (Food)
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterBothFilters = session.browser('snapshot')
    t.notOk(afterBothFilters.includes('Something went wrong'), 'no crash after combined filters')

    // Verify intersection count
    const intersectionCount = expected.dateCategoryIntersection.count
    t.ok(
        afterBothFilters.includes(`${intersectionCount} transactions`),
        `shows ${intersectionCount} transactions (date+category intersection)`,
    )
    t.ok(afterBothFilters.includes(`filtered from ${primaryCount}`), `shows "filtered from ${primaryCount}"`)

    // Clear both filters (use nth=0 since two clear buttons are visible)
    session.browser('click', ['[style*="border-radius: 50%"] >> nth=0'])
    await wait(200)
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(`${primaryCount} transactions`),
        `shows ${primaryCount} transactions after clearing both filters`,
    )
})

tap.test('bank-filters: keyboard d opens date popover', async t => {
    await session.pressKey('d')
    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('Include all dates') || snapshot.includes('This Year'), 'date options visible')

    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('bank-filters: keyboard c opens category popover', async t => {
    await session.pressKey('c')
    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('Search...'), 'category search visible')

    session.browser('press', ['Escape'])
    await wait(200)
})
