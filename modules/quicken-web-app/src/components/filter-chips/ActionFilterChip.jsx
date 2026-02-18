// ABOUTME: Investment action filter chip with keyboard-navigable popover
// ABOUTME: Fully controlled via Redux — renders action selection with multi-select

import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule
const POPOVER_ID = 'actions'

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null, next: 0, prev: 0, highlightedItemId: null }
let triggerCleanup = null
let contentCleanup = null

const E = {
    // Registers filter:actions focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:actions',
                    description: 'Actions',
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
                        const { viewId, highlightedItemId } = chipState
                        if (highlightedItemId) post(Action.ToggleActionFilter(viewId, highlightedItemId))
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

// Investment action filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const { badges } = useSelector(state => S.UI.actionFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))

    const popoverData = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex } = popoverData
    const { highlightedItemId, filteredItems } = popoverData
    const isOpen = popoverId === POPOVER_ID

    chipState = { viewId, next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId }

    return (
        <SelectableListPopover
            label="Actions"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={150}
            isActive={isActive}
            actionContext={viewId}
            triggerRef={E.registerTriggerActions}
            contentRef={E.registerContentActions}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onToggle={actionId => post(Action.ToggleActionFilter(viewId, actionId))}
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
