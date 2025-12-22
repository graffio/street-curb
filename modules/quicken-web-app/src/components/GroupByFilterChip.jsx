// ABOUTME: Group by filter chip with inline popover
// ABOUTME: Shows current grouping dimension, opens selector on click

import { Box, Flex, Popover, Text } from '@graffio/design-system'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const triggerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: 'var(--space-1) var(--space-2)',
    backgroundColor: 'var(--accent-3)',
    borderRadius: 'var(--radius-4)',
    cursor: 'pointer',
    userSelect: 'none',
    width: 155,
}

const optionStyle = { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderRadius: 'var(--radius-1)' }

const groupByOptions = [
    { value: 'category', label: 'Category' },
    { value: 'account', label: 'Account' },
    { value: 'payee', label: 'Payee' },
    { value: 'month', label: 'Month' },
]

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

export { GroupByFilterChip }
