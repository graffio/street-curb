// ABOUTME: Tests for applyChipFilters — variant-agnostic chip state → IR merge
// ABOUTME: Run with: yarn tap test/apply-chip-filters.tap.js

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { Account, IRFinancialQuery, IRDateRange, IRFilter, IRGrouping } from '../src/types/index.js'
import { applyChipFilters } from '../src/apply-chip-filters.js'

// ═════════════════════════════════════════════════
// Test fixtures
// ═════════════════════════════════════════════════

const ACCOUNTS = LookupTable(
    [
        Account('acc_000000000001', 'Checking', 'Bank'),
        Account('acc_000000000002', 'Savings', 'Bank'),
        Account('acc_000000000003', 'Brokerage', 'Investment'),
    ],
    Account,
    'id',
)

const emptyChipState = {
    selectedCategories: [],
    selectedAccounts: [],
    filterQuery: '',
    groupBy: undefined,
    dateRange: undefined,
    asOfDate: undefined,
}

const txQuery = IRFinancialQuery.TransactionQuery('test', undefined, undefined, undefined, IRGrouping('category'))
const posQuery = IRFinancialQuery.PositionQuery('test', undefined, undefined, undefined, IRGrouping('account'))
const snapQuery = IRFinancialQuery.SnapshotQuery(
    'test',
    undefined,
    undefined,
    IRDateRange.Year(2025),
    undefined,
    'balances',
    'monthly',
)

// ═════════════════════════════════════════════════
// No-op cases
// ═════════════════════════════════════════════════

test('applyChipFilters — returns ir unchanged when no chip state', t => {
    t.equal(applyChipFilters(txQuery, undefined, ACCOUNTS), txQuery, 'Then returns same reference')
    t.equal(applyChipFilters(txQuery, null, ACCOUNTS), txQuery, 'Then returns same reference for null')
    t.end()
})

test('applyChipFilters — returns ir unchanged when chip state is empty', t => {
    t.equal(applyChipFilters(txQuery, emptyChipState, ACCOUNTS), txQuery, 'Then returns same reference')
    t.end()
})

// ═════════════════════════════════════════════════
// Category chip
// ═════════════════════════════════════════════════

test('applyChipFilters — one category produces Equals filter', t => {
    const state = { ...emptyChipState, selectedCategories: ['Food'] }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'Equals', 'Then filter is Equals (single category, no base)')
    t.equal(result.filter.value, 'Food', 'Then value is Food')
    t.end()
})

test('applyChipFilters — multiple categories produces Or of Equals', t => {
    const state = { ...emptyChipState, selectedCategories: ['Food', 'Housing'] }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'Or', 'Then filter is Or combinator')
    t.equal(result.filter.filters.length, 2, 'Then Or has 2 children')
    t.end()
})

// ═════════════════════════════════════════════════
// Account chip
// ═════════════════════════════════════════════════

test('applyChipFilters — account selection resolves IDs to names', t => {
    const state = { ...emptyChipState, selectedAccounts: ['acc_000000000001', 'acc_000000000002'] }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'In', 'Then filter is In')
    t.same(result.filter.values, ['Checking', 'Savings'], 'Then values are resolved account names')
    t.end()
})

// ═════════════════════════════════════════════════
// Search chip
// ═════════════════════════════════════════════════

test('applyChipFilters — search query produces Or of Matches across 8 fields', t => {
    const state = { ...emptyChipState, filterQuery: 'coffee' }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'Or', 'Then filter is Or')
    t.equal(result.filter.filters.length, 8, 'Then Or searches 8 fields')
    t.end()
})

test('applyChipFilters — search query escapes regex special chars', t => {
    const state = { ...emptyChipState, filterQuery: '$100.00' }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    const firstMatch = result.filter.filters[0]
    t.equal(firstMatch.pattern, '\\$100\\.00', 'Then special chars are escaped')
    t.end()
})

// ═════════════════════════════════════════════════
// Filter combination with base filter
// ═════════════════════════════════════════════════

