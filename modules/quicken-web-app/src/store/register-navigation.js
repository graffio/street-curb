// ABOUTME: Pure transforms for register page navigation, search matching, and date ranges
// ABOUTME: Takes data arrays and primitives, never reads Redux state directly

import { endOfDay, startOfMonth } from '@graffio/functional'

const T = {
    // Reducer: picks the match closest to fromRowIdx in the given direction (wrapping)
    // @sig toClosestMatch :: ([Row], Number, Number, Number) -> ({ dist, rowIdx }, String) -> { dist, rowIdx }
    toClosestMatch: (data, fromRowIdx, len, dir) => (best, id) => {
        const idx = toRowIndex(data, id)
        if (idx < 0) return best
        const dist = ((idx - fromRowIdx) * dir + len) % len
        return dist > 0 && dist < best.dist ? { dist, rowIdx: idx } : best
    },
}

// Checks if we need to initialize the date range on first render
// @sig shouldInitializeDateRange :: (String, DateRange | null) -> Boolean
const shouldInitializeDateRange = (dateRangeKey, dateRange) => dateRangeKey === 'lastTwelveMonths' && !dateRange

// Finds the index of a transaction by ID in the data array
// Rows without a transaction (e.g., subtotal rows) are skipped via optional chaining
// @sig toRowIndex :: ([Row], String) -> Number
const toRowIndex = (data, id) => data.findIndex(r => r.transaction?.id === id)

// Finds the row index of the adjacent match in match-list order
// @sig toAdjacentMatchRowIdx :: ([Row], [String], Number, Number) -> Number
const toAdjacentMatchRowIdx = (data, matchIds, currentIdx, dir) => {
    const targetIdx = (currentIdx + dir + matchIds.length) % matchIds.length
    return toRowIndex(data, matchIds[targetIdx])
}

// Finds the display row index of the nearest match forward (dir=1) or backward (dir=-1)
// @sig toNearestMatchRowIdx :: ([Row], [String], Number, Number) -> Number
const toNearestMatchRowIdx = (data, matchIds, fromRowIdx, dir) =>
    matchIds.reduce(T.toClosestMatch(data, fromRowIdx, data.length, dir), { dist: Infinity, rowIdx: -1 }).rowIdx

// Creates a date range spanning the last 12 months
// @sig toDefaultDateRange :: () -> DateRange
const toDefaultDateRange = () => {
    const now = new Date()
    const twelveMonthsAgo = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1))
    return { start: twelveMonthsAgo, end: endOfDay(now) }
}

// Generates a unique table layout ID for an account with a type prefix
// @sig toTableLayoutId :: (String, String) -> String
const toTableLayoutId = (prefix, id) => `cols_${prefix}_${id}`

const RegisterNavigation = {
    shouldInitializeDateRange,
    toRowIndex,
    toAdjacentMatchRowIdx,
    toNearestMatchRowIdx,
    toDefaultDateRange,
    toTableLayoutId,
}

export { RegisterNavigation }
