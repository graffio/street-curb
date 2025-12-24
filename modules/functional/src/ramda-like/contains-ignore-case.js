// ABOUTME: Case-insensitive substring matching
// ABOUTME: Curried function for use in filter/map pipelines

/*
 * Case-insensitive substring check, curried for filter/map usage
 * Pre-computes lowercase query for efficiency when checking multiple values
 *
 * @sig containsIgnoreCase :: String -> String? -> Boolean
 */
const containsIgnoreCase = query => {
    const q = query.toLowerCase()
    return text => text?.toLowerCase().includes(q) ?? false
}

export default containsIgnoreCase
