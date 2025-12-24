// ABOUTME: Security filter chip with inline popover
// ABOUTME: Shows count of selected securities, opens multi-select on click

import { Badge, Box, Checkbox, Flex, Popover, ScrollArea, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const baseTriggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
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

const securityRowStyle = { padding: 'var(--space-2)', borderBottom: '1px solid var(--gray-3)', cursor: 'pointer' }

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
        <Flex key={id} align="center" gap="2" style={securityRowStyle} onClick={() => handleToggleSecurity(id)}>
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

export { SecurityFilterChip }
