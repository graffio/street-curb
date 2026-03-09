// ABOUTME: Tests for to-financial-query-description — human-readable IR descriptions
// ABOUTME: Run with: yarn tap test/query-language/to-financial-query-description.tap.js

import { test } from 'tap'
import { FinancialQuery, IRDateRange, IRFilter, IRGrouping } from '../../src/query-language/types/index.js'
import { toFinancialQueryDescription } from '../../src/query-language/to-financial-query-description.js'

// ═════════════════════════════════════════════════
// TransactionQuery descriptions
// ═════════════════════════════════════════════════

test('TransactionQuery — bare', t => {
    const ir = FinancialQuery.TransactionQuery('test', undefined, undefined, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions', 'Then description is "transactions"')
    t.end()
})

test('TransactionQuery — with filter', t => {
    const ir = FinancialQuery.TransactionQuery(
        'test',
        undefined,
        IRFilter.Equals('category', 'Food'),
        undefined,
        undefined,
    )
    t.equal(toFinancialQueryDescription(ir), 'transactions where category = Food', 'Then includes filter')
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
// AccountQuery descriptions
// ═════════════════════════════════════════════════

test('AccountQuery — bare', t => {
    const ir = FinancialQuery.AccountQuery('test', undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'accounts', 'Then description is "accounts"')
    t.end()
})

test('AccountQuery — with filter', t => {
    const ir = FinancialQuery.AccountQuery('test', undefined, IRFilter.Equals('accountType', 'Bank'))
    t.equal(toFinancialQueryDescription(ir), 'accounts where accountType = Bank', 'Then includes filter')
    t.end()
})

// ═════════════════════════════════════════════════
// ExpressionQuery descriptions
// ═════════════════════════════════════════════════

test('ExpressionQuery — with description', t => {
    const ir = FinancialQuery.ExpressionQuery(
        'test',
        'Savings rate',
        FinancialQuery.TransactionQuery('left', undefined, undefined, undefined, undefined),
        FinancialQuery.TransactionQuery('right', undefined, undefined, undefined, undefined),
        { '@@typeName': 'IRExpression', '@@tagName': 'Literal', value: 42 },
    )
    t.equal(toFinancialQueryDescription(ir), 'Savings rate', 'Then uses description field')
    t.end()
})

test('ExpressionQuery — without description', t => {
    const ir = FinancialQuery.ExpressionQuery(
        'test',
        undefined,
        FinancialQuery.TransactionQuery('left', undefined, undefined, undefined, undefined),
        FinancialQuery.TransactionQuery('right', undefined, undefined, undefined, undefined),
        { '@@typeName': 'IRExpression', '@@tagName': 'Literal', value: 42 },
    )
    t.equal(toFinancialQueryDescription(ir), 'expression', 'Then falls back to "expression"')
    t.end()
})

// ═════════════════════════════════════════════════
// SnapshotQuery descriptions
// ═════════════════════════════════════════════════

test('SnapshotQuery — balances monthly', t => {
    const ir = FinancialQuery.SnapshotQuery('test', undefined, 'balances', undefined, IRDateRange.Year(2025), 'monthly')
    t.equal(toFinancialQueryDescription(ir), 'balances snapshots (monthly)', 'Then includes domain and interval')
    t.end()
})

test('SnapshotQuery — positions quarterly', t => {
    const ir = FinancialQuery.SnapshotQuery(
        'test',
        undefined,
        'positions',
        undefined,
        IRDateRange.Year(2025),
        'quarterly',
    )
    t.equal(toFinancialQueryDescription(ir), 'positions snapshots (quarterly)', 'Then includes domain and interval')
    t.end()
})

// ═════════════════════════════════════════════════
// RunningBalanceQuery descriptions
// ═════════════════════════════════════════════════

test('RunningBalanceQuery — bare', t => {
    const ir = FinancialQuery.RunningBalanceQuery('test', undefined, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'running balance', 'Then description is "running balance"')
    t.end()
})

test('RunningBalanceQuery — with filter', t => {
    const ir = FinancialQuery.RunningBalanceQuery('test', undefined, IRFilter.Equals('account', 'Checking'), undefined)
    t.equal(toFinancialQueryDescription(ir), 'running balance where account = Checking', 'Then includes filter')
    t.end()
})

// ═════════════════════════════════════════════════
// Compound filter descriptions
// ═════════════════════════════════════════════════

test('And filter description', t => {
    const filter = IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.LessThan('amount', -100)])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where category = Food and amount < -100',
        'Then joins with "and"',
    )
    t.end()
})

test('Or filter description', t => {
    const filter = IRFilter.Or([IRFilter.Equals('category', 'Food'), IRFilter.Equals('category', 'Housing')])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(
        toFinancialQueryDescription(ir),
        'transactions where (category = Food or category = Housing)',
        'Then wraps in parens',
    )
    t.end()
})

test('Not filter description', t => {
    const filter = IRFilter.Not(IRFilter.Equals('category', 'Transfer'))
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions where not category = Transfer', 'Then prefixes with "not"')
    t.end()
})

test('Between filter description', t => {
    const filter = IRFilter.Between('amount', -1000, -100)
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions where amount -1000–-100', 'Then uses dash notation')
    t.end()
})

test('Matches filter description', t => {
    const filter = IRFilter.Matches('payee', '^Pac')
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions where payee ~ /^Pac/', 'Then shows regex pattern')
    t.end()
})

test('GreaterThan filter description', t => {
    const filter = IRFilter.GreaterThan('amount', 1000)
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions where amount > 1000', 'Then uses > operator')
    t.end()
})

test('In filter description', t => {
    const filter = IRFilter.In('account', ['Checking', 'Savings'])
    const ir = FinancialQuery.TransactionQuery('test', undefined, filter, undefined, undefined)
    t.equal(toFinancialQueryDescription(ir), 'transactions where account in (Checking, Savings)', 'Then lists values')
    t.end()
})
