// ABOUTME: Composition layout shell for filter chips — renders count summary and children
// ABOUTME: Children are self-selecting column components that call their own useSelector
// COMPLEXITY: react-redux-separation — ActionRegistry useEffect lifecycle awaiting non-React mechanism

import { Flex, Text } from '@radix-ui/themes'
import { KeymapModule } from '@graffio/keymap'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

const containerBaseStyle = { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--gray-4)' }
const containerActiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--ruby-3)' }
const containerInactiveStyle = { ...containerBaseStyle, backgroundColor: 'var(--gray-2)' }

const { ActionRegistry } = KeymapModule

const T = {
    // Builds filter actions array from visibility config
    // @sig toFilterActions :: (FilterConfig, (String -> void)) -> [Action]
    //     FilterConfig = { accounts, categories, date, actions, securities, groupBy, search }
    // prettier-ignore
    toFilterActions: (config, openPopover) => {
        const { accounts, actions, categories, date, groupBy, search, securities } = config
        const result = []
        if (accounts)   result.push({ id: 'filter:accounts'  , description: 'Accounts'  , execute: () => openPopover('accounts') })
        if (categories) result.push({ id: 'filter:categories', description: 'Categories', execute: () => openPopover('categories') })
        if (date || config.asOfDate) result.push({ id: 'filter:date', description: 'Date', execute: () => openPopover(config.asOfDate ? 'asOfDate' : 'date') })
        if (actions)    result.push({ id: 'filter:actions'   , description: 'Actions'   , execute: () => openPopover('actions') })
        if (securities) result.push({ id: 'filter:securities', description: 'Securities', execute: () => openPopover('securities') })
        if (groupBy)    result.push({ id: 'filter:group-by'  , description: 'Group by'  , execute: () => openPopover('groupBy') })
        if (search)     result.push({ id: 'filter:search'    , description: 'Search'    , execute: () => openPopover('search') })
        return result
    },
}

const E = {
    // Registers filter-focus actions for visible chips
    // @sig filterActionsEffect :: (String, FilterConfig) -> () -> (() -> void)
    filterActionsEffect: (viewId, config) => () =>
        ActionRegistry.register(
            viewId,
            T.toFilterActions(config, popoverId => post(Action.SetFilterPopoverOpen(viewId, popoverId))),
        ),
}

/*
 * Composition layout shell for filter chips — renders count summary, container highlight, and children
 * filterConfig is a temporary prop for ActionRegistry — will be removed when registration moves out of React
 *
 * @sig FilterChipRow :: FilterChipRowProps -> ReactElement
 *     FilterChipRowProps = { viewId, accountId?, filteredCount?, totalCount?, itemLabel?, filterConfig, children }
 */
const FilterChipRow = props => {
    const { viewId, accountId, filteredCount: filteredCountProp, totalCount: totalCountProp } = props
    const { itemLabel = 'transactions', filterConfig, children } = props

    const { filtered, total, isFiltering } = useSelector(state => S.UI.filterCounts(state, viewId, accountId))

    useEffect(E.filterActionsEffect(viewId, filterConfig), [viewId, filterConfig])

    const filteredCount = filteredCountProp ?? filtered
    const totalCount = totalCountProp ?? total
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
                {children}
            </Flex>
        </Flex>
    )
}

export { FilterChipRow }
