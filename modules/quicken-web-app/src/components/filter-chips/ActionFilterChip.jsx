// ABOUTME: Investment action filter chip with keyboard-navigable popover
// ABOUTME: Fully controlled via Redux — renders action selection with multi-select

import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

// Investment action filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const POPOVER_ID = 'actions'
    const { badges } = useSelector(state => S.UI.actionFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    return (
        <SelectableListPopover
            label="Actions"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            width={150}
            isActive={isActive}
            actionContext={viewId}
            onMoveDown={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))}
            onMoveUp={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))}
            onToggle={actionId => post(Action.ToggleActionFilter(viewId, actionId))}
            onToggleHighlighted={() => highlightedItemId && post(Action.ToggleActionFilter(viewId, highlightedItemId))}
            onDismiss={() => post(Action.SetFilterPopoverOpen(viewId, null))}
            onClear={() => post(Action.SetTransactionFilter(viewId, { selectedInvestmentActions: [] }))}
        />
    )
}

// Self-selecting action filter column — selects chipData and renders ActionFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive, details } = useSelector(state => S.UI.actionChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={details} />
}

const ActionFilterChip = { ActionFilterChip: Chip, ActionFilterColumn: Column }

export { ActionFilterChip }
