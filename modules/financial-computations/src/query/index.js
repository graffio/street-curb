// ABOUTME: Query primitives for financial computations (internal)
// ABOUTME: Exports filter, sort, and limit operations

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

export { take, skip, paginate } from './limit.js'
