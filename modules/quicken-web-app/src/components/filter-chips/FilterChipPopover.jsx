// ABOUTME: Shared filter chip popover with internalized keyboard navigation and action registration
// ABOUTME: Accepts config for static chip identity and dynamic props (selectedIds, onToggle)

import { KeymapModule } from '@graffio/keymap'
import { Badge, Box, Checkbox, Flex, Popover, ScrollArea, Text, TextField } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import { KeymapConfig } from '../../keymap-config.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { ChipStyles } from './chip-styles.js'

const { ActionRegistry, normalizeKey } = KeymapModule
const { DEFAULT_BINDINGS } = KeymapConfig

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Creates item row style with optional highlight
    // @sig makeItemRowStyle :: Boolean -> Style
    makeItemRowStyle: highlighted => ({
        padding: 'var(--space-2)',
        borderBottom: '1px solid var(--gray-3)',
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: highlighted ? 'var(--accent-4)' : 'transparent',
    }),

    // Creates search input props with current search text and handler
    // @sig makeSearchProps :: (String, Function) -> Object
    makeSearchProps: (text, onChange) => ({
        placeholder: 'Search...',
        value: text,
        onChange,
        onKeyDown: E.handleSearchKey,
        style: { marginBottom: 'var(--space-2)' },
    }),

    // Finds items matching selectedIds from the full items list
    // @sig findSelectedItems :: ([{ id }], [String]) -> [{ id }]
    findSelectedItems: (allItems, selectedIds) => {
        const set = new Set(selectedIds)
        return allItems.filter(item => set.has(item.id))
    },

    // Finds selected item label from items list for single-select display
    // @sig findSelectedLabel :: ([{ id, label }], [String]) -> String
    findSelectedLabel: (items, selectedIds) => {
        if (selectedIds.length === 0) return 'All'
        const item = items.find(i => i.id === selectedIds[0])
        return item ? item.label : 'All'
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Routes navigation keys through ActionRegistry — blocks global shortcuts while popover is open
    // @sig handleContentKey :: KeyboardEvent -> void
    handleContentKey: e => {
        e.stopPropagation()
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
        const actionId = DEFAULT_BINDINGS[normalizeKey(e)]
        if (!actionId) return
        const action = ActionRegistry.resolve(actionId, chipState.viewId)
        if (!action) return
        e.preventDefault()
        action.execute()
    },

    // Routes non-character keys from search input via ActionRegistry — lets printable characters through
    // @sig handleSearchKey :: KeyboardEvent -> void
    handleSearchKey: e => {
        e.stopPropagation()
        const { key, ctrlKey, altKey, metaKey } = e
        if (key.length === 1 && !ctrlKey && !altKey && !metaKey) return
        const actionId = DEFAULT_BINDINGS[normalizeKey(e)]
        if (!actionId) return
        const action = ActionRegistry.resolve(actionId, chipState.viewId)
        if (!action) return
        e.preventDefault()
        action.execute()
    },

    // Handles select action — toggles highlighted item, auto-closes for single-select
    // @sig handleSelect :: () -> void
    handleSelect: () => {
        const { highlightedItemId, onToggle, singleSelect: isSingle, viewId } = chipState
        if (!highlightedItemId) return
        onToggle(highlightedItemId)
        if (isSingle) post(Action.SetFilterPopoverOpen(viewId, null))
    },

    // Opens the popover for the given triggerId — read from triggerStates at call time
    // @sig handleTriggerExecute :: String -> void
    handleTriggerExecute: triggerId => {
        const trigger = triggerStates.get(triggerId)
        post(Action.SetFilterPopoverOpen(trigger.viewId, trigger.popoverId))
    },

    // Processes trigger element mount/unmount for a single triggerId
    // @sig registerTriggerElement :: (String, Element?) -> void
    registerTriggerElement: (triggerId, element) => {
        triggerCleanups.get(triggerId)?.()
        triggerCleanups.delete(triggerId)
        if (!element) return
        const trigger = triggerStates.get(triggerId)

        // prettier-ignore
        triggerCleanups.set(triggerId, ActionRegistry.register(trigger.viewId, [
            { id: triggerId, description: trigger.label, execute: () => E.handleTriggerExecute(triggerId) },
        ]))
    },

    // Returns a stable ref callback for a trigger — creates on first use, caches thereafter
    // @sig registerTrigger :: String -> (Element? -> void)
    registerTrigger: triggerId => {
        if (!triggerRefs.has(triggerId))
            triggerRefs.set(triggerId, element => E.registerTriggerElement(triggerId, element))
        return triggerRefs.get(triggerId)
    },

    // Registers navigate/select/dismiss actions when popover content mounts — reads chipState at call time
    // @sig registerContent :: Element? -> void
    registerContent: element => {
        contentCleanup?.()
        contentCleanup = null
        if (!element) return

        // prettier-ignore
        contentCleanup = ActionRegistry.register(chipState.viewId, [
            { id: 'navigate:down', description: 'Move down',  execute: () => post(Action.SetViewUiState(chipState.viewId, { filterPopoverHighlight: chipState.next })) },
            { id: 'navigate:up',   description: 'Move up',    execute: () => post(Action.SetViewUiState(chipState.viewId, { filterPopoverHighlight: chipState.prev })) },
            { id: 'select',        description: 'Toggle',     execute: E.handleSelect },
            { id: 'dismiss',       description: 'Dismiss',    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, null)) },
        ])
    },

    // Scrolls the highlighted item into view when it receives this ref callback
    // @sig handleScrollRef :: Element? -> void
    handleScrollRef: el => el?.scrollIntoView({ block: 'nearest' }),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Checkbox row for a single navigable item (multi-select mode)
