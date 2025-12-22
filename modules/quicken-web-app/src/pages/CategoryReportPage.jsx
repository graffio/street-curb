// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { categoryReportColumns } from '../columns/index.js'
import { FilterChipRow, TransactionSubTable } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { buildTransactionTree } from '../utils/category-tree.js'

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }

const dimensionLayouts = {
    category: { title: 'Spending by Category', subtitle: 'View spending breakdown by category hierarchy' },
    account: { title: 'Spending by Account', subtitle: 'View spending breakdown by account' },
    payee: { title: 'Spending by Payee', subtitle: 'View spending breakdown by payee' },
    month: { title: 'Spending by Month', subtitle: 'View spending breakdown by month' },
}

/*
 * Category spending report with hierarchical tree display
 *
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height = '100%' }) => {
    // Get children from a tree node for DataTable getChildRows prop
    // @sig getChildRows :: TreeNode -> [TreeNode]
    const getChildRows = row => row.children

    // Rows can expand if they have children (tree) or are leaves with transactions (sub-component)
    // @sig getRowCanExpand :: Row -> Boolean
    const getRowCanExpand = row => {
        const { children, value } = row.original
        const hasChildren = children && children.length > 0
        const hasTransactions = value && value.length > 0
        return hasChildren || hasTransactions
    }

    // Transform transactions to include categoryName and accountName from lookups
    // @sig enrichTransactions :: ([Transaction], LookupTable, LookupTable) -> [EnrichedTransaction]
    const enrichTransactions = (txns, cats, accts) => {
        const addNames = txn => ({
            ...txn,
            categoryName: cats.get(txn.categoryId)?.name || 'Uncategorized',
            accountName: accts.get(txn.accountId)?.name || '',
        })

        if (!txns || !cats || !accts) return []
        return txns.map(addNames)
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const [, setLayout] = useChannel(layoutChannel)
    const filteredTransactions = useSelector(state => S.filteredTransactions(state, viewId))
    const categories = useSelector(S.categories)
    const accounts = useSelector(S.accounts)
    const groupBy = useSelector(state => S.groupBy(state, viewId))

    // -----------------------------------------------------------------------------------------------------------------
    // Local state for expanded rows
    // -----------------------------------------------------------------------------------------------------------------
    const [expanded, setExpanded] = useState({})

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------
    const enrichedTransactions = useMemo(
        () => enrichTransactions(filteredTransactions, categories, accounts),
        [filteredTransactions, categories, accounts],
    )

    // Build aggregated tree from transactions by selected dimension
    const transactionTree = useMemo(
        () => buildTransactionTree(groupBy, enrichedTransactions),
        [groupBy, enrichedTransactions],
    )

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleExpandedChange = useCallback(
        updater => setExpanded(prev => (typeof updater === 'function' ? updater(prev) : updater)),
        [],
    )

    // Render transaction list when leaf row is expanded (needs groupBy to hide redundant column)
    // @sig renderSubComponent :: { row: Row } -> ReactElement
    const renderSubComponent = useCallback(
        ({ row }) => <TransactionSubTable transactions={row.original.value} groupBy={groupBy} />,
        [groupBy],
    )

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(() => setLayout(dimensionLayouts[groupBy] || dimensionLayouts.category), [setLayout, groupBy])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} showGroupBy />
            <DataTable
                columns={categoryReportColumns}
                data={transactionTree}
                height={height}
                rowHeight={40}
                getChildRows={getChildRows}
                getRowCanExpand={getRowCanExpand}
                renderSubComponent={renderSubComponent}
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
            />
        </Flex>
    )
}

export default CategoryReportPage
export { CategoryReportPage }
