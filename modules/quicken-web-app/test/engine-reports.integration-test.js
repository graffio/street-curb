// ABOUTME: Integration tests for all FinancialQuery result pages with fixture-based numerical assertions
// ABOUTME: Run with: yarn tap:file test/engine-reports.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('engine-reports-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)
})

tap.teardown(() => session.close())
tap.setTimeout(180000)

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

const formatDollars = n => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ═════════════════════════════════════════════════════════════════════════════
// TransactionQuery → Identity (Spending Engine)
// Variant: TransactionQuery with IRGrouping('category')
// ═════════════════════════════════════════════════════════════════════════════

tap.test('TransactionQuery/Identity: category names and totals match fixture', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    const expected = loadExpected()
    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Verify each category name and total matches fixture
    expected.categoryTotals.forEach(({ category, total }) => {
        t.ok(snapshot.includes(category), `shows category: ${category}`)
        t.ok(snapshot.includes(formatDollars(total)), `${category} shows total $${formatDollars(total)}`)
    })
})

tap.test('TransactionQuery/Identity: account filter shows filtered totals', async t => {
    const expected = loadExpected()

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Primary Checking')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Verify filtered totals for Primary Checking from fixture
    const filteredTotals = expected.categoryTotalsByAccount.PrimaryChecking
    filteredTotals.forEach(({ category, total }) =>
        t.ok(afterFilter.includes(formatDollars(total)), `${category} shows filtered total $${formatDollars(total)}`),
    )

    // Negative: unfiltered Food total should NOT appear
    const unfilteredFood = Math.abs(expected.categoryTotals.find(c => c.category === 'Food').total)
    const filteredFood = Math.abs(filteredTotals.find(c => c.category === 'Food').total)
    t.not(unfilteredFood, filteredFood, 'fixture precondition: filtered Food differs from unfiltered')
    t.notOk(
        afterFilter.includes(formatDollars(unfilteredFood)),
        `unfiltered Food total $${formatDollars(unfilteredFood)} not visible`,
    )

    // Clear and verify totals restore
    session.clickClear()
    await wait(300)

    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(formatDollars(unfilteredFood)),
        `Food total $${formatDollars(unfilteredFood)} restored after clear`,
    )
})

tap.test('TransactionQuery/Identity: date filter shows date-filtered totals', async t => {
    const expected = loadExpected()
    const originalFoodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)

    // Apply custom date range matching fixture dateFiltered range
    const startParts = expected.dateFiltered.startDate.split('-')
    const endParts = expected.dateFiltered.endDate.split('-')
    const startInput = `${startParts[1]}/${startParts[2]}/${startParts[0]}`
    const endInput = `${endParts[1]}/${endParts[2]}/${endParts[0]}`

    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', startInput)
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', endInput)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterDateFilter = session.browser('snapshot')
    t.notOk(afterDateFilter.includes('Something went wrong'), 'no crash after date filter')

    // Verify date-filtered Food total from fixture — should differ from unfiltered
    const filteredFood = formatDollars(expected.dateFiltered.categoryTotals.find(c => c.category === 'Food').total)
    t.ok(afterDateFilter.includes(filteredFood), `Food shows date-filtered total $${filteredFood}`)
    t.not(filteredFood, originalFoodTotal, 'filtered Food total differs from unfiltered')

    // Clear and verify original totals return
    session.clickClear()
    await wait(300)
    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(originalFoodTotal),
        `Food shows original total $${originalFoodTotal} after clearing date filter`,
    )
})

tap.test('TransactionQuery/Identity: category filter scopes to Food only', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    session.clickByText('Categories:')
    await wait(300)
    session.clickPopoverItem('Food')
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterFilter.includes('1 selected'), 'chip shows "1 selected"')
    t.ok(afterFilter.includes('Food'), 'Food category visible')

    // Clear via the clear button and verify restoration
    session.clickClear()
    await wait(500)

    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes('Income'), 'Income visible after clearing category filter')
    t.ok(afterClear.includes('Transportation'), 'Transportation visible after clearing category filter')
})

