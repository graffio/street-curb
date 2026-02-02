// ABOUTME: All filter chip components for transaction filtering UI
// ABOUTME: Consolidated chips with shared styles for accounts, actions, categories, dates, search, securities, groupBy

import {
    Badge,
    Box,
    calculateDateRange,
    CategorySelector,
    Checkbox,
    DATE_RANGES,
    Flex,
    KeyboardDateInput,
    Popover,
    ScrollArea,
    Text,
    TextField,
} from '@graffio/design-system'
import { endOfDay } from '@graffio/functional'
import React, { useRef } from 'react'
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

const itemRowStyle = { padding: 'var(--space-2)', borderBottom: '1px solid var(--gray-3)', cursor: 'pointer' }
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

// Removable badge for selected items
// @sig SelectedBadge :: { id: String, label: String, onRemove: Function } -> ReactElement
const SelectedBadge = ({ id, label, onRemove }) => (
    <Badge key={id} variant="soft" style={{ cursor: 'pointer' }} onClick={() => onRemove(id)}>
        {label} ×
    </Badge>
)

// Row with checkbox for multi-select lists
// @sig CheckboxRow :: { id: String, label: String, isSelected: Boolean, onToggle: Function } -> ReactElement
const CheckboxRow = ({ id, label, isSelected, onToggle }) => (
    <Flex key={id} align="center" gap="2" style={itemRowStyle} onClick={() => onToggle(id)}>
        <Checkbox checked={isSelected} />
        <Text size="2">{label}</Text>
    </Flex>
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

// Account filter chip with inline account multi-select popover
// @sig AccountFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const AccountFilterChip = ({ viewId, isActive = false }) => {
    const handleToggle = accountId => post(Action.ToggleAccountFilter(viewId, accountId))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedAccounts: [] }))
    }

    const { rows, badges, count } = useSelector(state => S.UI.accountFilterData(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(175, isActive)
    const label = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Accounts: {label}
                    </Text>
                    {count > 0 && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-2)', minWidth: 250 }}>
                {count > 0 && (
                    <Flex wrap="wrap" gap="1" mb="2">
                        {badges.map(({ id, label }) => (
                            <SelectedBadge key={id} id={id} label={label} onRemove={handleToggle} />
                        ))}
                    </Flex>
                )}
                <ScrollArea style={{ maxHeight: 200 }}>
                    {rows.map(({ id, name, isSelected }) => (
                        <CheckboxRow key={id} id={id} label={name} isSelected={isSelected} onToggle={handleToggle} />
                    ))}
                    {rows.length === 0 && (
                        <Text size="2" color="gray">
                            No accounts available
                        </Text>
                    )}
                </ScrollArea>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// ActionFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Investment action filter chip with inline multi-select popover
// @sig ActionFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const ActionFilterChip = ({ viewId, isActive = false }) => {
    const handleToggle = actionId => post(Action.ToggleActionFilter(viewId, actionId))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedInvestmentActions: [] }))
    }

    const { rows, badges, count } = useSelector(state => S.UI.actionFilterData(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(150, isActive)
    const chipLabel = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Actions: {chipLabel}
                    </Text>
                    {count > 0 && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-2)', minWidth: 200 }}>
                {count > 0 && (
                    <Flex wrap="wrap" gap="1" mb="2">
                        {badges.map(({ id, label }) => (
                            <SelectedBadge key={id} id={id} label={label} onRemove={handleToggle} />
                        ))}
                    </Flex>
                )}
                {rows.map(({ id, label, isSelected }) => (
                    <CheckboxRow key={id} id={id} label={label} isSelected={isSelected} onToggle={handleToggle} />
                ))}
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// CategoryFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Category filter chip with inline category selector popover
// @sig CategoryFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const CategoryFilterChip = ({ viewId, isActive = false }) => {
    const handleCategoryAdd = category => post(Action.AddCategoryFilter(viewId, category))
    const handleCategoryRemove = category => post(Action.RemoveCategoryFilter(viewId, category))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedCategories: [] }))
    }

    const selectedCategories = useSelector(state => S.UI.selectedCategories(state, viewId))
    const allCategories = useSelector(S.Categories.allNames)
    const triggerStyle = F.makeChipTriggerStyle(185, isActive)
    const { length: count } = selectedCategories
    const label = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
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

    const asOfDate = useSelector(state => S.UI.asOfDate(state, viewId))
    const dateValue = asOfDate ? new Date(asOfDate + 'T00:00:00') : new Date()
    const dateInputRef = useRef(null)
    const triggerStyle = F.makeChipTriggerStyle(180, false)
    const displayDate = dateValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <Popover.Root onOpenChange={open => open && setTimeout(() => dateInputRef.current?.focus('month'), 0)}>
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

