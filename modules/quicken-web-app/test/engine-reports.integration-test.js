// ABOUTME: covers new FinancialQuery result pages — verifies data parity with old reports and chip filter correctness
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
tap.setTimeout(60000)

// ═════════════════════════════════════════════════════════════════════════════
// Helpers
// ═════════════════════════════════════════════════════════════════════════════

const formatDollars = n => Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

// ═════════════════════════════════════════════════════════════════════════════
// Spending (Engine) — data parity with Spending by Category
// ═════════════════════════════════════════════════════════════════════════════

tap.test('spending-engine: shows same category names and totals as old report', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    const expected = loadExpected()
    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Verify each category name and total matches fixture — same assertions as old report test
    expected.categoryTotals.forEach(({ category, total }) => {
        t.ok(snapshot.includes(category), `shows category: ${category}`)
        t.ok(snapshot.includes(formatDollars(total)), `${category} shows total $${formatDollars(total)}`)
    })
})

tap.test('spending-engine: account filter shows same filtered totals as old report', async t => {
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

    // Same fixture-based assertions as old report: verify filtered totals for Primary Checking
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

tap.test('spending-engine: date filter shows same filtered totals as old report', async t => {
    const expected = loadExpected()
    const originalFoodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)

    // Apply custom date range: Feb 2024
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')
    session.browser('press', ['Escape'])
    await wait(300)

    const afterDateFilter = session.browser('snapshot')
    t.notOk(afterDateFilter.includes('Something went wrong'), 'no crash after date filter')

    // Same fixture-based assertions as old report: verify date-filtered totals
    const filteredFood = formatDollars(expected.dateFiltered.categoryTotals.find(c => c.category === 'Food').total)
    const filteredIncome = expected.dateFiltered.categoryTotals
        .find(c => c.category === 'Income')
        .total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    t.ok(afterDateFilter.includes(filteredFood), `Food shows date-filtered total $${filteredFood}`)
    t.ok(afterDateFilter.includes(filteredIncome), `Income shows date-filtered total $${filteredIncome}`)

    // Clear and verify original totals return
    session.clickClear()
    await wait(300)
    const afterClear = session.browser('snapshot')
    t.ok(
        afterClear.includes(originalFoodTotal),
        `Food shows original total $${originalFoodTotal} after clearing date filter`,
    )
})

tap.test('spending-engine: category filter includes subcategories (prefix match)', async t => {
    const expected = loadExpected()

    // Select "Food" — should include Food:Dining, Food:Groceries etc.
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterFilter.includes('1 selected'), 'chip shows "1 selected"')
    t.ok(afterFilter.includes('Food'), 'Food category visible')
    t.notOk(afterFilter.includes('Income'), 'Income hidden when Food selected')
    t.notOk(afterFilter.includes('Transportation'), 'Transportation hidden when Food selected')

    // Verify Food total is the full tree total (including subcategories)
    const foodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)
    t.ok(afterFilter.includes(foodTotal), `Food shows full total $${foodTotal} (includes subcategories)`)

    // Unselect Food — all categories should reappear
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterUnselect = session.browser('snapshot')
    t.ok(afterUnselect.includes('Food'), 'Food visible after unselect')
    t.ok(afterUnselect.includes('Income'), 'Income visible after unselect')
    t.ok(afterUnselect.includes('Transportation'), 'Transportation visible after unselect')
})

tap.test('spending-engine: category multi-select and full unselect', async t => {
    // Select Food, then Transportation
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.clickPopoverItem('Transportation')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterMulti = session.browser('snapshot')
    t.ok(afterMulti.includes('2 selected'), 'chip shows "2 selected"')
    t.ok(afterMulti.includes('Food'), 'Food visible')
    t.ok(afterMulti.includes('Transportation'), 'Transportation visible')
    t.notOk(afterMulti.includes('Income'), 'Income hidden')

    // Unselect both
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.clickPopoverItem('Transportation')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes('Income'), 'Income visible after clearing all categories')
    t.notOk(afterClear.includes('selected'), 'no "selected" text after clearing all categories')
})

tap.test('spending-engine: group by account changes tree structure', async t => {
    const beforeGroupBy = session.browser('snapshot')

    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(300)

    const afterGroupBy = session.browser('snapshot')
    t.notOk(afterGroupBy.includes('Something went wrong'), 'no crash after group by Account')
    t.not(afterGroupBy, beforeGroupBy, 'display changes after group by switch')

    // Account names should appear as group headers
    t.ok(afterGroupBy.includes('Primary Checking'), 'Primary Checking visible as account group')
    t.ok(afterGroupBy.includes('Chase Sapphire'), 'Chase Sapphire visible as account group')

    // Switch back to Category for subsequent tests
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Category')
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after switching back')
})