tap.test('TransactionQuery/Identity: group by account shows account names', async t => {
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(300)

    const afterGroupBy = session.browser('snapshot')
    t.notOk(afterGroupBy.includes('Something went wrong'), 'no crash after group by Account')

    // Account names should appear as group headers
    t.ok(afterGroupBy.includes('Primary Checking'), 'Primary Checking visible as account group')
    t.ok(afterGroupBy.includes('Chase Sapphire'), 'Chase Sapphire visible as account group')

    // Switch back to Category for subsequent tests
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Category')
    await wait(200)
})

tap.test('TransactionQuery/Identity: group by payee shows real payee names', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    session.clickByText('Group by:')
    await wait(300)
    session.clickPopoverItem('Payee')
    await wait(500)

    const afterGroupBy = session.browser('snapshot')
    t.notOk(afterGroupBy.includes('Something went wrong'), 'no crash after group by Payee')

    // Verify specific fixture payees appear as group headers
    const expected = loadExpected()
    const payees = [...new Set(expected.spotChecks.filter(s => s.payee).map(s => s.payee))]
    payees.forEach(payee => t.ok(afterGroupBy.includes(payee), `payee "${payee}" visible as group header`))
})

tap.test('TransactionQuery/Identity: filter chip matches payee', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    const beforeSearch = session.browser('snapshot')

    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Chipotle'])
    await wait(400)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search')
    t.not(afterSearch, beforeSearch, 'display changes after search filter')

    // Clear search
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('TransactionQuery/Identity: filter producing zero rows does not crash', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    // Filter for a nonexistent payee to produce zero matching rows
    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'ZZZZZ_NO_MATCH_ZZZZZ'])
    await wait(400)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash with zero results')
    t.notOk(snapshot.includes('NaN'), 'no NaN values in empty result')

    // Clear filter
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// TransactionQuery → Identity with filters (Seed queries)
// Variant: TransactionQuery with various IRFilter combinations
// ═════════════════════════════════════════════════════════════════════════════

tap.test('TransactionQuery/Identity+LessThan: Spending Over $500 shows Uncategorized', async t => {
    session.clickByRef('Spending Over $500')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Uncategorized'), 'Uncategorized category visible (has large expenses)')
    t.ok(snapshot.includes('amount < -500'), 'query description shows amount filter')
})

tap.test('TransactionQuery/Identity+Not: Exclude Transfers shows correct totals', async t => {
    const expected = loadExpected()
    session.clickByRef('Exclude Transfers')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Food'), 'Food category visible')
    t.ok(snapshot.includes('Income'), 'Income category visible')

    // Food and Income totals from fixture (Transfer filter doesn't affect these categories)
    const foodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)
    const incomeTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Income').total)
    t.ok(snapshot.includes(foodTotal), `Food total $${foodTotal} visible`)
    t.ok(snapshot.includes(incomeTotal), `Income total $${incomeTotal} visible`)
})

tap.test('TransactionQuery/Identity+And+In: Food at Select Accounts filters correctly', async t => {
    session.clickByRef('Food at Select Accounts')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Food'), 'Food category visible')
    t.notOk(snapshot.includes('Income'), 'Income not visible (filtered to Food only)')
    t.notOk(snapshot.includes('Transportation'), 'Transportation not visible (filtered to Food only)')
    t.ok(snapshot.includes('category'), 'query description mentions category filter')
    t.ok(snapshot.includes('account'), 'query description mentions account filter')
})

// ═════════════════════════════════════════════════════════════════════════════
// TransactionQuery → Pivot (Category by Year)
// Variant: TransactionQuery with IRGrouping('category', 'year') + ComputedRow
// ═════════════════════════════════════════════════════════════════════════════

