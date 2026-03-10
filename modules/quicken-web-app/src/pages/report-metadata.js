// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, filters, tree config, and chip row overrides

import {
    FinancialQuery,
    IRComputedRow,
    IRDateRange,
    IRFilter,
    IRGrouping,
    IRPivotExpression,
} from '@graffio/query-language'
import { CategoryReportColumns, InvestmentReportColumns } from '../columns/index.js'
import { AccountFilterChip } from '../components/filter-chips/AccountFilterChip.jsx'
import { AsOfDateChip } from '../components/filter-chips/AsOfDateChip.jsx'
import { CategoryFilterChip } from '../components/filter-chips/CategoryFilterChip.jsx'
import { DateFilterChip } from '../components/filter-chips/DateFilterChip.jsx'
import { GroupByFilterChip } from '../components/filter-chips/GroupByFilterChip.jsx'
import { SearchFilterChip } from '../components/filter-chips/SearchFilterChip.jsx'

const { AccountFilterColumn } = AccountFilterChip
const { AsOfDateColumn } = AsOfDateChip
const { CategoryFilterColumn } = CategoryFilterChip
const { DateFilterColumn } = DateFilterChip
const { GroupByFilterColumn, investmentGroupByItems } = GroupByFilterChip
const { SearchFilterColumn } = SearchFilterChip

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const TRANSACTION_TREE_METADATA = {
    getChildRows: row => row.children,
    getRowCanExpand: row => row.original.children.length > 0,
    columns: CategoryReportColumns,
    hiddenColumnsByGroup: { account: { account: false }, payee: { payee: false } },
    filters: [
        { component: DateFilterColumn },
        { component: CategoryFilterColumn },
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn },
        { component: SearchFilterColumn },
    ],
}

const POSITION_TREE_METADATA = {
    getChildRows: row => row.children,
    getRowCanExpand: row => row.original.children.length > 0,
    columns: InvestmentReportColumns,
    itemLabel: 'positions',
    filters: [
        { component: AsOfDateColumn },
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn, props: { items: investmentGroupByItems } },
        { component: SearchFilterColumn },
    ],
}

const categoryByYearComputation = [
    IRComputedRow(
        'Food % of Income',
        IRPivotExpression.Binary(
            '/',
            IRPivotExpression.RowRef('Food'),
            IRPivotExpression.Binary('*', IRPivotExpression.RowRef('Income'), IRPivotExpression.Literal(-1)),
        ),
    ),
]

// prettier-ignore
const BASE_QUERIES = {
    spending:           FinancialQuery.TransactionQuery.from({ name: 'spending',          grouping: IRGrouping('category') }),
    positions:          FinancialQuery.PositionQuery.from(   { name: 'positions',         grouping: IRGrouping('account') }),
    largeTransactions:  FinancialQuery.TransactionQuery.from({ name: 'largeTransactions', grouping: IRGrouping('category'), filter: IRFilter.LessThan('amount', -500) }),
    excludeTransfers:   FinancialQuery.TransactionQuery.from({ name: 'excludeTransfers',  grouping: IRGrouping('category'), filter: IRFilter.Not(IRFilter.Equals('category', 'Transfer')) }),
    amountRange:        FinancialQuery.TransactionQuery.from({ name: 'amountRange',       grouping: IRGrouping('category'), filter: IRFilter.Between('amount', -1000, -100) }),
    diningMultiAccount: FinancialQuery.TransactionQuery.from({ name: 'diningMultiAccount',grouping: IRGrouping('category'), filter: IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.In('account', ['Primary Checking', 'Chase Sapphire'])]) }),
    payeePattern:       FinancialQuery.TransactionQuery.from({ name: 'payeePattern',      grouping: IRGrouping('category'), filter: IRFilter.Matches('payee', '^Pac') }),
    categoryByYear:     FinancialQuery.TransactionQuery.from({ name: 'categoryByYear',    grouping: IRGrouping('category', 'year'), description: 'Spending by category per year', computed: categoryByYearComputation }),
    netWorth:           FinancialQuery.SnapshotQuery.from(   { name: 'netWorth',          domain: 'balances', dateRange: IRDateRange.Year(2025), interval: 'monthly', description: 'Net worth over time' }),
    spendingOverTime:   FinancialQuery.SnapshotQuery.from(   { name: 'spendingOverTime',  domain: 'balances', dateRange: IRDateRange.Year(2025), interval: 'monthly', description: 'Spending by category over time', grouping: IRGrouping('category') }),
}

// Report metadata — each key is a reportType that maps to a full QueryResultPage configuration
// prettier-ignore
const ReportMetadata = {
    spending:            { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.spending },
    positions:           { ...POSITION_TREE_METADATA,    baseQueryIR: BASE_QUERIES.positions },
    largeTransactions:   { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.largeTransactions },
    excludeTransfers:    { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.excludeTransfers },
    amountRange:         { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.amountRange },
    diningMultiAccount:  { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.diningMultiAccount },
    payeePattern:        { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.payeePattern },
    categoryByYear:      {                               baseQueryIR: BASE_QUERIES.categoryByYear,    filters: [{ component: DateFilterColumn }, { component: CategoryFilterColumn }, { component: AccountFilterColumn }, { component: SearchFilterColumn }] },
    netWorth:            { chart: true,                  baseQueryIR: BASE_QUERIES.netWorth,          filters: [{ component: DateFilterColumn }, { component: AccountFilterColumn }] },
    spendingOverTime:    { chart: true,                  baseQueryIR: BASE_QUERIES.spendingOverTime,  filters: [{ component: DateFilterColumn }, { component: CategoryFilterColumn }, { component: AccountFilterColumn }] },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { ReportMetadata }
