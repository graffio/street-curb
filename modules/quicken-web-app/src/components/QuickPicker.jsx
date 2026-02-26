// ABOUTME: Modal picker for keyboard-accessible item selection (reports, accounts, etc.)
// ABOUTME: Self-selecting with search/filter input, FilterChipPopover visual style, and draggable positioning

import { KeymapModule } from '@graffio/keymap'
import { Flex, ScrollArea, Text, TextField } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { KeymapConfig } from '../keymap-config.js'
import { PickerConfig } from '../picker-config.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'

import { Dialog } from './Dialog.jsx'

const { ActionRegistry, normalizeKey } = KeymapModule
const { DEFAULT_BINDINGS } = KeymapConfig

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Creates item row style with optional highlight — matches FilterChipPopover
    // @sig makeItemRowStyle :: Boolean -> Style
    makeItemRowStyle: highlighted => ({
        padding: 'var(--space-2)',
        borderBottom: '1px solid var(--gray-3)',
        cursor: 'pointer',
        outline: 'none',
        backgroundColor: highlighted ? 'var(--accent-4)' : 'transparent',
    }),

    // Creates content style with optional position offset
    // @sig makeContentStyle :: ({x,y}?) -> Style?
    makeContentStyle: position =>
        position ? { left: `calc(50% + ${position.x}px)`, top: `calc(50% + ${position.y}px)` } : undefined,
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Closes the picker
    // @sig closePicker :: () -> void
    closePicker: () => post(Action.SetPickerOpen(undefined)),

    // Executes the highlighted item's callback and closes picker — reads pickerState at call time
    // @sig executeHighlighted :: () -> void
    executeHighlighted: () => {
        const item = pickerState.filteredItems[pickerState.highlightedIndex]
        if (!item) return
        item.execute()
        E.closePicker()
    },

    // Moves highlight up — reads pickerState at call time
    // @sig moveUp :: () -> void
    moveUp: () => post(Action.SetPickerHighlight(pickerState.prev)),

    // Moves highlight down — reads pickerState at call time
    // @sig moveDown :: () -> void
    moveDown: () => post(Action.SetPickerHighlight(pickerState.next)),

    // Routes non-character keys from search input via ActionRegistry — lets printable characters through
    // @sig handleSearchKey :: KeyboardEvent -> void
    handleSearchKey: e => {
        e.stopPropagation()
        const { key, ctrlKey, altKey, metaKey } = e
        if (key.length === 1 && !ctrlKey && !altKey && !metaKey) return
        const actionId = DEFAULT_BINDINGS[normalizeKey(e)]
        if (!actionId) return
        const action = ActionRegistry.resolve(actionId, undefined)
        if (!action) return
        e.preventDefault()
        action.execute()
    },

    // Scrolls the highlighted item into view when it receives this ref callback
    // @sig handleScrollRef :: Element? -> void
    handleScrollRef: el => el?.scrollIntoView({ block: 'nearest' }),

    // Starts drag on title bar mousedown — captures start position, attaches move/up listeners
    // @sig handleDragStart :: MouseEvent -> void
    handleDragStart: e => {
        e.preventDefault()
        const el = contentEl.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        currentDrag = { startX: e.clientX, startY: e.clientY, originX: rect.left, originY: rect.top }
        document.body.style.cursor = 'grabbing'
        document.body.style.userSelect = 'none'
        document.addEventListener('mousemove', E.handleDragMove)
        document.addEventListener('mouseup', E.handleDragEnd)
    },

    // Moves dialog via DOM mutation during drag — no React re-render
    // @sig handleDragMove :: MouseEvent -> void
    handleDragMove: e => {
        if (!currentDrag) return
        const el = contentEl.current
        if (!el) return
        const { startX, startY, originX, originY } = currentDrag
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        el.style.left = `${originX + dx}px`
        el.style.top = `${originY + dy}px`
        el.style.transform = 'none' // Override Radix Dialog centering transform
    },

    // Commits final position to Redux, removes listeners, resets cursor
    // @sig handleDragEnd :: MouseEvent? -> void
    handleDragEnd: e => {
        document.removeEventListener('mousemove', E.handleDragMove)
        document.removeEventListener('mouseup', E.handleDragEnd)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        if (!currentDrag || !e) {
            currentDrag = undefined
            return
        }
        const dx = e.clientX - currentDrag.startX
        const dy = e.clientY - currentDrag.startY
        const prevPos = pickerState.position ?? { x: 0, y: 0 }
        post(Action.SetPickerPosition(prevPos.x + dx, prevPos.y + dy))
        currentDrag = undefined
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Renders a single picker item row — matches FilterChipPopover visual style
// @sig PickerItem :: { item: Object, isHighlighted: Boolean } -> ReactElement
const PickerItem = ({ item, isHighlighted }) => {
    const onClick = () => {
        item.execute()
        E.closePicker()
    }
    const ref = isHighlighted ? E.handleScrollRef : undefined
    const style = F.makeItemRowStyle(isHighlighted)

    return (
        <Flex ref={ref} align="center" style={style} onClick={onClick}>
            <Text size="2">{item.label}</Text>
        </Flex>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const S_DRAG_BAR = { cursor: 'grab', padding: 'var(--space-1) 0', marginBottom: 'var(--space-1)' }
const S_DRAG_GRIP = { width: 32, height: 4, borderRadius: 2, backgroundColor: 'var(--gray-6)' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let pickerCleanup
let currentDrag
let pickerState = { next: 0, prev: 0, filteredItems: [], highlightedIndex: -1, position: undefined }
const contentEl = { current: undefined }
const handleContentKey = KeymapConfig.createContentKeyHandler(() => undefined)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Self-selecting picker — reads pickerType from state, renders matching items with search filtering
// @sig QuickPicker :: () -> ReactElement | false
const QuickPicker = () => {
    // Registers picker actions on mount, cleans up on unmount — no render-scoped closures
    // @sig ref :: Element? -> void
    const ref = element => {
        pickerCleanup?.()
        pickerCleanup = undefined

        if (currentDrag) E.handleDragEnd()

        contentEl.current = element ?? undefined
        if (!element) return
        const { closePicker, executeHighlighted, moveUp, moveDown } = E

        // prettier-ignore
        pickerCleanup = ActionRegistry.register(undefined, [
            { id: 'dismiss',       description: 'Close picker',  execute: closePicker },
            { id: 'select',        description: 'Open selected', execute: executeHighlighted },
            { id: 'navigate:up',   description: 'Previous item', execute: moveUp },
            { id: 'navigate:down', description: 'Next item',     execute: moveDown },
        ])
    }

    const { closePicker, handleDragStart, handleSearchKey } = E
    const contentProps = { onKeyDown: handleContentKey, onEscapeKeyDown: e => e.preventDefault(), maxWidth: '360px' }
    const pickerType = useSelector(S.pickerType)
    const config = pickerType ? PickerConfig[pickerType] : undefined
    const data = useSelector(state => S.pickerData(state, config?.items ?? []))
    const { searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex, filteredItems, position } = data

    // Update module-level state for E functions to read at call-time
    pickerState = { next: nextHighlightIndex, prev: prevHighlightIndex, filteredItems, highlightedIndex, position }

    if (!pickerType) return false
    if (!config) throw new Error(`Unknown picker type: ${pickerType}`)

    const contentStyle = F.makeContentStyle(position)

    const searchProps = {
        ref: el => el?.focus(),
        placeholder: 'Search...',
        onChange: e => post(Action.SetPickerSearch(e.target.value)),
        onKeyDown: handleSearchKey,
        style: { marginBottom: 'var(--space-2)' },
        value: searchText,
    }

    return (
        <Dialog.Root open onOpenChange={closePicker}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content ref={ref} style={contentStyle} {...contentProps}>
                    <Flex justify="center" style={S_DRAG_BAR} onMouseDown={handleDragStart}>
                        <div style={S_DRAG_GRIP} />
                    </Flex>
                    <Dialog.Title>{config.title}</Dialog.Title>
                    <TextField.Root {...searchProps} />
                    <ScrollArea style={{ maxHeight: 200 }}>
                        {filteredItems.map((item, i) => (
                            <PickerItem key={item.id} item={item} isHighlighted={i === highlightedIndex} />
                        ))}
                        {filteredItems.length === 0 && (
                            <Text size="2" color="gray">
                                {searchText ? `No items match "${searchText}"` : 'No items available'}
                            </Text>
                        )}
                    </ScrollArea>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export { QuickPicker }
