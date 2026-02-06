// ABOUTME: Horizontal row of filter chips organized in columns
// ABOUTME: Each column shows chip + details below it (up to 3 lines)

import { Flex, Text } from '@graffio/design-system'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CellRenderers } from '../columns/CellRenderers.jsx'
import { post } from '../commands/post.js'
import { Action } from '../types/action.js'
import * as S from '../store/selectors.js'
import { formatDateRange } from '../utils/formatters.js'
import { FilterChips } from './FilterChips.jsx'

const { ACTION_LABELS } = CellRenderers
const { AccountFilterChip, ActionFilterChip, AsOfDateChip, CategoryFilterChip, DateFilterChip } = FilterChips
const { FilterColumn, GroupByFilterChip, SearchFilterChip, SecurityFilterChip } = FilterChips

const MAX_DETAIL_LINES = 3
const EMPTY_ARRAY = []

const containerBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }
const containerActiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--ruby-3)' }
const containerInactiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--gray-2)' }

const T = {
    // Truncates a list of strings to MAX_DETAIL_LINES with "+N more" suffix
    // @sig toTruncatedDetails :: [String] -> [String]
    toTruncatedDetails: items => {
        const { length } = items
        if (length === 0) return []
        if (length <= MAX_DETAIL_LINES) return items
        const shown = items.slice(0, MAX_DETAIL_LINES - 1)
        return [...shown, `+${length - shown.length} more`]
    },

    // Maps account IDs to names, then truncates
    // @sig toAccountDetails :: ([String], LookupTable) -> [String]
    toAccountDetails: (accountIds, accountLookup) => {
        if (accountIds.length === 0 || !accountLookup) return []
        const names = accountIds.map(id => accountLookup.get(id)?.name || id)
        return T.toTruncatedDetails(names)
    },

    // Maps security IDs to symbols, then truncates
    // @sig toSecurityDetails :: ([String], LookupTable) -> [String]
    toSecurityDetails: (securityIds, securityLookup) => {
        if (securityIds.length === 0 || !securityLookup) return []
        const symbols = securityIds.map(id => securityLookup.get(id)?.symbol || id)
        return T.toTruncatedDetails(symbols)
    },

    // Maps action codes to labels, then truncates
    // @sig toActionDetails :: [String] -> [String]
    toActionDetails: actionCodes => {
        if (actionCodes.length === 0) return []
        const labels = actionCodes.map(code => ACTION_LABELS[code] || code)
        return T.toTruncatedDetails(labels)
    },

    // Filters transactions by accountId (or returns all if no accountId)
    // @sig toAccountFiltered :: ([Transaction], String?) -> [Transaction]
    toAccountFiltered: (transactions, accountId) =>
        accountId ? transactions.filter(t => t.accountId === accountId) : transactions,
}

const F = {
    // Creates keymap with bindings for visible filter chips
    // @sig createFilterShortcutsKeymap :: (String, FilterConfig, Function) -> Keymap
    //     FilterConfig = { accounts, categories, date, actions, securities, groupBy, search }
    createFilterShortcutsKeymap: (viewId, config, openPopover) => {
        const { accounts, actions, asOfDate, categories, date, groupBy, search, securities } = config
        const bindings = []
        if (accounts) bindings.push({ description: 'Accounts', keys: ['a'], action: () => openPopover('accounts') })
        if (categories)
            bindings.push({ description: 'Categories', keys: ['c'], action: () => openPopover('categories') })
        if (date) bindings.push({ description: 'Date', keys: ['d'], action: () => openPopover('date') })
        if (asOfDate) bindings.push({ description: 'As of date', keys: ['d'], action: () => openPopover('asOfDate') })
        if (actions) bindings.push({ description: 'Actions', keys: ['x'], action: () => openPopover('actions') })
        if (securities)
            bindings.push({ description: 'Securities', keys: ['h'], action: () => openPopover('securities') })
        if (groupBy) bindings.push({ description: 'Group by', keys: ['g'], action: () => openPopover('groupBy') })
        if (search) bindings.push({ description: 'Search', keys: ['/', 'f'], action: () => openPopover('search') })
        return KeymapModule.fromBindings(`${viewId}_filters`, 'Filter shortcuts', bindings, { activeForViewId: viewId })
    },
}

const E = {
    handleRegisterKeymap: keymap => post(Action.RegisterKeymap(keymap)),
    handleUnregisterKeymap: keymapId => post(Action.UnregisterKeymap(keymapId)),
}

/*
 * Row of filter chips organized in columns with details below each chip
 *
 * @sig FilterChipRow :: FilterChipRowProps -> ReactElement
 *     FilterChipRowProps = { viewId, showGroupBy?, showAsOfDate?, showCategories?, showSecurities?, showActions?,
 *         accountId?, groupByOptions?, filteredCount?, totalCount?, itemLabel? }
 */
