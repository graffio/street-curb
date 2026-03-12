// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, tree config, editableFilters on the IR, and utilityChips

import { IRFinancialQuery } from '@graffio/query-language'
import { CategoryReportColumns, InvestmentReportColumns } from '../columns/index.js'
import { GroupByFilterChip } from '../components/filter-chips/GroupByFilterChip.jsx'

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
}

const POSITION_TREE_METADATA = {
    getChildRows: row => row.children,
    getRowCanExpand: row => row.original.children.length > 0,
    columns: InvestmentReportColumns,
    itemLabel: 'positions',
}

// Seed queries as JSON — revived via IRFinancialQuery.fromJSON() to avoid importing IR construction
// types. The expression tree in categoryByYear is verbose as JSON but structurally necessary.
const fromJSON = IRFinancialQuery.fromJSON

const ALL_DATES = { '@@tagName': 'AllDates' }
const YEAR_2025 = { '@@tagName': 'Year', year: 2025 }

// prettier-ignore
const BASE_QUERIES = {
    spending:           fromJSON({ '@@tagName': 'TransactionQuery', name: 'spending',          grouping: { rows: 'category' }, editableFilters: { categories: [], accounts: [], dateRange: ALL_DATES, groupBy: 'category' } }),
    positions:          fromJSON({ '@@tagName': 'PositionQuery',    name: 'positions',         grouping: { rows: 'account' },  editableFilters: { accounts: [], groupBy: 'account', asOfDate: '' } }), // asOfDate '' = chip defaults to today
    largeTransactions:  fromJSON({ '@@tagName': 'TransactionQuery', name: 'largeTransactions', grouping: { rows: 'category' }, filter: { '@@tagName': 'LessThan', field: 'amount', value: -500 }, editableFilters: { categories: [], accounts: [], dateRange: ALL_DATES, groupBy: 'category' } }),
    excludeTransfers:   fromJSON({ '@@tagName': 'TransactionQuery', name: 'excludeTransfers',  grouping: { rows: 'category' }, filter: { '@@tagName': 'Not', filter: { '@@tagName': 'Equals', field: 'category', value: 'Transfer' } }, editableFilters: { accounts: [], dateRange: ALL_DATES, groupBy: 'category' } }),
    amountRange:        fromJSON({ '@@tagName': 'TransactionQuery', name: 'amountRange',       grouping: { rows: 'category' }, filter: { '@@tagName': 'Between', field: 'amount', low: -1000, high: -100 }, editableFilters: { categories: [], accounts: [], dateRange: ALL_DATES, groupBy: 'category' } }),
    diningMultiAccount: fromJSON({ '@@tagName': 'TransactionQuery', name: 'diningMultiAccount',grouping: { rows: 'category' }, editableFilters: { categories: ['Food'], accounts: ['Primary Checking', 'Chase Sapphire'], dateRange: ALL_DATES, groupBy: 'category' } }),
    payeePattern:       fromJSON({ '@@tagName': 'TransactionQuery', name: 'payeePattern',      grouping: { rows: 'category' }, filter: { '@@tagName': 'Matches', field: 'payee', pattern: '^Pac' } , editableFilters: { categories: [], accounts: [], dateRange: ALL_DATES, groupBy: 'category' } }),
    categoryByYear:     fromJSON({ '@@tagName': 'TransactionQuery', name: 'categoryByYear',    grouping: { rows: 'category', columns: 'year' }, description: 'Spending by category per year', computed: [{ name: 'Food % of Income', expression: { '@@tagName': 'Binary', op: '/', left: { '@@tagName': 'RowRef', name: 'Food' }, right: { '@@tagName': 'Binary', op: '*', left: { '@@tagName': 'RowRef', name: 'Income' }, right: { '@@tagName': 'Literal', value: -1 } } } }], editableFilters: { categories: [], accounts: [], dateRange: ALL_DATES } }),
    netWorth:           fromJSON({ '@@tagName': 'SnapshotQuery',    name: 'netWorth',          domain: 'balances', dateRange: YEAR_2025, interval: 'monthly', description: 'Net worth over time', editableFilters: { accounts: [], dateRange: YEAR_2025 } }),
    spendingOverTime:   fromJSON({ '@@tagName': 'SnapshotQuery',    name: 'spendingOverTime',  domain: 'balances', dateRange: YEAR_2025, interval: 'monthly', description: 'Spending by category over time', grouping: { rows: 'category' }, editableFilters: { categories: [], accounts: [], dateRange: YEAR_2025 } }),
}

// Report metadata — each key is a reportType that maps to a full QueryResultPage configuration
// prettier-ignore
const ReportMetadata = {
    spending:            { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.spending,           utilityChips: new Set(['search']) },
    positions:           { ...POSITION_TREE_METADATA,    baseQueryIR: BASE_QUERIES.positions,          utilityChips: new Set(['search']), groupByItems: GroupByFilterChip.investmentGroupByItems },
    largeTransactions:   { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.largeTransactions,  utilityChips: new Set(['search']) },
    excludeTransfers:    { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.excludeTransfers,   utilityChips: new Set(['search']) },
    amountRange:         { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.amountRange,        utilityChips: new Set(['search']) },
    diningMultiAccount:  { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.diningMultiAccount, utilityChips: new Set(['search']) },
    payeePattern:        { ...TRANSACTION_TREE_METADATA, baseQueryIR: BASE_QUERIES.payeePattern,       utilityChips: new Set(['search']) },
    categoryByYear:      {                               baseQueryIR: BASE_QUERIES.categoryByYear,     utilityChips: new Set(['search']) },
    netWorth:            { chart: true,                  baseQueryIR: BASE_QUERIES.netWorth,           utilityChips: new Set() },
    spendingOverTime:    { chart: true,                  baseQueryIR: BASE_QUERIES.spendingOverTime,   utilityChips: new Set() },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { ReportMetadata }
