// ABOUTME: Investment holdings report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal
import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import { useSelector } from 'react-redux'
import { InvestmentReportColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
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

const pageContainerStyle = { height: '100%' }

/*
 * Investment holdings report with hierarchical tree display
 *
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height = '100%' }) => {
    const holdings = useSelector(state => S.Holdings.asOf(state, viewId))
    const holdingsTree = useSelector(state => S.Holdings.tree(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))

    const totalHoldingsCount = holdings.length

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                filteredCount={totalHoldingsCount}
                totalCount={totalHoldingsCount}
                itemLabel="holdings"
            >
                <AsOfDateColumn viewId={viewId} />
                <AccountFilterColumn viewId={viewId} />
                <GroupByFilterColumn viewId={viewId} items={investmentGroupByItems} />
                <SearchFilterColumn viewId={viewId} />
            </FilterChipRow>
            <DataTable
                columns={InvestmentReportColumns}
                data={holdingsTree}
                height={height}
                rowHeight={40}
                getChildRows={row => row.children}
                getRowCanExpand={row => row.original.children && row.original.children.length > 0}
                expanded={expanded}
                onExpandedChange={updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater }))}
                columnSizing={columnSizing}
                onColumnSizingChange={updater => post(Action.SetViewUiState(viewId, { columnSizing: updater }))}
                columnOrder={columnOrder}
                onColumnOrderChange={order => post(Action.SetViewUiState(viewId, { columnOrder: order }))}
                context={{ groupBy }}
            />
        </Flex>
    )
}

export { InvestmentReportPage }
