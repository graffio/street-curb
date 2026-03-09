// ABOUTME: Tests for merge-chip-filters — variant-agnostic chip state → IR merge
// ABOUTME: Run with: yarn tap test/query-language/merge-chip-filters.tap.js

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { Account } from '../../src/types/index.js'
import { FinancialQuery, IRDateRange, IRFilter, IRGrouping } from '../../src/query-language/types/index.js'
import { MergeChipFilters } from '../../src/query-language/merge-chip-filters.js'

const { applyChipFilters, buildCombinedFilter, buildChipFilters, buildChipPatch } = MergeChipFilters

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

const txQuery = FinancialQuery.TransactionQuery('test', undefined, undefined, undefined, IRGrouping('category'))
const posQuery = FinancialQuery.PositionQuery('test', undefined, undefined, undefined, IRGrouping('account'))
const snapQuery = FinancialQuery.SnapshotQuery(
    'test',
    undefined,
    'balances',
    undefined,
    undefined,
    IRDateRange.Year(2025),
    'monthly',
)

// ═════════════════════════════════════════════════
// buildCombinedFilter
// ═════════════════════════════════════════════════

test('buildCombinedFilter — combines base filter with chip filters', t => {
    t.test('Given no chip filters', t => {
        const base = IRFilter.Equals('category', 'Food')
        t.equal(buildCombinedFilter(base, []), base, 'Then returns base filter unchanged')
        t.end()
    })
    t.test('Given no base filter and one chip filter', t => {
        const chip = IRFilter.Equals('category', 'Food')
        const result = buildCombinedFilter(undefined, [chip])
        t.equal(result, chip, 'Then returns the single chip filter')
        t.end()
    })
    t.test('Given no base filter and multiple chip filters', t => {
        const chips = [IRFilter.Equals('category', 'Food'), IRFilter.Equals('account', 'Checking')]
        const result = buildCombinedFilter(undefined, chips)
        t.equal(result['@@tagName'], 'And', 'Then wraps in And')
        t.equal(result.filters.length, 2, 'Then And has 2 children')
        t.end()
    })
    t.test('Given base filter and chip filters', t => {
        const base = IRFilter.Equals('category', 'Food')
        const chips = [IRFilter.Equals('account', 'Checking')]
        const result = buildCombinedFilter(base, chips)
        t.equal(result['@@tagName'], 'And', 'Then wraps in And')
        t.equal(result.filters.length, 2, 'Then And has base + chip')
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// buildChipFilters
// ═════════════════════════════════════════════════

test('buildChipFilters — converts chip state to IRFilter nodes', t => {
    t.test('Given empty chip state', t => {
        const result = buildChipFilters(emptyChipState, ACCOUNTS)
        t.same(result, [], 'Then returns empty array')
        t.end()
    })
    t.test('Given one selected category', t => {
        const state = { ...emptyChipState, selectedCategories: ['Food'] }
        const result = buildChipFilters(state, ACCOUNTS)
        t.equal(result.length, 1, 'Then returns one filter')
        t.equal(result[0]['@@tagName'], 'Equals', 'Then it is an Equals filter')
        t.equal(result[0].value, 'Food', 'Then value is Food')
        t.end()
    })
    t.test('Given multiple selected categories', t => {
        const state = { ...emptyChipState, selectedCategories: ['Food', 'Housing'] }
        const result = buildChipFilters(state, ACCOUNTS)
        t.equal(result.length, 1, 'Then returns one filter')
        t.equal(result[0]['@@tagName'], 'Or', 'Then it is an Or combinator')
        t.equal(result[0].filters.length, 2, 'Then Or has 2 children')
        t.end()
    })
    t.test('Given selected accounts', t => {
        const state = { ...emptyChipState, selectedAccounts: ['acc_000000000001', 'acc_000000000002'] }
        const result = buildChipFilters(state, ACCOUNTS)
        t.equal(result.length, 1, 'Then returns one filter')
        t.equal(result[0]['@@tagName'], 'In', 'Then it is an In filter')
        t.same(result[0].values, ['Checking', 'Savings'], 'Then values are account names')
        t.end()
    })
    t.test('Given a search query', t => {
        const state = { ...emptyChipState, filterQuery: 'coffee' }
        const result = buildChipFilters(state, ACCOUNTS)
        t.equal(result.length, 1, 'Then returns one filter')
        t.equal(result[0]['@@tagName'], 'Or', 'Then it is an Or combinator')
        t.equal(result[0].filters.length, 8, 'Then Or searches 8 fields')
        t.end()
    })
    t.test('Given a search query with regex special chars', t => {
        const state = { ...emptyChipState, filterQuery: '$100.00' }
        const result = buildChipFilters(state, ACCOUNTS)
        const firstMatch = result[0].filters[0]
        t.equal(firstMatch.pattern, '\\$100\\.00', 'Then special chars are escaped')
        t.end()
    })
    t.test('Given categories and accounts together', t => {
        const state = { ...emptyChipState, selectedCategories: ['Food'], selectedAccounts: ['acc_000000000001'] }
        const result = buildChipFilters(state, ACCOUNTS)
        t.equal(result.length, 2, 'Then returns two separate filters')
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// buildChipPatch
// ═════════════════════════════════════════════════

test('buildChipPatch — builds patch object from chip state', t => {
    t.test('Given empty chip state', t => {
        const patch = buildChipPatch(txQuery, emptyChipState, ACCOUNTS)
        t.same(patch, {}, 'Then returns empty patch')
        t.end()
    })
    t.test('Given category chip', t => {
        const state = { ...emptyChipState, selectedCategories: ['Food'] }
        const patch = buildChipPatch(txQuery, state, ACCOUNTS)
        t.ok(patch.filter, 'Then patch has filter')
        t.notOk(patch.dateRange, 'Then patch has no dateRange')
        t.notOk(patch.grouping, 'Then patch has no grouping')
        t.end()
    })
    t.test('Given groupBy chip with existing grouping', t => {
        const state = { ...emptyChipState, groupBy: 'payee' }
        const patch = buildChipPatch(txQuery, state, ACCOUNTS)
        t.ok(patch.grouping, 'Then patch has grouping')
        t.equal(patch.grouping.rows, 'payee', 'Then grouping rows is overridden')
        t.end()
    })
    t.test('Given groupBy chip overriding existing category grouping', t => {
        const state = { ...emptyChipState, groupBy: 'account' }
        const patch = buildChipPatch(txQuery, state, ACCOUNTS)
        t.ok(patch.grouping, 'Then patch has grouping')
        t.equal(patch.grouping.rows, 'account', 'Then grouping rows is overridden to account')
        t.end()
    })
    t.test('Given dateRange chip', t => {
        const state = { ...emptyChipState, dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') } }
        const patch = buildChipPatch(txQuery, state, ACCOUNTS)
        t.ok(patch.dateRange, 'Then patch has dateRange')
        t.equal(patch.dateRange['@@tagName'], 'Range', 'Then dateRange is a Range')
        t.equal(patch.dateRange.start, '2025-01-01', 'Then start is ISO formatted')
        t.equal(patch.dateRange.end, '2025-12-31', 'Then end is ISO formatted')
        t.end()
    })
    t.test('Given asOfDate chip on PositionQuery', t => {
        const state = { ...emptyChipState, asOfDate: '2025-06-15' }
        const patch = buildChipPatch(posQuery, state, ACCOUNTS)
        t.ok(patch.dateRange, 'Then patch has dateRange')
        t.equal(patch.dateRange.start, '2025-06-15', 'Then start equals asOfDate')
        t.equal(patch.dateRange.end, '2025-06-15', 'Then end equals asOfDate')
        t.end()
    })
    t.test('Given asOfDate chip on TransactionQuery', t => {
        const state = { ...emptyChipState, asOfDate: '2025-06-15' }
        const patch = buildChipPatch(txQuery, state, ACCOUNTS)
        t.ok(patch.dateRange, 'Then patch has dateRange (variant-agnostic)')
        t.equal(patch.dateRange.start, '2025-06-15', 'Then start equals asOfDate')
        t.end()
    })
    t.test('Given undefined asOfDate (default)', t => {
        const patch = buildChipPatch(txQuery, emptyChipState, ACCOUNTS)
        t.notOk(patch.dateRange, 'Then no dateRange patch when asOfDate is undefined')
        t.end()
    })
    t.test('Given asOfDate and dateRange chips together', t => {
        const state = {
            ...emptyChipState,
            asOfDate: '2025-06-15',
            dateRange: { start: new Date('2025-01-01'), end: new Date('2025-12-31') },
        }
        const patch = buildChipPatch(posQuery, state, ACCOUNTS)
        t.equal(patch.dateRange.start, '2025-06-15', 'Then asOfDate takes priority over dateRange')
        t.end()
    })
    t.end()
})

// ═════════════════════════════════════════════════
// applyChipFilters — variant-agnostic merge
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

test('applyChipFilters — TransactionQuery preserves all fields', t => {
    const ir = FinancialQuery.TransactionQuery(
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
    t.equal(result.filter['@@tagName'], 'And', 'Then filter is merged (And of base + chip)')
    t.end()
})

test('applyChipFilters — PositionQuery preserves all fields', t => {
    const ir = FinancialQuery.PositionQuery(
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

test('applyChipFilters — groupBy chip overrides existing grouping', t => {
    const state = { ...emptyChipState, groupBy: 'payee' }
    const result = applyChipFilters(txQuery, state, ACCOUNTS)
    t.equal(result.grouping.rows, 'payee', 'Then grouping rows is overridden to payee')
    t.end()
})

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
