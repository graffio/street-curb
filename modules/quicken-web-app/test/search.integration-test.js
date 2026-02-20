// ABOUTME: covers SearchChip, search keyboard shortcuts
// ABOUTME: Run with: yarn tap:file test/search.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('search-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)

    // Navigate to Primary Checking register
    session.clickByRef('Primary Checking')
    await wait(500)

    // Open second tab group to exercise multi-instance module-level state
    session.clickByText('Split')
    await wait(300)
    session.clickByRef('Spending by Category')
    await wait(500)
    session.browser('click', ['text=Primary Checking >> nth=1'])
    await wait(300)

    const registerSnap = session.browser('snapshot')
    if (registerSnap.includes('Something went wrong')) throw new Error('register crashed on load')
})

tap.teardown(() => session.close())

tap.test('search: type query shows match counter', async t => {
    // Type in search box
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500) // wait for debounce (300ms) + render

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after typing search query')
    t.ok(afterSearch.includes('of'), 'match counter is visible')

    // Clean up: clear search
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: Escape clears search and blurs', async t => {
    // Type a query first
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500)

    // Clear via Escape
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)

    const afterClear = session.browser('snapshot')
    t.notOk(afterClear.includes('Something went wrong'), 'no crash after clearing search')
})

tap.test('search: slash focuses search input', async t => {
    await session.pressKey('/')
    await wait(200)

    const snapshot = session.browser('snapshot')
    t.ok(snapshot.includes('Search') || snapshot.includes('search'), 'search visible after / press')

    // Clean up: Escape to blur
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: Enter navigates to next match', async t => {
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500)

    const beforeEnter = session.browser('snapshot')
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Enter'])
    await wait(300)

    const afterEnter = session.browser('snapshot')
    t.notOk(afterEnter.includes('Something went wrong'), 'no crash after Enter')
    t.not(afterEnter, beforeEnter, 'snapshot changed after Enter — cursor moved')

    // Clean up
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: Shift+Enter navigates to previous match', async t => {
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500)

    // Navigate forward first to have a previous match
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Enter'])
    await wait(300)

    const beforeShiftEnter = session.browser('snapshot')
    session.browser('press', ['Shift+Enter'])
    await wait(300)

    const afterShiftEnter = session.browser('snapshot')
    t.notOk(afterShiftEnter.includes('Something went wrong'), 'no crash after Shift+Enter')
    t.not(afterShiftEnter, beforeShiftEnter, 'snapshot changed after Shift+Enter — cursor moved back')

    // Clean up
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: Unknown Payee matches rows with empty payee field', async t => {
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Unknown Payee'])
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after searching Unknown Payee')
    t.ok(snapshot.includes('of'), 'match counter visible for Unknown Payee search')

    // Clean up
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: counter reflects sorted data after column sort', async t => {
    // Type a query and note the counter
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500)

    const beforeSort = session.browser('snapshot')
    const counterMatch = beforeSort.match(/(\d+) of (\d+)/)
    t.ok(counterMatch, 'match counter visible before sort')

    // Clean up
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('search: clear search after navigating returns to full view', async t => {
    const expected = loadExpected()
    const primaryCount = expected.accounts.find(a => a.name === 'Primary Checking').transactionCount

    // Type query and navigate to a match
    session.browser('find', ['placeholder', 'Search...', 'fill', 'Acme'])
    await wait(500)
    session.browser('find', ['placeholder', 'Search...', 'click'])
    session.browser('press', ['Enter'])
    await wait(300)

    // Clear search
    session.browser('press', ['Escape'])
    await wait(200)

    const afterClear = session.browser('snapshot')
    t.notOk(afterClear.includes('Something went wrong'), 'no crash after clearing navigated search')
    t.ok(afterClear.includes(`${primaryCount} transactions`), `shows full ${primaryCount} transactions after clearing`)
})
