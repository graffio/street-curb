// ABOUTME: Investment holdings report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal

import { DataTable, Flex } from '@graffio/design-system'
import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { InvestmentReportColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow, investmentGroupByOptions } from '../components/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const pageContainerStyle = { height: '100%' }

const dimensionLayouts = {
    account: { title: 'Holdings by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Holdings by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Holdings by Goal', subtitle: 'View portfolio positions by investment goal' },
}

const E = {
    // Resolves TanStack updater and dispatches tree expansion change
    // @sig dispatchTreeExpanded :: (String, Object) -> (Function | Object) -> void
    dispatchTreeExpanded: (viewId, current) => updater =>
        post(
            Action.SetViewUiState(viewId, {
                treeExpansion: typeof updater === 'function' ? updater(current) : updater,
            }),
        ),

    // Resolves TanStack updater and dispatches column sizing change
    // @sig dispatchColumnSizing :: (String, Object) -> (Function | Object) -> void
    dispatchColumnSizing: (viewId, current) => updater =>
        post(
            Action.SetViewUiState(viewId, { columnSizing: typeof updater === 'function' ? updater(current) : updater }),
        ),
}

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

    const handleExpandedChange = useCallback(E.dispatchTreeExpanded(viewId, expanded), [viewId, expanded])
    const handleColumnSizingChange = useCallback(E.dispatchColumnSizing(viewId, columnSizing), [viewId, columnSizing])
    const handleColumnOrderChange = useCallback(
        order => post(Action.SetViewUiState(viewId, { columnOrder: order })),
        [viewId],
    )

    const totalHoldingsCount = holdings?.length ?? 0

    const layout = dimensionLayouts[groupBy] || dimensionLayouts.account
    useEffect(() => post(Action.SetPageTitle(layout.title, layout.subtitle)), [layout])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                showGroupBy
                showAsOfDate
                showCategories={false}
                groupByOptions={investmentGroupByOptions}
                filteredCount={totalHoldingsCount}
                totalCount={totalHoldingsCount}
                itemLabel="holdings"
            />
            <DataTable
                columns={InvestmentReportColumns.columns}
                data={holdingsTree}
                height={height}
                rowHeight={40}
                getChildRows={row => row.children}
                getRowCanExpand={row => row.original.children && row.original.children.length > 0}
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
                columnSizing={columnSizing}
                onColumnSizingChange={handleColumnSizingChange}
                columnOrder={columnOrder}
                onColumnOrderChange={handleColumnOrderChange}
                context={{ groupBy }}
            />
        </Flex>
    )
}

export { InvestmentReportPage }
