// ABOUTME: Tests for to-financial-query-description — human-readable IR descriptions
// ABOUTME: Run with: yarn tap test/to-financial-query-description.tap.js

import { test } from 'tap'
import { FinancialQuery, IRDateRange, IRFilter, IRGrouping } from '../src/types/index.js'
import { toFinancialQueryDescription } from '../src/to-financial-query-description.js'

// ═════════════════════════════════════════════════
// TransactionQuery descriptions
// ═════════════════════════════════════════════════

test('TransactionQuery — with default grouping', t => {
    const ir = FinancialQuery.TransactionQuery('test', undefined, undefined, undefined, IRGrouping('category'))
    t.equal(toFinancialQueryDescription(ir), 'transactions, grouped by category', 'Then description includes grouping')
    t.end()
})

test('TransactionQuery — with filter', t => {
    const ir = FinancialQuery.TransactionQuery(
        'test',
        undefined,
        IRFilter.Equals('category', 'Food'),
        undefined,
        IRGrouping('category'),
    )
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where category = Food, grouped by category',
        'Then includes filter and grouping',
    )
    t.end()
})

test('TransactionQuery — with grouping', t => {
    const ir = FinancialQuery.TransactionQuery('test', undefined, undefined, undefined, IRGrouping('payee'))
    t.equal(toFinancialQueryDescription(ir), 'transactions, grouped by payee', 'Then includes grouping')
    t.end()
})

test('TransactionQuery — with pivot grouping', t => {
    const ir = FinancialQuery.TransactionQuery('test', undefined, undefined, undefined, IRGrouping('category', 'year'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions, grouped by category by year',
        'Then includes row and column',
    )
    t.end()
})

test('TransactionQuery — with filter and grouping', t => {
    const ir = FinancialQuery.TransactionQuery(
        'test',
        undefined,
        IRFilter.LessThan('amount', -500),
        undefined,
        IRGrouping('category'),
    )
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where amount < -500, grouped by category',
        'Then includes both',
    )
    t.end()
})

// ═════════════════════════════════════════════════
// PositionQuery descriptions
// ═════════════════════════════════════════════════

test('PositionQuery — bare', t => {
    const ir = FinancialQuery.PositionQuery('test', undefined, undefined, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'positions', 'Then description is "positions"')
    t.end()
})

test('PositionQuery — with filter and grouping', t => {
    const ir = FinancialQuery.PositionQuery(
        'test',
        undefined,
        IRFilter.In('account', ['Brokerage']),
        undefined,
        IRGrouping('account'),
    )
    t.equal(
        toFinancialQueryDescription(ir),
        'positions where account in (Brokerage), grouped by account',
        'Then includes both',
    )
    t.end()
})

// ═════════════════════════════════════════════════
// SnapshotQuery descriptions
// ═════════════════════════════════════════════════

test('SnapshotQuery — balances monthly', t => {
    const ir = FinancialQuery.SnapshotQuery(
        'test',
        undefined,
        undefined,
        IRDateRange.Year(2025),
        undefined,
        'balances',
        'monthly',
    )
    t.equal(toFinancialQueryDescription(ir), 'balances snapshots (monthly)', 'Then includes domain and interval')
    t.end()
})

test('SnapshotQuery — positions quarterly', t => {
    const ir = FinancialQuery.SnapshotQuery(
        'test',
        undefined,
        undefined,
        IRDateRange.Year(2025),
        undefined,
        'positions',
        'quarterly',
    )
    t.equal(toFinancialQueryDescription(ir), 'positions snapshots (quarterly)', 'Then includes domain and interval')
    t.end()
})

// ═════════════════════════════════════════════════
// Compound filter descriptions
// ═════════════════════════════════════════════════

test('And filter description', t => {
    const filter = IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.LessThan('amount', -100)])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where category = Food and amount < -100, grouped by category',
        'Then joins with "and"',
    )
    t.end()
})

test('Or filter description', t => {
    const filter = IRFilter.Or([IRFilter.Equals('category', 'Food'), IRFilter.Equals('category', 'Housing')])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where (category = Food or category = Housing), grouped by category',
        'Then wraps in parens',
    )
    t.end()
})

test('Not filter description', t => {
    const filter = IRFilter.Not(IRFilter.Equals('category', 'Transfer'))
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where not category = Transfer, grouped by category',
        'Then prefixes with "not"',
    )
    t.end()
})

test('Between filter description', t => {
    const filter = IRFilter.Between('amount', -1000, -100)
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where amount -1000–-100, grouped by category',
        'Then uses dash notation',
    )
    t.end()
})

test('Matches filter description', t => {
    const filter = IRFilter.Matches('payee', '^Pac')
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where payee ~ /^Pac/, grouped by category',
        'Then shows regex pattern',
    )
    t.end()
})

test('GreaterThan filter description', t => {
    const filter = IRFilter.GreaterThan('amount', 1000)
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where amount > 1000, grouped by category',
        'Then uses > operator',
    )
    t.end()
})

test('In filter description', t => {
    const filter = IRFilter.In('account', ['Checking', 'Savings'])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, IRGrouping('category'))
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where account in (Checking, Savings), grouped by category',
        'Then lists values',
    )
    t.end()
})
