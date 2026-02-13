// ABOUTME: All filter chip components for transaction filtering UI
// ABOUTME: Consolidated chips with shared styles for accounts, actions, categories, dates, search, securities, groupBy
// COMPLEXITY: react-redux-separation — 2 useEffect for ActionRegistry lifecycle awaiting non-React mechanism

import { Box, Flex, Popover, Text, TextField } from '@radix-ui/themes'
import { DateRangeUtils } from '../utils/date-range-utils.js'
import { KeyboardDateInput } from './KeyboardDateInput.jsx'
import { SelectableListPopover } from './SelectableListPopover.jsx'
import { endOfDay, wrapIndex } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { currentStore } from '../store/index.js'
import { Action } from '../types/action.js'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
// Cohesion groups
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Finds the selected item by ID from items list
    // @sig toSelectedItems :: ([{ id }], String?) -> [{ id }]
    toSelectedItems: (items, selectedId) => {
        if (!selectedId) return []
        const item = items.find(i => i.id === selectedId)
        return item ? [item] : []
    },
}

const F = {
    // Creates chip trigger style with specified width and active state
    // @sig makeChipTriggerStyle :: (Number, Boolean?) -> Style
    makeChipTriggerStyle: (width, isActive) => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-4)',
        cursor: 'pointer',
        userSelect: 'none',
        width,
        backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)',
    }),

    // Creates option style with selected and highlighted states
    // @sig makeOptionStyle :: (Boolean, Boolean?) -> Style
    makeOptionStyle: (isSelected, isHighlighted = false) => ({
        ...optionStyle,
        backgroundColor: isHighlighted ? 'var(--accent-4)' : isSelected ? 'var(--accent-3)' : 'transparent',
    }),
}

// Module-level DOM refs — only one popover open at a time
const dateInputEl = { current: null }
const startDateEl = { current: null }
const endDateEl = { current: null }
const searchInputEl = { current: null }

const E = {
    // Toggles a category filter: adds if not selected, removes if selected
    // @sig toggleCategoryFilter :: (String, String, [String]) -> void
    toggleCategoryFilter: (viewId, categoryName, selectedIds) => {
        if (selectedIds.includes(categoryName)) post(Action.RemoveCategoryFilter(viewId, categoryName))
        else post(Action.AddCategoryFilter(viewId, categoryName))
    },

    // Registers dismiss action for AsOfDate popover when open
    // @sig asOfDateActionsEffect :: String -> () -> (() -> void)?
    asOfDateActionsEffect: viewId => () => {
        const popoverId = S.UI.filterPopoverId(currentStore().getState(), viewId)
        if (popoverId !== 'asOfDate') return undefined
        return ActionRegistry.register(viewId, [
            { id: 'dismiss', description: 'Dismiss', execute: () => post(Action.SetFilterPopoverOpen(viewId, null)) },
        ])
    },

    // Selects highlighted date range option, focuses custom date input if applicable
    // @sig dateFilterSelectHighlighted :: String -> void
    dateFilterSelectHighlighted: viewId => {
        const state = currentStore().getState()
        const { highlightedItemId } = S.UI.filterPopoverData(state, viewId)
        if (!highlightedItemId) return
        const dateRange = DateRangeUtils.calculateDateRange(highlightedItemId) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: highlightedItemId, dateRange }))
        if (highlightedItemId === 'customDates') setTimeout(() => startDateEl.current?.focus('month'), 0)
    },

    // Registers keyboard navigation actions for DateFilter popover when open
    // @sig dateFilterActionsEffect :: String -> () -> (() -> void)?
    dateFilterActionsEffect: viewId => () => {
        const popoverId = S.UI.filterPopoverId(currentStore().getState(), viewId)
        if (popoverId !== 'date') return undefined
        return ActionRegistry.register(viewId, [
            {
                id: 'navigate:down',
                description: 'Move down',
                execute: () => {
                    const { nextHighlightIndex } = S.UI.filterPopoverData(currentStore().getState(), viewId)
                    post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))
                },
            },
            {
                id: 'navigate:up',
                description: 'Move up',
                execute: () => {
                    const { prevHighlightIndex } = S.UI.filterPopoverData(currentStore().getState(), viewId)
                    post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))
                },
            },
            { id: 'select', description: 'Select', execute: () => E.dateFilterSelectHighlighted(viewId) },
            {
                id: 'navigate:next-apply',
                description: 'Focus dates',
                execute: () => {
                    const dateRangeKey = S.UI.dateRangeKey(currentStore().getState(), viewId)
                    if (dateRangeKey === 'customDates') startDateEl.current?.focus('month')
                },
            },
            { id: 'dismiss', description: 'Dismiss', execute: () => post(Action.SetFilterPopoverOpen(viewId, null)) },
        ])
    },
}

