// ABOUTME: Investment action filter chip with inline popover
// ABOUTME: Shows count of selected actions, opens multi-select on click

import { Badge, Box, Checkbox, Flex, Popover, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

// Predefined investment action types (comprehensive list)
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

const baseTriggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width: 150,
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

const actionRowStyle = { padding: 'var(--space-2)', borderBottom: '1px solid var(--gray-3)', cursor: 'pointer' }

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
        <Flex key={id} align="center" gap="2" style={actionRowStyle} onClick={() => handleToggleAction(id)}>
            <Checkbox checked={selectedActions.includes(id)} />
            <Text size="2">{label}</Text>
        </Flex>
    )

    const selectedActions = useSelector(state => S.selectedInvestmentActions(state, viewId))
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

export { ActionFilterChip }
