// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { categoryReportColumns } from '../columns/index.js'
import { TransactionSubTable } from '../components/index.js'
import * as S from '../store/selectors/index.js'
import { buildCategoryTree } from '../utils/category-tree.js'

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }

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

    // Render transaction list when leaf category is expanded
    // @sig renderSubComponent :: { row: Row } -> ReactElement
    const renderSubComponent = ({ row }) => <TransactionSubTable transactions={row.original.value} />

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

    // Build aggregated category tree from transactions
    const categoryTree = useMemo(() => buildCategoryTree(enrichedTransactions), [enrichedTransactions])

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleExpandedChange = useCallback(
        updater => setExpanded(prev => (typeof updater === 'function' ? updater(prev) : updater)),
        [],
    )

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(
        () => setLayout({ title: 'Spending by Category', subtitle: 'View spending breakdown by category hierarchy' }),
        [setLayout],
    )

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <DataTable
                columns={categoryReportColumns}
                data={categoryTree}
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
