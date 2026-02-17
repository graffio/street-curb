// ABOUTME: Account filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders account selection with multi-select

import { useSelector } from 'react-redux'
import { SelectableListPopover } from '../SelectableListPopover.jsx'
import { post } from '../../commands/post.js'
import { Action } from '../../types/action.js'
import * as S from '../../store/selectors.js'
import { FilterColumn } from './FilterColumn.jsx'

// Account filter chip with keyboard-navigable popover and search — fully controlled via Redux
// @sig Chip :: { viewId: String, isActive?: Boolean } -> ReactElement
const Chip = ({ viewId, isActive = false }) => {
    const handleOpenChange = nextOpen => post(Action.SetFilterPopoverOpen(viewId, nextOpen ? POPOVER_ID : null))
    const handleSearchChange = text => post(Action.SetFilterPopoverSearch(viewId, text))
    const handleToggle = accountId => post(Action.ToggleAccountFilter(viewId, accountId))
    const handleClear = () => post(Action.SetTransactionFilter(viewId, { selectedAccounts: [] }))
    const handleDismiss = () => post(Action.SetFilterPopoverOpen(viewId, null))

    const handleMoveDown = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: nextHighlightIndex }))

    const handleMoveUp = () => post(Action.SetViewUiState(viewId, { filterPopoverHighlight: prevHighlightIndex }))

    const handleToggleHighlighted = () =>
        highlightedItemId && post(Action.ToggleAccountFilter(viewId, highlightedItemId))

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
            onOpenChange={handleOpenChange}
            items={filteredItems}
            selectedIds={selectedIds}
            selectedItems={badges}
            highlightedIndex={highlightedIndex}
            searchText={searchText}
            searchable
            width={175}
            isActive={isActive}
            actionContext={viewId}
            onSearchChange={handleSearchChange}
            onMoveDown={handleMoveDown}
            onMoveUp={handleMoveUp}
            onToggle={handleToggle}
            onToggleHighlighted={handleToggleHighlighted}
            onDismiss={handleDismiss}
            onClear={handleClear}
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
