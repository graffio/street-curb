// ABOUTME: Horizontal row of filter chips organized in columns
// ABOUTME: Each column shows chip + details below it (up to 3 lines)

import { Flex, Text } from '@graffio/design-system'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { FilterChips } from './FilterChips.jsx'

const { AccountFilterChip, ActionFilterChip, AsOfDateChip, CategoryFilterChip, DateFilterChip } = FilterChips
const { FilterColumn, GroupByFilterChip, SearchFilterChip, SecurityFilterChip } = FilterChips

const containerBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }
const containerActiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--ruby-3)' }
const containerInactiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--gray-2)' }

const F = {
    // Creates keymap with bindings for visible filter chips
    // @sig createFilterShortcutsKeymap :: (String, FilterConfig, Function) -> Keymap
    //     FilterConfig = { accounts, categories, date, actions, securities, groupBy, search }
    // prettier-ignore
    createFilterShortcutsKeymap: (viewId, config, openPopover) => {
        const { accounts, actions, asOfDate, categories, date, groupBy, search, securities } = config
        const bindings = []
        if (accounts)   bindings.push({ description: 'Accounts'  , keys: ['a']      , action : () => openPopover('accounts') })
        if (categories) bindings.push({ description: 'Categories', keys: ['c']      , action : () => openPopover('categories') })
        if (date)       bindings.push({ description: 'Date'      , keys: ['d']      , action : () => openPopover('date') })
        if (asOfDate)   bindings.push({ description: 'As of date', keys: ['d']      , action : () => openPopover('asOfDate') })
        if (actions)    bindings.push({ description: 'Actions'   , keys: ['x']      , action : () => openPopover('actions') })
        if (securities) bindings.push({ description: 'Securities', keys: ['h']      , action : () => openPopover('securities') })
        if (groupBy)    bindings.push({ description: 'Group by'  , keys: ['g']      , action : () => openPopover('groupBy') })
        if (search)     bindings.push({ description: 'Search'    , keys: ['/' , 'f'], action : () => openPopover('search') })

        return KeymapModule.fromBindings(`${viewId}_filters`, 'Filter shortcuts', bindings, { activeForViewId: viewId })
    },
}

const E = {
    // Registers keymap effect for filter shortcuts
    // @sig keymapEffect :: (String, FilterConfig) -> (() -> void)
    keymapEffect: (viewId, config) => {
        const openPopover = popoverId => post(Action.SetFilterPopoverOpen(viewId, popoverId))
        const keymap = F.createFilterShortcutsKeymap(viewId, config, openPopover)
        post(Action.RegisterKeymap(keymap))
        return () => post(Action.UnregisterKeymap(`${viewId}_filters`))
    },
}

/*
 * Row of filter chips organized in columns with details below each chip
 *
 * @sig FilterChipRow :: FilterChipRowProps -> ReactElement
 *     FilterChipRowProps = { viewId, showGroupBy?, showAsOfDate?, showCategories?, showSecurities?, showActions?,
 *         accountId?, groupByOptions?, filteredCount?, totalCount?, itemLabel? }
 */
const FilterChipRow = props => {
    const { viewId, showGroupBy = false, showAsOfDate = false, showCategories = true } = props
    const { showSecurities = false, showActions = false } = props
    const { accountId = null, groupByOptions = null } = props
    const { filteredCount: filteredCountProp, totalCount: totalCountProp, itemLabel = 'transactions' } = props

    // Per-chip data selectors
    const { isActive: isDateActive, details: dateDetails } = useSelector(state => S.UI.dateChipData(state, viewId))
    const category = useSelector(state => S.UI.categoryChipData(state, viewId))
    const account = useSelector(state => S.UI.accountChipData(state, viewId))
    const security = useSelector(state => S.UI.securityChipData(state, viewId))
    const action = useSelector(state => S.UI.actionChipData(state, viewId))
    const { isActive: isSearchActive } = useSelector(state => S.UI.searchChipData(state, viewId))
    const counts = useSelector(state => S.UI.filterCounts(state, viewId, accountId))
    const { filtered, total, isFiltering: countsIsFiltering } = counts

    const keymapConfig = {
        accounts: showGroupBy,
        categories: showCategories,
        date: !showAsOfDate,
        asOfDate: showAsOfDate,
        actions: showActions,
        securities: showSecurities,
        groupBy: showGroupBy,
        search: true,
    }
    useEffect(
        () => E.keymapEffect(viewId, keymapConfig),
        [viewId, showGroupBy, showAsOfDate, showCategories, showSecurities, showActions],
    )

    // Use props if provided, otherwise use selector data
    const filteredCount = filteredCountProp ?? filtered
    const totalCount = totalCountProp ?? total
    const isFiltering =
        filteredCountProp !== undefined
            ? filteredCount < totalCount || isDateActive || isSearchActive
            : countsIsFiltering

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
                        chip={<CategoryFilterChip viewId={viewId} isActive={category.isActive} />}
                        details={category.details}
                    />
                )}

                {showGroupBy && (
                    <>
                        <FilterColumn
                            chip={<AccountFilterChip viewId={viewId} isActive={account.isActive} />}
                            details={account.details}
                        />
                        <FilterColumn
                            chip={<GroupByFilterChip viewId={viewId} options={groupByOptions} />}
                            details={[]}
                        />
                    </>
                )}

                {showSecurities && (
                    <FilterColumn
                        chip={<SecurityFilterChip viewId={viewId} isActive={security.isActive} />}
                        details={security.details}
                    />
                )}

                {showActions && (
                    <FilterColumn
                        chip={<ActionFilterChip viewId={viewId} isActive={action.isActive} />}
                        details={action.details}
                    />
                )}

                <FilterColumn chip={<SearchFilterChip viewId={viewId} isActive={isSearchActive} />} details={[]} />
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
