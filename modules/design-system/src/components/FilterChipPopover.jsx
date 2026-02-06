// ABOUTME: Fully controlled filter chip popover for multi-select lists
// ABOUTME: Zero internal state — all state and navigation callbacks provided by consumer via props

import { KeymapModule } from '@graffio/keymap'
import { Badge, Box, Checkbox, Flex, Popover, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'

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

const popoverContentStyle = { padding: 'var(--space-2)', minWidth: 250 }
const badgeStyle = { cursor: 'pointer' }

const F = {
    // Creates chip trigger style with specified width and active state
    // @sig makeTriggerStyle :: (Number, Boolean) -> Style
    makeTriggerStyle: (width, isActive) => ({
        appearance: 'none',
        border: 'none',
        font: 'inherit',
        color: 'inherit',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-4)',
        cursor: 'pointer',
        userSelect: 'none',
        width,
        backgroundColor: isActive ? 'var(--ruby-5)' : 'var(--accent-3)',
    }),

    // Creates item row style with optional highlight
    // @sig makeItemRowStyle :: Boolean -> Style
    makeItemRowStyle: isHighlighted => ({
        padding: 'var(--space-2)',
        borderBottom: '1px solid var(--gray-3)',
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: isHighlighted ? 'var(--accent-4)' : 'transparent',
    }),
}

// Checkbox row for a single navigable item (multi-select mode)
// @sig ItemRow :: { item, isSelected, isHighlighted, onToggle, itemRef? } -> ReactElement
const ItemRow = ({ item, isSelected, isHighlighted, onToggle, itemRef }) => (
    <Flex
        ref={itemRef}
        align="center"
        gap="2"
        style={F.makeItemRowStyle(isHighlighted)}
        onClick={() => onToggle(item.id)}
    >
        <Checkbox checked={isSelected} tabIndex={-1} />
        <Text size="2">{item.label}</Text>
    </Flex>
)

// Single-select row without checkbox
// @sig SingleSelectRow :: { item, isSelected, isHighlighted, onToggle, itemRef? } -> ReactElement
const SingleSelectRow = ({ item, isSelected, isHighlighted, onToggle, itemRef }) => (
    <Flex
        ref={itemRef}
        align="center"
        gap="2"
        style={F.makeItemRowStyle(isHighlighted)}
        onClick={() => onToggle(item.id)}
    >
        <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
            {item.label}
        </Text>
    </Flex>
)

// Removable badge for a selected item
// @sig SelectedItemBadge :: { item, onToggle } -> ReactElement
const SelectedItemBadge = ({ item, onToggle }) => (
    <Badge variant="soft" style={badgeStyle} onClick={() => onToggle(item.id)}>
        {item.label} ×
    </Badge>
)

/**
 * Fully controlled filter chip popover — all state managed by consumer
 * @sig FilterChipPopover :: FilterChipPopoverProps -> ReactElement
 */
