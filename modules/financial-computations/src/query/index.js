// ABOUTME: Query primitives for financial computations
// ABOUTME: Exports filter, sort, group, and limit operations

export {
    and,
    or,
    not,
    byDateRange,
    byAccount,
    byCategory,
    byCategoryPrefix,
    byText,
    byCleared,
    byAmountRange,
    applyFilter,
} from './filter.js'

export { compareValues, sortBy, applySort } from './sort.js'

export { groupBy, expandCategoryHierarchy, groupByCategoryHierarchy } from './group.js'

export { take, skip, paginate } from './limit.js'