// ---------------------------------------------------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------------------------------------------------

const clearButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--gray-6)',
    color: 'var(--gray-11)',
    fontSize: 10,
    cursor: 'pointer',
}

const optionStyle = { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderRadius: 'var(--radius-1)' }
const separatorStyle = { padding: 'var(--space-1) var(--space-3)', userSelect: 'none' }

const columnStyle = { display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }
const detailTextStyle = {
    fontSize: 'var(--font-size-1)',
    color: 'var(--gray-11)',
    lineHeight: 1.3,
    paddingLeft: 'var(--space-2)',
}

// ---------------------------------------------------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------------------------------------------------

const defaultGroupByItems = [
    { id: 'category', label: 'Category' },
    { id: 'account', label: 'Account' },
    { id: 'payee', label: 'Payee' },
    { id: 'month', label: 'Month' },
]

const investmentGroupByItems = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'securityType', label: 'Type' },
    { id: 'goal', label: 'Goal' },
]

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DateRangeUtils.DATE_RANGES).map(([key, label]) => ({ key, label }))

// ---------------------------------------------------------------------------------------------------------------------
// Shared helper components
// ---------------------------------------------------------------------------------------------------------------------

// A filter column with chip and detail lines below
// @sig FilterColumn :: { chip: ReactElement, details: [String] } -> ReactElement
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

// Separator line for option lists
// @sig OptionSeparator :: { id: String } -> ReactElement
const OptionSeparator = ({ id }) => (
    <Box key={id} style={separatorStyle}>
        <Text size="1" color="gray">
            ───────────────
        </Text>
    </Box>
)

// Selectable option row for dropdown menus
// @sig SelectableOption :: { id, label, isSelected, isHighlighted?, onSelect, closeOnSelect? } -> ReactElement
const SelectableOption = ({ id, label, isSelected, isHighlighted = false, onSelect, closeOnSelect = true }) => {
    const style = F.makeOptionStyle(isSelected, isHighlighted)
    const content = (
        <Box key={id} style={style} onClick={() => onSelect(id)}>
            <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                {label}
            </Text>
        </Box>
    )
    return closeOnSelect ? <Popover.Close key={id}>{content}</Popover.Close> : content
}

// Date range option that handles both separators and selectable options
// @sig DateRangeOption :: { option: { key, label }, selectedKey, isHighlighted?, onSelect } -> ReactElement
const DateRangeOption = ({ option, selectedKey, isHighlighted = false, onSelect }) => {
    const { key, label } = option
    if (key.startsWith('separator')) return <OptionSeparator key={key} id={key} />
    const closeOnSelect = key !== 'customDates'
    return (
        <SelectableOption
            key={key}
            id={key}
            label={label}
            isSelected={key === selectedKey}
            isHighlighted={isHighlighted}
            onSelect={onSelect}
            closeOnSelect={closeOnSelect}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// AccountFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Account filter chip with keyboard-navigable popover and search — fully controlled via Redux
// @sig AccountFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const AccountFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleSearchChange = text => post(Action.SetFilterPopoverSearch(viewId, text))
    const handleToggle = accountId => post(Action.ToggleAccountFilter(viewId, accountId))
    const handleClear = () => post(Action.SetTransactionFilter(viewId, { selectedAccounts: [] }))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleAccountFilter(viewId, highlightedItemId))

    const POPOVER_ID = 'accounts'
    const { badges, selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Accounts"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={175}
            isActive={isActive}
            actionContext={viewId}
            onSearchChange={handleSearchChange}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleClear}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// ActionFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Investment action filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig ActionFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const ActionFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleToggle = actionId => post(Action.ToggleActionFilter(viewId, actionId))
    const handleClear = () => post(Action.SetTransactionFilter(viewId, { selectedInvestmentActions: [] }))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleActionFilter(viewId, highlightedItemId))

    const POPOVER_ID = 'actions'
    const { badges } = useSelector(state => S.UI.actionFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Actions"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            width={150}
            isActive={isActive}
            actionContext={viewId}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleClear}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// CategoryFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Category filter chip with keyboard-navigable searchable popover — fully controlled via Redux
