// ABOUTME: Sidebar account list with collapsible sections and sort modes
// ABOUTME: Reads accounts from Redux and dispatches OpenView actions

import { Box, Button, Flex, Heading, ScrollArea, Select, Text } from '@graffio/design-system'
import React, { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Accounts } from '../store/selectors/accounts.js'
import { Action } from '../types/action.js'
import { SortMode } from '../types/sort-mode.js'
import { View } from '../types/view.js'

const SORT_MODE_OPTIONS = [
    { value: 'ByType', label: 'By Type' },
    { value: 'Alphabetical', label: 'A-Z' },
    { value: 'ByAmount', label: 'By Amount' },
]

const T = {
    // Formats currency value for display (treats near-zero as $0.00)
    // @sig toFormattedBalance :: Number -> String
    toFormattedBalance: balance => {
        const rounded = Math.round(balance * 100) / 100
        if (rounded === 0) return '$0.00'
        const formatted = Math.abs(rounded).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        return rounded < 0 ? `(${formatted})` : formatted
    },

    // Formats day change for display with sign
    // @sig toFormattedDayChange :: Number -> String
    toFormattedDayChange: change => {
        if (change === 0 || change == null) return null
        const sign = change > 0 ? '+' : ''
        return `${sign}${change.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
    },

    // Gets color for day change (green for positive, red for negative)
    // @sig toDayChangeColor :: Number -> String
    toDayChangeColor: change => (change > 0 ? 'green' : 'red'),
}

const E = {
    // Dispatches sort mode change action
    // @sig handleSortModeChange :: String -> ()
    handleSortModeChange: value => {
        const sortMode = SortMode[value]()
        post(Action.SetAccountListSortMode(sortMode))
    },

    // Dispatches toggle section collapsed action
    // @sig handleSectionToggle :: String -> ()
    handleSectionToggle: sectionId => post(Action.ToggleSectionCollapsed(sectionId)),

    // Opens a register view for the account
    // @sig handleAccountClick :: Account -> ()
    handleAccountClick: account => {
        const { id, name } = account
        const viewId = `reg_${id}`
        const view = View.Register(viewId, id, name)
        post(Action.OpenView(view))
    },
}

// Displays an enriched account with balance and day change
// @sig AccountRow :: { enriched: EnrichedAccount } -> ReactElement
const AccountRow = ({ enriched }) => {
    const { account, balance, dayChange } = enriched
    const formattedDayChange = T.toFormattedDayChange(dayChange)

    return (
        <Button
            variant="ghost"
            onClick={() => E.handleAccountClick(account)}
            style={{ justifyContent: 'flex-start', width: '100%', padding: '4px 8px' }}
        >
            <Flex justify="between" width="100%" align="center" gap="2">
                <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
                    {account.name}
                </Text>
                <Flex direction="column" align="end" gap="0">
                    <Text size="2" color="gray">
                        {T.toFormattedBalance(balance)}
                    </Text>
                    {formattedDayChange && (
                        <Text size="1" color={T.toDayChangeColor(dayChange)}>
                            {formattedDayChange}
                        </Text>
                    )}
                </Flex>
            </Flex>
        </Button>
    )
}

// Displays a collapsible section header with balance subtotal
// @sig SectionHeader :: { section: AccountSection, isCollapsed: Boolean, onToggle: Function } -> ReactElement
const SectionHeader = ({ section, isCollapsed, onToggle, indent = 0 }) => {
    const { accounts, children, id, isCollapsible, label } = section

    // Count includes direct accounts plus all accounts in children
    const childAccountCount = children.reduce((sum, child) => sum + child.accounts.length, 0)
    const totalCount = accounts.length + childAccountCount

    // Subtotal includes direct accounts plus all accounts in children
    const directSubtotal = accounts.reduce((sum, e) => sum + e.balance, 0)
    const childSubtotal = children.reduce((sum, child) => sum + child.accounts.reduce((s, e) => s + e.balance, 0), 0)
    const subtotal = directSubtotal + childSubtotal

    return (
        <Flex
            justify="between"
            align="center"
            py="2"
            px="2"
            style={{ cursor: isCollapsible ? 'pointer' : 'default', paddingLeft: `${8 + indent * 12}px` }}
            onClick={() => isCollapsible && onToggle(id)}
        >
            <Flex align="center" gap="1">
                {isCollapsible && (
                    <Text size="1" color="gray">
                        {isCollapsed ? '▸' : '▾'}
                    </Text>
                )}
                <Text size="2" weight="medium">
                    {label}
                </Text>
                <Text size="1" color="gray">
                    ({totalCount})
                </Text>
            </Flex>
            <Text size="2" color="gray">
                {T.toFormattedBalance(subtotal)}
            </Text>
        </Flex>
    )
}

// Displays a section with header and accounts (supports nested children)
// @sig AccountSectionView :: { section: AccountSection, collapsedSections: Set, indent: Number } -> ReactElement
const AccountSectionView = ({ section, collapsedSections, indent = 0 }) => {
    const { accounts, children, id } = section
    const isCollapsed = collapsedSections.has(id)
    const onToggle = useCallback(sectionId => E.handleSectionToggle(sectionId), [])
    const hasChildren = children.length > 0
    const paddingLeft = `${8 + indent * 12}px`
    const nextIndent = indent + 1
    const childProps = { collapsedSections, indent: nextIndent }

    return (
        <Box>
            <SectionHeader section={section} isCollapsed={isCollapsed} onToggle={onToggle} indent={indent} />
            {!isCollapsed && (
                <>
                    {accounts.length > 0 && (
                        <Flex direction="column" gap="0" px="2" style={{ paddingLeft }}>
                            {accounts.map(enriched => (
                                <AccountRow key={enriched.id} enriched={enriched} />
                            ))}
                        </Flex>
                    )}
                    {hasChildren &&
                        children.map(child => <AccountSectionView key={child.id} section={child} {...childProps} />)}
                </>
            )}
        </Box>
    )
}

// Sort mode dropdown selector
// @sig SortModeDropdown :: { value: String, onChange: Function } -> ReactElement
const SortModeDropdown = ({ value, onChange }) => (
    <Select.Root value={value} onValueChange={onChange} size="1">
        <Select.Trigger variant="ghost" />
        <Select.Content>
            {SORT_MODE_OPTIONS.map(({ value: v, label: l }) => (
                <Select.Item key={v} value={v}>
                    {l}
                </Select.Item>
            ))}
        </Select.Content>
    </Select.Root>
)

// Main AccountList component
// @sig AccountList :: () -> ReactElement
const AccountList = () => {
    const accounts = useSelector(S.accounts)
    const sortMode = useSelector(S.accountListSortMode)
    const collapsedSections = useSelector(S.collapsedSections)
    const organizedSections = useSelector(Accounts.A.collectOrganized)

    if (!accounts || accounts.length === 0)
        return (
            <Box mx="3">
                <Text size="2" color="gray">
                    No accounts loaded
                </Text>
            </Box>
        )
    const sortModeValue = sortMode['@@tagName']

    return (
        <Box style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Flex justify="between" align="center" m="3">
                <Heading as="h3" size="3" style={{ fontWeight: 'lighter' }}>
                    Accounts
                </Heading>
                <SortModeDropdown value={sortModeValue} onChange={E.handleSortModeChange} />
            </Flex>
            <ScrollArea style={{ flex: 1 }}>
                <Flex direction="column" gap="2" mx="2" pb="3">
                    {organizedSections.map(section => (
                        <AccountSectionView key={section.id} section={section} collapsedSections={collapsedSections} />
                    ))}
                </Flex>
            </ScrollArea>
        </Box>
    )
}

export { AccountList }
