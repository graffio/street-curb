// ABOUTME: Category filter chip with keyboard-navigable searchable popover
// ABOUTME: Fully controlled via Redux — renders category selection with toggle

import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { FilterChipPopover } from './FilterChipPopover.jsx'
import { FilterColumn } from './FilterColumn.jsx'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Category filter chip — selects category filter data and renders FilterChipPopover
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleToggle = category => post(Action.ToggleCategoryFilter(viewId, category))

    // prettier-ignore
    const config = { popoverId: 'categories', label: 'Categories', triggerId: 'filter:categories', width: 185, clearFilter: { selectedCategories: [] } }
    const { selectedIds } = useSelector(state => S.UI.categoryFilterData(state, viewId))
    return <FilterChipPopover config={config} viewId={viewId} selectedIds={selectedIds} onToggle={handleToggle} />
}

// Self-selecting category filter column — selects chipData and renders CategoryFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { details } = useSelector(state => S.UI.categoryChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} />} details={details} />
}

const CategoryFilterChip = { CategoryFilterChip: Chip, CategoryFilterColumn: Column }

export { CategoryFilterChip }
