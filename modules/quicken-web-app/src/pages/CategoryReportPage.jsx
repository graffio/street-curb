// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals
// COMPLEXITY: react-redux-separation — useMemo for expensive tree building

import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { CategoryReportColumns } from '../columns/index.js'
import {
    AccountFilterColumn,
    CategoryFilterColumn,
    DateFilterColumn,
    FilterChipRow,
    GroupByFilterColumn,
    SearchFilterColumn,
    TransactionSubTable,
} from '../components/index.js'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { buildTransactionTree } from '../utils/category-tree.js'

const pageContainerStyle = { height: '100%' }
const categoryFilterConfig = { accounts: true, categories: true, date: true, groupBy: true, search: true }

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

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow viewId={viewId} filterConfig={categoryFilterConfig}>
                <DateFilterColumn viewId={viewId} />
                <CategoryFilterColumn viewId={viewId} />
                <AccountFilterColumn viewId={viewId} />
                <GroupByFilterColumn viewId={viewId} />
                <SearchFilterColumn viewId={viewId} />
            </FilterChipRow>
            <DataTable
                columns={CategoryReportColumns}
                data={transactionTree}
                height={height}
                rowHeight={40}
                getChildRows={row => row.children}
                getRowCanExpand={row => row.original.children?.length > 0 || row.original.value?.length > 0}
                renderSubComponent={({ row }) => (
                    <TransactionSubTable transactions={row.original.value} groupBy={groupBy} />
                )}
                expanded={expanded}
                onExpandedChange={updater => post(Action.SetViewUiState(viewId, { treeExpansion: updater }))}
            />
        </Flex>
    )
}

export { CategoryReportPage }
