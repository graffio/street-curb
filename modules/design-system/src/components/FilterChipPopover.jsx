// ABOUTME: Keyboard-navigable filter chip popover for multi-select lists
// ABOUTME: Owns Popover lifecycle, keymap registration, search filtering, and arrow-key navigation

import { Badge, Box, Checkbox, Flex, Popover, ScrollArea, Text, TextField } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FilterChipPopover as Logic } from './filter-chip-popover.js'

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
        backgroundColor: isHighlighted ? 'var(--accent-4)' : 'transparent',
    }),
}

const E = {
    // Registers keymap and returns cleanup function that unregisters it
    // @sig keymapRegistrationEffect :: (Keymap, String, Function, Function) -> (() -> void)
    keymapRegistrationEffect: (keymap, keymapId, onRegister, onUnregister) => {
        onRegister(keymap)
        return () => onUnregister(keymapId)
    },
}

// Checkbox row for a single navigable item
// @sig ItemRow :: { item, isSelected, isHighlighted, onToggle, itemRef? } -> ReactElement
const ItemRow = ({ item, isSelected, isHighlighted, onToggle, itemRef }) => (
    <Flex
        ref={itemRef}
        align="center"
        gap="2"
        style={F.makeItemRowStyle(isHighlighted)}
        onClick={() => onToggle(item.id)}
    >
        <Checkbox checked={isSelected} />
        <Text size="2">{item.label}</Text>
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
 * Keyboard-navigable filter chip popover with multi-select, search, and keymap support
 * @sig FilterChipPopover :: FilterChipPopoverProps -> ReactElement
 */
const FilterChipPopover = ({
    label,
    onClear,
    items,
    selectedIds,
    onToggle,
    searchable = false,
    width = 175,
    isActive = false,
    keymapId,
    keymapName,
    onRegisterKeymap,
    onUnregisterKeymap,
}) => {
    // Functions defined before hooks (closures capture bindings, not values)
    const moveDown = () => setHighlightedIndex(prev => Logic.toNextIndex(prev, filteredCount))
    const moveUp = () => setHighlightedIndex(prev => Logic.toPreviousIndex(prev, filteredCount))

    const toggle = () => {
        if (filteredCount === 0) return
        onToggle(filteredItems[highlightedIndex].id)
    }

    const dismiss = () => {
        setOpen(false)
        setSearchText('')
        setHighlightedIndex(0)
    }

    // Dispatches navigation keys from search input (global keymap skips INPUT elements)
    // @sig handleSearchKeyDown :: KeyboardEvent -> void
    const handleSearchKeyDown = e => {
        const handler = { ArrowDown: moveDown, ArrowUp: moveUp, Enter: toggle, Escape: dismiss }[e.key]
        if (!handler) return
        e.preventDefault()
        handler()
    }

    // Creates keymap when popover is open and keymap props provided
    // @sig createKeymapMemo :: () -> Keymap?
    const createKeymapMemo = () => {
        if (!open || !onRegisterKeymap || !keymapId) return null
        return Logic.createKeymap(keymapId, keymapName, {
            onDown: moveDown,
            onUp: moveUp,
            onEnter: toggle,
            onEscape: dismiss,
        })
    }

    const keymapRegistrationEffect = () => {
        if (!keymap || !onRegisterKeymap || !onUnregisterKeymap) return undefined
        return E.keymapRegistrationEffect(keymap, keymapId, onRegisterKeymap, onUnregisterKeymap)
    }

    // Resets search and highlight when popover closes
    // @sig handleOpenChange :: Boolean -> void
    const handleOpenChange = nextOpen => {
        setOpen(nextOpen)
        if (!nextOpen) {
            setSearchText('')
            setHighlightedIndex(0)
        }
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

    // Maps an item and its position to an ItemRow element
    // @sig toItemRow :: ({ id, label }, Number) -> ReactElement
    const toItemRow = (item, i) => (
        <ItemRow
            key={item.id}
            item={item}
            isSelected={selectedSet.has(item.id)}
            isHighlighted={i === highlightedIndex}
            onToggle={onToggle}
            itemRef={i === highlightedIndex ? highlightedRef : null}
        />
    )

    // Hooks
    const [open, setOpen] = useState(false) // EXEMPT: drawer
    const [searchText, setSearchText] = useState('') // EXEMPT: focus
    const [highlightedIndex, setHighlightedIndex] = useState(0) // EXEMPT: focus
    const highlightedRef = useRef(null)
    const searchRef = useRef(null)

    // Derived state
    const filteredItems = searchable ? Logic.toFilteredItems(items, searchText) : items
    const { length: filteredCount } = filteredItems
    const { length: selectedCount } = selectedIds
    const selectedSet = new Set(selectedIds)
    const selectedItems = items.filter(item => selectedSet.has(item.id))

    // Effects
    useEffect(() => setHighlightedIndex(0), [filteredCount])
    useEffect(() => highlightedRef.current?.scrollIntoView({ block: 'nearest' }), [highlightedIndex])
    useEffect(focusSearchEffect, [open, searchable])

    const keymap = useMemo(createKeymapMemo, [
        open,
        onRegisterKeymap,
        keymapId,
        keymapName,
        highlightedIndex,
        filteredCount,
    ])

    useEffect(keymapRegistrationEffect, [keymap, keymapId, onRegisterKeymap, onUnregisterKeymap])

    const triggerStyle = F.makeTriggerStyle(width, isActive)
    const displayLabel = selectedCount > 0 ? `${selectedCount} selected` : 'All'

    return (
        <Popover.Root open={open} onOpenChange={handleOpenChange}>
            <Popover.Trigger>
                <Box style={triggerStyle}>
                    <Text size="1" weight="medium">
                        {label}: {displayLabel}
                    </Text>
                    {selectedCount > 0 && (
                        <Box style={clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </Box>
            </Popover.Trigger>
            <Popover.Content style={popoverContentStyle}>
                {selectedItems.length > 0 && (
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
                        onChange={e => setSearchText(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        style={{ marginBottom: 'var(--space-2)' }}
                    />
                )}
                <ScrollArea style={{ maxHeight: 200 }}>
                    {filteredItems.map(toItemRow)}
                    {filteredCount === 0 && (
                        <Text size="2" color="gray">
                            {searchText ? `No items match "${searchText}"` : 'No items available'}
                        </Text>
                    )}
                </ScrollArea>
            </Popover.Content>
        </Popover.Root>
    )
}

FilterChipPopover.propTypes = {
    label: PropTypes.string.isRequired,
    onClear: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired }))
        .isRequired,
    selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onToggle: PropTypes.func.isRequired,
    searchable: PropTypes.bool,
    width: PropTypes.number,
    isActive: PropTypes.bool,
    keymapId: PropTypes.string,
    keymapName: PropTypes.string,
    onRegisterKeymap: PropTypes.func,
    onUnregisterKeymap: PropTypes.func,
}

export { FilterChipPopover }
