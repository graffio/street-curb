// ABOUTME: Investment holdings report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import { useCallback, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { InvestmentReportColumns } from '../columns/index.js'
import { FilterChipRow, investmentGroupByOptions } from '../components/index.js'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { HoldingsTree } from '../utils/holdings-tree.js'

const { buildHoldingsTree } = HoldingsTree

const pageContainerStyle = { height: '100%' }

const dimensionLayouts = {
    account: { title: 'Holdings by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Holdings by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Holdings by Goal', subtitle: 'View portfolio positions by investment goal' },
}

const P = {
    // Tree rows can expand if they have children
    // @sig canExpand :: Row -> Boolean
    canExpand: row => row.original.children && row.original.children.length > 0,
}

const T = {
    // Get children from a HoldingsTreeNode for DataTable getChildRows prop
    // @sig toChildRows :: HoldingsTreeNode -> [HoldingsTreeNode]
    toChildRows: row => row.children,
}

/*
 * Investment holdings report with hierarchical tree display
 *
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height = '100%' }) => {
    const [, setLayout] = useChannel(layoutChannel)
    const holdings = useSelector(state => S.Holdings.collectAsOf(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))
    const columnSizing = useSelector(state => S.UI.columnSizing(state, viewId))
    const columnOrder = useSelector(state => S.UI.columnOrder(state, viewId))

    // EXEMPT: useMemo - tree building is expensive; keeping as useMemo for render optimization
    const holdingsTree = useMemo(() => buildHoldingsTree(groupBy || 'account', holdings), [groupBy, holdings])

    const handleExpandedChange = useCallback(
        updater => {
            const next = typeof updater === 'function' ? updater(expanded) : updater
            post(Action.SetTreeExpanded(viewId, next))
        },
        [viewId, expanded],
    )
    const handleColumnSizingChange = useCallback(
        updater => {
            const next = typeof updater === 'function' ? updater(columnSizing) : updater
            post(Action.SetColumnSizing(viewId, next))
        },
        [viewId, columnSizing],
    )
    const handleColumnOrderChange = useCallback(order => post(Action.SetColumnOrder(viewId, order)), [viewId])

    const totalHoldingsCount = holdings?.length ?? 0

    useEffect(() => setLayout(dimensionLayouts[groupBy] || dimensionLayouts.account), [setLayout, groupBy])

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
                getChildRows={T.toChildRows}
                getRowCanExpand={P.canExpand}
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
