// ABOUTME: Account filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders account selection with multi-select

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

// Account filter chip — selects account filter data and renders FilterChipPopover
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleToggle = accountId => post(Action.ToggleAccountFilter(viewId, accountId))

    const clearFilter = { selectedAccounts: [] }
    const config = { popoverId: 'accounts', label: 'Accounts', triggerId: 'filter:accounts', width: 175, clearFilter }
    const { selectedIds } = useSelector(state => S.UI.accountFilterData(state, viewId))
    return <FilterChipPopover config={config} viewId={viewId} selectedIds={selectedIds} onToggle={handleToggle} />
}

// Self-selecting account filter column — selects chipData and renders AccountFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { details } = useSelector(state => S.UI.accountChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} />} details={details} />
}

const AccountFilterChip = { AccountFilterChip: Chip, AccountFilterColumn: Column }

export { AccountFilterChip }
