// ABOUTME: Tests for editableFilters → chip state transformers
// ABOUTME: Verifies every supported IRDateRange variant maps to the correct dateRangeKey and dateRange

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { EditableFilters } from '@graffio/query-language'
import { IRDateRange } from '@graffio/query-language/src/types/ir-date-range.js'
import { Account } from '../../src/types/account.js'
import { EditableFiltersToChipState } from '../../src/commands/editable-filters-to-chip-state.js'

const { toDateRangeChipState, toChipChanges, toAccountIds } = EditableFiltersToChipState

// Pin "now" to July 8, 2026 so Year-based tests are deterministic
const OriginalDate = global.Date

const withFixedDate = (t, fn) => {
    global.Date = class extends OriginalDate {
        constructor(...args) {
            if (args.length === 0) super(2026, 6, 8, 12, 0, 0, 0)
            else super(...args)
        }

        static now() {
            return new OriginalDate(2026, 6, 8, 12, 0, 0, 0).getTime()
        }
    }
    t.teardown(() => (global.Date = OriginalDate))
    fn()
}

// -----------------------------------------------------------------------------------------------------------------
// toDateRangeChipState
// -----------------------------------------------------------------------------------------------------------------

test('toDateRangeChipState — AllDates', t => {
    const result = toDateRangeChipState(IRDateRange.AllDates())

    t.same(result, { dateRangeKey: 'all' }, 'maps to dateRangeKey "all" with no dateRange')
    t.end()
})

test('toDateRangeChipState — Relative(days, 7)', t =>
    withFixedDate(t, () => {
        const result = toDateRangeChipState(IRDateRange.Relative('days', 7))

        t.equal(result.dateRangeKey, 'lastSevenDays')
        t.ok(result.dateRange, 'includes a dateRange')
        t.ok(result.dateRange.start instanceof OriginalDate, 'start is a Date')
        t.ok(result.dateRange.end instanceof OriginalDate, 'end is a Date')
        t.end()
    }))

test('toDateRangeChipState — Relative(days, 30)', t =>
    withFixedDate(t, () => {
        const result = toDateRangeChipState(IRDateRange.Relative('days', 30))

        t.equal(result.dateRangeKey, 'lastThirtyDays')
        t.ok(result.dateRange, 'includes a dateRange')
        t.end()
    }))

test('toDateRangeChipState — Relative(months, 12)', t =>
    withFixedDate(t, () => {
        const result = toDateRangeChipState(IRDateRange.Relative('months', 12))

        t.equal(result.dateRangeKey, 'lastTwelveMonths')
        t.ok(result.dateRange, 'includes a dateRange')
        t.end()
    }))

test('toDateRangeChipState — Relative with unsupported combo throws', t => {
    t.throws(
        () => toDateRangeChipState(IRDateRange.Relative('weeks', 2)),
        /No chip mapping for Relative/,
        'throws for unmapped Relative variant',
    )
    t.end()
})

test('toDateRangeChipState — Year(lastYear) maps to lastYear key', t =>
    withFixedDate(t, () => {
        const result = toDateRangeChipState(IRDateRange.Year(2025))

        t.equal(result.dateRangeKey, 'lastYear', 'dateRangeKey is lastYear')
        t.ok(result.dateRange, 'includes a dateRange')
        t.equal(result.dateRange.start.getFullYear(), 2025, 'start year is 2025')
        t.equal(result.dateRange.start.getMonth(), 0, 'start month is January')
        t.equal(result.dateRange.start.getDate(), 1, 'start day is 1')
        t.equal(result.dateRange.end.getFullYear(), 2025, 'end year is 2025')
        t.equal(result.dateRange.end.getMonth(), 11, 'end month is December')
        t.equal(result.dateRange.end.getDate(), 31, 'end day is 31')
        t.end()
    }))

test('toDateRangeChipState — Year(other) maps to customDates key', t =>
    withFixedDate(t, () => {
        const result = toDateRangeChipState(IRDateRange.Year(2020))

        t.equal(result.dateRangeKey, 'customDates', 'dateRangeKey is customDates')
        t.ok(result.dateRange, 'includes a dateRange')
        t.equal(result.dateRange.start.getFullYear(), 2020, 'start year is 2020')
        t.equal(result.dateRange.start.getMonth(), 0, 'start month is January')
        t.equal(result.dateRange.end.getFullYear(), 2020, 'end year is 2020')
        t.equal(result.dateRange.end.getMonth(), 11, 'end month is December')
        t.end()
    }))

