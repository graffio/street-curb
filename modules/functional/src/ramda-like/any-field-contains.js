// ABOUTME: Case-insensitive multi-field substring matching
// ABOUTME: Check if any of an object's fields contain a query string

/*
 * Check if any of the specified object fields contain the query string (case-insensitive)
 * Pre-computes lowercase query for efficiency when checking multiple objects
 *
 * @sig anyFieldContains :: [String] -> String -> Object -> Boolean
 */
const anyFieldContains = fields => query => {
    const q = query.toLowerCase()
    return obj => fields.some(field => obj[field]?.toLowerCase().includes(q))
}

export default anyFieldContains