// @sig CategoryFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const CategoryFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleSearchChange = text => post(Action.SetFilterPopoverSearch(viewId, text))
    const handleClear = () => post(Action.SetTransactionFilter(viewId, { selectedCategories: [] }))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggle = categoryName => E.toggleCategoryFilter(viewId, categoryName, selectedIds)

    const handleToggleHighlighted = () =>
        highlightedItemId && E.toggleCategoryFilter(viewId, highlightedItemId, selectedIds)

    const POPOVER_ID = 'categories'
    const { badges, selectedIds } = useSelector(state => S.UI.categoryFilterData(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Categories"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={185}
            isActive={isActive}
            actionContext={viewId}
            onSearchChange={handleSearchChange}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleClear}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// AsOfDateChip
// ---------------------------------------------------------------------------------------------------------------------

// As-of date filter chip with single date picker for holdings view — Escape closes, KeyboardDateInput has own keymap
// @sig AsOfDateChip :: { viewId: String } -> ReactElement
const AsOfDateChip = ({ viewId }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
        if (open) setTimeout(() => dateInputEl.current?.focus('month'), 0)
    }

    // Converts Date to YYYY-MM-DD string and dispatches filter update
    // @sig handleDateChange :: Date? -> void
    const handleDateChange = date => {
        if (date) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            post(Action.SetTransactionFilter(viewId, { asOfDate: `${year}-${month}-${day}` }))
        }
    }

    const POPOVER_ID = 'asOfDate'
    const asOfDate = useSelector(state => S.UI.asOfDate(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const dateValue = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date()
    const triggerStyle = F.makeChipTriggerStyle(180, false)
    const displayDate = dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    useEffect(E.asOfDateActionsEffect(viewId), [isOpen, viewId])

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        As of: {displayDate}
                    </Text>
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-3)', width: 200 }}>
                <Flex direction="column" gap="2">
                    <Text size="1" color="gray" weight="medium">
                        Show holdings as of date
                    </Text>
                    <KeyboardDateInput
                        ref={el => (dateInputEl.current = el)}
                        value={dateValue}
                        onChange={handleDateChange}
                        actionContext={viewId}
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// DateFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Date filter chip with keyboard-navigable date range options popover
// @sig DateFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const DateFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))

    const handleSelect = key => {
        const dateRange = DateRangeUtils.calculateDateRange(key) ?? { start: null, end: null }
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: key, dateRange }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: 'all', dateRange: { start: null, end: null } }))
    }

    const handleCustomStartChange = date => {
        post(Action.SetTransactionFilter(viewId, { customStartDate: date }))
        if (date && customEndDate)
            post(Action.SetTransactionFilter(viewId, { dateRange: { start: date, end: endOfDay(customEndDate) } }))
    }

    const handleCustomEndChange = date => {
        post(Action.SetTransactionFilter(viewId, { customEndDate: date }))
        if (customStartDate && date)
            post(Action.SetTransactionFilter(viewId, { dateRange: { start: customStartDate, end: endOfDay(date) } }))
    }

    const POPOVER_ID = 'date'
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, highlightedItemId } = popoverData
    const isOpen = popoverId === POPOVER_ID
    const triggerStyle = F.makeChipTriggerStyle(180, isActive)
    const currentLabel = DateRangeUtils.DATE_RANGES[dateRangeKey] || 'All dates'

    useEffect(E.dateFilterActionsEffect(viewId), [isOpen, viewId])

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Date: {currentLabel}
                    </Text>
                    {isActive && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content
                style={{ padding: 'var(--space-1)', width: 220 }}
                onOpenAutoFocus={e => e.preventDefault()}
            >
                {/* prettier-ignore */}
                <Flex direction="column">
                    {dateRangeOptions.map(opt => (
                        <DateRangeOption key={opt.key} option={opt} selectedKey={dateRangeKey}
                            isHighlighted={highlightedItemId === opt.key} onSelect={handleSelect} />
                    ))}
                </Flex>
                {dateRangeKey === 'customDates' && (
                    <Flex direction="column" gap="2" mt="2" p="2" style={{ borderTop: '1px solid var(--gray-5)' }}>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                Start Date
                            </Text>
                            <KeyboardDateInput
                                ref={el => (startDateEl.current = el)}
                                value={customStartDate}
                                onChange={handleCustomStartChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => endDateEl.current?.focus('month')}
                                actionContext={viewId}
                            />
                        </Flex>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                End Date
                            </Text>
                            <KeyboardDateInput
                                ref={el => (endDateEl.current = el)}
                                value={customEndDate}
                                onChange={handleCustomEndChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => startDateEl.current?.focus('month')}
                                actionContext={viewId}
                            />
                        </Flex>
                    </Flex>
                )}
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// GroupByFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Group by filter chip with keyboard-navigable single-select popover
// @sig GroupByFilterChip :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const GroupByFilterChip = ({ viewId, items }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleToggle = value => {
        post(Action.SetTransactionFilter(viewId, { groupBy: value }))
        handleDismiss()
    }

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        resolvedItems[highlightedIndex] && handleToggle(resolvedItems[highlightedIndex].id)

    const POPOVER_ID = 'groupBy'
    const resolvedItems = items ?? defaultGroupByItems
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const rawHighlight = useSelector(state => S.UI.filterPopoverHighlight(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const selectedId = groupBy || resolvedItems[0]?.id
    const selectedIds = selectedId ? [selectedId] : []
    const selectedItems = T.toSelectedItems(resolvedItems, selectedId)

    // prettier-ignore
    const { index: highlightedIndex, next: nextHighlightIndex, prev: prevHighlightIndex } = wrapIndex(rawHighlight || 0, resolvedItems.length)

    return (
        <SelectableListPopover
            label="Group by"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={resolvedItems}
            selectedIds={selectedIds}
            selectedItems={selectedItems}
            highlightedIndex={highlightedIndex}
            singleSelect
            width={155}
            actionContext={viewId}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleDismiss}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// SearchFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Search filter chip with inline text input popover
// @sig SearchFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const SearchFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
        if (open) setTimeout(() => searchInputEl.current?.focus(), 0)
    }

    const handleChange = e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleKeyDown = e => e.key === 'Escape' && (e.preventDefault(), handleDismiss())

    const POPOVER_ID = 'search'
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const triggerStyle = F.makeChipTriggerStyle(120, isActive)
    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                    </Text>
                    {hasQuery && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-2)', width: 250 }}>
                <Flex direction="column" gap="2">
                    <Text size="1" color="gray" weight="medium">
                        Search transactions
                    </Text>
                    <TextField.Root
                        ref={el => (searchInputEl.current = el)}
                        placeholder="Type to filter..."
                        value={filterQuery || ''}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// SecurityFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Security filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig SecurityFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const SecurityFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleSearchChange = text => post(Action.SetFilterPopoverSearch(viewId, text))
    const handleToggle = securityId => post(Action.ToggleSecurityFilter(viewId, securityId))
    const handleClear = () => post(Action.SetTransactionFilter(viewId, { selectedSecurities: [] }))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleSecurityFilter(viewId, highlightedItemId))

    const POPOVER_ID = 'securities'
    const { badges } = useSelector(state => S.UI.securityFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedSecurities(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Securities"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={175}
            isActive={isActive}
            actionContext={viewId}
            onSearchChange={handleSearchChange}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleClear}
        />
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------------------------------------------------

const FilterChips = {
    AccountFilterChip,
    ActionFilterChip,
    AsOfDateChip,
    CategoryFilterChip,
    DateFilterChip,
    FilterColumn,
    GroupByFilterChip,
    investmentGroupByItems,
    SearchFilterChip,
    SecurityFilterChip,
}

export { FilterChips }
