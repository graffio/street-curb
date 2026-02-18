// ABOUTME: Security filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders security selection with multi-select

import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule
const POPOVER_ID = 'securities'

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null, next: 0, prev: 0, highlightedItemId: null }
let triggerCleanup = null
let contentCleanup = null

const E = {
    // Registers filter:securities focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:securities',
                    description: 'Securities',
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
                        if (highlightedItemId) post(Action.ToggleSecurityFilter(viewId, highlightedItemId))
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

// Security filter chip with keyboard-navigable popover — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const { badges } = useSelector(state => S.UI.securityFilterData(state, viewId))
    const selectedIds = useSelector(state => S.UI.selectedSecurities(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

    chipState = { viewId, next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId }

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
            triggerRef={E.registerTriggerActions}
            contentRef={E.registerContentActions}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onToggle={securityId => post(Action.ToggleSecurityFilter(viewId, securityId))}
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
