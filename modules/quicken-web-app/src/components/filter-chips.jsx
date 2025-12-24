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
// Shared styles
// ---------------------------------------------------------------------------------------------------------------------

// Generate trigger style with specified width
// @sig makeChipTriggerStyle :: Number -> Style
const makeChipTriggerStyle = width => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width,
})

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

const groupByOptions = [
    { value: 'category', label: 'Category' },
    { value: 'account', label: 'Account' },
    { value: 'payee', label: 'Payee' },
    { value: 'month', label: 'Month' },
]

// Convert DATE_RANGES object to array of {key, label} entries
// @sig dateRangeOptions :: [{ key: String, label: String }]
const dateRangeOptions = Object.entries(DATE_RANGES).map(([key, label]) => ({ key, label }))

// ---------------------------------------------------------------------------------------------------------------------
// AccountFilterChip
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Account filter chip with inline account multi-select popover
 *
 * @sig AccountFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
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

    // Render a selected account badge
    // @sig renderSelectedBadge :: String -> ReactElement
    const renderSelectedBadge = id => {
        const account = accounts.get(id)
        return (
            <Badge key={id} variant="soft" style={{ cursor: 'pointer' }} onClick={() => handleToggleAccount(id)}>
                {account?.name || id} ×
            </Badge>
        )
    }

    // Render an account row with checkbox
    // @sig renderAccountRow :: { id: String, name: String } -> ReactElement
    const renderAccountRow = ({ id, name }) => (
        <Flex key={id} align="center" gap="2" style={itemRowStyle} onClick={() => handleToggleAccount(id)}>
            <Checkbox checked={selectedAccounts.includes(id)} />
            <Text size="2">{name}</Text>
        </Flex>
    )

    const selectedAccounts = useSelector(state => S.selectedAccounts(state, viewId))
    const accounts = useSelector(S.accounts)

    const baseTriggerStyle = makeChipTriggerStyle(175)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }

    // Convert LookupTable to array of {id, name}
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
                        {selectedAccounts.map(renderSelectedBadge)}
                    </Flex>
                )}
                <ScrollArea style={{ maxHeight: 200 }}>
                    {accountList.map(renderAccountRow)}
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

/*
 * Investment action filter chip with inline multi-select popover
 *
 * @sig ActionFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
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

    // Render a selected action badge
    // @sig renderSelectedBadge :: String -> ReactElement
    const renderSelectedBadge = id => {
        const action = INVESTMENT_ACTIONS.find(a => a.id === id)
        return (
            <Badge key={id} variant="soft" style={{ cursor: 'pointer' }} onClick={() => handleToggleAction(id)}>
                {action?.label || id} ×
            </Badge>
        )
    }

    // Render an action row with checkbox
    // @sig renderActionRow :: { id: String, label: String } -> ReactElement
    const renderActionRow = ({ id, label }) => (
        <Flex key={id} align="center" gap="2" style={itemRowStyle} onClick={() => handleToggleAction(id)}>
            <Checkbox checked={selectedActions.includes(id)} />
            <Text size="2">{label}</Text>
        </Flex>
    )

    const selectedActions = useSelector(state => S.selectedInvestmentActions(state, viewId))
    const baseTriggerStyle = makeChipTriggerStyle(150)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }

    const { length: count } = selectedActions
    const label = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Actions: {label}
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
                        {selectedActions.map(renderSelectedBadge)}
                    </Flex>
                )}
                {INVESTMENT_ACTIONS.map(renderActionRow)}
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// CategoryFilterChip
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Category filter chip with inline category selector popover
 *
 * @sig CategoryFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
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

    const selectedCategories = useSelector(state => S.selectedCategories(state, viewId))
    const allCategories = useSelector(S.allCategoryNames)

    const baseTriggerStyle = makeChipTriggerStyle(185)
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
                />
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// DateFilterChip
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Date filter chip with inline date range options popover
 *
 * @sig DateFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
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

    // Render a separator row
    // @sig renderSeparator :: String -> ReactElement
    const renderSeparator = key => (
        <Box key={key} style={separatorStyle}>
            <Text size="1" color="gray">
                ───────────────
            </Text>
        </Box>
    )

    // Render a selectable option row
    // @sig renderSelectableOption :: (String, String, Boolean) -> ReactElement
    const renderSelectableOption = (key, label, isSelected) => {
        const style = { ...optionStyle, backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent' }
        const content = (
            <Box key={key} style={style} onClick={() => handleSelect(key)}>
                <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                    {label}
                </Text>
            </Box>
        )

        // Don't close popover for customDates so user can enter dates
        return key === 'customDates' ? content : <Popover.Close key={key}>{content}</Popover.Close>
    }

    // Render a date range option row
    // @sig renderOption :: { key: String, label: String } -> ReactElement
    const renderOption = ({ key, label }) => {
        if (key.startsWith('separator')) return renderSeparator(key)
        return renderSelectableOption(key, label, key === dateRangeKey)
    }

    const startDateRef = useRef(null)
    const endDateRef = useRef(null)

    const dateRangeKey = useSelector(state => S.dateRangeKey(state, viewId))
    const customStartDate = useSelector(state => S.customStartDate(state, viewId))
    const customEndDate = useSelector(state => S.customEndDate(state, viewId))
    const baseTriggerStyle = makeChipTriggerStyle(180)
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
                <Flex direction="column">{dateRangeOptions.map(renderOption)}</Flex>
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

/*
 * Group by filter chip with inline dimension selector popover
 *
 * @sig GroupByFilterChip :: { viewId: String } -> ReactElement
 */
