// ABOUTME: Group by filter chip with keyboard-navigable single-select popover
// ABOUTME: Provides default and investment group-by item lists

import { KeymapModule } from '@graffio/keymap'
import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

const { ActionRegistry } = KeymapModule
const POPOVER_ID = 'groupBy'

const defaultGroupByItems = [
    { id: 'category', label: 'Category' },
    { id: 'account', label: 'Account' },
    { id: 'payee', label: 'Payee' },
    { id: 'month', label: 'Month' },
]

const investmentGroupByItems = [
    { id: 'account', label: 'Account' },
    { id: 'security', label: 'Security' },
    { id: 'securityType', label: 'Type' },
    { id: 'goal', label: 'Goal' },
]

// Module-level state — single instance per view, updated on each render
let chipState = { viewId: null, next: 0, prev: 0, highlightedItemId: null }
let triggerCleanup = null
let contentCleanup = null

const T = {
    // Finds the selected item by ID from items list
    // @sig toSelectedItems :: ([{ id }], String?) -> [{ id }]
    toSelectedItems: (items, selectedId) => {
        if (!selectedId) return []
        const item = items.find(i => i.id === selectedId)
        return item ? [item] : []
    },
}

const E = {
    // Selects a group-by value and closes the popover
    // @sig handleToggle :: String -> void
    handleToggle: value => {
        post(Action.SetTransactionFilter(chipState.viewId, { groupBy: value }))
        post(Action.SetFilterPopoverOpen(chipState.viewId, null))
    },

    // Registers filter:group-by focus action on trigger button mount
    // @sig registerTriggerActions :: Element? -> void
    registerTriggerActions: element => {
        triggerCleanup?.()
        triggerCleanup = null
        if (element)
            triggerCleanup = ActionRegistry.register(chipState.viewId, [
                {
                    id: 'filter:group-by',
                    description: 'Group by',
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
                        const { highlightedItemId } = chipState
                        if (highlightedItemId) E.handleToggle(highlightedItemId)
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

// Group by filter chip with keyboard-navigable single-select popover
// @sig Chip :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Chip = ({ viewId, items }) => {
    const { handleToggle, registerTriggerActions, registerContentActions } = E
    const resolvedItems = items ?? defaultGroupByItems
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const selectedId = groupBy || resolvedItems[0]?.id
    const selectedIds = selectedId ? [selectedId] : []
    const selectedItems = T.toSelectedItems(resolvedItems, selectedId)

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId, resolvedItems))
    const isOpen = popoverId === POPOVER_ID

    chipState = { viewId, next: nextHighlightIndex, prev: prevHighlightIndex, highlightedItemId }

    return (
        <SelectableListPopover
            label="Group by"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={selectedItems}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            singleSelect
            width={155}
            actionContext={viewId}
            triggerRef={registerTriggerActions}
            contentRef={registerContentActions}
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onToggle={handleToggle}
            onClear={() => post(Action.SetFilterPopoverOpen(viewId, null))}
        />
    )
}

// Group-by filter column wrapper — no chipData, renders GroupByFilterChip in FilterColumn
// @sig Column :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Column = ({ viewId, items }) => <FilterColumn chip={<Chip viewId={viewId} items={items} />} details={[]} />

const GroupByFilterChip = { GroupByFilterChip: Chip, GroupByFilterColumn: Column, investmentGroupByItems }

export { GroupByFilterChip }
