// ABOUTME: Tests for generator-emitted fromJSON — JSON.parse(JSON.stringify()) → fromJSON produces Tagged instances
// ABOUTME: Run with: yarn tap test/from-json-round-trip.tap.js

import { test } from 'tap'
import {
    IRFinancialQuery,
    IRFilter,
    IRDateRange,
    IRGrouping,
    IRComputedRow,
    IRPivotExpression,
} from '../src/types/index.js'

// Helper: full JSON round-trip (matches real-world serialization path)
const roundTrip = original => JSON.parse(JSON.stringify(original))

// ═════════════════════════════════════════════════
// IRDateRange round-trips
// ═════════════════════════════════════════════════

test('IRDateRange.fromJSON — Year variant', t => {
    const revived = IRDateRange.fromJSON(roundTrip(IRDateRange.Year(2025)))
    t.equal(revived['@@tagName'], 'Year', 'Then tag is preserved')
    t.equal(revived.year, 2025, 'Then year is preserved')
    t.end()
})

test('IRDateRange.fromJSON — Quarter variant', t => {
    const revived = IRDateRange.fromJSON(roundTrip(IRDateRange.Quarter(1, 2025)))
    t.equal(revived['@@tagName'], 'Quarter', 'Then tag is preserved')
    t.equal(revived.quarter, 1, 'Then quarter is preserved')
    t.equal(revived.year, 2025, 'Then year is preserved')
    t.end()
})

test('IRDateRange.fromJSON — Range variant', t => {
    const revived = IRDateRange.fromJSON(roundTrip(IRDateRange.Range('2025-01-01', '2025-12-31')))
    t.equal(revived['@@tagName'], 'Range', 'Then tag is preserved')
    t.equal(revived.start, '2025-01-01', 'Then start is preserved')
    t.equal(revived.end, '2025-12-31', 'Then end is preserved')
    t.end()
})

test('IRDateRange.fromJSON — null/undefined passthrough', t => {
    t.equal(IRDateRange.fromJSON(null), null, 'Then null returns null')
    t.equal(IRDateRange.fromJSON(undefined), undefined, 'Then undefined returns undefined')
    t.end()
})

test('IRDateRange.fromJSON — throws on missing @@tagName', t => {
    t.throws(() => IRDateRange.fromJSON({ year: 2025 }), /missing @@tagName/, 'Then throws descriptive error')
    t.end()
})

// ═════════════════════════════════════════════════
// IRGrouping round-trips
// ═════════════════════════════════════════════════

test('IRGrouping.fromJSON — rows only', t => {
    const revived = IRGrouping.fromJSON(roundTrip(IRGrouping('category')))
    t.equal(revived.rows, 'category', 'Then rows is preserved')
    t.equal(revived.columns, undefined, 'Then columns stays undefined')
    t.end()
})

test('IRGrouping.fromJSON — rows and columns', t => {
    const revived = IRGrouping.fromJSON(roundTrip(IRGrouping('category', 'year')))
    t.equal(revived.rows, 'category', 'Then rows is preserved')
    t.equal(revived.columns, 'year', 'Then columns is preserved')
    t.end()
})

test('IRGrouping.fromJSON — null/undefined passthrough', t => {
    t.equal(IRGrouping.fromJSON(null), null, 'Then null returns null')
    t.equal(IRGrouping.fromJSON(undefined), undefined, 'Then undefined returns undefined')
    t.end()
})

// ═════════════════════════════════════════════════
// IRFilter round-trips
// ═════════════════════════════════════════════════

test('IRFilter.fromJSON — leaf Equals', t => {
    const revived = IRFilter.fromJSON(roundTrip(IRFilter.Equals('category', 'Food')))
    t.equal(revived['@@tagName'], 'Equals', 'Then tag is preserved')
    t.equal(revived.field, 'category', 'Then field is preserved')
    t.equal(revived.value, 'Food', 'Then value is preserved')
    t.end()
})

test('IRFilter.fromJSON — In variant', t => {
    const revived = IRFilter.fromJSON(roundTrip(IRFilter.In('account', ['Checking', 'Savings'])))
    t.equal(revived['@@tagName'], 'In', 'Then tag is preserved')
    t.equal(revived.field, 'account', 'Then field is preserved')
    t.same(revived.values, ['Checking', 'Savings'], 'Then values array is preserved')
    t.end()
})

