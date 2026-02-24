// ABOUTME: Boundary converter for sql.js parameter binding
// ABOUTME: Converts undefined to null at the sql.js interface boundary
// COMPLEXITY: no-null-literal — toSqlParams is the sql.js boundary; null is required by the driver API

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Convert undefined to null for multiple sql.js parameters
// sql.js rejects undefined but accepts null for nullable columns
// Apply at .run()/.get()/.all() call sites, not inside transformers
// @sig toSqlParams :: ...Any -> [Any]
const toSqlParams = (...values) => values.map(v => (v === undefined ? null : v))

export { toSqlParams }