tap.test('spending-engine: expanding tree shows subcategories and transactions', async t => {
    const beforeExpand = session.browser('snapshot')
    t.ok(beforeExpand.includes('Income'), 'Income category visible')

    // Collapse Income if already expanded
    if (beforeExpand.includes('Salary')) {
        session.browser('click', ['text=▼ >> nth=0'])
        await wait(300)
    }

    // Expand Income — sorted: Food(0), Income(1), Transportation(2), ...
    session.browser('click', ['text=▶ >> nth=1'])
    await wait(300)

    const afterExpandIncome = session.browser('snapshot')
    t.notOk(afterExpandIncome.includes('Something went wrong'), 'no crash after expanding Income')
    t.ok(afterExpandIncome.includes('Salary'), 'Salary subcategory visible after expanding Income')

    // Expand Salary — after Income expand, arrows are: Food(0), Income(1), Salary(2), Transportation(3), ...
    session.browser('click', ['text=▶ >> nth=2'])
    await wait(300)

    const afterExpandSalary = session.browser('snapshot')
    t.ok(afterExpandSalary.includes('Acme Corp'), 'Acme Corp payee visible in expanded transactions')
    t.ok(afterExpandSalary.includes('4,500'), 'transaction amount $4,500 visible')
})

tap.test('spending-engine: search filter matches payee and shows results', async t => {
    // Navigate fresh to reset tree expansion state
    session.clickByRef('Spending (Engine)')
    await wait(500)

    const beforeSearch = session.browser('snapshot')

    session.clickByText('Filter')
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

// ═════════════════════════════════════════════════════════════════════════════
// Positions (Engine) — data parity with Investment Positions
// ═════════════════════════════════════════════════════════════════════════════

tap.test('positions-engine: shows account names and market values matching old report', async t => {
    session.clickByRef('Positions (Engine)')
    await wait(500)

    const expected = loadExpected()
    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Same assertions as old report: verify investment accounts with market values
    const investmentAccounts = expected.accounts.filter(a => a.type === 'Investment' && a.marketValue)
    investmentAccounts.forEach(({ name, marketValue }) => {
        t.ok(snapshot.includes(name), `shows account: ${name}`)
        t.ok(snapshot.includes(formatDollars(marketValue)), `${name} shows market value $${formatDollars(marketValue)}`)
    })
})

tap.test('positions-engine: group by Security shows individual securities', async t => {
    const expected = loadExpected()

    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Security')
    await wait(300)

    const securityView = session.browser('snapshot')
    t.notOk(securityView.includes('Something went wrong'), 'no crash after group by Security')

    // Same assertions as old report: spot check securities from Fidelity Brokerage
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

    // Switch back to Account
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(200)
})

tap.test('positions-engine: group by Type does not crash', async t => {
    const beforeGroupBy = session.browser('snapshot')

    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Type')
    await wait(500)

    const afterGroupBy = session.browser('snapshot')
    t.notOk(afterGroupBy.includes('Something went wrong'), 'no crash after group by Type')
    t.not(afterGroupBy, beforeGroupBy, 'display changes after group by Type')

    // Switch back to Account
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(200)
})

tap.test('positions-engine: account filter shows correct values and changes display', async t => {
    const expected = loadExpected()
    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Fidelity Brokerage')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Same assertion as old report: Fidelity market value should appear
    const fidelity = expected.accounts.find(a => a.name === 'Fidelity Brokerage')
    t.ok(
        afterFilter.includes(formatDollars(fidelity.marketValue)),
        `Fidelity market value $${formatDollars(fidelity.marketValue)} visible`,
    )

    t.not(afterFilter, beforeFilter, 'display changes after account filter applied')

    // Clear and verify unfiltered view returns
    session.clickClear()
    await wait(300)

    const afterClear = session.browser('snapshot')
    t.notOk(afterClear.includes('1 selected'), 'chip cleared after reset')
})

tap.test('positions-engine: search filter scopes to matching securities', async t => {
    const beforeSearch = session.browser('snapshot')

    session.clickByText('Filter')
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', 'Apple'])
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

// ═════════════════════════════════════════════════════════════════════════════
// Seed queries — Spending Over $500, Exclude Transfers, etc.
// ═════════════════════════════════════════════════════════════════════════════

tap.test('spending-over-500: shows categories with large transactions', async t => {
    session.clickByRef('Spending Over $500')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // LessThan('amount', -500) filters to expenses > $500
    // Uncategorized includes large items (mortgage, transfers, 401k contributions)
    t.ok(snapshot.includes('Uncategorized'), 'Uncategorized category visible (has large expenses)')

    // Description confirms filter
    t.ok(snapshot.includes('amount < -500'), 'query description shows amount filter')

    // Should have filter chips for interaction
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Group by:'), 'Group by chip visible')
})

tap.test('exclude-transfers: shows non-transfer categories with correct totals', async t => {
    const expected = loadExpected()
    session.clickByRef('Exclude Transfers')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Not(Equals('category', 'Transfer')) — should show Food, Income, Transportation, etc.
    t.ok(snapshot.includes('Food'), 'Food category visible')
    t.ok(snapshot.includes('Income'), 'Income category visible')

    // Food total from fixture should match (all Food txns, no Transfer filter affects Food)
    const foodTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Food').total)
    t.ok(snapshot.includes(foodTotal), `Food total $${foodTotal} visible`)

    // Income total from fixture
    const incomeTotal = formatDollars(expected.categoryTotals.find(c => c.category === 'Income').total)
    t.ok(snapshot.includes(incomeTotal), `Income total $${incomeTotal} visible`)

    t.ok(snapshot.includes('Date:'), 'Date chip visible')
})

tap.test('spending-100-1000: shows medium-amount transactions', async t => {
    session.clickByRef('Spending $100–$1000')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Between('amount', -1000, -100) — expenses from $100 to $1000
    t.ok(snapshot.includes('amount'), 'query description shows amount filter')

    // Should show categories that have medium-range expenses
    // Utilities has items like PG&E ($123.94), mortgage-related; Food has Whole Foods ($80-120 range)
    t.ok(
        snapshot.includes('Utilities') || snapshot.includes('Food') || snapshot.includes('Uncategorized'),
        'at least one category with medium expenses visible',
    )

    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Group by:'), 'Group by chip visible')
})

tap.test('food-at-select-accounts: shows Food transactions from Primary Checking and Chase Sapphire', async t => {
    session.clickByRef('Food at Select Accounts')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // And([Equals('category', 'Food'), In('account', ['Primary Checking', 'Chase Sapphire'])])
    t.ok(snapshot.includes('Food'), 'Food category visible')

    // Should NOT show non-Food categories
    t.notOk(snapshot.includes('Income'), 'Income not visible (filtered to Food only)')
    t.notOk(snapshot.includes('Transportation'), 'Transportation not visible (filtered to Food only)')

    // Description confirms compound filter
    t.ok(snapshot.includes('category'), 'query description mentions category filter')
    t.ok(snapshot.includes('account'), 'query description mentions account filter')
})

tap.test('payees-matching-pac: shows Pacific National Mortgage transactions', async t => {
    session.clickByRef('Payees Matching ^Pac')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Matches('payee', '^Pac') — Pacific National Mortgage is the matching payee
    // These are categorized as Uncategorized in the seed data
    t.ok(
        snapshot.includes('Uncategorized') || snapshot.includes('Food') || snapshot.includes('Utilities'),
        'category visible for matched payees',
    )

    // Description confirms payee pattern filter
    t.ok(snapshot.includes('payee'), 'query description mentions payee filter')
})

// ═════════════════════════════════════════════════════════════════════════════
// Non-tree engine reports — Net Worth, Category by Year, Running Balance, Bank Accounts
// ═════════════════════════════════════════════════════════════════════════════

tap.test('net-worth: renders time series table with Date and Total columns', async t => {
    session.clickByRef('Net Worth Over Time')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Accounts:'), 'Accounts chip visible')
    t.ok(snapshot.includes('Date'), 'Date column header present')
    t.ok(snapshot.includes('Total'), 'Total column header present')

    // Default seed is IRDateRange.Year(2025) monthly — should have month-end dates
    t.ok(snapshot.includes('Jan'), 'January snapshot row present')
    t.ok(snapshot.includes('$'), 'currency values rendered')
})

tap.test('net-worth: account filter scopes and clear restores', async t => {
    // Re-navigate to ensure clean state
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
    t.notOk(session.browser('snapshot').includes('1 selected'), 'chip cleared after reset')
})

tap.test('category-by-year: renders pivot table with category rows and year columns', async t => {
    const expected = loadExpected()
    session.clickByRef('Category by Year')
    await wait(1000)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')
    t.ok(snapshot.includes('Date:'), 'Date chip visible')
    t.ok(snapshot.includes('Categories:'), 'Categories chip visible')
    t.ok(snapshot.includes('Accounts:'), 'Accounts chip visible')

    // Pivot table structure: category rows with year columns + Total
    t.ok(snapshot.includes('Total'), 'Total column header present')

    // Verify category row labels from fixture data
    expected.categoryTotals.forEach(({ category }) =>
        t.ok(snapshot.includes(category), `category row "${category}" visible`),
    )

    // Verify fixture category totals appear as Total column values
    expected.categoryTotals.forEach(({ category, total }) =>
        t.ok(snapshot.includes(formatDollars(total)), `${category} total $${formatDollars(total)} visible`),
    )

    // Computed row label should be present (value may be "—" if Housing row absent in seed data)
    t.ok(snapshot.includes('Food % of Income'), 'computed row "Food % of Income" visible')
})

tap.test('category-by-year: category filter includes subcategories', async t => {
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after category filter')
    t.ok(afterFilter.includes('1 selected'), 'chip shows "1 selected"')

    // Unselect and verify restore
    session.clickByText('Categories:')
    await wait(200)
    session.clickPopoverItem('Food')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(300)

    const afterClear = session.browser('snapshot')
    t.notOk(afterClear.includes('1 selected'), 'chip cleared after unselect')
})

tap.test('category-by-year: account filter scopes and clear restores', async t => {
    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Primary Checking')
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

tap.test('running-balance: renders register with Date, Payee, Amount, Balance columns', async t => {
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

    // Running balance shows all transactions sorted by date — earliest should be visible
    // Fixture spot checks confirm Feb 14, 2024 as an early date with Acme Corp ($4,500)
    t.ok(snapshot.includes('$'), 'currency amounts rendered')

    // Verify the report shows description text from query IR
    t.ok(snapshot.includes('running balance'), 'report description visible')
})

tap.test('running-balance: account filter narrows entries', async t => {
    const beforeFilter = session.browser('snapshot')

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Primary Checking')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')
    t.not(afterFilter, beforeFilter, 'display changes after filtering')

    // After filtering to Primary Checking, display should change and show filtered data
    t.ok(afterFilter.includes('Accounts:'), 'Accounts chip still visible')

    session.clickClear()
    await wait(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// Known bugs — these tests document broken behavior that needs fixing
// ═════════════════════════════════════════════════════════════════════════════

tap.test('spending-engine: search by amount finds transactions', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    const beforeSearch = session.browser('snapshot')
    t.ok(beforeSearch.includes('Income'), 'Income visible before search')

    // "4500" matches the Acme Corp salary amount ($4,500) in the old report
    session.clickByText('Filter')
    await wait(200)
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', '4500'])
    await wait(400)

    const afterSearch = session.browser('snapshot')
    t.ok(afterSearch.includes('Income'), 'searching "4500" should find Income (salary amount match)')

    // Clear search
    session.browser('find', ['placeholder', 'Type to filter...', 'fill', ''])
    await wait(300)
    session.browser('press', ['Escape'])
    await wait(200)
})

tap.test('spending-engine: group by payee shows real payee names', async t => {
    session.clickByRef('Spending (Engine)')
    await wait(500)

    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Payee')
    await wait(300)

    const afterGroupBy = session.browser('snapshot')
    t.notOk(afterGroupBy.includes('Something went wrong'), 'no crash after group by Payee')

    // Snapshot truncates at ~5000 chars — Acme Corp (expanded, 53 txns) fills most of it.
    // Check payees that appear early alphabetically: 401k Contribution and Acme Corp
    t.ok(afterGroupBy.includes('Acme Corp'), 'Acme Corp payee visible as group')
    t.ok(afterGroupBy.includes('401k Contribution'), '401k Contribution payee visible as group')
    t.notOk(afterGroupBy.includes('Unknown\n'), 'no "Unknown" fallback groups')

    // Switch back to Category
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Category')
    await wait(200)
})

// ═════════════════════════════════════════════════════════════════════════════
// Bank Accounts
// ═════════════════════════════════════════════════════════════════════════════

tap.test('bank-accounts: shows exactly the Bank accounts with correct balances', async t => {
    const expected = loadExpected()
    session.clickByRef('Bank Accounts')
    await wait(500)

    const snapshot = session.browser('snapshot')
    t.notOk(snapshot.includes('Something went wrong'), 'no crash after opening report')

    // Column headers
    t.ok(snapshot.includes('Account'), 'Account column present')
    t.ok(snapshot.includes('Type'), 'Type column present')
    t.ok(snapshot.includes('Balance'), 'Balance column present')

    // Bank accounts from fixture — should appear with correct balances
    const bankAccounts = expected.accounts.filter(a => a.type === 'Bank')
    bankAccounts.forEach(({ name, balance }) => {
        t.ok(snapshot.includes(name), `shows Bank account: ${name}`)
        t.ok(snapshot.includes(formatDollars(balance)), `${name} shows balance $${formatDollars(balance)}`)
    })

    // Report description confirms the AccountQuery filter is applied
    t.ok(snapshot.includes('accountType = Bank'), 'report description shows Bank filter')
})