const FilterChipPopover = ({
    label,
    open,
    onOpenChange,
    items,
    selectedIds,
    selectedItems,
    highlightedIndex,
    searchText,
    searchable = false,
    singleSelect = false,
    customContent,
    width = 175,
    isActive = false,
    keymapId,
    onRegisterKeymap,
    onUnregisterKeymap,
    onSearchChange,
    onMoveDown,
    onMoveUp,
    onToggle,
    onToggleHighlighted,
    onDismiss,
    onClear,
}) => {
    // Dispatches navigation keys from search input (global keymap skips INPUT elements)
    // @sig handleSearchKeyDown :: KeyboardEvent -> void
    const handleSearchKeyDown = e => {
        const handler = { ArrowDown: onMoveDown, ArrowUp: onMoveUp, Enter: onToggleHighlighted, Escape: onDismiss }[
            e.key
        ]
        if (!handler) return
        e.preventDefault()
        handler()
    }

    const handleClear = e => {
        e.stopPropagation()
        onClear()
    }

    // Focuses search input when popover opens
    // @sig focusSearchEffect :: () -> void
    const focusSearchEffect = () => {
        if (open && searchable) searchRef.current?.focus()
    }

    // Creates and registers navigation keymap when popover is open
    // @sig keymapLifecycleEffect :: () -> (() -> void)?
    const keymapLifecycleEffect = () => {
        if (!keymapId || !onRegisterKeymap || !onUnregisterKeymap || !open) return undefined
        const keymap = KeymapModule.fromBindings(keymapId, `${label} Filter`, [
            { description: 'Move down', keys: ['ArrowDown'], action: () => handlersRef.current.onMoveDown() },
            { description: 'Move up', keys: ['ArrowUp'], action: () => handlersRef.current.onMoveUp() },
            { description: 'Toggle', keys: ['Enter'], action: () => handlersRef.current.onToggleHighlighted() },
            { description: 'Dismiss', keys: ['Escape'], action: () => handlersRef.current.onDismiss() },
        ])
        onRegisterKeymap(keymap)
        return () => onUnregisterKeymap(keymapId)
    }

    // Maps an item and its position to an ItemRow or SingleSelectRow element
    // @sig toItemRow :: ({ id, label }, Number) -> ReactElement
    const toItemRow = (item, i) => {
        const Row = singleSelect ? SingleSelectRow : ItemRow
        return (
            <Row
                key={item.id}
                item={item}
                isSelected={selectedSet.has(item.id)}
                isHighlighted={i === highlightedIndex}
                onToggle={onToggle}
                itemRef={i === highlightedIndex ? highlightedRef : null}
            />
        )
    }

    // Refs to capture latest callbacks without triggering effect re-runs
    const handlersRef = useRef({ onMoveDown, onMoveUp, onToggleHighlighted, onDismiss })
    handlersRef.current = { onMoveDown, onMoveUp, onToggleHighlighted, onDismiss }
    const highlightedRef = useRef(null)
    const searchRef = useRef(null)

    const { length: selectedCount } = selectedIds
    const selectedSet = new Set(selectedIds)

    // DOM effects: scroll highlighted item into view, focus search input, manage keymap
    useEffect(() => highlightedRef.current?.scrollIntoView({ block: 'nearest' }), [highlightedIndex])
    useEffect(focusSearchEffect, [open, searchable])
    useEffect(keymapLifecycleEffect, [open, keymapId, label, onRegisterKeymap, onUnregisterKeymap])

    const triggerStyle = F.makeTriggerStyle(width, isActive)
    const multiSelectLabel = selectedCount > 0 ? `${selectedCount} selected` : 'All'
    const singleSelectLabel = selectedItems.length > 0 ? selectedItems[0].label : 'All'
    const displayLabel = singleSelect ? singleSelectLabel : multiSelectLabel
    const showClearButton = !singleSelect && selectedCount > 0

    return (
        <Popover.Root open={open} onOpenChange={onOpenChange}>
            <Popover.Trigger asChild>
                <button type="button" style={triggerStyle}>
                    <Text size="1" weight="medium">
                        {label}: {displayLabel}
                    </Text>
                    {showClearButton && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </button>
            </Popover.Trigger>
            <Popover.Content style={popoverContentStyle} side="right" align="start" sideOffset={4}>
                {!singleSelect && selectedItems.length > 0 && (
                    <Flex wrap="wrap" gap="1" mb="2">
                        {selectedItems.map(item => (
                            <SelectedItemBadge key={item.id} item={item} onToggle={onToggle} />
                        ))}
                    </Flex>
                )}
                {searchable && (
                    <TextField.Root
                        ref={searchRef}
                        placeholder="Search..."
                        value={searchText}
                        onChange={e => onSearchChange(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        style={{ marginBottom: 'var(--space-2)' }}
                    />
                )}
                <ScrollArea style={{ maxHeight: 200 }}>
                    {items.map(toItemRow)}
                    {items.length === 0 && (
                        <Text size="2" color="gray">
                            {searchText ? `No items match "${searchText}"` : 'No items available'}
                        </Text>
                    )}
                </ScrollArea>
                {customContent}
            </Popover.Content>
        </Popover.Root>
    )
}

FilterChipPopover.propTypes = {
    label: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    onOpenChange: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired }))
        .isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedItems: PropTypes.arrayOf(
        PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired }),
    ).isRequired,
    highlightedIndex: PropTypes.number.isRequired,
    searchText: PropTypes.string,
    searchable: PropTypes.bool,
    singleSelect: PropTypes.bool,
    customContent: PropTypes.node,
    width: PropTypes.number,
    isActive: PropTypes.bool,
    keymapId: PropTypes.string,
    onRegisterKeymap: PropTypes.func,
    onUnregisterKeymap: PropTypes.func,
    onSearchChange: PropTypes.func,
    onMoveDown: PropTypes.func.isRequired,
    onMoveUp: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onToggleHighlighted: PropTypes.func.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
}

export { FilterChipPopover }
