// ABOUTME: All filter chip components for transaction filtering UI
// ABOUTME: Consolidated chips with shared styles for accounts, actions, categories, dates, search, securities, groupBy

import {
    Box,
    calculateDateRange,
    CategorySelector,
    FilterChipPopover,
    DATE_RANGES,
    Flex,
    KeyboardDateInput,
    Popover,
    Text,
    TextField,
} from '@graffio/design-system'
import { endOfDay } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

// ---------------------------------------------------------------------------------------------------------------------
// Cohesion groups
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Finds current group-by option from options list
    // @sig toCurrentOption :: ([{ value, label }], String?) -> { value, label }
    toCurrentOption: (options, groupBy) => options.find(o => o.value === groupBy) || options[0],

    // Converts options ({value, label}) to items ({id, label}) format for FilterChipPopover
    // @sig toItems :: [{ value, label }] -> [{ id, label }]
    toItems: options => options.map(({ value, label }) => ({ id: value, label })),

    // Gets selected item from items array by ID
    // @sig toSelectedItems :: ([{ id, label }], String?) -> [{ id, label }]
    toSelectedItems: (items, selectedId) => items.filter(item => item.id === selectedId),
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

    // Creates option style with selected state
    // @sig makeOptionStyle :: Boolean -> Style
    makeOptionStyle: isSelected => ({
        ...optionStyle,
        backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
    }),
}

