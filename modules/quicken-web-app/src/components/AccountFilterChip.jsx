// ABOUTME: Account filter chip with inline popover
// ABOUTME: Shows count of selected accounts, opens multi-select on click

import { Badge, Box, Checkbox, Flex, Popover, ScrollArea, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const triggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    backgroundColor: 'var(--accent-3)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width: 175,
}

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

const accountRowStyle = { padding: 'var(--space-2)', borderBottom: '1px solid var(--gray-3)', cursor: 'pointer' }

/*
 * Account filter chip with inline account multi-select popover
 *
 * @sig AccountFilterChip :: { viewId: String } -> ReactElement
 */
const AccountFilterChip = ({ viewId }) => {
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
        <Flex key={id} align="center" gap="2" style={accountRowStyle} onClick={() => handleToggleAccount(id)}>
            <Checkbox checked={selectedAccounts.includes(id)} />
            <Text size="2">{name}</Text>
        </Flex>
    )

    const selectedAccounts = useSelector(state => S.selectedAccounts(state, viewId))
    const accounts = useSelector(S.accounts)

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

export { AccountFilterChip }
