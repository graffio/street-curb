// ABOUTME: Horizontal row of filter chips organized in columns
// ABOUTME: Each column shows chip + details below it (up to 3 lines)

import { Flex, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors/index.js'
import { formatShortDate } from '../utils/formatters.js'
import {
    AccountFilterChip,
    CategoryFilterChip,
    DateFilterChip,
    GroupByFilterChip,
    SearchFilterChip,
} from './filter-chips.jsx'

const baseContainerStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }

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
 *     FilterChipRowProps = { viewId, showGroupBy?, accountId? }
 */
const FilterChipRow = ({ viewId, showGroupBy = false, accountId = null }) => {
    // Format a date range for display
    // @sig formatDateRange :: (Date, Date) -> String?
    const formatDateRange = (start, end) => {
        const startStr = formatShortDate(start)
        const endStr = formatShortDate(end)
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

    const allTransactions = useSelector(S.transactions)
    const filteredTransactions = useSelector(state => S.filteredTransactions(state, viewId))
    const dateRange = useSelector(state => S.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.dateRangeKey(state, viewId))
    const filterQuery = useSelector(state => S.filterQuery(state, viewId))
    const selectedCategories = useSelector(state => S.selectedCategories(state, viewId))
    const selectedAccounts = useSelector(state => S.selectedAccounts(state, viewId))
    const accounts = useSelector(S.accounts)

    const dateDetails = dateRange ? [formatDateRange(dateRange.start, dateRange.end)].filter(Boolean) : []
    const categoryDetails = buildCategoryDetails(selectedCategories)
    const accountDetails = buildAccountDetails(selectedAccounts, accounts)

    // Determine which filters are active
    const isDateActive = dateRangeKey !== 'all'
    const isCategoriesActive = selectedCategories.length > 0
    const isAccountsActive = selectedAccounts.length > 0
    const isTextActive = filterQuery?.length > 0

    // Determine if any filtering is happening
    // For registers, compare to account transactions; for reports, compare to all
    const baseTransactions = accountId
        ? (allTransactions?.filter(t => t.accountId === accountId) ?? [])
        : (allTransactions ?? [])
    const filteredCount = filteredTransactions.length
    const totalCount = baseTransactions.length
    const isFiltering = filteredCount < totalCount || isDateActive || isTextActive

    const containerStyle = { ...baseContainerStyle, backgroundColor: isFiltering ? 'var(--ruby-3)' : 'var(--gray-2)' }

    return (
        <Flex direction="column" gap="2" style={containerStyle}>
            <Flex align="center" gap="2" style={{ paddingLeft: 'var(--space-2)' }}>
                <Text size="1" color="gray">
                    {filteredCount} transactions
                </Text>
                {isFiltering && (
                    <Text size="1" color="ruby" weight="medium">
                        (filtered from {totalCount})
                    </Text>
                )}
            </Flex>

            <Flex align="start" gap="3" wrap="wrap">
                <FilterColumn chip={<DateFilterChip viewId={viewId} isActive={isDateActive} />} details={dateDetails} />
                <FilterColumn
                    chip={<CategoryFilterChip viewId={viewId} isActive={isCategoriesActive} />}
                    details={categoryDetails}
                />

                {showGroupBy && (
                    <>
                        <FilterColumn
                            chip={<AccountFilterChip viewId={viewId} isActive={isAccountsActive} />}
                            details={accountDetails}
                        />
                        <FilterColumn chip={<GroupByFilterChip viewId={viewId} />} details={[]} />
                    </>
                )}

                <FilterColumn chip={<SearchFilterChip viewId={viewId} isActive={isTextActive} />} details={[]} />
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