// @sig ItemRow :: { item, isSelected, highlighted, onToggle } -> ReactElement
const ItemRow = ({ item, isSelected, highlighted, onToggle }) => {
    const ref = highlighted ? E.handleScrollRef : undefined
    const style = F.makeItemRowStyle(highlighted)
    return (
        <Flex ref={ref} align="center" gap="2" style={style} onClick={() => onToggle(item.id)}>
            <Checkbox checked={isSelected} tabIndex={-1} />
            <Text size="2">{item.label}</Text>
        </Flex>
    )
}

// Single-select row without checkbox — auto-closes popover on click
// @sig SingleSelectRow :: { item, isSelected, highlighted, onToggle } -> ReactElement
const SingleSelectRow = ({ item, isSelected, highlighted, onToggle }) => {
    const handleClick = () => {
        onToggle(item.id)
        post(Action.SetFilterPopoverOpen(chipState.viewId, null))
    }

    const ref = highlighted ? E.handleScrollRef : undefined
    const style = F.makeItemRowStyle(highlighted)
    return (
        <Flex ref={ref} align="center" gap="2" style={style} onClick={handleClick}>
            <Text size="2" weight={isSelected ? 'medium' : 'regular'}>
                {item.label}
            </Text>
        </Flex>
    )
}

// Removable badge for a selected item
// @sig SelectedItemBadge :: { item, onToggle } -> ReactElement
const SelectedItemBadge = ({ item, onToggle }) => (
    <Badge variant="soft" style={{ cursor: 'pointer' }} onClick={() => onToggle(item.id)}>
        {item.label} ×
    </Badge>
)

// Selected item badges shown at the top of open popover content (multi-select only)
// @sig SelectedBadges :: { allItems, selectedIds, onToggle } -> ReactElement?
const SelectedBadges = ({ allItems, selectedIds, onToggle }) => {
    const items = F.findSelectedItems(allItems, selectedIds)
    if (items.length === 0) return null
    return (
        <Flex wrap="wrap" gap="1" mb="2">
            {items.map(item => (
                <SelectedItemBadge key={item.id} item={item} onToggle={onToggle} />
            ))}
        </Flex>
    )
}

