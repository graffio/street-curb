// ABOUTME: Filter predicates and composition for transaction queries
// ABOUTME: All predicates return functions suitable for Array.filter

// --- Predicate composition ---

// Compose multiple predicates with AND
// @sig and :: (...Predicates) -> Predicate
const and = (...predicates) => {
    const matchAll = item => predicates.every(p => p(item))
    return matchAll
}

// Compose multiple predicates with OR
// @sig or :: (...Predicates) -> Predicate
const or = (...predicates) => {
    const matchAny = item => predicates.some(p => p(item))
    return matchAny
}

// Negate a predicate
// @sig not :: Predicate -> Predicate
const not = predicate => item => !predicate(item)

// --- Domain predicates ---

// Filter by date range (inclusive)
// @sig byDateRange :: (String, String) -> Predicate
const byDateRange = (startDate, endDate) => txn => txn.date >= startDate && txn.date <= endDate

// Filter by account ID
// @sig byAccount :: String -> Predicate
const byAccount = accountId => txn => txn.accountId === accountId

// Filter by exact category match
// @sig byCategory :: String -> Predicate
const byCategory = categoryName => txn => txn.categoryName === categoryName

// Filter by category prefix (hierarchy match)
// Matches "food" for both "food" and "food:restaurant"
// @sig byCategoryPrefix :: String -> Predicate
const byCategoryPrefix = prefix => txn => txn.categoryName === prefix || txn.categoryName?.startsWith(prefix + ':')

// Filter by text search (searches payee, memo, categoryName)
// @sig byText :: String -> Predicate
const byText = query => {
    const lower = query.toLowerCase()
    return txn => {
        const { payee, memo, categoryName } = txn
        const searchable = [payee, memo, categoryName].filter(Boolean).join(' ').toLowerCase()
        return searchable.includes(lower)
    }
}

// Filter by cleared status
// @sig byCleared :: String -> Predicate
const byCleared = status => txn => txn.cleared === status

// Filter by amount range (inclusive)
// @sig byAmountRange :: (Number, Number) -> Predicate
const byAmountRange = (min, max) => txn => txn.amount >= min && txn.amount <= max

// Apply filter to array, preserving type
// @sig applyFilter :: (Predicate, [a]) -> [a]
const applyFilter = (predicate, items) => items.filter(predicate)

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
}
