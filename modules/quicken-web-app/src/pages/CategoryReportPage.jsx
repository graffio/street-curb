// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals
// COMPLEXITY: react-redux-separation — useMemo for expensive tree building, useEffect for page title

import { DataTable, Flex } from '@graffio/design-system'
import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CategoryReportColumns } from '../columns/index.js'
import { FilterChipRow, TransactionSubTable } from '../components/index.js'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { currentStore } from '../store/index.js'
import { Action } from '../types/action.js'
import { buildTransactionTree } from '../utils/category-tree.js'

const pageContainerStyle = { height: '100%' }

const dimensionLayouts = {
    category: { title: 'Spending by Category', subtitle: 'View spending breakdown by category hierarchy' },
    account: { title: 'Spending by Account', subtitle: 'View spending breakdown by account' },
    payee: { title: 'Spending by Payee', subtitle: 'View spending breakdown by payee' },
    month: { title: 'Spending by Month', subtitle: 'View spending breakdown by month' },
}

const P = {
    // Rows can expand if they have children (tree) or are leaves with transactions (sub-component)
    // @sig canExpand :: Row -> Boolean
    canExpand: row => {
        const { children, value } = row.original
        return children?.length > 0 || value?.length > 0
    },
}

const E = {
    // Reads current tree expansion from store, resolves TanStack updater, dispatches
    // @sig updateTreeExpansion :: (String, Function | Object) -> void
    updateTreeExpansion: (viewId, updater) => {
        const current = S.UI.treeExpansion(currentStore().getState(), viewId)
        const next = typeof updater === 'function' ? updater(current) : updater
        post(Action.SetViewUiState(viewId, { treeExpansion: next }))
    },
}

/*
 * Category spending report with hierarchical tree display
 *
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height = '100%' }) => {
    const enrichedTransactions = useSelector(state => S.Transactions.enriched(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))

    // EXEMPT: useMemo — tree building is expensive, selector migration requires multi-slice dependency tracking
    const transactionTree = useMemo(
        () => buildTransactionTree(groupBy || 'category', enrichedTransactions),
        [groupBy, enrichedTransactions],
    )

    const layout = dimensionLayouts[groupBy] || dimensionLayouts.category
    useEffect(() => post(Action.SetPageTitle(layout.title, layout.subtitle)), [layout])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} showGroupBy />
            <DataTable
                columns={CategoryReportColumns.columns}
                data={transactionTree}
                height={height}
                rowHeight={40}
                getChildRows={row => row.children}
                getRowCanExpand={P.canExpand}
                renderSubComponent={({ row }) => (
                    <TransactionSubTable transactions={row.original.value} groupBy={groupBy} />
                )}
                expanded={expanded}
                onExpandedChange={updater => E.updateTreeExpansion(viewId, updater)}
            />
        </Flex>
    )
}

export { CategoryReportPage }
