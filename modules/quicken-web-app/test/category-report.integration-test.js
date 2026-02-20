// ABOUTME: covers Spending by Category report, GroupByFilterChip, AccountFilterChip, DateFilterChip, tree expansion
// ABOUTME: Run with: yarn tap:file test/category-report.integration-test.js (-g 'pattern' for single test)

import tap from 'tap'
import { IntegrationBrowser } from './helpers/integration-browser.js'

const { wait, loadExpected } = IntegrationBrowser

const PORT = process.env.PORT || 3000
const TEST_URL = `http://localhost:${PORT}?testFile=seed-12345`

let session

tap.before(async () => {
    session = IntegrationBrowser.createSession('category-test')
    session.open(TEST_URL)
    session.setViewport(1280, 1600)
    await wait(1500)

    // Navigate to Spending by Category report
    session.clickByRef('Spending by Category')
    await wait(500)

    // Open second tab group to exercise multi-instance module-level state
    session.clickByText('Split')
    await wait(300)
    session.clickByRef('Primary Checking')
    await wait(500)
    session.browser('click', ['text=Spending by Category >> nth=1'])
    await wait(300)
})

tap.teardown(() => session.close())

tap.test('category: report shows category names and totals', async t => {
    const afterClick = session.browser('snapshot')
    const expected = loadExpected()

    t.notOk(afterClick.includes('Something went wrong'), 'no crash after clicking report')

    expected.categoryTotals.forEach(({ category, total }) => {
        t.ok(afterClick.includes(category), `shows category: ${category}`)
        const formattedTotal = Math.abs(total).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(afterClick.includes(formattedTotal), `${category} shows total $${formattedTotal}`)
    })
})

tap.test('category: GroupBy toggle changes display', async t => {
    const beforeGroupBy = session.browser('snapshot')

    // Switch to Account
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Account')
    await wait(200)

    const afterAccountGroup = session.browser('snapshot')
    t.notOk(afterAccountGroup.includes('Something went wrong'), 'no crash after group by Account')
    t.not(afterAccountGroup, beforeGroupBy, 'display changes after group by switch')

    // Switch back to Category
    session.clickByText('Group by:')
    await wait(200)
    session.clickPopoverItem('Category')
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after switching back to Category')
})

tap.test('category: account filter Primary Checking shows correct filtered totals', async t => {
    const expected = loadExpected()

    session.clickByText('Accounts:')
    await wait(200)
    session.clickPopoverItem('Primary Checking')
    await wait(200)
    session.browser('press', ['Escape'])
    await wait(200)

    const afterFilter = session.browser('snapshot')
    t.notOk(afterFilter.includes('Something went wrong'), 'no crash after account filter')
    t.ok(afterFilter.includes('1 selected'), 'account chip shows "1 selected"')

    // Verify filtered category totals for Primary Checking
    const filteredTotals = expected.categoryTotalsByAccount.PrimaryChecking
    filteredTotals.forEach(({ category, total }) => {
        const formatted = Math.abs(total).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        t.ok(afterFilter.includes(formatted), `${category} shows filtered total $${formatted}`)
    })

    // Negative assertion: unfiltered Food total (all accounts) should NOT appear
    const unfilteredFood = Math.abs(expected.categoryTotals.find(c => c.category === 'Food').total)
    const filteredFood = Math.abs(filteredTotals.find(c => c.category === 'Food').total)
    t.not(unfilteredFood, filteredFood, 'fixture precondition: filtered Food differs from unfiltered')
    const unfilteredFormatted = unfilteredFood.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
    t.notOk(afterFilter.includes(unfilteredFormatted), `unfiltered Food total $${unfilteredFormatted} not visible`)

    // Clear account filter
    session.clickClear()
    await wait(200)
    t.notOk(session.browser('snapshot').includes('Something went wrong'), 'no crash after clearing account filter')
})

tap.test('category: custom date filter shows correct filtered totals', async t => {
    const expected = loadExpected()
    const originalFoodTotal = Math.abs(expected.categoryTotals.find(c => c.category === 'Food').total).toLocaleString(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    )

    // Open date filter and select "Custom dates..."
    session.clickByText('Date:')
    await wait(200)
    session.clickPopoverItem('Custom dates')
    await wait(200)

    // Enter dates via key presses
    await session.enterDate('text=Start Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/01/2024')
    await session.enterDate('text=End Date >> .. >> [placeholder="MM/DD/YYYY"]', '02/28/2024')

    // Close popover
    session.browser('press', ['Escape'])
    await wait(200)

    const afterDateFilter = session.browser('snapshot')

    // Verify date-filtered category totals
    const filteredFood = Math.abs(
        expected.dateFiltered.categoryTotals.find(c => c.category === 'Food').total,
    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const filteredIncome = expected.dateFiltered.categoryTotals
        .find(c => c.category === 'Income')
        .total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    t.ok(afterDateFilter.includes(filteredFood), `Food shows filtered total $${filteredFood}`)
    t.ok(afterDateFilter.includes(filteredIncome), `Income shows filtered total $${filteredIncome}`)

    // Clear date filter and verify original totals return
    session.clickClear()
    await wait(200)
    const afterClear = session.browser('snapshot')
    t.ok(afterClear.includes(originalFoodTotal), `Food shows original total $${originalFoodTotal} after clearing`)
})

tap.test('category: expanding a leaf category shows individual transactions', async t => {
    // Tree may start expanded (default treeExpansion state), so collapse Income first if needed
    const beforeExpand = session.browser('snapshot')
    t.ok(beforeExpand.includes('Income'), 'Income category visible')

    if (beforeExpand.includes('Salary')) {
        // Income is already expanded — collapse it so we can test the expand flow
        session.browser('click', ['text=▼ >> nth=1'])
        await wait(300)
        t.notOk(session.browser('snapshot').includes('Salary'), 'Salary hidden after collapsing Income')
    }

    // Expand Income — click its ▶ chevron.
    // Tree sorted alphabetically: Food(0), Income(1), Transportation(2), Uncategorized(3), Utilities(4).
    session.browser('click', ['text=▶ >> nth=1'])
    await wait(300)

    const afterExpandIncome = session.browser('snapshot')
    t.notOk(afterExpandIncome.includes('Something went wrong'), 'no crash after expanding Income')
    t.ok(afterExpandIncome.includes('Salary'), 'Salary subcategory visible after expanding Income')

    // Expand Salary — Income's ▶ became ▼, so Salary takes the nth=1 ▶ position.
    session.browser('click', ['text=▶ >> nth=1'])
    await wait(300)

    const afterExpandSalary = session.browser('snapshot')
    t.notOk(afterExpandSalary.includes('Something went wrong'), 'no crash after expanding Salary')
    t.ok(afterExpandSalary.includes('Acme Corp'), 'Acme Corp payee visible in expanded transactions')
    t.ok(afterExpandSalary.includes('4,500'), 'transaction amount $4,500 visible')
})
