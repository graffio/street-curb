// ABOUTME: Barrel file reassembling FilterChips namespace from individual chip modules
// ABOUTME: Preserves identical export shape as the original monolithic FilterChips.jsx

import { FilterColumn } from './FilterColumn.jsx'
import { AccountFilterChip } from './AccountFilterChip.jsx'
import { ActionFilterChip } from './ActionFilterChip.jsx'
import { AsOfDateChip } from './AsOfDateChip.jsx'
import { CategoryFilterChip } from './CategoryFilterChip.jsx'
import { DateFilterChip } from './DateFilterChip.jsx'
import { GroupByFilterChip } from './GroupByFilterChip.jsx'
import { SearchFilterChip } from './SearchFilterChip.jsx'
import { SecurityFilterChip } from './SecurityFilterChip.jsx'

const FilterChips = {
    ...AccountFilterChip,
    ...ActionFilterChip,
    ...AsOfDateChip,
    ...CategoryFilterChip,
    ...DateFilterChip,
    FilterColumn,
    ...GroupByFilterChip,
    ...SearchFilterChip,
    ...SecurityFilterChip,
}

export { FilterChips }
