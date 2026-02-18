// ABOUTME: Category filter chip with keyboard-navigable searchable popover
// ABOUTME: Fully controlled via Redux — renders category selection with multi-select

import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule
const POPOVER_ID = 'categories'

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null, next: 0, prev: 0, highlightedItemId: null, selectedIds: [] }
let triggerCleanup = null
let contentCleanup = null

const E = {
    // Toggles a category filter: adds if not selected, removes if selected
    // @sig toggleCategoryFilter :: (String, String, [String]) -> void
    toggleCategoryFilter: (viewId, categoryName, selectedIds) => {
        if (selectedIds.includes(categoryName)) post(Action.RemoveCategoryFilter(viewId, categoryName))
        else post(Action.AddCategoryFilter(viewId, categoryName))
    },

    // Registers filter:categories focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:categories',
                    description: 'Categories',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, POPOVER_ID)),
                },
            ])
    },

    // Registers popover navigation actions on content mount
    // @sig registerContentActions :: Element? -> void
    registerContentActions: element => {
        contentCleanup?.()
        contentCleanup = null
        if (element)
            contentCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'navigate:down',
                    description: 'Move down',
                    execute: () =>
                        post(Action.SetViewUiState(chipState.viewId, { filterPopoverHighlight: chipState.next })),
                },
                {
                    id: 'navigate:up',
                    description: 'Move up',
                    execute: () =>
                        post(Action.SetViewUiState(chipState.viewId, { filterPopoverHighlight: chipState.prev })),
                },
                {
                    id: 'select',
                    description: 'Toggle',
                    execute: () => {
                        const { viewId, highlightedItemId, selectedIds } = chipState
                        if (highlightedItemId) E.toggleCategoryFilter(viewId, highlightedItemId, selectedIds)
                    },
                },
                {
                    id: 'dismiss',
                    description: 'Dismiss',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, null)),
                },
            ])
    },
}

// Category filter chip with keyboard-navigable searchable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const { badges, selectedIds } = useSelector(state => S.UI.categoryFilterData(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    chipState = { viewId, next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId, selectedIds }

    return (
        <SelectableListPopover
            label="Categories"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={185}
            isActive={isActive}
            actionContext={viewId}
            triggerRef={E.registerTriggerActions}
            contentRef={E.registerContentActions}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onToggle={categoryName => E.toggleCategoryFilter(viewId, categoryName, selectedIds)}
            onClear={() => post(Action.SetTransactionFilter(viewId, { selectedCategories: [] }))}
        />
    )
}

// Self-selecting category filter column — selects chipData and renders CategoryFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive, details } = useSelector(state => S.UI.categoryChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={details} />
}

const CategoryFilterChip = { CategoryFilterChip: Chip, CategoryFilterColumn: Column }

export { CategoryFilterChip }