tap.test('TransactionQuery/Pivot: category rows with correct totals and computed row', async t => {
    const expected = loadExpected()
    session.clickByRef('Category by Year')
    await wait(1000)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Categories:'), 'Categories chip visible')
    t.ok(snapshot.includes('Accounts:'), 'Accounts chip visible')
    t.ok(snapshot.includes('Total'), 'Total column header present')

    // Verify category row labels and totals from fixture
    expected.categoryTotals.forEach(({ category, total }) => {
        t.ok(snapshot.includes(category), `category row "${category}" visible`)
        t.ok(snapshot.includes(formatDollars(total)), `${category} total $${formatDollars(total)} visible`)
    })

    // Computed row: "Food % of Income" should show percentage values per year column
    t.ok(snapshot.includes('Food % of Income'), 'computed row "Food % of Income" visible')

    // Per-year computed percentages appear as N.NN% values (Total column shows "—")
    // Extract all percentage values from the snapshot to verify they are non-trivial
    const pctMatches = snapshot.match(/\d+\.\d{2}%/g)
    t.ok(
        pctMatches && pctMatches.length >= 2,
        `at least 2 computed percentage values visible (found ${pctMatches?.length || 0})`,
    )

    // Sanity check: percentages should be reasonable (Food is ~10% of Income)
    const pctValues = (pctMatches || []).map(s => parseFloat(s))
    const allReasonable = pctValues.every(v => v > 0 && v < 100)
    t.ok(allReasonable, `all percentage values are between 0% and 100%: ${pctValues.join(', ')}`)
})

tap.test('TransactionQuery/Pivot: category filter scopes pivot', async t => {
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterFilter.includes('1 selected'), 'chip shows "1 selected"')
    t.ok(afterFilter.includes('Food'), 'Food row still visible')

    // Unselect and restore
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)
})

tap.test('TransactionQuery/Pivot: date filter narrows visible year columns', async t => {
    session.clickByRef('Category by Year')
    await wait(1000)

    const beforeFilter = session.browser('snapshot')

    // Apply date filter — restrict to a single year
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('This Year')
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after date filter')
    t.not(afterFilter, beforeFilter, 'display changes after date filter')

    // Clear and verify restoration
    session.clickClear()
    await wait(300)
    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes('Total'), 'Total column restored after clear')
})

tap.test('TransactionQuery/Pivot: account filter changes category totals', async t => {
    const expected = loadExpected()
    session.clickByRef('Category by Year')
    await wait(1000)

    const unfilteredFoodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)
    const beforeFilter = session.browser('snapshot')
    t.ok(beforeFilter.includes(unfilteredFoodTotal), `unfiltered Food total $${unfilteredFoodTotal} visible`)

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Primary Checking')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Filtered Food total should match fixture's per-account total
    const filteredFoodTotal = formatDollars(
        expected.categoryTotalsByAccount.PrimaryChecking.find(c => c.category === 'Food').total,
    )
    t.ok(afterFilter.includes(filteredFoodTotal), `filtered Food total $${filteredFoodTotal} visible`)

    session.clickClear()
    await wait(300)
})

