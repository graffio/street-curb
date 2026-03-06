// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, filters, tree config, and chip row overrides

import { LookupTable } from '@graffio/functional'
import { CategoryReportColumns, InvestmentReportColumns } from '../columns/index.js'
import { AccountFilterChip } from '../components/filter-chips/AccountFilterChip.jsx'
import { AsOfDateChip } from '../components/filter-chips/AsOfDateChip.jsx'
import { CategoryFilterChip } from '../components/filter-chips/CategoryFilterChip.jsx'
import { DateFilterChip } from '../components/filter-chips/DateFilterChip.jsx'
import { GroupByFilterChip } from '../components/filter-chips/GroupByFilterChip.jsx'
import { SearchFilterChip } from '../components/filter-chips/SearchFilterChip.jsx'
import { IRComputation, IRDomain, IRFilter, IRSource, Query } from '../query-language/types/index.js'
import * as S from '../store/selectors.js'

const { AccountFilterColumn } = AccountFilterChip
const { AsOfDateColumn } = AsOfDateChip
const { CategoryFilterColumn } = CategoryFilterChip
const { DateFilterColumn } = DateFilterChip
const { GroupByFilterColumn, investmentGroupByItems } = GroupByFilterChip
const { SearchFilterColumn } = SearchFilterChip

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Build a Query IR with a single Identity source
    // @sig toQuery :: (String, IRDomain, String, IRFilter?) -> Query
    toQuery: (name, domain, groupBy, filter) =>
        Query(
            name,
            undefined,
            LookupTable([IRSource('_default', domain, filter, undefined, groupBy)], IRSource, 'name'),
            IRComputation.Identity('_default'),
            undefined,
        ),
}

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
    { component: CategoryFilterColumn },
    { component: AccountFilterColumn },
    { component: GroupByFilterColumn },
]

const ENGINE_TRANSACTION_TREE_METADATA = {
    ...TRANSACTION_TREE_METADATA,
    selector: undefined,
    defaultQueryIR: T.toQuery('transactions', IRDomain.Transactions(), 'category'),
    filters: ENGINE_TRANSACTION_FILTERS,
}

const ENGINE_POSITION_TREE_METADATA = {
    ...POSITION_TREE_METADATA,
    selector: undefined,
    countSelector: undefined,
    defaultQueryIR: T.toQuery('positions', IRDomain.Positions(), 'account'),
    filters: [
        { component: AccountFilterColumn },
        { component: GroupByFilterColumn, props: { items: investmentGroupByItems } },
    ],
}

// prettier-ignore
const SEED_QUERIES = {
    large_transactions:   T.toQuery('large_transactions', IRDomain.Transactions(), 'category', IRFilter.LessThan('amount', -500)),
    dining_multi_account: T.toQuery('dining_multi_account', IRDomain.Transactions(), 'category', IRFilter.And([IRFilter.Equals('category', 'Food:Dining'), IRFilter.In('account', ['Checking', 'Savings'])])),
    exclude_transfers:    T.toQuery('exclude_transfers', IRDomain.Transactions(), 'category', IRFilter.Not(IRFilter.Equals('category', 'Transfer'))),
    payee_pattern:        T.toQuery('payee_pattern', IRDomain.Transactions(), 'category', IRFilter.Matches('payee', '^WAL')),
    amount_range:         T.toQuery('amount_range', IRDomain.Transactions(), 'category', IRFilter.Between('amount', -1000, -100)),
}

// Seed query metadata — pre-filtered engine reports demonstrating compound IR filters
// prettier-ignore
const SEED_QUERY_METADATA = {
    large_transactions:   { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.large_transactions },
    exclude_transfers:    { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.exclude_transfers },
    amount_range:         { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.amount_range },
    dining_multi_account: { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.dining_multi_account },
    payee_pattern:        { ...ENGINE_TRANSACTION_TREE_METADATA, defaultQueryIR: SEED_QUERIES.payee_pattern },
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
