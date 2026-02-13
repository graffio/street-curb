// ABOUTME: Investment holdings report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal
// COMPLEXITY: react-redux-separation — SetPageTitle useEffect awaiting tab-system title mechanism

import { DataTable, Flex } from '@graffio/design-system'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { InvestmentReportColumns } from '../columns/index.js'
import { post } from '../commands/post.js'
import { FilterChipRow, investmentGroupByItems } from '../components/index.js'
import * as S from '../store/selectors.js'
import { currentStore } from '../store/index.js'
import { Action } from '../types/action.js'

const pageContainerStyle = { height: '100%' }

const dimensionLayouts = {
    account: { title: 'Holdings by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Holdings by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Holdings by Goal', subtitle: 'View portfolio positions by investment goal' },
}

const T = {
    // Resolves a TanStack updater (function or value) against current state
    // @sig resolveUpdater :: (Function | Object, Object) -> Object
    resolveUpdater: (updater, current) => (typeof updater === 'function' ? updater(current) : updater),
}

const E = {
    // Reads current tree expansion from store, resolves updater, dispatches
    // @sig updateTreeExpansion :: (String, Function | Object) -> void
    updateTreeExpansion: (viewId, updater) => {
        const current = S.UI.treeExpansion(currentStore().getState(), viewId)
        post(Action.SetViewUiState(viewId, { treeExpansion: T.resolveUpdater(updater, current) }))
    },

    // Reads current column sizing from store, resolves updater, dispatches
    // @sig updateColumnSizing :: (String, Function | Object) -> void
    updateColumnSizing: (viewId, updater) => {
        const current = S.UI.columnSizing(currentStore().getState(), viewId)
        post(Action.SetViewUiState(viewId, { columnSizing: T.resolveUpdater(updater, current) }))
    },

    // Dispatches column order change
    // @sig updateColumnOrder :: (String, Object) -> void
    updateColumnOrder: (viewId, order) => post(Action.SetViewUiState(viewId, { columnOrder: order })),
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
                groupByItems={investmentGroupByItems}
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
                onExpandedChange={updater => E.updateTreeExpansion(viewId, updater)}
                columnSizing={columnSizing}
                onColumnSizingChange={updater => E.updateColumnSizing(viewId, updater)}
                columnOrder={columnOrder}
                onColumnOrderChange={order => E.updateColumnOrder(viewId, order)}
                context={{ groupBy }}
            />
        </Flex>
    )
}

export { InvestmentReportPage }
