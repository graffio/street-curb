// ABOUTME: Investment action filter chip with keyboard-navigable popover
// ABOUTME: Fully controlled via Redux — renders action selection with multi-select

import { useSelector } from 'react-redux'
import { post } from '../../commands/post.js'
import * as S from '../../store/selectors.js'
import { Action } from '../../types/action.js'
import { FilterChipPopover } from './FilterChipPopover.jsx'
import { FilterColumn } from './FilterColumn.jsx'

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Investment action filter chip — selects action filter data and renders FilterChipPopover
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleToggle = actionId => post(Action.ToggleActionFilter(viewId, actionId))

    const selectedIds = useSelector(state => S.UI.selectedInvestmentActions(state, viewId))
    return <FilterChipPopover config={CONFIG} viewId={viewId} selectedIds={selectedIds} onToggle={handleToggle} />
}

// Self-selecting action filter column — selects chipData and renders ActionFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { details } = useSelector(state => S.UI.actionChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} />} details={details} />
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const CONFIG = { popoverId: 'actions', label: 'Actions', triggerId: 'filter:actions', width: 150, clearFilter: { selectedInvestmentActions: [] } }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const ActionFilterChip = { ActionFilterChip: Chip, ActionFilterColumn: Column }

export { ActionFilterChip }
