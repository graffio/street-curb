// ABOUTME: Account filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders account selection with multi-select

import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule
const POPOVER_ID = 'accounts'

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null, next: 0, prev: 0, highlightedItemId: null }
let triggerCleanup = null
let contentCleanup = null

const E = {
    // Registers filter:accounts focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:accounts',
                    description: 'Accounts',
                    execute: () => post(Action.SetFilterPopoverOpen(chipState.viewId, POPOVER_ID)),
                },
            ])
    },

    // Registers popover navigation actions on content mount (fires when popover opens/closes)
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
                        if (highlightedItemId) post(Action.ToggleAccountFilter(viewId, highlightedItemId))
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

// Account filter chip with keyboard-navigable popover and search — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const { badges, selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    chipState = { viewId, next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId }

    return (
        <SelectableListPopover
            label="Accounts"
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
            triggerRef={E.registerTriggerActions}
            contentRef={E.registerContentActions}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onToggle={accountId => post(Action.ToggleAccountFilter(viewId, accountId))}
            onClear={() => post(Action.SetTransactionFilter(viewId, { selectedAccounts: [] }))}
        />
    )
}

// Self-selecting account filter column — selects chipData and renders AccountFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { isActive, details } = useSelector(state => S.UI.accountChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} isActive={isActive} />} details={details} />
}

const AccountFilterChip = { AccountFilterChip: Chip, AccountFilterColumn: Column }

export { AccountFilterChip }
