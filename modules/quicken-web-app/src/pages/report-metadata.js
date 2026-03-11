// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, filters, tree config, and chip row overrides

import { IRFinancialQuery } from '@graffio/query-language'
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

// Seed queries as JSON — revived via IRFinancialQuery.fromJSON() to avoid importing IR construction
// types. The expression tree in categoryByYear is verbose as JSON but structurally necessary.
const fromJSON = IRFinancialQuery.fromJSON

// prettier-ignore
const BASE_QUERIES = {
    spending:           fromJSON({ '@@tagName': 'TransactionQuery', name: 'spending',          grouping: { rows: 'category' } }),
    positions:          fromJSON({ '@@tagName': 'PositionQuery',    name: 'positions',         grouping: { rows: 'account' } }),
    largeTransactions:  fromJSON({ '@@tagName': 'TransactionQuery', name: 'largeTransactions', grouping: { rows: 'category' }, filter: { '@@tagName': 'LessThan', field: 'amount', value: -500 } }),
    excludeTransfers:   fromJSON({ '@@tagName': 'TransactionQuery', name: 'excludeTransfers',  grouping: { rows: 'category' }, filter: { '@@tagName': 'Not', filter: { '@@tagName': 'Equals', field: 'category', value: 'Transfer' } } }),
    amountRange:        fromJSON({ '@@tagName': 'TransactionQuery', name: 'amountRange',       grouping: { rows: 'category' }, filter: { '@@tagName': 'Between', field: 'amount', low: -1000, high: -100 } }),
    diningMultiAccount: fromJSON({ '@@tagName': 'TransactionQuery', name: 'diningMultiAccount',grouping: { rows: 'category' }, filter: { '@@tagName': 'And', filters: [{ '@@tagName': 'Equals', field: 'category', value: 'Food' }, { '@@tagName': 'In', field: 'account', values: ['Primary Checking', 'Chase Sapphire'] }] } }),
    payeePattern:       fromJSON({ '@@tagName': 'TransactionQuery', name: 'payeePattern',      grouping: { rows: 'category' }, filter: { '@@tagName': 'Matches', field: 'payee', pattern: '^Pac' } }),
    categoryByYear:     fromJSON({ '@@tagName': 'TransactionQuery', name: 'categoryByYear',    grouping: { rows: 'category', columns: 'year' }, description: 'Spending by category per year', computed: [{ name: 'Food % of Income', expression: { '@@tagName': 'Binary', op: '/', left: { '@@tagName': 'RowRef', name: 'Food' }, right: { '@@tagName': 'Binary', op: '*', left: { '@@tagName': 'RowRef', name: 'Income' }, right: { '@@tagName': 'Literal', value: -1 } } } }] }),
    netWorth:           fromJSON({ '@@tagName': 'SnapshotQuery',    name: 'netWorth',          domain: 'balances', dateRange: { '@@tagName': 'Year', year: 2025 }, interval: 'monthly', description: 'Net worth over time' }),
    spendingOverTime:   fromJSON({ '@@tagName': 'SnapshotQuery',    name: 'spendingOverTime',  domain: 'balances', dateRange: { '@@tagName': 'Year', year: 2025 }, interval: 'monthly', description: 'Spending by category over time', grouping: { rows: 'category' } }),
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
