// ABOUTME: Group by filter chip with keyboard-navigable single-select popover
// ABOUTME: Provides default and investment group-by item lists

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

// Group by filter chip — selects groupBy state and renders FilterChipPopover in single-select mode
// @sig Chip :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Chip = ({ viewId, items }) => {
    const onToggle = value => post(Action.SetTransactionFilter(viewId, { groupBy: value }))

    const allItems = items ?? defaultGroupByItems
    const groupBy = useSelector(state => S.UI.groupBy(state, viewId))
    const selected = groupBy || allItems[0]?.id
    const ids = selected ? [selected] : []
    return <FilterChipPopover config={CONFIG} viewId={viewId} selectedIds={ids} onToggle={onToggle} items={allItems} />
}

// Group-by filter column wrapper — renders GroupByFilterChip in FilterColumn
// @sig Column :: { viewId: String, items?: [{ id, label }] } -> ReactElement
const Column = ({ viewId, items }) => <FilterColumn chip={<Chip viewId={viewId} items={items} />} details={[]} />

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
const CONFIG = { popoverId: 'groupBy', label: 'Group by', triggerId: 'filter:group-by', width: 155, singleSelect: true }

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const GroupByFilterChip = { GroupByFilterChip: Chip, GroupByFilterColumn: Column, investmentGroupByItems }

export { GroupByFilterChip }