const E = {
    // Dispatches keymap registration action
    // @sig handleRegisterKeymap :: Keymap -> void
    handleRegisterKeymap: keymap => post(Action.RegisterKeymap(keymap)),

    // Dispatches keymap unregistration action
    // @sig handleUnregisterKeymap :: String -> void
    handleUnregisterKeymap: id => post(Action.UnregisterKeymap(id)),
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

const defaultGroupByOptions = [
    { value: 'category', label: 'Category' },
    { value: 'account', label: 'Account' },
    { value: 'payee', label: 'Payee' },
    { value: 'month', label: 'Month' },
]

const investmentGroupByOptions = [
    { value: 'account', label: 'Account' },
    { value: 'security', label: 'Security' },
    { value: 'securityType', label: 'Type' },
    { value: 'goal', label: 'Goal' },
]

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DATE_RANGES).map(([key, label]) => ({ key, label }))

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
// @sig SelectableOption :: { id, label, isSelected, onSelect, closeOnSelect? } -> ReactElement
const SelectableOption = ({ id, label, isSelected, onSelect, closeOnSelect = true }) => {
    const style = F.makeOptionStyle(isSelected)
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
// @sig DateRangeOption :: { option: { key, label }, selectedKey: String, onSelect: Function } -> ReactElement
const DateRangeOption = ({ option, selectedKey, onSelect }) => {
    const { key, label } = option
    if (key.startsWith('separator')) return <OptionSeparator key={key} id={key} />
    const closeOnSelect = key !== 'customDates'
    return (
        <SelectableOption
            key={key}
            id={key}
            label={label}
            isSelected={key === selectedKey}
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

    const handleMoveDown = () =>
        post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleAccountFilter(viewId, highlightedItemId))

    const KEYMAP_ID = `${viewId}_accounts`
    const POPOVER_ID = 'accounts'
    const { badges, selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    return (
        <FilterChipPopover
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
            keymapId={KEYMAP_ID}
            onRegisterKeymap={E.handleRegisterKeymap}
            onUnregisterKeymap={E.handleUnregisterKeymap}
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

    const handleMoveDown = () =>
        post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleActionFilter(viewId, highlightedItemId))

    const KEYMAP_ID = `${viewId}_actions`
    const POPOVER_ID = 'actions'
    const { badges } = useSelector(state => S.UI.actionFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    return (
        <FilterChipPopover
            label="Actions"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            width={150}
            isActive={isActive}
            keymapId={KEYMAP_ID}
            onRegisterKeymap={E.handleRegisterKeymap}
            onUnregisterKeymap={E.handleUnregisterKeymap}
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

// Category filter chip with inline category selector popover
// @sig CategoryFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const CategoryFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
    const handleCategoryAdd = category => post(Action.AddCategoryFilter(viewId, category))
    const handleCategoryRemove = category => post(Action.RemoveCategoryFilter(viewId, category))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedCategories: [] }))
    }

    const POPOVER_ID = 'categories'
    const selectedCategories = useSelector(state => S.UI.selectedCategories(state, viewId))
    const allCategories = useSelector(S.Categories.allNames)
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const triggerStyle = F.makeChipTriggerStyle(185, isActive)
    const { length: count } = selectedCategories
    const label = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Categories: {label}
                    </Text>
                    {count > 0 && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-3)', minWidth: 300 }}>
                <CategorySelector
                    categories={allCategories}
                    selectedCategories={selectedCategories}
                    onCategoryAdded={handleCategoryAdd}
                    onCategoryRemoved={handleCategoryRemove}
                    keymapId={`${viewId}_category`}
                    keymapName="Category Filter"
                    onRegisterKeymap={E.handleRegisterKeymap}
                    onUnregisterKeymap={E.handleUnregisterKeymap}
                />
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// AsOfDateChip
// ---------------------------------------------------------------------------------------------------------------------

// As-of date filter chip with single date picker for holdings view
// @sig AsOfDateChip :: { viewId: String } -> ReactElement
const AsOfDateChip = ({ viewId }) => {
    const handleOpenChange = open => {
        post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
        if (open) setTimeout(() => dateInputRef.current?.focus('month'), 0)
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
    const dateInputRef = useRef(null)
    const triggerStyle = F.makeChipTriggerStyle(180, false)
    const displayDate = dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

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
                        ref={dateInputRef}
                        value={dateValue}
                        onChange={handleDateChange}
                        keymapId={`${viewId}_date_asof`}
                        keymapName="Date Input"
                        onRegisterKeymap={E.handleRegisterKeymap}
                        onUnregisterKeymap={E.handleUnregisterKeymap}
                    />
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// DateFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Date filter chip with inline date range options popover — Escape closes, date inputs have own keymaps
// @sig DateFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const DateFilterChip = ({ viewId, isActive = false }) => {
    const handleOpenChange = open => post(Action.SetFilterPopoverOpen(viewId, open ? POPOVER_ID : null))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleSelect = key => {
        const dateRange = calculateDateRange(key) ?? { start: null, end: null }
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

    // Escape keymap effect — closes popover when Escape pressed
    // @sig escapeKeymapEffect :: () -> (() -> void)?
    const escapeKeymapEffect = () => {
        if (!isOpen) return undefined
        const keymap = KeymapModule.fromBindings(KEYMAP_ID, 'Date Filter', [
            { description: 'Dismiss', keys: ['Escape'], action: handleDismiss },
        ])
        E.handleRegisterKeymap(keymap)
        return () => E.handleUnregisterKeymap(KEYMAP_ID)
    }

    const KEYMAP_ID = `${viewId}_date`
    const POPOVER_ID = 'date'
    const { handleRegisterKeymap, handleUnregisterKeymap } = E
    const startDateRef = useRef(null)
    const endDateRef = useRef(null)
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const triggerStyle = F.makeChipTriggerStyle(180, isActive)
    const currentLabel = DATE_RANGES[dateRangeKey] || 'All dates'

    useEffect(escapeKeymapEffect, [isOpen, viewId])

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
            <Popover.Content style={{ padding: 'var(--space-1)', width: 220 }}>
                {/* prettier-ignore */}
                <Flex direction="column">
                    {dateRangeOptions.map(opt => (
                        <DateRangeOption key={opt.key} option={opt}
                            selectedKey={dateRangeKey} onSelect={handleSelect} />
                    ))}
                </Flex>
                {dateRangeKey === 'customDates' && (
                    <Flex direction="column" gap="2" mt="2" p="2" style={{ borderTop: '1px solid var(--gray-5)' }}>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                Start Date
                            </Text>
                            <KeyboardDateInput
                                ref={startDateRef}
                                value={customStartDate}
                                onChange={handleCustomStartChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => endDateRef?.current?.focus('month')}
                                keymapId={`${viewId}_date_start`}
                                keymapName="Date Input"
                                onRegisterKeymap={handleRegisterKeymap}
                                onUnregisterKeymap={handleUnregisterKeymap}
                            />
                        </Flex>
                        <Flex direction="column" gap="1">
                            <Text size="1" color="gray" weight="medium">
                                End Date
                            </Text>
                            <KeyboardDateInput
                                ref={endDateRef}
                                value={customEndDate}
                                onChange={handleCustomEndChange}
                                placeholder="MM/DD/YYYY"
                                onTabOut={() => startDateRef?.current?.focus('month')}
                                keymapId={`${viewId}_date_end`}
                                keymapName="Date Input"
                                onRegisterKeymap={handleRegisterKeymap}
                                onUnregisterKeymap={handleUnregisterKeymap}
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
// @sig GroupByFilterChip :: { viewId: String, options?: [{ value, label }] } -> ReactElement
const GroupByFilterChip = ({ viewId, options }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleToggle = value => {
        post(Action.SetTransactionFilter(viewId, { groupBy: value }))
        handleDismiss()
    }

    const handleMoveDown = () =>
        post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () => items[highlightedIndex] && handleToggle(items[highlightedIndex].id)

    const KEYMAP_ID = `${viewId}_group_by`
    const POPOVER_ID = 'groupBy'
    const resolvedOptions = options ?? defaultGroupByOptions
    const items = T.toItems(resolvedOptions)
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const rawHighlight = useSelector(state => S.UI.filterPopoverHighlight(state, viewId))
    const isOpen = popoverId === POPOVER_ID
    const selectedId = groupBy || items[0]?.id
    const selectedIds = selectedId ? [selectedId] : []
    const selectedItems = T.toSelectedItems(items, selectedId)
    const count = items.length
    const highlightedIndex = count === 0 ? 0 : Math.min(rawHighlight || 0, count - 1)
    const nextHighlightIndex = count === 0 ? 0 : highlightedIndex < count - 1 ? highlightedIndex + 1 : 0
    const prevHighlightIndex = count === 0 ? 0 : highlightedIndex > 0 ? highlightedIndex - 1 : count - 1

    return (
        <FilterChipPopover
            label="Group by"
            open={isOpen}
            onOpenChange={handleOpenChange}
            items={items}
            selectedIds={selectedIds}
            selectedItems={selectedItems}
            highlightedIndex={highlightedIndex}
            singleSelect
            width={155}
            keymapId={KEYMAP_ID}
            onRegisterKeymap={E.handleRegisterKeymap}
            onUnregisterKeymap={E.handleUnregisterKeymap}
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
        if (open) setTimeout(() => inputRef.current?.focus(), 0)
    }

    const handleChange = e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const handleKeyDown = e => {
        if (e.key === 'Escape') handleClear(e)
    }

    const POPOVER_ID = 'search'
    const inputRef = useRef(null)
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
                        ref={inputRef}
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

    const handleMoveDown = () =>
        post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetTransactionFilter(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleSecurityFilter(viewId, highlightedItemId))

    const KEYMAP_ID = `${viewId}_securities`
    const POPOVER_ID = 'securities'
    const { badges } = useSelector(state => S.UI.securityFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedSecurities(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    return (
        <FilterChipPopover
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
            keymapId={KEYMAP_ID}
            onRegisterKeymap={E.handleRegisterKeymap}
            onUnregisterKeymap={E.handleUnregisterKeymap}
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
    investmentGroupByOptions,
    SearchFilterChip,
    SecurityFilterChip,
}

export { FilterChips }
