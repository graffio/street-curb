// ABOUTME: Security filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders security selection with multi-select

import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

// Security filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const POPOVER_ID = 'securities'
    const { badges } = useSelector(state => S.UI.securityFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedSecurities(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Securities"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={175}
            isActive={isActive}
            actionContext={viewId}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onMoveDown={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))}
            onMoveUp={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))}
            onToggle={securityId => post(Action.ToggleSecurityFilter(viewId, securityId))}
            onToggleHighlighted={() =>
                highlightedItemId && post(Action.ToggleSecurityFilter(viewId, highlightedItemId))
            }
            onDismiss={() => post(Action.SetFilterPopoverOpen(viewId, null))}
            onClear={() => post(Action.SetTransactionFilter(viewId, { selectedSecurities: [] }))}
        />
    )
}

// Self-selecting security filter column — selects chipData and renders SecurityFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive, details } = useSelector(state => S.UI.securityChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={details} />
}

const SecurityFilterChip = { SecurityFilterChip: Chip, SecurityFilterColumn: Column }

export { SecurityFilterChip }
