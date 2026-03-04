// ABOUTME: Investment positions report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal
import { Flex } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { InvestmentReportColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { DataTable } from '../components/DataTable.jsx'
import {
    AccountFilterColumn,
    AsOfDateColumn,
    FilterChipRow,
    GroupByFilterColumn,
    investmentGroupByItems,
    SearchFilterColumn,
} from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Investment positions report with hierarchical tree display
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height = '100%' }) => {
    const positions = useSelector(state => S.Positions.asOf(state, viewId))
    const positionsTree = useSelector(state => S.Positions.tree(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))
    const highlightedRowId = useSelector(state => S.UI.highlightedRowId(state, viewId))

    const totalPositionsCount = positions.length

    const filterChipRowProps = {
        viewId,
        filteredCount: totalPositionsCount,
        totalCount: totalPositionsCount,
        itemLabel: 'positions',
    }

    const dataTableProps = {
        columns: InvestmentReportColumns,
        data: positionsTree,
        height,
        rowHeight: 40,
        getChildRows: row => row.children,
        getRowCanExpand: row => row.original.children && row.original.children.length > 0,
        expanded,
        onExpandedChange: updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater })),
        columnSizing,
        onColumnSizingChange: updater => post(Action.SetViewUiState(viewId, { columnSizing: updater })),
        columnOrder,
        onColumnOrderChange: order => post(Action.SetViewUiState(viewId, { columnOrder: order })),
        highlightedId: highlightedRowId,
        actionContext: viewId,
        onHighlightChange: newId => post(Action.SetViewUiState(viewId, { highlightedRowId: newId })),
        context: { groupBy },
    }

    return (
        <Flex direction="column" style={{ height: '100%' }}>
            <FilterChipRow {...filterChipRowProps}>
                <AsOfDateColumn viewId={viewId} />
                <AccountFilterColumn viewId={viewId} />
                <GroupByFilterColumn viewId={viewId} items={investmentGroupByItems} />
                <SearchFilterColumn viewId={viewId} />
            </FilterChipRow>
            <DataTable {...dataTableProps} />
        </Flex>
    )
}

export { InvestmentReportPage }