tap.test('TransactionQuery/Pivot: filter chip matches category name', async t => {
    session.clickByRef('Category by Year')
    await wait(1000)

    const beforeSearch = session.browser('snapshot')

    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Food'])
    await wait(400)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search')
    t.ok(afterSearch.includes('Food'), 'Food category visible after filter')
    t.not(afterSearch, beforeSearch, 'display changes after search filter')

    // Clear search
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// PositionQuery → Identity (Positions Engine)
// Variant: PositionQuery with IRGrouping('account')
// ═════════════════════════════════════════════════════════════════════════════

tap.test('PositionQuery/Identity: account names and market values match fixture', async t => {
    session.clickByRef('Positions (Engine)')
    await wait(500)

    const expected = loadExpected()
    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Verify investment accounts with market values from fixture
    const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
    investmentAccounts.forEach(({ name, marketValue }) => {
        t.ok(snapshot.includes(name), `shows account: ${name}`)
        t.ok(snapshot.includes(formatDollars(marketValue)), `${name} shows market value $${formatDollars(marketValue)}`)
    })
})

tap.test('PositionQuery/Identity: group by Security shows shares and values', async t => {
    const expected = loadExpected()

    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Security')
    await wait(300)

    const securityView = session.browser('snapshot')
    t.notOk(securityView.includes('Something went wrong'), 'no crash after group by Security')

    // Verify securities from Fidelity Brokerage with shares and market values
    const spotCheckSecurities = expected.holdings.filter(p => p.account === 'Fidelity Brokerage').slice(0, 3)
    spotCheckSecurities.forEach(({ marketValue, shares, symbol }) => {
        t.ok(securityView.includes(symbol), `shows security: ${symbol}`)
        const isWhole = Number.isInteger(shares)
        const formattedShares = isWhole
            ? shares.toLocaleString('en-US')
            : shares.toLocaleString('en-US', { minimumFractionDigits: 3 })
        const formattedValue = formatDollars(marketValue)
        t.ok(securityView.includes(formattedShares), `${symbol} shows ${formattedShares} shares`)
        t.ok(securityView.includes(formattedValue), `${symbol} shows market value $${formattedValue}`)
    })
})

tap.test('PositionQuery/Identity: account filter shows correct market value', async t => {
    const expected = loadExpected()

    // Re-navigate to reset GroupBy back to Account
    session.clickByRef('Positions (Engine)')
    await wait(500)

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Fidelity Brokerage')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Fidelity market value from fixture
    const fidelity = expected.accounts.find(a => a.name === 'Fidelity Brokerage')
    t.ok(
        afterFilter.includes(formatDollars(fidelity.marketValue)),
        `Fidelity market value $${formatDollars(fidelity.marketValue)} visible`,
    )

    session.clickClear()
    await wait(300)
})

tap.test('PositionQuery/Identity: filter chip matches security name', async t => {
    session.clickByRef('Positions (Engine)')
    await wait(500)

    const beforeSearch = session.browser('snapshot')

    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Vanguard'])
    await wait(400)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search')
    t.not(afterSearch, beforeSearch, 'display changes after search filter')

    // Vanguard positions should be visible
    t.ok(afterSearch.includes('VFIAX') || afterSearch.includes('Vanguard'), 'Vanguard position visible')

    // Clear search
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('PositionQuery/Identity: as-of date filter shows historical positions', async t => {
    const expected = loadExpected()
    session.clickByRef('Positions (Engine)')
    await wait(1000)

    const beforeFilter = session.browser('snapshot')

    // Click the As of chip — component auto-focuses the date input
    session.clickByText('As of:')
    await wait(800)

    // Type the fixture's holdingsAsOf date directly (input is already focused)
    const dateParts = expected.holdingsAsOf.date.split('-')
    const dateDigits = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`
    dateDigits.split('').forEach(c => session.browser('press', [c]))
    await wait(850)
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after as-of date change')
    t.not(afterFilter, beforeFilter, 'display changes after as-of date')
})

// ═════════════════════════════════════════════════════════════════════════════
// AccountQuery → FilteredEntities (Bank Accounts)
// Variant: AccountQuery with IRFilter.Equals('accountType', 'Bank')
// ═════════════════════════════════════════════════════════════════════════════

tap.test('AccountQuery/FilteredEntities: Bank accounts with correct balances', async t => {
    const expected = loadExpected()
    session.clickByRef('Bank Accounts')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Column headers
    t.ok(snapshot.includes('Account'), 'Account column present')
    t.ok(snapshot.includes('Type'), 'Type column present')
    t.ok(snapshot.includes('Balance'), 'Balance column present')

    // Bank accounts from fixture with correct balances
    const bankAccounts = expected.accounts.filter(a => a.type === 'Bank')
    bankAccounts.forEach(({ name, balance }) => {
        t.ok(snapshot.includes(name), `shows Bank account: ${name}`)
        t.ok(snapshot.includes(formatDollars(balance)), `${name} shows balance $${formatDollars(balance)}`)
    })

    // Report description confirms the AccountQuery filter
    t.ok(snapshot.includes('accountType = Bank'), 'report description shows Bank filter')
})

tap.test('AccountQuery/FilteredEntities: filter chip narrows account list', async t => {
    session.clickByRef('Bank Accounts')
    await wait(500)

    const beforeFilter = session.browser('snapshot')

    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Checking'])
    await wait(400)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after filter')
    t.ok(afterFilter.includes('Primary Checking'), 'Primary Checking visible after filter')
    t.not(afterFilter, beforeFilter, 'display changes after filter')

    // Clear filter
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// SnapshotQuery → TimeSeries (Net Worth Over Time)
// Variant: SnapshotQuery with domain='balances', IRDateRange.Year(2025), 'monthly'
// ═════════════════════════════════════════════════════════════════════════════

tap.test('SnapshotQuery/TimeSeries: monthly snapshots with month rows and values', async t => {
    session.clickByRef('Net Worth Over Time')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Accounts:'), 'Accounts chip visible')
    t.ok(snapshot.includes('Date'), 'Date column header present')
    t.ok(snapshot.includes('Total'), 'Total column header present')

    // Verify monthly snapshot totals from fixture
    const expected = loadExpected()
    expected.netWorthSnapshots.forEach(({ date, total }) => {
        const monthAbbr = new Date(date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })
        t.ok(snapshot.includes(monthAbbr), `${monthAbbr} row present`)
        t.ok(snapshot.includes(formatDollars(total)), `${monthAbbr} shows total $${formatDollars(total)}`)
    })
})

tap.test('SnapshotQuery/TimeSeries: account filter changes totals', async t => {
    session.clickByRef('Net Worth Over Time')
    await wait(1000)

    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(500)
    session.clickPopoverItem('Primary Checking')
    await wait(500)
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')
    t.not(afterFilter, beforeFilter, 'display changes after filtering')

    session.clickClear()
    await wait(500)
    const afterClear = session.browser('snapshot')
    t.not(afterClear, afterFilter, 'display changes after clearing filter')
})

tap.test('SnapshotQuery/TimeSeries: date filter narrows visible snapshots', async t => {
    session.clickByRef('Net Worth Over Time')
    await wait(1000)

    const beforeFilter = session.browser('snapshot')

    // Verify we can see multiple months before filtering
    t.ok(beforeFilter.includes('Jan'), 'Jan visible before date filter')
    t.ok(beforeFilter.includes('Jun'), 'Jun visible before date filter')

    // Apply date filter — Q1 only
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '01/01/2025')
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '03/31/2025')
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after date filter')

    // Q1 months should be visible after filtering
    t.ok(afterFilter.includes('Jan'), 'Jan visible after Q1 filter')
    t.ok(afterFilter.includes('Mar'), 'Mar visible after Q1 filter')

    // Clear and verify full year returns
    session.clickClear()
    await wait(500)
    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes('Jun'), 'Jun visible again after clearing date filter')
})

// ═════════════════════════════════════════════════════════════════════════════
// RunningBalanceQuery → RunningBalance
// Variant: RunningBalanceQuery (no filter, no dateRange — all transactions)
// ═════════════════════════════════════════════════════════════════════════════

tap.test('RunningBalanceQuery/RunningBalance: entries with payees, amounts, and cumulative balances', async t => {
    const expected = loadExpected()
    session.clickByRef('Running Balance')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Accounts:'), 'Accounts chip visible')

    // Column headers
    t.ok(snapshot.includes('Date'), 'Date column present')
    t.ok(snapshot.includes('Payee'), 'Payee column present')
    t.ok(snapshot.includes('Amount'), 'Amount column present')
    t.ok(snapshot.includes('Balance'), 'Balance column present')

    // Verify first few entries from fixture match what's displayed
    const firstEntries = expected.runningBalance.firstEntries
    const firstEntry = firstEntries[0]
    t.ok(snapshot.includes(firstEntry.payee), `first entry payee "${firstEntry.payee}" visible`)
    t.ok(
        snapshot.includes(formatDollars(firstEntry.amount)),
        `first entry amount $${formatDollars(firstEntry.amount)} visible`,
    )
    t.ok(
        snapshot.includes(formatDollars(firstEntry.cumulativeBalance)),
        `first entry balance $${formatDollars(firstEntry.cumulativeBalance)} visible`,
    )

    // Check a second entry for confidence (different payee/amount)
    const secondEntry = firstEntries.find(e => e.payee && e.payee !== firstEntry.payee)
    if (secondEntry) {
        t.ok(snapshot.includes(secondEntry.payee), `entry payee "${secondEntry.payee}" visible`)
        t.ok(
            snapshot.includes(formatDollars(secondEntry.amount)),
            `entry amount $${formatDollars(secondEntry.amount)} visible`,
        )
    }

    t.ok(snapshot.includes('running balance'), 'report description visible')
})

tap.test('RunningBalanceQuery/RunningBalance: account filter narrows entries and changes values', async t => {
    const expected = loadExpected()
    const firstEntry = expected.runningBalance.firstEntries[0]
    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(200)

    // Filter to an account that isn't the first entry's account to verify values change
    const otherAccount = firstEntry.account === 'Primary Checking' ? 'Chase Sapphire' : 'Primary Checking'
    session.clickPopoverItem(otherAccount)
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')
    t.not(afterFilter, beforeFilter, 'display changes after filtering')

    session.clickClear()
    await wait(200)
})

tap.test('RunningBalanceQuery/RunningBalance: filter chip matches payee', async t => {
    session.clickByRef('Running Balance')
    await wait(500)

    const expected = loadExpected()
    const beforeSearch = session.browser('snapshot')
    const targetPayee = expected.runningBalance.firstEntries.find(e => e.payee)?.payee

    session.browser('click', ['text="Filter" >> nth=0'])
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', targetPayee])
    await wait(400)

    const afterSearch = session.browser('snapshot')
    t.notOk(afterSearch.includes('Something went wrong'), 'no crash after search')
    t.ok(afterSearch.includes(targetPayee), `payee "${targetPayee}" visible after filter`)
    t.not(afterSearch, beforeSearch, 'display changes after search filter')

    // Clear search
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('RunningBalanceQuery/RunningBalance: date filter narrows entries', async t => {
    const expected = loadExpected()
    session.clickByRef('Running Balance')
    await wait(500)

    const beforeFilter = session.browser('snapshot')

    // Apply date filter — narrow to first month of data
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)

    // Use dates from fixture spotChecks — first few entries
    const firstDate = expected.runningBalance.firstEntries[0].date
    const dateParts = firstDate.split('-')
    const startInput = `${dateParts[1]}/01/${dateParts[0]}`
    const endInput = `${dateParts[1]}/15/${dateParts[0]}`
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', startInput)
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', endInput)
    session.browser('press', ['Escape'])
    await wait(500)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after date filter')
    t.not(afterFilter, beforeFilter, 'display changes after date filter')

    // First entry should still be visible (it falls within the date range)
    const firstPayee = expected.runningBalance.firstEntries[0].payee
    t.ok(afterFilter.includes(firstPayee), `first payee "${firstPayee}" still visible in date range`)

    // Clear and verify restoration
    session.clickClear()
    await wait(300)
})

// ═════════════════════════════════════════════════════════════════════════════
// ExpressionQuery → Scalar
// NOTE: No ScalarResultPage exists yet — ExpressionQuery cannot be tested
// through the browser. This variant needs a page component before it can
// have integration tests. Unit tests exist in run-financial-query.tap.js.
// ═════════════════════════════════════════════════════════════════════════════