const FilterChipRow = props => {
    // Register filter shortcut keymap on mount, unregister on unmount
    // @sig keymapEffect :: () -> (() -> void)
    const keymapEffect = () => {
        const openPopover = popoverId => post(Action.SetFilterPopoverOpen(viewId, popoverId))
        const config = {
            accounts: showGroupBy,
            categories: showCategories,
            date: !showAsOfDate,
            asOfDate: showAsOfDate,
            actions: showActions,
            securities: showSecurities,
            groupBy: showGroupBy,
            search: true,
        }
        const keymap = F.createFilterShortcutsKeymap(viewId, config, openPopover)
        E.handleRegisterKeymap(keymap)
        return () => E.handleUnregisterKeymap(`${viewId}_filters`)
    }

    const { viewId, showGroupBy = false, showAsOfDate = false, showCategories = true } = props
    const { showSecurities = false, showActions = false } = props
    const { accountId = null, groupByOptions = null } = props
    const { filteredCount: filteredCountProp, totalCount: totalCountProp, itemLabel = 'transactions' } = props

    // Only fetch transaction data if counts not provided via props
    const needsTransactionData = filteredCountProp === undefined
    const allTransactions = useSelector(state => (needsTransactionData ? S.transactions(state) : null))
    const filteredTransactions = useSelector(state =>
        needsTransactionData ? S.Transactions.filtered(state, viewId) : EMPTY_ARRAY,
    )
    const dateRange = useSelector(state => S.UI.dateRange(state, viewId))
    const dateRangeKey = useSelector(state => S.UI.dateRangeKey(state, viewId))
    const filterQuery = useSelector(state => S.UI.filterQuery(state, viewId))
    const selectedCategories = useSelector(state => S.UI.selectedCategories(state, viewId))
    const selectedAccounts = useSelector(state => S.UI.selectedAccounts(state, viewId))
    const selectedSecurities = useSelector(state =>
        showSecurities ? S.UI.selectedSecurities(state, viewId) : EMPTY_ARRAY,
    )
    const selectedActions = useSelector(state =>
        showActions ? S.UI.selectedInvestmentActions(state, viewId) : EMPTY_ARRAY,
    )
    const accounts = useSelector(S.accounts)
    const securitiesLookup = useSelector(state => (showSecurities ? S.securities(state) : null))

    useEffect(keymapEffect, [viewId, showGroupBy, showAsOfDate, showCategories, showSecurities, showActions])

    const dateLabel = dateRange ? formatDateRange(dateRange.start, dateRange.end) : null
    const dateDetails = dateLabel ? [dateLabel] : []
    const categoryDetails = T.toTruncatedDetails(selectedCategories)
    const accountDetails = T.toAccountDetails(selectedAccounts, accounts)
    const securityDetails = T.toSecurityDetails(selectedSecurities, securitiesLookup)
    const actionDetails = T.toActionDetails(selectedActions)

    // Determine which filters are active
    const isDateActive = dateRangeKey !== 'all'
    const isCategoriesActive = selectedCategories.length > 0
    const isAccountsActive = selectedAccounts.length > 0
    const isSecuritiesActive = selectedSecurities.length > 0
    const isActionsActive = selectedActions.length > 0
    const isTextActive = filterQuery?.length > 0

    // Determine if any filtering is happening
    // Use props if provided, otherwise compute from transaction selectors
    const accountFilteredTxns = T.toAccountFiltered(filteredTransactions, accountId)
    const baseTransactions = T.toAccountFiltered(allTransactions ?? [], accountId)
    const filteredCount = filteredCountProp ?? accountFilteredTxns.length
    const totalCount = totalCountProp ?? baseTransactions.length
    const isFiltering = filteredCount < totalCount || (!showAsOfDate && isDateActive) || isTextActive

    const containerStyle = isFiltering ? containerActiveStyle : containerInactiveStyle

    return (
        <Flex direction="column" gap="2" style={containerStyle}>
            <Flex align="center" gap="2" style={{ paddingLeft: 'var(--space-2)' }}>
                <Text size="1" color="gray">
                    {filteredCount} {itemLabel}
                </Text>
                {isFiltering && (
                    <Text size="1" color="ruby" weight="medium">
                        (filtered from {totalCount})
                    </Text>
                )}
            </Flex>

            <Flex align="start" gap="3" wrap="wrap">
                {showAsOfDate ? (
                    <FilterColumn chip={<AsOfDateChip viewId={viewId} />} details={[]} />
                ) : (
                    <FilterColumn
                        chip={<DateFilterChip viewId={viewId} isActive={isDateActive} />}
                        details={dateDetails}
                    />
                )}

                {showCategories && (
                    <FilterColumn
                        chip={<CategoryFilterChip viewId={viewId} isActive={isCategoriesActive} />}
                        details={categoryDetails}
                    />
                )}

                {showGroupBy && (
                    <>
                        <FilterColumn
                            chip={<AccountFilterChip viewId={viewId} isActive={isAccountsActive} />}
                            details={accountDetails}
                        />
                        <FilterColumn
                            chip={<GroupByFilterChip viewId={viewId} options={groupByOptions} />}
                            details={[]}
                        />
                    </>
                )}

                {showSecurities && (
                    <FilterColumn
                        chip={<SecurityFilterChip viewId={viewId} isActive={isSecuritiesActive} />}
                        details={securityDetails}
                    />
                )}

                {showActions && (
                    <FilterColumn
                        chip={<ActionFilterChip viewId={viewId} isActive={isActionsActive} />}
                        details={actionDetails}
                    />
                )}

                <FilterColumn chip={<SearchFilterChip viewId={viewId} isActive={isTextActive} />} details={[]} />
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
