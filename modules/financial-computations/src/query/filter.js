// ABOUTME: Filter predicates and composition for transaction queries
// ABOUTME: All predicates return functions suitable for Array.filter

// --- Predicate composition ---

// Compose multiple predicates with AND
// @sig and :: (...Predicates) -> a -> Boolean
// prettier-ignore
const and = (...predicates) => item => predicates.every(p => p(item))

// Compose multiple predicates with OR
// @sig or :: (...Predicates) -> a -> Boolean
// prettier-ignore
const or = (...predicates) => item => predicates.some(p => p(item))

// Negate a predicate
// @sig not :: Predicate -> a -> Boolean
const not = predicate => item => !predicate(item)

// --- Domain predicates ---

// Filter by date range (inclusive)
// @sig byDateRange :: (String, String) -> a -> Boolean
const byDateRange = (startDate, endDate) => txn => startDate <= txn.date && txn.date <= endDate

// Filter by account ID
// @sig byAccount :: String -> a -> Boolean
const byAccount = accountId => txn => txn.accountId === accountId

// Filter by exact category match
// @sig byCategory :: String -> a -> Boolean
const byCategory = categoryName => txn => txn.categoryName === categoryName

// Filter by category prefix (hierarchy match)
// Matches "food" for both "food" and "food:restaurant"
// @sig byCategoryPrefix :: String -> a -> Boolean
const byCategoryPrefix = prefix => txn => txn.categoryName === prefix || txn.categoryName?.startsWith(prefix + ':')

// Filter by text search (searches payee, memo, categoryName)
// @sig byText :: String -> a -> Boolean
const byText = query => {
    const lower = query.toLowerCase()
    return txn => {
        const { payee, memo, categoryName } = txn
        const searchable = [payee, memo, categoryName].filter(Boolean).join(' ').toLowerCase()
        return searchable.includes(lower)
    }
}

// Filter by cleared status
// @sig byCleared :: String -> a -> Boolean
const byCleared = status => txn => txn.cleared === status

// Filter by amount range (inclusive)
// @sig byAmountRange :: (Number, Number) -> a -> Boolean
const byAmountRange = (min, max) => txn => min <= txn.amount && txn.amount <= max

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
