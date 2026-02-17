// ABOUTME: Account filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders account selection with multi-select

import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { FilterColumn } from './FilterColumn.jsx'

// Account filter chip with keyboard-navigable popover and search — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const POPOVER_ID = 'accounts'
    const { badges, selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))

    // prettier-ignore
    const { popoverId, searchText, highlightedIndex, nextHighlightIndex, prevHighlightIndex,
        highlightedItemId, filteredItems } = useSelector(state => S.UI.filterPopoverData(state, viewId))
    const isOpen = popoverId === POPOVER_ID

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
            onSearchChange={text => post(Action.SetFilterPopoverSearch(viewId, text))}
            onMoveDown={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))}
            onMoveUp={() => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))}
            onToggle={accountId => post(Action.ToggleAccountFilter(viewId, accountId))}
            onToggleHighlighted={() => highlightedItemId && post(Action.ToggleAccountFilter(viewId, highlightedItemId))}
            onDismiss={() => post(Action.SetFilterPopoverOpen(viewId, null))}
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
