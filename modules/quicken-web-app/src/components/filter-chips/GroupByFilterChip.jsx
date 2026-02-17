// ABOUTME: Group by filter chip with keyboard-navigable single-select popover
// ABOUTME: Provides default and investment group-by item lists

import { wrapIndex } from '@graffio/functional'
import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

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

const T = {
    // Finds the selected item by ID from items list
    // @sig toSelectedItems :: ([{ id }], String?) -> [{ id }]
    toSelectedItems: (items, selectedId) => {
        if (!selectedId) return []
        const item = items.find(i => i.id === selectedId)
        return item ? [item] : []
    },
}

// Group by filter chip with keyboard-navigable single-select popover
// @sig Chip :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Chip = ({ viewId, items }) => {
    const handleToggle = value => {
        post(Action.SetTransactionFilter(viewId, { groupBy: value }))
        post(Action.SetFilterPopoverOpen(viewId, null))
    }

    const resolvedItems = items ?? defaultGroupByItems
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const popoverId = useSelector(state => S.UI.filterPopoverId(state, viewId))
    const rawHighlight = useSelector(state => S.UI.filterPopoverHighlight(state, viewId))
    const isOpen = popoverId === 'groupBy'
    const selectedId = groupBy || resolvedItems[0]?.id
    const selectedIds = selectedId ? [selectedId] : []
    const selectedItems = T.toSelectedItems(resolvedItems, selectedId)

    // prettier-ignore
    const { index: highlightedIndex, next: nextHighlightIndex, prev: prevHighlightIndex } = wrapIndex(rawHighlight || 0, resolvedItems.length)

    return (
        <SelectableListPopover
            label="Group by"
            open={isOpen}
            onOpenChange={nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? 'groupBy' : null))}
            items={resolvedItems}
            selectedIds={selectedIds}
            selectedItems={selectedItems}
            highlightedIndex={highlightedIndex}
            singleSelect
            width={155}
            actionContext={viewId}
            onMoveDown={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))}
            onMoveUp={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))}
            onToggle={handleToggle}
            onToggleHighlighted={() =>
                resolvedItems[highlightedIndex] && handleToggle(resolvedItems[highlightedIndex].id)
            }
            onDismiss={() => post(Action.SetFilterPopoverOpen(viewId, null))}
            onClear={() => post(Action.SetFilterPopoverOpen(viewId, null))}
        />
    )
}

// Group-by filter column wrapper — no chipData, renders GroupByFilterChip in FilterColumn
// @sig Column :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Column = ({ viewId, items }) => <FilterColumn chip={<Chip viewId={viewId} items={items} />} details={[]} />

const GroupByFilterChip = { GroupByFilterChip: Chip, GroupByFilterColumn: Column, investmentGroupByItems }

export { GroupByFilterChip }