test('IRFilter.fromJSON — Between variant', t => {
    const revived = IRFilter.fromJSON(roundTrip(IRFilter.Between('amount', -500, -100)))
    t.equal(revived['@@tagName'], 'Between', 'Then tag is preserved')
    t.equal(revived.low, -500, 'Then low is preserved')
    t.equal(revived.high, -100, 'Then high is preserved')
    t.end()
})

test('IRFilter.fromJSON — nested And with children', t => {
    const original = IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.LessThan('amount', -100)])
    const revived = IRFilter.fromJSON(roundTrip(original))
    t.equal(revived['@@tagName'], 'And', 'Then And tag is preserved')
    t.equal(revived.filters.length, 2, 'Then has 2 children')
    t.equal(revived.filters[0]['@@tagName'], 'Equals', 'Then first child is Equals')
    t.equal(revived.filters[1]['@@tagName'], 'LessThan', 'Then second child is LessThan')
    t.end()
})

test('IRFilter.fromJSON — deeply nested Not(And([Or()]))', t => {
    const original = IRFilter.Not(
        IRFilter.And([IRFilter.Or([IRFilter.Equals('category', 'Food'), IRFilter.Equals('category', 'Housing')])]),
    )
    const revived = IRFilter.fromJSON(roundTrip(original))
    t.equal(revived['@@tagName'], 'Not', 'Then Not tag is preserved')
    t.equal(revived.filter['@@tagName'], 'And', 'Then inner And is preserved')
    t.equal(revived.filter.filters[0]['@@tagName'], 'Or', 'Then inner Or is preserved')
    t.equal(revived.filter.filters[0].filters.length, 2, 'Then Or has 2 children')
    t.end()
})

test('IRFilter.fromJSON — throws on missing @@tagName', t => {
    t.throws(() => IRFilter.fromJSON({ field: 'category', value: 'Food' }), /missing @@tagName/, 'Then throws')
    t.end()
})

// ═════════════════════════════════════════════════
// IRPivotExpression round-trips
// ═════════════════════════════════════════════════

test('IRPivotExpression.fromJSON — RowRef', t => {
    const revived = IRPivotExpression.fromJSON(roundTrip(IRPivotExpression.RowRef('Income')))
    t.equal(revived['@@tagName'], 'RowRef', 'Then tag is preserved')
    t.equal(revived.name, 'Income', 'Then name is preserved')
    t.end()
})

test('IRPivotExpression.fromJSON — Literal', t => {
    const revived = IRPivotExpression.fromJSON(roundTrip(IRPivotExpression.Literal(42)))
    t.equal(revived['@@tagName'], 'Literal', 'Then tag is preserved')
    t.equal(revived.value, 42, 'Then value is preserved')
    t.end()
})

test('IRPivotExpression.fromJSON — Binary with nested expressions', t => {
    const original = IRPivotExpression.Binary(
        '-',
        IRPivotExpression.RowRef('Income'),
        IRPivotExpression.RowRef('Expenses'),
    )
    const revived = IRPivotExpression.fromJSON(roundTrip(original))
    t.equal(revived['@@tagName'], 'Binary', 'Then Binary tag is preserved')
    t.equal(revived.op, '-', 'Then operator is preserved')
    t.equal(revived.left['@@tagName'], 'RowRef', 'Then left is RowRef')
    t.equal(revived.right['@@tagName'], 'RowRef', 'Then right is RowRef')
    t.end()
})

// ═════════════════════════════════════════════════
// IRComputedRow round-trips
// ═════════════════════════════════════════════════

test('IRComputedRow.fromJSON — with IRPivotExpression', t => {
    const original = IRComputedRow(
        'Net',
        IRPivotExpression.Binary('-', IRPivotExpression.RowRef('Income'), IRPivotExpression.RowRef('Expenses')),
    )
    const revived = IRComputedRow.fromJSON(roundTrip(original))
    t.equal(revived.name, 'Net', 'Then name is preserved')
    t.equal(revived.expression['@@tagName'], 'Binary', 'Then expression is revived')
    t.equal(revived.expression.left['@@tagName'], 'RowRef', 'Then nested left is revived')
    t.end()
})

test('IRComputedRow.fromJSON — null/undefined passthrough', t => {
    t.equal(IRComputedRow.fromJSON(null), null, 'Then null returns null')
    t.equal(IRComputedRow.fromJSON(undefined), undefined, 'Then undefined returns undefined')
    t.end()
})

// ═════════════════════════════════════════════════
// IRFinancialQuery round-trips
// ═════════════════════════════════════════════════