test('applyChipFilters — chip filter merges with existing base filter via And', t => {
    const ir = IRFinancialQuery.TransactionQuery(
        'tx',
        undefined,
        IRFilter.Equals('category', 'Food'),
        undefined,
        IRGrouping('category'),
    )
    const state = { ...emptyChipState, selectedAccounts: ['acc_000000000001'] }
    const result = applyChipFilters(ir, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'And', 'Then filter is And (base + chip)')
    t.equal(result.filter.filters.length, 2, 'Then And has base + chip')
    t.end()
})

test('applyChipFilters — category and account chips produce And of two filters', t => {
    const state = { ...emptyChipState, selectedCategories: ['Food'], selectedAccounts: ['acc_000000000001'] }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.filter['@@tagName'], 'And', 'Then filter is And (category + account)')
    t.equal(result.filter.filters.length, 2, 'Then And has 2 children')
    t.end()
})

// ═════════════════════════════════════════════════
// GroupBy chip
// ═════════════════════════════════════════════════

test('applyChipFilters — groupBy chip overrides existing grouping', t => {
    const state = { ...emptyChipState, groupBy: 'payee' }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.grouping.rows, 'payee', 'Then grouping rows is overridden to payee')
    t.end()
})

// ═════════════════════════════════════════════════
// DateRange chip
// ═════════════════════════════════════════════════

test('applyChipFilters — dateRange chip converts Date objects to ISO strings', t => {
    const state = { ...emptyChipState, dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') } }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.dateRange['@@tagName'], 'Range', 'Then dateRange is a Range')
    t.equal(result.dateRange.start, '2025-01-01', 'Then start is ISO formatted')
    t.equal(result.dateRange.end, '2025-12-31', 'Then end is ISO formatted')
    t.end()
})

// ═════════════════════════════════════════════════
// AsOfDate chip
// ═════════════════════════════════════════════════

test('applyChipFilters — asOfDate produces single-day Range', t => {
    const state = { ...emptyChipState, asOfDate: '2025-06-15' }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result.dateRange.start, '2025-06-15', 'Then start equals asOfDate')
    t.equal(result.dateRange.end, '2025-06-15', 'Then end equals asOfDate')
    t.end()
})

test('applyChipFilters — asOfDate takes priority over dateRange', t => {
    const state = {
        ...emptyChipState,
        asOfDate: '2025-06-15',
        dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
    }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result.dateRange.start, '2025-06-15', 'Then asOfDate wins over dateRange')
    t.equal(result.dateRange.end, '2025-06-15', 'Then end also equals asOfDate')
    t.end()
})

// ═════════════════════════════════════════════════
// Variant preservation
// ═════════════════════════════════════════════════

test('applyChipFilters — TransactionQuery preserves all fields', t => {
    const ir = IRFinancialQuery.TransactionQuery(
        'tx',
        'desc',
        IRFilter.Equals('category', 'Food'),
        IRDateRange.Year(2025),
        IRGrouping('category', 'year'),
        undefined,
    )
    const state = { ...emptyChipState, selectedAccounts: ['acc_000000000001'] }
    const result = applyChipFilters(ir, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'TransactionQuery', 'Then result is a TransactionQuery')
    t.equal(result.name, 'tx', 'Then name preserved')
    t.equal(result.description, 'desc', 'Then description preserved')
    t.equal(result.dateRange.year, 2025, 'Then dateRange preserved when no chip date')
    t.equal(result.grouping.rows, 'category', 'Then grouping preserved when no chip groupBy')
    t.equal(result.grouping.columns, 'year', 'Then grouping columns preserved')
    t.end()
})