// Main filter chip popover — internalizes action registration, search, open/close state
// config: { popoverId, label, triggerId, width?, singleSelect?, clearFilter? }
// @sig FilterChipPopover :: { config, viewId, selectedIds, onToggle, items? } -> ReactElement
const FilterChipPopover = ({ config, viewId, selectedIds, onToggle, items }) => {
    const toggleOpen = open => post(Action.SetFilterPopoverOpen(viewId, open ? config.popoverId : null))

    const handleClear = e => {
        e.stopPropagation()
        if (config.clearFilter) post(Action.SetTransactionFilter(viewId, config.clearFilter))
    }

    const handleSearch = e => post(Action.SetFilterPopoverSearch(viewId, e.target.value))

    const { popoverId, label, triggerId, width = 175, singleSelect = false } = config
    const { handleContentKey, registerContent, registerTrigger } = E
    const Row = singleSelect ? SingleSelectRow : ItemRow

    // prettier-ignore
    const { popoverId: openPopoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems, allItems } = useSelector(state => S.UI.filterPopoverData(state, viewId, items))

    const isOpen = openPopoverId === popoverId
    const isActive = !singleSelect && selectedIds.length > 0
    const selectedCount = selectedIds.length
    const selectedSet = new Set(selectedIds)

    // Update module-level state for trigger and content actions
    triggerStates.set(triggerId, { viewId, popoverId, label })
    if (isOpen)
        chipState = {
            viewId,
            popoverId,
            singleSelect,
            next: nextHighlightIndex,
            prev: prevHighlightIndex,
            highlightedItemId,
            onToggle,
        }

    const triggerStyle = ChipStyles.makeChipTriggerStyle(width, isActive)
    const multiLabel = selectedCount > 0 ? `${selectedCount} selected` : 'All'
    const singleLabel = singleSelect && items ? F.findSelectedLabel(items, selectedIds) : 'All'
    const displayLabel = singleSelect ? singleLabel : multiLabel

    return (
        <Popover.Root open={isOpen} onOpenChange={toggleOpen}>
            <Popover.Trigger asChild>
                <button ref={registerTrigger(triggerId)} type="button" style={triggerStyle}>
                    <Text size="1" weight="medium">
                        {label}: {displayLabel}
                    </Text>
                    {!singleSelect && selectedCount > 0 && (
                        <Box style={ChipStyles.clearButtonStyle} onClick={handleClear}>
                            ×
                        </Box>
                    )}
                </button>
            </Popover.Trigger>
            <Popover.Content ref={registerContent} {...CONTENT_PROPS} onKeyDown={handleContentKey}>
                {!singleSelect && <SelectedBadges allItems={allItems} selectedIds={selectedIds} onToggle={onToggle} />}
                <TextField.Root ref={el => el?.focus()} {...F.makeSearchProps(searchText, handleSearch)} />
                <ScrollArea style={SCROLL_STYLE}>
                    {filteredItems.map((item, i) => {
                        const hl = i === highlightedIndex
                        const sel = selectedSet.has(item.id)
                        return <Row key={item.id} item={item} isSelected={sel} highlighted={hl} onToggle={onToggle} />
                    })}
                    {filteredItems.length === 0 && (
                        <Text size="2" color="gray">
                            {searchText ? `No items match "${searchText}"` : 'No items available'}
                        </Text>
                    )}
                </ScrollArea>
            </Popover.Content>
        </Popover.Root>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const CONTENT_PROPS = { style: { padding: 'var(--space-2)', minWidth: 250 }, side: 'right', align: 'start', sideOffset: 4 }

const SCROLL_STYLE = { maxHeight: 200 }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

const triggerStates = new Map()
const triggerCleanups = new Map()
const triggerRefs = new Map()
let contentCleanup = null
let chipState = {
    viewId: null,
    popoverId: null,
    singleSelect: false,
    next: 0,
    prev: 0,
    highlightedItemId: null,
    onToggle: null,
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { FilterChipPopover }