const GroupByFilterChip = ({ viewId }) => {
    const handleSelect = value => post(Action.SetTransactionFilter(viewId, { groupBy: value }))

    // Render a group by option row
    // @sig renderOption :: { value: String, label: String } -> ReactElement
    const renderOption = ({ value, label }) => {
        const isSelected = value === (groupBy || 'category')
        const style = { ...optionStyle, backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent' }
        return (
            <Popover.Close key={value}>
                <Box style={style} onClick={() => handleSelect(value)}>
                    <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                        {label}
                    </Text>
                </Box>
            </Popover.Close>
        )
    }

    const groupBy = useSelector(state => S.groupBy(state, viewId))

    const baseTriggerStyle = makeChipTriggerStyle(155)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: 'var(--accent-3)' }
    const currentOption = groupByOptions.find(o => o.value === groupBy) || groupByOptions[0]

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
                <Flex direction="column">{groupByOptions.map(renderOption)}</Flex>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
// SearchFilterChip
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Search filter chip with inline text input popover
 *
 * @sig SearchFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
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
    const filterQuery = useSelector(state => S.filterQuery(state, viewId))
    const baseTriggerStyle = makeChipTriggerStyle(120)
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

/*
 * Security filter chip with inline security multi-select popover
 *
 * @sig SecurityFilterChip :: { viewId: String, isActive?: Boolean } -> ReactElement
 */
const SecurityFilterChip = ({ viewId, isActive = false }) => {
    /*
     * Toggle security selection in filter
     * @sig handleToggleSecurity :: String -> void
     */
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

    // Render a selected security badge
    // @sig renderSelectedBadge :: String -> ReactElement
    const renderSelectedBadge = id => {
        const security = securities.get(id)
        return (
            <Badge key={id} variant="soft" style={{ cursor: 'pointer' }} onClick={() => handleToggleSecurity(id)}>
                {security?.symbol || id} ×
            </Badge>
        )
    }

    // Render a security row with checkbox
    // @sig renderSecurityRow :: { id: String, symbol: String, name: String } -> ReactElement
    const renderSecurityRow = ({ id, symbol, name }) => (
        <Flex key={id} align="center" gap="2" style={itemRowStyle} onClick={() => handleToggleSecurity(id)}>
            <Checkbox checked={selectedSecurities.includes(id)} />
            <Text size="2">
                {symbol} - {name}
            </Text>
        </Flex>
    )

    // @sig toSecurityItem :: Security -> { id: String, symbol: String, name: String }
    const toSecurityItem = ({ id, symbol, name }) => ({ id, symbol, name })

    const selectedSecurities = useSelector(state => S.selectedSecurities(state, viewId))
    const securities = useSelector(S.securities)
    const securityList = securities ? Array.from(securities).map(toSecurityItem) : []
    const baseTriggerStyle = makeChipTriggerStyle(175)
    const triggerStyle = { ...baseTriggerStyle, backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)' }

    const { length: count } = selectedSecurities
    const label = count > 0 ? `${count} selected` : 'All'

    return (
        <Popover.Root>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        Securities: {label}
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
                        {selectedSecurities.map(renderSelectedBadge)}
                    </Flex>
                )}
                <ScrollArea style={{ maxHeight: 350 }}>
                    {securityList.map(renderSecurityRow)}
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

export {
    AccountFilterChip,
    ActionFilterChip,
    CategoryFilterChip,
    DateFilterChip,
    GroupByFilterChip,
    SearchFilterChip,
    SecurityFilterChip,
}