test('applyChipFilters — PositionQuery preserves all fields', t => {
    const ir = IRFinancialQuery.PositionQuery(
        'pos',
        'desc',
        undefined,
        undefined,
        IRGrouping('account'),
        ['totalReturn'],
        'totalReturn',
        'desc',
        10,
    )
    const state = { ...emptyChipState, selectedCategories: ['Food'] }
    const result = applyChipFilters(ir, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'PositionQuery', 'Then result is a PositionQuery')
    t.equal(result.name, 'pos', 'Then name preserved')
    t.same(result.metrics, ['totalReturn'], 'Then metrics preserved')
    t.equal(result.orderByField, 'totalReturn', 'Then orderByField preserved')
    t.equal(result.orderByDirection, 'desc', 'Then orderByDirection preserved')
    t.equal(result.limit, 10, 'Then limit preserved')
    t.end()
})

test('applyChipFilters — SnapshotQuery merges filter and dateRange', t => {
    const state = {
        ...emptyChipState,
        selectedAccounts: ['acc_000000000001'],
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
    }
    const result = applyChipFilters(snapQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'SnapshotQuery', 'Then result is a SnapshotQuery')
    t.ok(result.filter, 'Then filter is set')
    t.equal(result.dateRange.start, '2024-01-01', 'Then dateRange is overridden')
    t.equal(result.domain, 'balances', 'Then domain preserved')
    t.equal(result.interval, 'monthly', 'Then interval preserved')
    t.end()
})

// ═════════════════════════════════════════════════
// Cross-variant chip coverage
// ═════════════════════════════════════════════════

test('applyChipFilters — groupBy chip overrides PositionQuery grouping to goal', t => {
    const state = { ...emptyChipState, groupBy: 'goal' }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'PositionQuery', 'Then result is a PositionQuery')
    t.equal(result.grouping.rows, 'goal', 'Then grouping rows is overridden to goal')
    t.end()
})

test('applyChipFilters — groupBy chip overrides PositionQuery grouping to securityType', t => {
    const state = { ...emptyChipState, groupBy: 'securityType' }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'PositionQuery', 'Then result is a PositionQuery')
    t.equal(result.grouping.rows, 'securityType', 'Then grouping rows is overridden to securityType')
    t.end()
})

test('applyChipFilters — category chip on SnapshotQuery preserves domain and interval', t => {
    const state = { ...emptyChipState, selectedCategories: ['Food'] }
    const result = applyChipFilters(snapQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'SnapshotQuery', 'Then result is a SnapshotQuery')
    t.ok(result.filter, 'Then filter is set')
    t.equal(result.domain, 'balances', 'Then domain preserved')
    t.equal(result.interval, 'monthly', 'Then interval preserved')
    t.end()
})

test('applyChipFilters — account chip applies filter to PositionQuery', t => {
    const state = { ...emptyChipState, selectedAccounts: ['acc_000000000001'] }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'PositionQuery', 'Then result is a PositionQuery')
    t.equal(result.filter['@@tagName'], 'In', 'Then filter is In')
    t.same(result.filter.values, ['Checking'], 'Then values are resolved account names')
    t.end()
})

test('applyChipFilters — search chip applies filter to PositionQuery', t => {
    const state = { ...emptyChipState, filterQuery: 'AAPL' }
    const result = applyChipFilters(posQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'PositionQuery', 'Then result is a PositionQuery')
    t.equal(result.filter['@@tagName'], 'Or', 'Then filter is Or')
    t.equal(result.filter.filters.length, 8, 'Then Or searches 8 fields')
    t.end()
})

// ═════════════════════════════════════════════════
// Combined chips
// ═════════════════════════════════════════════════

test('applyChipFilters — multiple chip types applied simultaneously', t => {
    const state = {
        ...emptyChipState,
        selectedCategories: ['Food'],
        selectedAccounts: ['acc_000000000001'],
        filterQuery: 'coffee',
        groupBy: 'payee',
        dateRange: { start: new Date('2025-01-01'), end: new Date('2025-06-30') },
    }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result['@@tagName'], 'TransactionQuery', 'Then result is a TransactionQuery')
    t.equal(result.filter['@@tagName'], 'And', 'Then filter is And (combined)')
    t.equal(result.grouping.rows, 'payee', 'Then grouping overridden')
    t.equal(result.dateRange.start, '2025-01-01', 'Then dateRange overridden')
    t.end()
})
