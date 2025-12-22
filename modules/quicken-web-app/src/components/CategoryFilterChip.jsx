// ABOUTME: Category filter chip with inline popover
// ABOUTME: Shows count of selected categories, opens selector on click

import { Box, CategorySelector, Popover, Text } from '@graffio/design-system'
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
    width: 185,
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

/*
 * Category filter chip with inline category selector popover
 *
 * @sig CategoryFilterChip :: { viewId: String } -> ReactElement
 */
const CategoryFilterChip = ({ viewId }) => {
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

export { CategoryFilterChip }
