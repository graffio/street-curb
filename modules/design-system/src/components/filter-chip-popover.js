// ABOUTME: Pure logic for FilterChipPopover keyboard navigation
// ABOUTME: Keymap factory, item filtering, and index wrapping — no React dependency

import { containsIgnoreCase, LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'

// Filters items by case-insensitive substring match on label
// @sig toFilteredItems :: ([{ id, label }], String) -> [{ id, label }]
const toFilteredItems = (items, searchText) => {
    if (!searchText.trim()) return items
    return items.filter(item => containsIgnoreCase(searchText)(item.label))
}

// Wraps index forward, cycling back to 0 after the last item
// @sig toNextIndex :: (Number, Number) -> Number
const toNextIndex = (currentIndex, itemCount) => (currentIndex < itemCount - 1 ? currentIndex + 1 : 0)

// Wraps index backward, cycling to the last item from 0
// @sig toPreviousIndex :: (Number, Number) -> Number
const toPreviousIndex = (currentIndex, itemCount) => (currentIndex > 0 ? currentIndex - 1 : itemCount - 1)

// Creates a keymap with navigation intents for a filter chip popover
// @sig createKeymap :: (String, String, { onDown, onUp, onEnter, onEscape }) -> Keymap
const createKeymap = (keymapId, keymapName, handlers) => {
    const { Intent, Keymap } = KeymapModule
    const { onDown, onUp, onEnter, onEscape } = handlers

    const intents = LookupTable(
        [
            Intent('Move down', ['ArrowDown'], onDown),
            Intent('Move up', ['ArrowUp'], onUp),
            Intent('Toggle', ['Enter'], onEnter),
            Intent('Dismiss', ['Escape'], onEscape),
        ],
        Intent,
        'description',
    )

    return Keymap(keymapId, keymapName, 10, false, null, intents)
}

const FilterChipPopover = { createKeymap, toFilteredItems, toNextIndex, toPreviousIndex }
export { FilterChipPopover }
