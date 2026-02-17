// ABOUTME: Category filter chip with keyboard-navigable searchable popover
// ABOUTME: Fully controlled via Redux — renders category selection with multi-select

import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

const E = {
    // Toggles a category filter: adds if not selected, removes if selected
    // @sig toggleCategoryFilter :: (String, String, [String]) -> void
    toggleCategoryFilter: (viewId, categoryName, selectedIds) => {
        if (selectedIds.includes(categoryName)) post(Action.RemoveCategoryFilter(viewId, categoryName))
        else post(Action.AddCategoryFilter(viewId, categoryName))
    },
}

// Category filter chip with keyboard-navigable searchable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const POPOVER_ID = 'categories'
    const { badges, selectedIds } = useSelector(state => S.UI.categoryFilterData(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

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
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onMoveDown={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))}
            onMoveUp={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))}
            onToggle={categoryName => E.toggleCategoryFilter(viewId, categoryName, selectedIds)}
            onToggleHighlighted={() =>
                highlightedItemId && E.toggleCategoryFilter(viewId, highlightedItemId, selectedIds)
            }
            onDismiss={() => post(Action.SetFilterPopoverOpen(viewId, null))}
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