test('toDateRangeChipState — Quarter throws', t => {
    t.throws(() => toDateRangeChipState(IRDateRange.Quarter(1, 2025)), /Quarter not yet supported/)
    t.end()
})

test('toDateRangeChipState — Month throws', t => {
    t.throws(() => toDateRangeChipState(IRDateRange.Month(3, 2025)), /Month not yet supported/)
    t.end()
})

test('toDateRangeChipState — Range throws', t => {
    t.throws(() => toDateRangeChipState(IRDateRange.Range('2025-01-01', '2025-06-30')), /Range not yet supported/)
    t.end()
})

// -----------------------------------------------------------------------------------------------------------------
// toAccountIds
// -----------------------------------------------------------------------------------------------------------------

test('toAccountIds — resolves names to IDs', t => {
    const a1 = Account('acc_000000000001', 'Checking', 'Bank', '', 0)
    const a2 = Account('acc_000000000002', 'Savings', 'Bank', '', 0)
    const accountsLT = LookupTable([a1, a2], Account, 'id')

    const result = toAccountIds(accountsLT, ['Checking', 'Savings'])

    t.same(result, ['acc_000000000001', 'acc_000000000002'])
    t.end()
})

test('toAccountIds — empty names returns empty array', t => {
    const accountsLT = LookupTable([], Account, 'id')

    const result = toAccountIds(accountsLT, [])

    t.same(result, [])
    t.end()
})

test('toAccountIds — filters out unresolved names', t => {
    const a1 = Account('acc_000000000001', 'Checking', 'Bank', '', 0)
    const accountsLT = LookupTable([a1], Account, 'id')

    const result = toAccountIds(accountsLT, ['Checking', 'NonExistent'])

    t.same(result, ['acc_000000000001'], 'only resolved names appear')
    t.end()
})

// -----------------------------------------------------------------------------------------------------------------
// toChipChanges — integration
// -----------------------------------------------------------------------------------------------------------------

test('toChipChanges — netWorth editableFilters (accounts + Year dateRange)', t =>
    withFixedDate(t, () => {
        const accountsLT = LookupTable([], Account, 'id')
        const editableFilters = EditableFilters(undefined, [], IRDateRange.Year(2025))

        const result = toChipChanges(editableFilters, accountsLT)

        t.same(result.selectedAccounts, [], 'selectedAccounts is empty array')
        t.equal(result.dateRangeKey, 'lastYear', 'dateRangeKey is lastYear')
        t.ok(result.dateRange, 'dateRange is present')
        t.equal(result.dateRange.start.getFullYear(), 2025, 'dateRange start year')
        t.equal(result.dateRange.end.getFullYear(), 2025, 'dateRange end year')
        t.equal(result.selectedCategories, undefined, 'no selectedCategories')
        t.equal(result.groupBy, undefined, 'no groupBy')
        t.end()
    }))

test('toChipChanges — spending editableFilters (categories + accounts + AllDates + groupBy)', t => {
    const a1 = Account('acc_000000000001', 'Checking', 'Bank', '', 0)
    const accountsLT = LookupTable([a1], Account, 'id')
    const editableFilters = EditableFilters(
        [], // categories
        ['Checking'], // accounts
        IRDateRange.AllDates(), // dateRange
        'category', // groupBy
    )

    const result = toChipChanges(editableFilters, accountsLT)

    t.same(result.selectedCategories, [], 'selectedCategories from editableFilters')
    t.same(result.selectedAccounts, ['acc_000000000001'], 'account name resolved to ID')
    t.equal(result.dateRangeKey, 'all', 'AllDates maps to "all"')
    t.equal(result.dateRange, undefined, 'AllDates has no dateRange')
    t.equal(result.groupBy, 'category', 'groupBy passed through')
    t.end()
})

test('toChipChanges — positions editableFilters (accounts + asOfDate, no dateRange)', t => {
    const accountsLT = LookupTable([], Account, 'id')
    const editableFilters = EditableFilters(
        undefined, // categories
        [], // accounts
        undefined, // dateRange
        'account', // groupBy
        undefined, // securities
        undefined, // investmentActions
        '', // asOfDate — empty string means "chip defaults to today"
    )

    const result = toChipChanges(editableFilters, accountsLT)

    t.same(result.selectedAccounts, [])
    t.equal(result.dateRangeKey, undefined, 'no dateRangeKey when dateRange is undefined')
    t.equal(result.asOfDate, '', 'empty string asOfDate preserved')
    t.equal(result.groupBy, 'account')
    t.end()
})
