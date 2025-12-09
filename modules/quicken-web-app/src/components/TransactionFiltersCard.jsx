/*
 * TransactionFiltersCard - Sidebar component for filtering transactions
 *
 * Provides filtering, searching, and category selection controls for transaction registers.
 * Extracted from TransactionRegisterPage for reusability.
 */

import { Button, Card, CategorySelector, DateRangePicker, Flex, Text, TextField } from '@graffio/design-system'
import PropTypes from 'prop-types'
import React from 'react'

const filtersCardStyle = { width: '280px', flexShrink: 0 }

/*
 * Filters sidebar card for transaction filtering, searching, and category selection
 *
 * @sig TransactionFiltersCard :: (TransactionFiltersCardProps) -> ReactElement
 */
const TransactionFiltersCard = ({
    dateRange,
    dateRangeKey,
    filterQuery,
    searchQuery,
    selectedCategories,
    currentSearchIndex,
    customStartDate,
    customEndDate,
    defaultStartDate,
    defaultEndDate,
    allCategories,
    searchMatches,
    filteredTransactionsCount,
    onDateRangeChange,
    onDateRangeKeyChange,
    onCustomStartDateChange,
    onCustomEndDateChange,
    onFilterQueryChange,
    onSearchQueryChange,
    onCategoryAdd,
    onCategoryRemove,
    onPreviousMatch,
    onNextMatch,
    onClearFilters,
}) => (
    <Card style={filtersCardStyle}>
        <Flex direction="column" gap="4">
            <Text size="3" weight="medium">
                Filters
            </Text>

            <DateRangePicker
                value={dateRangeKey}
                onChange={onDateRangeChange}
                onValueChange={onDateRangeKeyChange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onCustomStartDateChange={onCustomStartDateChange}
                onCustomEndDateChange={onCustomEndDateChange}
                defaultStartDate={defaultStartDate}
                defaultEndDate={defaultEndDate}
            />

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    Filter
                </Text>
                <TextField.Root
                    placeholder="Filter transactions (e.g., Chipotle)..."
                    value={filterQuery}
                    onChange={onFilterQueryChange}
                />
            </Flex>

            <Flex direction="column" gap="2">
                <Text size="2" weight="medium" color="gray">
                    Search
                </Text>
                <TextField.Root
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={onSearchQueryChange}
                />
                {searchQuery && searchMatches.length > 0 && (
                    <Flex gap="2" align="center">
                        <Button size="1" variant="soft" disabled={searchMatches.length === 0} onClick={onPreviousMatch}>
                            ← Previous
                        </Button>
                        <Button size="1" variant="soft" disabled={searchMatches.length === 0} onClick={onNextMatch}>
                            Next →
                        </Button>
                        <Text size="1" color="gray">
                            {currentSearchIndex + 1} of {searchMatches.length}
                        </Text>
                    </Flex>
                )}
            </Flex>

            <CategorySelector
                categories={allCategories}
                selectedCategories={selectedCategories}
                onCategoryAdded={onCategoryAdd}
                onCategoryRemoved={onCategoryRemove}
            />

            <Button variant="soft" onClick={onClearFilters}>
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

TransactionFiltersCard.propTypes = {
    dateRange: PropTypes.shape({ start: PropTypes.instanceOf(Date), end: PropTypes.instanceOf(Date) }),
    dateRangeKey: PropTypes.string,
    filterQuery: PropTypes.string,
    searchQuery: PropTypes.string,
    selectedCategories: PropTypes.arrayOf(PropTypes.string),
    currentSearchIndex: PropTypes.number,
    customStartDate: PropTypes.instanceOf(Date),
    customEndDate: PropTypes.instanceOf(Date),
    defaultStartDate: PropTypes.instanceOf(Date),
    defaultEndDate: PropTypes.instanceOf(Date),
    allCategories: PropTypes.arrayOf(PropTypes.string),
    searchMatches: PropTypes.arrayOf(PropTypes.number),
    filteredTransactionsCount: PropTypes.number,
    onDateRangeChange: PropTypes.func.isRequired,
    onDateRangeKeyChange: PropTypes.func.isRequired,
    onCustomStartDateChange: PropTypes.func.isRequired,
    onCustomEndDateChange: PropTypes.func.isRequired,
    onFilterQueryChange: PropTypes.func.isRequired,
    onSearchQueryChange: PropTypes.func.isRequired,
    onCategoryAdd: PropTypes.func.isRequired,
    onCategoryRemove: PropTypes.func.isRequired,
    onPreviousMatch: PropTypes.func.isRequired,
    onNextMatch: PropTypes.func.isRequired,
    onClearFilters: PropTypes.func.isRequired,
}

export { TransactionFiltersCard }
