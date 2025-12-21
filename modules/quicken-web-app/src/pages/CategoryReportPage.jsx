// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { categoryReportColumns } from '../columns/index.js'
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

    // Transform transactions to include categoryName from categories lookup
    // @sig addCategoryNames :: ([Transaction], LookupTable) -> [TransactionWithCategoryName]
    const addCategoryNames = (txns, cats) => {
        if (!txns || !cats) return []
        return txns.map(txn => ({ ...txn, categoryName: cats.get(txn.categoryId)?.name || 'Uncategorized' }))
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const [, setLayout] = useChannel(layoutChannel)
    const filteredTransactions = useSelector(state => S.filteredTransactions(state, viewId))
    const categories = useSelector(S.categories)

    // -----------------------------------------------------------------------------------------------------------------
    // Local state for expanded rows
    // -----------------------------------------------------------------------------------------------------------------
    const [expanded, setExpanded] = useState({})

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------
    const transactionsWithCategoryNames = useMemo(
        () => addCategoryNames(filteredTransactions, categories),
        [filteredTransactions, categories],
    )

    // Build aggregated category tree from transactions
    const categoryTree = useMemo(
        () => buildCategoryTree(transactionsWithCategoryNames),
        [transactionsWithCategoryNames],
    )

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
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
            />
        </Flex>
    )
}

export default CategoryReportPage
export { CategoryReportPage }
