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
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

// ---------------------------------------------------------------------------------------------------------------------
// Cohesion groups
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Creates chip trigger style with specified width
    // @sig makeChipTriggerStyle :: Number -> Style
    makeChipTriggerStyle: width => ({
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-4)',
        cursor: 'pointer',
        userSelect: 'none',
        width,
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

const INVESTMENT_ACTIONS = [
    { id: 'Buy', label: 'Buy' },
    { id: 'Sell', label: 'Sell' },
    { id: 'Div', label: 'Dividend' },
    { id: 'ReinvDiv', label: 'Reinvest Dividend' },
    { id: 'XIn', label: 'Transfer In' },
    { id: 'XOut', label: 'Transfer Out' },
    { id: 'ContribX', label: 'Contribution' },
    { id: 'WithdrwX', label: 'Withdrawal' },
    { id: 'ShtSell', label: 'Short Sell' },
    { id: 'CvrShrt', label: 'Cover Short' },
    { id: 'CGLong', label: 'Long-Term Gain' },
    { id: 'CGShort', label: 'Short-Term Gain' },
    { id: 'MargInt', label: 'Margin Interest' },
    { id: 'ShrsIn', label: 'Shares In' },
    { id: 'ShrsOut', label: 'Shares Out' },
    { id: 'StkSplit', label: 'Stock Split' },
    { id: 'Exercise', label: 'Exercise Option' },
    { id: 'Expire', label: 'Expire Option' },
]

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
    const style = { ...optionStyle, backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent' }
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
    const handleToggleAccount = accountId => {
        const isSelected = selectedAccounts.includes(accountId)
        const updated = isSelected ? selectedAccounts.filter(id => id !== accountId) : [...selectedAccounts, accountId]
        post(Action.SetTransactionFilter(viewId, { selectedAccounts: updated }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedAccounts: [] }))
    }

    const toSelectedBadge = id => (
        <SelectedBadge key={id} id={id} label={accounts.get(id)?.name || id} onRemove={handleToggleAccount} />
    )

    // Maps account to checkbox row element
    // @sig toCheckboxRow :: { id: String, name: String } -> ReactElement
    const toCheckboxRow = ({ id, name }) => (
        <CheckboxRow
            key={id}
            id={id}
            label={name}
            isSelected={selectedAccounts.includes(id)}
            onToggle={handleToggleAccount}
        />
    )

    const baseTriggerStyle = F.makeChipTriggerStyle(175)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }

    const selectedAccounts = useSelector(state => S.UI.selectedAccounts(state, viewId))
    const accounts = useSelector(S.accounts)
    const accountList = accounts ? Array.from(accounts).map(a => ({ id: a.id, name: a.name })) : []
    const { length: count } = selectedAccounts
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
                        {selectedAccounts.map(toSelectedBadge)}
                    </Flex>
                )}
                <ScrollArea style={{ maxHeight: 200 }}>
                    {accountList.map(toCheckboxRow)}
                    {accountList.length === 0 && (
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
    const handleToggleAction = actionId => {
        const isSelected = selectedActions.includes(actionId)
        const updated = isSelected ? selectedActions.filter(id => id !== actionId) : [...selectedActions, actionId]
        post(Action.SetTransactionFilter(viewId, { selectedInvestmentActions: updated }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedInvestmentActions: [] }))
    }

    // Maps action id to removable badge element
    // @sig toSelectedBadge :: String -> ReactElement
    const toSelectedBadge = id => (
        <SelectedBadge
            key={id}
            id={id}
            label={INVESTMENT_ACTIONS.find(a => a.id === id)?.label || id}
            onRemove={handleToggleAction}
        />
    )

    // Maps action to checkbox row element
    // @sig toCheckboxRow :: { id: String, label: String } -> ReactElement
    const toCheckboxRow = ({ id, label }) => (
        <CheckboxRow
            key={id}
            id={id}
            label={label}
            isSelected={selectedActions.includes(id)}
            onToggle={handleToggleAction}
        />
    )

    const selectedActions = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))
    const baseTriggerStyle = F.makeChipTriggerStyle(150)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }
    const { length: count } = selectedActions
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
                        {selectedActions.map(toSelectedBadge)}
                    </Flex>
                )}
                {INVESTMENT_ACTIONS.map(toCheckboxRow)}
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
    const handleCategoryAdd = category =>
        post(Action.SetTransactionFilter(viewId, { selectedCategories: [...selectedCategories, category] }))

    const handleCategoryRemove = category => {
        const remaining = selectedCategories.filter(c => c !== category)
        post(Action.SetTransactionFilter(viewId, { selectedCategories: remaining }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedCategories: [] }))
    }

    const selectedCategories = useSelector(state => S.UI.selectedCategories(state, viewId))
    const allCategories = useSelector(S.Categories.allNames)
    const baseTriggerStyle = F.makeChipTriggerStyle(185)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }
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
    const baseTriggerStyle = F.makeChipTriggerStyle(180)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: 'var(--accent-3)' }
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
        const dateRange = calculateDateRange(key)
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: key, dateRange }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { dateRangeKey: 'all', dateRange: null }))
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

    const toDateRangeOption = opt => (
        <DateRangeOption key={opt.key} option={opt} selectedKey={dateRangeKey} onSelect={handleSelect} />
    )

    const { handleRegisterKeymap, handleUnregisterKeymap } = E
    const startDateRef = useRef(null)
    const endDateRef = useRef(null)
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.UI.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.UI.customEndDate(state, viewId))
    const baseTriggerStyle = F.makeChipTriggerStyle(180)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }
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
                <Flex direction="column">{dateRangeOptions.map(toDateRangeOption)}</Flex>
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

    // Maps group option to selectable option element
    // @sig toOption :: { value: String, label: String } -> ReactElement
    const toOption = ({ value, label }) => (
        <SelectableOption
            key={value}
            id={value}
            label={label}
            isSelected={value === (groupBy || defaultValue)}
            onSelect={handleSelect}
        />
    )

    const resolvedOptions = options ?? defaultGroupByOptions
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const baseTriggerStyle = F.makeChipTriggerStyle(155)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: 'var(--accent-3)' }
    const currentOption = resolvedOptions.find(o => o.value === groupBy) || resolvedOptions[0]
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
                <Flex direction="column">{resolvedOptions.map(toOption)}</Flex>
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
    const baseTriggerStyle = F.makeChipTriggerStyle(120)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }
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
    // Toggles security selection and updates filter
    // @sig handleToggleSecurity :: String -> void
    const handleToggleSecurity = securityId => {
        const isSelected = selectedSecurities.includes(securityId)
        const updated = isSelected
            ? selectedSecurities.filter(id => id !== securityId)
            : [...selectedSecurities, securityId]
        post(Action.SetTransactionFilter(viewId, { selectedSecurities: updated }))
    }

    const handleClear = e => {
        e.stopPropagation()
        post(Action.SetTransactionFilter(viewId, { selectedSecurities: [] }))
    }

    const toSelectedBadge = id => (
        <SelectedBadge key={id} id={id} label={securities.get(id)?.symbol || id} onRemove={handleToggleSecurity} />
    )

    // Maps security to checkbox row element
    // @sig toCheckboxRow :: { id: String, symbol: String, name: String } -> ReactElement
    const toCheckboxRow = ({ id, symbol, name }) => (
        <CheckboxRow
            key={id}
            id={id}
            label={`${symbol} - ${name}`}
            isSelected={selectedSecurities.includes(id)}
            onToggle={handleToggleSecurity}
        />
    )

    const selectedSecurities = useSelector(state => S.UI.selectedSecurities(state, viewId))
    const securities = useSelector(S.securities)
    const securityList = securities ? Array.from(securities).map(({ id, symbol, name }) => ({ id, symbol, name })) : []
    const baseTriggerStyle = F.makeChipTriggerStyle(175)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }
    const { length: count } = selectedSecurities
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
                        {selectedSecurities.map(toSelectedBadge)}
                    </Flex>
                )}
                <ScrollArea style={{ maxHeight: 350 }}>
                    {securityList.map(toCheckboxRow)}
                    {securityList.length === 0 && (
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
