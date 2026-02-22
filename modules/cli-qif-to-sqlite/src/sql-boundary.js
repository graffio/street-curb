// ABOUTME: Boundary converter for sql.js parameter binding
// ABOUTME: Converts undefined to null at the sql.js interface boundary
// COMPLEXITY: export-structure — SqlBoundary namespace documents boundary intent; will grow as needed

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

// Convert undefined to null for multiple sql.js parameters
// sql.js rejects undefined but accepts null for nullable columns
// Apply at .run()/.get()/.all() call sites, not inside transformers
// @sig toSqlParams :: ...Any -> [Any]
const toSqlParams = (...values) => values.map(v => (v === undefined ? null : v))

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const SqlBoundary = { toSqlParams }

export { SqlBoundary }
