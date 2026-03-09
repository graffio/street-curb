// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, filters, tree config, and chip row overrides

import { CategoryReportColumns, InvestmentReportColumns } from '../columns/index.js'
import { AccountFilterChip } from '../components/filter-chips/AccountFilterChip.jsx'
import { AsOfDateChip } from '../components/filter-chips/AsOfDateChip.jsx'
import { CategoryFilterChip } from '../components/filter-chips/CategoryFilterChip.jsx'
import { DateFilterChip } from '../components/filter-chips/DateFilterChip.jsx'
import { GroupByFilterChip } from '../components/filter-chips/GroupByFilterChip.jsx'
import { SearchFilterChip } from '../components/filter-chips/SearchFilterChip.jsx'
import {
    ComputedRow,
    FinancialQuery,
    IRDateRange,
    IRFilter,
    IRGrouping,
    PivotExpression,
} from '../query-language/types/index.js'
import * as S from '../store/selectors.js'
import { PivotResultPage } from './PivotResultPage.jsx'
import { TimeSeriesResultPage } from './TimeSeriesResultPage.jsx'

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
    selector: S.Transactions.tree,
    columns: CategoryReportColumns,
    hiddenColumnsByGroup: { account: { account: false }, payee: { payee: false } },
    filters: [
        { component: DateFilterColumn },
        { component: CategoryFilterColumn },
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn },
        { component: SearchFilterColumn },
    ],
    getChildRows: row => row.children,
    getRowCanExpand: row => row.original.children.length > 0,
}

const POSITION_TREE_METADATA = {
    selector: S.Positions.tree,
    countSelector: S.Positions.asOf,
    itemLabel: 'positions',
    columns: InvestmentReportColumns,
    filters: [
        { component: AsOfDateColumn },
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn, props: { items: investmentGroupByItems } },
        { component: SearchFilterColumn },
    ],
    getChildRows: row => row.children,
    getRowCanExpand: row => row.original.children.length > 0,
}

const ENGINE_TRANSACTION_FILTERS = [
    { component: DateFilterColumn },
    { component: CategoryFilterColumn },
    { component: AccountFilterColumn },
    { component: GroupByFilterColumn },
    { component: SearchFilterColumn },
]

const ENGINE_TRANSACTION_TREE_METADATA = {
    ...TRANSACTION_TREE_METADATA,
    selector: undefined,
    defaultQueryIR: FinancialQuery.TransactionQuery(
        'transactions',
        undefined,
        undefined,
        undefined,
        IRGrouping('category'),
    ),
    filters: ENGINE_TRANSACTION_FILTERS,
}

const ENGINE_POSITION_TREE_METADATA = {
    ...POSITION_TREE_METADATA,
    selector: undefined,
    countSelector: undefined,
    defaultQueryIR: FinancialQuery.PositionQuery('positions', undefined, undefined, undefined, IRGrouping('account')),
    filters: [
        { component: AsOfDateColumn },
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn, props: { items: investmentGroupByItems } },
        { component: SearchFilterColumn },
    ],
}

// prettier-ignore
const SEED_QUERIES = {
    large_transactions:   FinancialQuery.TransactionQuery('large_transactions', undefined, IRFilter.LessThan('amount', -500), undefined, IRGrouping('category')),
    dining_multi_account: FinancialQuery.TransactionQuery('dining_multi_account', undefined, IRFilter.And([IRFilter.Equals('category', 'Food'), IRFilter.In('account', ['Primary Checking', 'Chase Sapphire'])]), undefined, IRGrouping('category')),
    exclude_transfers:    FinancialQuery.TransactionQuery('exclude_transfers', undefined, IRFilter.Not(IRFilter.Equals('category', 'Transfer')), undefined, IRGrouping('category')),
    payee_pattern:        FinancialQuery.TransactionQuery('payee_pattern', undefined, IRFilter.Matches('payee', '^Pac'), undefined, IRGrouping('category')),
    amount_range:         FinancialQuery.TransactionQuery('amount_range', undefined, IRFilter.Between('amount', -1000, -100), undefined, IRGrouping('category')),
    category_by_year:     FinancialQuery.TransactionQuery('category_by_year', 'Spending by category per year', undefined, undefined, IRGrouping('category', 'year'), [ComputedRow('Food % of Income', PivotExpression.Binary('/', PivotExpression.RowRef('Food'), PivotExpression.Binary('*', PivotExpression.RowRef('Income'), PivotExpression.Literal(-1))))]),
    net_worth:            FinancialQuery.SnapshotQuery('net_worth', 'Net worth over time', 'balances', undefined, undefined, IRDateRange.Year(2025), 'monthly'),
    spending_over_time:   FinancialQuery.SnapshotQuery('spending_over_time', 'Spending by category over time', 'balances', undefined, IRGrouping('category'), IRDateRange.Year(2025), 'monthly'),
}

// Seed query metadata — pre-filtered engine reports demonstrating compound IR filters
// prettier-ignore
const SEED_QUERY_METADATA = {
    large_transactions:   { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.large_transactions },
    exclude_transfers:    { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.exclude_transfers },
    amount_range:         { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.amount_range },
    dining_multi_account: { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.dining_multi_account },
    payee_pattern:        { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.payee_pattern },
    net_worth:            { page: TimeSeriesResultPage, defaultQueryIR: SEED_QUERIES.net_worth, filters: [{ component: DateFilterColumn }, { component: AccountFilterColumn }] },
    category_by_year:     { page: PivotResultPage, defaultQueryIR: SEED_QUERIES.category_by_year, filters: [{ component: DateFilterColumn }, { component: CategoryFilterColumn }, { component: AccountFilterColumn }, { component: SearchFilterColumn }] },
    spending_over_time:   { page: TimeSeriesResultPage, defaultQueryIR: SEED_QUERIES.spending_over_time, filters: [{ component: DateFilterColumn }, { component: CategoryFilterColumn }, { component: AccountFilterColumn }] },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const ReportMetadata = {
    TRANSACTION_TREE_METADATA, POSITION_TREE_METADATA,
    ENGINE_TRANSACTION_TREE_METADATA, ENGINE_POSITION_TREE_METADATA,
    SEED_QUERIES, SEED_QUERY_METADATA,
}

export { ReportMetadata }
