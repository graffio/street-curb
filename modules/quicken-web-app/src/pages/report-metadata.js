// ABOUTME: Static metadata constants that configure QueryResultPage for each report domain
// ABOUTME: Each constant bundles columns, filters, tree config, and chip row overrides

import { CategoryReportColumns, InvestmentReportColumns } from '../columns/index.js'
import { AccountFilterChip } from '../components/filter-chips/AccountFilterChip.jsx'
import { AsOfDateChip } from '../components/filter-chips/AsOfDateChip.jsx'
import { CategoryFilterChip } from '../components/filter-chips/CategoryFilterChip.jsx'
import { DateFilterChip } from '../components/filter-chips/DateFilterChip.jsx'
import { GroupByFilterChip } from '../components/filter-chips/GroupByFilterChip.jsx'
import { SearchFilterChip } from '../components/filter-chips/SearchFilterChip.jsx'
import * as S from '../store/selectors.js'

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const ReportMetadata = { TRANSACTION_TREE_METADATA, POSITION_TREE_METADATA }

export { ReportMetadata }
