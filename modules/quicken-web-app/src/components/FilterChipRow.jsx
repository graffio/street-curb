// ABOUTME: Horizontal row of filter chips organized in columns
// ABOUTME: Each column shows chip + details below it (up to 3 lines)

import { Flex, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors/index.js'
import { AccountFilterChip } from './AccountFilterChip.jsx'
import { CategoryFilterChip } from './CategoryFilterChip.jsx'
import { DateFilterChip } from './DateFilterChip.jsx'
import { GroupByFilterChip } from './GroupByFilterChip.jsx'
import { SearchFilterChip } from './SearchFilterChip.jsx'

const containerStyle = {
    padding: 'var(--space-2) var(--space-3)',
    backgroundColor: 'var(--gray-2)',
    borderBottom: '1px solid var(--gray-4)',
}

const columnStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }

const detailTextStyle = {
    fontSize: 'var(--font-size-1)',
    color: 'var(--gray-11)',
    lineHeight: 1.3,
    paddingLeft: 'var(--space-2)', // Align with text inside chip (matches chip's horizontal padding)
}

const MAX_DETAIL_LINES = 3

/*
 * A filter column with chip and detail lines below
 *
 * @sig FilterColumn :: { chip: ReactElement, details: [String] } -> ReactElement
 */
const FilterColumn = ({ chip, details }) => (
    <div style={columnStyle}>
        {chip}
        {details.map((line, i) => (
            <span key={i} style={detailTextStyle}>
                {line}
            </span>
        ))}
    </div>
)

/*
 * Row of filter chips organized in columns with details below each chip
 *
 * @sig FilterChipRow :: FilterChipRowProps -> ReactElement
 *     FilterChipRowProps = { viewId, showGroupBy? }
 */
const FilterChipRow = ({ viewId, showGroupBy = false }) => {
    // Format a date range for display
    // @sig formatDateRange :: (Date, Date) -> String?
    const formatDateRange = (start, end) => {
        // Format a single date for display
        // @sig formatDate :: Date -> String?
        const formatDate = date => {
            if (!date || !(date instanceof Date)) return null
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }

        const startStr = formatDate(start)
        const endStr = formatDate(end)
        if (!startStr || !endStr) return null
        return `${startStr} – ${endStr}`
    }

    // Build detail lines for categories (up to MAX_DETAIL_LINES, then +N more)
    // @sig buildCategoryDetails :: [String] -> [String]
    const buildCategoryDetails = categories => {
        const { length } = categories
        if (length === 0) return []
        if (length <= MAX_DETAIL_LINES) return categories
        const shown = categories.slice(0, MAX_DETAIL_LINES - 1)
        const remaining = length - shown.length
        return [...shown, `+${remaining} more`]
    }

    // Build detail lines for accounts (up to MAX_DETAIL_LINES, then +N more)
    // @sig buildAccountDetails :: ([String], LookupTable) -> [String]
    const buildAccountDetails = (accountIds, accountLookup) => {
        const { length } = accountIds
        if (length === 0 || !accountLookup) return []
        const names = accountIds.map(id => accountLookup.get(id)?.name || id)
        if (names.length <= MAX_DETAIL_LINES) return names
        const shown = names.slice(0, MAX_DETAIL_LINES - 1)
        const remaining = names.length - shown.length
        return [...shown, `+${remaining} more`]
    }

    const filteredTransactions = useSelector(state => S.filteredTransactions(state, viewId))
    const dateRange = useSelector(state => S.dateRange(state, viewId))
    const selectedCategories = useSelector(state => S.selectedCategories(state, viewId))
    const selectedAccounts = useSelector(state => S.selectedAccounts(state, viewId))
    const accounts = useSelector(S.accounts)

    const dateDetails = dateRange ? [formatDateRange(dateRange.start, dateRange.end)].filter(Boolean) : []
    const categoryDetails = buildCategoryDetails(selectedCategories)
    const accountDetails = buildAccountDetails(selectedAccounts, accounts)

    return (
        <Flex align="start" gap="3" wrap="wrap" style={containerStyle}>
            <FilterColumn chip={<DateFilterChip viewId={viewId} />} details={dateDetails} />
            <FilterColumn chip={<CategoryFilterChip viewId={viewId} />} details={categoryDetails} />

            {showGroupBy && (
                <>
                    <FilterColumn chip={<AccountFilterChip viewId={viewId} />} details={accountDetails} />
                    <FilterColumn chip={<GroupByFilterChip viewId={viewId} />} details={[]} />
                </>
            )}

            <FilterColumn chip={<SearchFilterChip viewId={viewId} />} details={[]} />

            <Flex align="center" style={{ marginLeft: 'auto' }}>
                <Text size="1" color="gray">
                    {filteredTransactions.length} transactions
                </Text>
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