test('IRFinancialQuery.fromJSON — TransactionQuery with all nested types', t => {
    const computed = [
        IRComputedRow(
            'Net',
            IRPivotExpression.Binary('-', IRPivotExpression.RowRef('Income'), IRPivotExpression.RowRef('Expenses')),
        ),
    ]
    const original = IRFinancialQuery.TransactionQuery.from({
        name: 'test',
        description: 'A test query',
        filter: IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.LessThan('amount', -100)]),
        dateRange: IRDateRange.Year(2025),
        grouping: IRGrouping('category', 'year'),
        computed,
    })
    const revived = IRFinancialQuery.fromJSON(roundTrip(original))

    t.equal(revived['@@tagName'], 'TransactionQuery', 'Then variant is preserved')
    t.equal(revived.name, 'test', 'Then name is preserved')
    t.equal(revived.description, 'A test query', 'Then description is preserved')
    t.equal(revived.filter['@@tagName'], 'And', 'Then filter is revived as And')
    t.equal(revived.filter.filters.length, 2, 'Then filter children are revived')
    t.equal(revived.dateRange['@@tagName'], 'Year', 'Then dateRange is revived')
    t.equal(revived.dateRange.year, 2025, 'Then dateRange year is preserved')
    t.equal(revived.grouping.rows, 'category', 'Then grouping rows is preserved')
    t.equal(revived.grouping.columns, 'year', 'Then grouping columns is preserved')
    t.equal(revived.computed.length, 1, 'Then computed is revived')
    t.equal(revived.computed[0].expression['@@tagName'], 'Binary', 'Then computed expression is revived')
    t.end()
})

test('IRFinancialQuery.fromJSON — PositionQuery minimal', t => {
    const original = IRFinancialQuery.PositionQuery.from({ name: 'positions', grouping: IRGrouping('account') })
    const revived = IRFinancialQuery.fromJSON(roundTrip(original))

    t.equal(revived['@@tagName'], 'PositionQuery', 'Then variant is preserved')
    t.equal(revived.name, 'positions', 'Then name is preserved')
    t.equal(revived.grouping.rows, 'account', 'Then grouping is revived')
    t.end()
})

test('IRFinancialQuery.fromJSON — SnapshotQuery', t => {
    const original = IRFinancialQuery.SnapshotQuery.from({
        name: 'netWorth',
        domain: 'balances',
        dateRange: IRDateRange.Year(2025),
        interval: 'monthly',
    })
    const revived = IRFinancialQuery.fromJSON(roundTrip(original))

    t.equal(revived['@@tagName'], 'SnapshotQuery', 'Then variant is preserved')
    t.equal(revived.name, 'netWorth', 'Then name is preserved')
    t.equal(revived.domain, 'balances', 'Then domain is preserved')
    t.equal(revived.dateRange['@@tagName'], 'Year', 'Then dateRange is revived')
    t.equal(revived.interval, 'monthly', 'Then interval is preserved')
    t.end()
})

test('IRFinancialQuery.fromJSON — AccountQuery minimal', t => {
    const original = IRFinancialQuery.AccountQuery.from({ name: 'accounts' })
    const revived = IRFinancialQuery.fromJSON(roundTrip(original))

    t.equal(revived['@@tagName'], 'AccountQuery', 'Then variant is preserved')
    t.equal(revived.name, 'accounts', 'Then name is preserved')
    t.end()
})

test('IRFinancialQuery.fromJSON — AccountQuery with filter', t => {
    const original = IRFinancialQuery.AccountQuery.from({
        name: 'filtered',
        filter: IRFilter.Equals('account', 'Checking'),
        dateRange: IRDateRange.Range('2025-01-01', '2025-12-31'),
    })
    const revived = IRFinancialQuery.fromJSON(roundTrip(original))

    t.equal(revived['@@tagName'], 'AccountQuery', 'Then variant is preserved')
    t.equal(revived.filter['@@tagName'], 'Equals', 'Then filter is revived')
    t.equal(revived.dateRange['@@tagName'], 'Range', 'Then dateRange is revived')
    t.end()
})

test('IRFinancialQuery.fromJSON — null/undefined passthrough', t => {
    t.equal(IRFinancialQuery.fromJSON(null), null, 'Then null returns null')
    t.equal(IRFinancialQuery.fromJSON(undefined), undefined, 'Then undefined returns undefined')
    t.end()
})

test('IRFinancialQuery.fromJSON — throws on missing @@tagName', t => {
    t.throws(() => IRFinancialQuery.fromJSON({ name: 'test' }), /missing @@tagName/, 'Then throws')
    t.end()
})
