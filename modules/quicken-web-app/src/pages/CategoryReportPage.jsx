// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { Flex } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { CategoryReportColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { DataTable } from '../components/DataTable.jsx'
import {
    AccountFilterColumn,
    CategoryFilterColumn,
    DateFilterColumn,
    FilterChipRow,
    GroupByFilterColumn,
    SearchFilterColumn,
} from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// Column visibility by groupBy dimension — hide the column that matches the grouping
const HIDDEN_COLUMNS_BY_GROUP = { account: { account: false }, payee: { payee: false } }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Category spending report with hierarchical tree display
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height = '100%' }) => {
    const transactionTree = useSelector(state => S.Transactions.tree(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))

    const dataTableProps = {
        columns: CategoryReportColumns,
        data: transactionTree,
        height,
        rowHeight: 40,
        getChildRows: row => row.children,
        getRowCanExpand: row => row.original.children.length > 0,
        columnVisibility: HIDDEN_COLUMNS_BY_GROUP[groupBy],
        expanded,
        onExpandedChange: updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater })),
    }

    return (
        <Flex direction="column" style={{ height: '100%' }}>
            <FilterChipRow viewId={viewId}>
                <DateFilterColumn viewId={viewId} />
                <CategoryFilterColumn viewId={viewId} />
                <AccountFilterColumn viewId={viewId} />
                <GroupByFilterColumn viewId={viewId} />
                <SearchFilterColumn viewId={viewId} />
            </FilterChipRow>
            <DataTable {...dataTableProps} />
        </Flex>
    )
}

export { CategoryReportPage }
