// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { categoryReportColumns } from '../columns/index.js'
import { FilterChipRow, TransactionSubTable } from '../components/index.js'
import * as S from '../store/selectors/index.js'
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

const T = {
    // Get children from a tree node for DataTable getChildRows prop
    // @sig toChildRows :: TreeNode -> [TreeNode]
    toChildRows: row => row.children,
}

/*
 * Category spending report with hierarchical tree display
 *
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height = '100%' }) => {
    const [, setLayout] = useChannel(layoutChannel)
    const enrichedTransactions = useSelector(state => S.enrichedTransactions(state, viewId))
    const groupBy = useSelector(state => S.groupBy(state, viewId))
    const [expanded, setExpanded] = useState({})

    const transactionTree = useMemo(
        () => buildTransactionTree(groupBy, enrichedTransactions),
        [groupBy, enrichedTransactions],
    )

    const handleExpandedChange = useCallback(
        updater => setExpanded(prev => (typeof updater === 'function' ? updater(prev) : updater)),
        [],
    )

    const renderSubComponent = useCallback(
        ({ row }) => <TransactionSubTable transactions={row.original.value} groupBy={groupBy} />,
        [groupBy],
    )

    useEffect(() => setLayout(dimensionLayouts[groupBy] || dimensionLayouts.category), [setLayout, groupBy])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} showGroupBy />
            <DataTable
                columns={categoryReportColumns}
                data={transactionTree}
                height={height}
                rowHeight={40}
                getChildRows={T.toChildRows}
                getRowCanExpand={P.canExpand}
                renderSubComponent={renderSubComponent}
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
            />
        </Flex>
    )
}

export default CategoryReportPage
export { CategoryReportPage }