// Date filter chip with inline date range options popover
// @sig DateFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const DateFilterChip = ({ viewId, isActive = false }) => {
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

    const { handleRegisterKeymap, handleUnregisterKeymap } = E
    const startDateRef = useRef(null)
    const endDateRef = useRef(null)
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(180, isActive)
    const currentLabel = DATE_RANGES[dateRangeKey] || 'All dates'

    return (
        <Popover.Root>
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

// Group by filter chip with inline dimension selector popover
// @sig GroupByFilterChip :: { viewId: String, options?: [{ value, label }] } -> ReactElement
const GroupByFilterChip = ({ viewId, options }) => {
    const handleSelect = value => post(Action.SetTransactionFilter(viewId, { groupBy: value }))

    const resolvedOptions = options ?? defaultGroupByOptions
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(155, false)
    const currentOption = T.toCurrentOption(resolvedOptions, groupBy)
    const defaultValue = resolvedOptions[0]?.value

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Group by: {currentOption.label}
                    </Text>
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-1)' }}>
                {/* prettier-ignore */}
                <Flex direction="column">
                    {resolvedOptions.map(({ value, label }) => (
                        <SelectableOption key={value} id={value} label={label}
                            isSelected={value === (groupBy || defaultValue)} onSelect={handleSelect} />
                    ))}
                </Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// SearchFilterChip
// ---------------------------------------------------------------------------------------------------------------------

// Search filter chip with inline text input popover
// @sig SearchFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const SearchFilterChip = ({ viewId, isActive = false }) => {
    const handleChange = e => post(Action.SetTransactionFilter(viewId, { filterQuery: e.target.value }))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { filterQuery: '' }))
    }

    const handleKeyDown = e => {
        if (e.key === 'Escape') handleClear(e)
    }

    const inputRef = useRef(null)
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(120, isActive)
    const hasQuery = filterQuery && filterQuery.length > 0
    const label = hasQuery ? filterQuery : 'Filter'

    return (
        <Popover.Root onOpenChange={open => open && setTimeout(() => inputRef.current?.focus(), 0)}>
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

// Security filter chip with inline security multi-select popover
// @sig SecurityFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
const SecurityFilterChip = ({ viewId, isActive = false }) => {
    const handleToggle = securityId => post(Action.ToggleSecurityFilter(viewId, securityId))

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedSecurities: [] }))
    }

    const { rows, badges, count } = useSelector(state => S.UI.securityFilterData(state, viewId))
    const triggerStyle = F.makeChipTriggerStyle(175, isActive)
    const chipLabel = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Securities: {chipLabel}
                    </Text>
                    {count > 0 && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={{ padding: 'var(--space-2)', minWidth: 300 }}>
                {count > 0 && (
                    <Flex wrap="wrap" gap="1" mb="2">
                        {badges.map(({ id, label }) => (
                            <SelectedBadge key={id} id={id} label={label} onRemove={handleToggle} />
                        ))}
                    </Flex>
                )}
                {/* prettier-ignore */}
                <ScrollArea style={{ maxHeight: 350 }}>
                    {rows.map(({ id, symbol, name, isSelected }) => (
                        <CheckboxRow key={id} id={id} label={`${symbol} - ${name}`}
                            isSelected={isSelected} onToggle={handleToggle} />
                    ))}
                    {rows.length === 0 && (
                        <Text size="2" color="gray">
                            No securities available
                        </Text>
                    )}
                </ScrollArea>
            </Popover.Content>
        </Popover.Root>
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
