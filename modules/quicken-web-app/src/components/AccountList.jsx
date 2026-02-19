// ABOUTME: Sidebar account list with collapsible sections and sort modes
// ABOUTME: Reads accounts from Redux and dispatches OpenView actions

import { Box, Button, Flex, Heading, ScrollArea, Select, Text } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { SortMode } from '../types/sort-mode.js'
import { View } from '../types/view.js'
import { Formatters } from '../utils/formatters.js'

const { toFormattedBalance, toFormattedDayChange, toDayChangeColor } = Formatters

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Displays an enriched account with balance and day change
// @sig AccountRow :: { enriched: EnrichedAccount } -> ReactElement
const AccountRow = ({ enriched }) => {
    const openRegister = () => post(Action.OpenView(View.Register(`reg_${id}`, id, name)))
    const { account, balance, dayChange } = enriched
    const { id, name } = account
    const formattedDayChange = toFormattedDayChange(dayChange)

    return (
        <Button variant="ghost" onClick={openRegister} style={ACCOUNT_ROW_STYLE}>
            <Flex justify="between" width="100%" align="center" gap="2">
                <Text size="2" style={{ flex: 1, textAlign: 'left' }}>
                    {account.name}
                </Text>
                <Flex direction="column" align="end" gap="0">
                    <Text size="2" color="gray">
                        {toFormattedBalance(balance)}
                    </Text>
                    {formattedDayChange && (
                        <Text size="1" color={toDayChangeColor(dayChange)}>
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
    const handleClick = () => isCollapsible && onToggle(id)
    const { id, isCollapsible, label, totalBalance, totalCount } = section

    const style = {
        backgroundColor: indent > 0 ? 'var(--gray-3)' : 'var(--gray-4)',
        borderRadius: 'var(--radius-2)',
        cursor: isCollapsible ? 'pointer' : 'default',
        paddingLeft: `${8 + indent * 12}px`,
    }

    return (
        <Flex justify="between" align="center" py="2" px="2" style={style} onClick={handleClick}>
            <Flex align="center" gap="2">
                {isCollapsible && <Text style={SECTION_CHEVRON_STYLE}>{isCollapsed ? '▶' : '▼'}</Text>}
                <Text size="2" weight="bold">
                    {label}
                </Text>
                <Text size="2" color="gray">
                    ({totalCount})
                </Text>
            </Flex>
            <Text size="2" color="gray">
                {toFormattedBalance(totalBalance)}
            </Text>
        </Flex>
    )
}

// Displays a section with header and accounts (supports nested children)
// @sig AccountSectionView :: { section: AccountSection, collapsedSections: Set, indent: Number } -> ReactElement
const AccountSectionView = ({ section, collapsedSections, indent = 0 }) => {
    const toggleSection = sectionId => post(Action.ToggleSectionCollapsed(sectionId))
    const { accounts, children, id } = section
    const isCollapsed = collapsedSections.has(id)
    const hasChildren = children.length > 0
    const paddingLeft = `${8 + indent * 12}px`
    const nextIndent = indent + 1
    const childProps = { collapsedSections, indent: nextIndent }

    return (
        <Box>
            <SectionHeader section={section} isCollapsed={isCollapsed} onToggle={toggleSection} indent={indent} />
            {!isCollapsed && (
                <>
                    {accounts.length > 0 && (
                        <Flex direction="column" gap="0" px="2" style={{ paddingLeft }}>
                            {accounts.map(enriched => (
                                <AccountRow key={enriched.id} enriched={enriched} />
                            ))}
                        </Flex>
                    )}
                    {hasChildren && (
                        <Flex direction="column" gap="2" mt="2">
                            {children.map(child => (
                                <AccountSectionView key={child.id} section={child} {...childProps} />
                            ))}
                        </Flex>
                    )}
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const SORT_MODE_OPTIONS = [
    { value: 'ByType', label: 'By Type' },
    { value: 'Alphabetical', label: 'A-Z' },
    { value: 'ByAmount', label: 'By Amount' },
]

const ACCOUNT_ROW_STYLE = { justifyContent: 'flex-start', width: '100%', padding: '4px 8px' }
const SECTION_CHEVRON_STYLE = { width: '20px', textAlign: 'center', fontSize: '12px', lineHeight: 1 }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Main AccountList component
// @sig AccountList :: () -> ReactElement
const AccountList = () => {
    const changeSortMode = value => post(Action.SetAccountListSortMode(SortMode[value]()))
    const accounts = useSelector(S.accounts)
    const sortMode = useSelector(S.UI.sortMode)
    const collapsedSections = useSelector(S.UI.collapsedSections)
    const organizedSections = useSelector(S.Accounts.organized)

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
                <SortModeDropdown value={sortModeValue} onChange={changeSortMode} />
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
