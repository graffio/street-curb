// ABOUTME: Security filter chip with keyboard-navigable popover and search
// ABOUTME: Fully controlled via Redux — renders security selection with multi-select

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

// Security filter chip — selects security filter data and renders FilterChipPopover
// @sig Chip :: { viewId: String } -> ReactElement
const Chip = ({ viewId }) => {
    const handleToggle = securityId => post(Action.ToggleSecurityFilter(viewId, securityId))

    // prettier-ignore
    const config = { popoverId: 'securities', label: 'Securities', triggerId: 'filter:securities', width: 175, clearFilter: { selectedSecurities: [] } }
    const selectedIds = useSelector(state => S.UI.selectedSecurities(state, viewId))
    return <FilterChipPopover config={config} viewId={viewId} selectedIds={selectedIds} onToggle={handleToggle} />
}

// Self-selecting security filter column — selects chipData and renders SecurityFilterChip
// @sig Column :: { viewId: String } -> ReactElement
const Column = ({ viewId }) => {
    const { details } = useSelector(state => S.UI.securityChipData(state, viewId))
    return <FilterColumn chip={<Chip viewId={viewId} />} details={details} />
}

const SecurityFilterChip = { SecurityFilterChip: Chip, SecurityFilterColumn: Column }

export { SecurityFilterChip }
