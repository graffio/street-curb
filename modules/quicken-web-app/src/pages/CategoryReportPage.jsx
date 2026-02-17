// ABOUTME: Category spending report page with hierarchical tree display
// ABOUTME: Aggregates transactions by category with expand/collapse and totals

import { Flex } from '@radix-ui/themes'
import { DataTable } from '../components/DataTable.jsx'
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

const pageContainerStyle = { height: '100%' }
const categoryFilterConfig = { accounts: true, categories: true, date: true, groupBy: true, search: true }

/*
 * Category spending report with hierarchical tree display
 *
 * @sig CategoryReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const CategoryReportPage = ({ viewId, height = '100%' }) => {
    const transactionTree = useSelector(state => S.Transactions.tree(state, viewId))
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const expanded = useSelector(state => S.UI.treeExpansion(state, viewId))

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
