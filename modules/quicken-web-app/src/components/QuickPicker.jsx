// ABOUTME: Modal picker for keyboard-accessible item selection (reports, accounts, etc.)
// ABOUTME: Self-selecting — reads pickerType from Redux, renders matching items from PickerConfig

import { KeymapModule } from '@graffio/keymap'
import { Box, Flex, Text } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { KeymapConfig } from '../keymap-config.js'
import { PickerConfig } from '../picker-config.js'
import { currentStore } from '../store/index.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { Dialog } from './Dialog.jsx'

const { ActionRegistry } = KeymapModule

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Reads current picker items from config — all execute callbacks read at call time (dispatch-intent)
    // @sig currentPickerItems :: () -> [PickerItem]
    currentPickerItems: () => PickerConfig[S.pickerType(currentStore().getState())]?.items,

    // Closes the picker
    // @sig closePicker :: () -> void
    closePicker: () => post(Action.SetPickerOpen(undefined)),

    // Executes the highlighted item's callback and closes picker — reads state at call time
    // @sig executeHighlighted :: () -> void
    executeHighlighted: () => {
        const items = E.currentPickerItems()
        const index = S.pickerHighlight(currentStore().getState())
        const item = items?.[index]
        if (!item) return
        item.execute()
        E.closePicker()
    },

    // Moves highlight up, wrapping to bottom — reads state at call time
    // @sig moveUp :: () -> void
    moveUp: () => {
        const items = E.currentPickerItems()
        if (!items) return
        const current = S.pickerHighlight(currentStore().getState())
        post(Action.SetPickerHighlight((current - 1 + items.length) % items.length))
    },

    // Moves highlight down, wrapping to top — reads state at call time
    // @sig moveDown :: () -> void
    moveDown: () => {
        const items = E.currentPickerItems()
        if (!items) return
        const current = S.pickerHighlight(currentStore().getState())
        post(Action.SetPickerHighlight((current + 1) % items.length))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Renders a single picker item row
// @sig PickerItem :: { item: Object, isHighlighted: Boolean } -> ReactElement
const PickerItem = ({ item, isHighlighted }) => {
    const onClick = () => {
        item.execute()
        E.closePicker()
    }

    return (
        <Box onClick={onClick} style={isHighlighted ? ITEM_HIGHLIGHTED_STYLE : ITEM_STYLE}>
            <Text size="2">{item.label}</Text>
        </Box>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const handleContentKey = KeymapConfig.createContentKeyHandler(() => undefined)

const CONTENT_PROPS = { onKeyDown: handleContentKey, onEscapeKeyDown: e => e.preventDefault(), maxWidth: '360px' }

const ITEM_STYLE = { padding: 'var(--space-2) var(--space-3)', cursor: 'pointer', borderRadius: 'var(--radius-2)' }

const ITEM_HIGHLIGHTED_STYLE = { ...ITEM_STYLE, backgroundColor: 'var(--accent-3)' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let pickerCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Self-selecting picker — reads pickerType from state, renders matching items
// @sig QuickPicker :: () -> ReactElement | false
const QuickPicker = () => {
    // Registers picker actions on mount, cleans up on unmount — no render-scoped closures
    // @sig ref :: Element? -> void
    const ref = element => {
        pickerCleanup?.()
        pickerCleanup = undefined
        if (!element) return
        const { closePicker, executeHighlighted, moveUp, moveDown } = E
        pickerCleanup = ActionRegistry.register(undefined, [
            { id: 'dismiss', description: 'Close picker', execute: closePicker },
            { id: 'select', description: 'Open selected', execute: executeHighlighted },
            { id: 'navigate:up', description: 'Previous item', execute: moveUp },
            { id: 'navigate:down', description: 'Next item', execute: moveDown },
        ])
    }

    const pickerType = useSelector(S.pickerType)
    const highlightIndex = useSelector(S.pickerHighlight)
    if (!pickerType) return false

    const config = PickerConfig[pickerType]
    if (!config) throw new Error(`Unknown picker type: ${pickerType}`)
    const { title, items } = config

    return (
        <Dialog.Root open onOpenChange={E.closePicker}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content ref={ref} {...CONTENT_PROPS}>
                    <Dialog.Title>{title}</Dialog.Title>
                    <Flex direction="column" gap="1">
                        {items.map((item, i) => (
                            <PickerItem key={item.id} item={item} isHighlighted={i === highlightIndex} />
                        ))}
                    </Flex>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}

export { QuickPicker }
