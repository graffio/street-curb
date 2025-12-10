/*
 * TransactionFiltersCard - Sidebar component for filtering transactions
 *
 * Fully connected component that reads all state from Redux selectors.
 * Zero props required - all data comes from the store.
 */

import { Button, Card, CategorySelector, DateRangePicker, Flex, Text, TextField } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const filtersCardStyle = { width: '280px', flexShrink: 0 }

/*
 * Filters sidebar card for transaction filtering, searching, and category selection
 */
const TransactionFiltersCard = () => {
    // Read all state from Redux
    const dateRange = useSelector(S.dateRange)
    const dateRangeKey = useSelector(S.dateRangeKey)
    const filterQuery = useSelector(S.filterQuery)
    const searchQuery = useSelector(S.searchQuery)
    const selectedCategories = useSelector(S.selectedCategories)
    const currentSearchIndex = useSelector(S.currentSearchIndex)
    const customStartDate = useSelector(S.customStartDate)
    const customEndDate = useSelector(S.customEndDate)

    // Derived state from selectors
    const defaultStartDate = useSelector(S.defaultStartDate)
    const defaultEndDate = useSelector(S.defaultEndDate)
    const allCategories = useSelector(S.allCategoryNames)
    const searchMatches = useSelector(S.searchMatches)
    const filteredTransactions = useSelector(S.filteredTransactions)
    const filteredTransactionsCount = filteredTransactions.length

    // Action handlers
    const handleDateRangeChange = dateRange => post(Action.SetTransactionFilter({ dateRange }))
    const handleDateRangeKeyChange = dateRangeKey => post(Action.SetTransactionFilter({ dateRangeKey }))
    const handleCustomStartDateChange = customStartDate => post(Action.SetTransactionFilter({ customStartDate }))
    const handleCustomEndDateChange = customEndDate => post(Action.SetTransactionFilter({ customEndDate }))
    const handleFilterQueryChange = e => post(Action.SetTransactionFilter({ filterQuery: e.target.value }))
    const handleSearchQueryChange = e =>
        post(Action.SetTransactionFilter({ searchQuery: e.target.value, currentSearchIndex: 0 }))
    const handleClearFilters = () => post(Action.ResetTransactionFilters())

    const handleCategoryAdd = category =>
        post(Action.SetTransactionFilter({ selectedCategories: [...selectedCategories, category] }))

    const handleCategoryRemove = category =>
        post(Action.SetTransactionFilter({ selectedCategories: selectedCategories.filter(c => c !== category) }))

    const handlePreviousMatch = () => {
        if (searchMatches.length > 0) {
            const newIndex = currentSearchIndex === 0 ? searchMatches.length - 1 : currentSearchIndex - 1
            post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    const handleNextMatch = () => {
        if (searchMatches.length > 0) {
            const newIndex = currentSearchIndex === searchMatches.length - 1 ? 0 : currentSearchIndex + 1
            post(Action.SetTransactionFilter({ currentSearchIndex: newIndex }))
        }
    }

    return (
        <Card style={filtersCardStyle}>
            <Flex direction="column" gap="4">
                <Text size="3" weight="medium">
                    Filters
                </Text>

                <DateRangePicker
                    value={dateRangeKey}
                    onChange={handleDateRangeChange}
                    onValueChange={handleDateRangeKeyChange}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    onCustomStartDateChange={handleCustomStartDateChange}
                    onCustomEndDateChange={handleCustomEndDateChange}
                    defaultStartDate={defaultStartDate}
                    defaultEndDate={defaultEndDate}
                />

                <Flex direction="column" gap="2">
                    <Text size="2" weight="medium" color="var(--gray-1)">
                        Filter
                    </Text>
                    <TextField.Root
                        placeholder="Filter transactions (e.g., Chipotle)..."
                        value={filterQuery}
                        onChange={handleFilterQueryChange}
                    />
                </Flex>

                <Flex direction="column" gap="2">
                    <Text size="2" weight="medium" color="gray">
                        Search
                    </Text>
                    <TextField.Root
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={handleSearchQueryChange}
                    />
                    {searchQuery && (
                        <Flex gap="2" align="center">
                            {searchMatches.length > 0 ? (
                                <>
                                    <Button size="1" variant="soft" onClick={handlePreviousMatch}>
                                        ← Previous
                                    </Button>
                                    <Button size="1" variant="soft" onClick={handleNextMatch}>
                                        Next →
                                    </Button>
                                    <Text size="1" color="gray">
                                        {currentSearchIndex + 1} of {searchMatches.length}
                                    </Text>
                                </>
                            ) : (
                                <Text size="1" color="red">
                                    No matches
                                </Text>
                            )}
                        </Flex>
                    )}
                </Flex>

                <CategorySelector
                    categories={allCategories}
                    selectedCategories={selectedCategories}
                    onCategoryAdded={handleCategoryAdd}
                    onCategoryRemoved={handleCategoryRemove}
                />

                <Button variant="soft" onClick={handleClearFilters}>
                    Clear Filters
                </Button>

                <Flex direction="column" gap="1">
                    <Text size="1" color="gray">
                        Showing {filteredTransactionsCount} transactions
                    </Text>
                    {dateRange && (
                        <Text size="1" color="gray">
                            {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                        </Text>
                    )}
                    {filterQuery && (
                        <Text size="1" color="gray">
                            Filtered by: "{filterQuery}"
                        </Text>
                    )}
                    {searchQuery && (
                        <Text size="1" color="gray">
                            Highlighting: "{searchQuery}"
                        </Text>
                    )}
                    {selectedCategories.length > 0 && (
                        <Text size="1" color="gray">
                            Categories: {selectedCategories.join(', ')}
                        </Text>
                    )}
                </Flex>
            </Flex>
        </Card>
    )
}

export { TransactionFiltersCard }
