// ABOUTME: Public API for the @graffio/query-language module
// ABOUTME: Exports query engine, IR entry point (fromJSON), output types, and financial computations

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Engine
export { runFinancialQuery } from './src/run-financial-query.js'
export { toFinancialQueryDescription } from './src/to-financial-query-description.js'
export { applyChipFilters } from './src/apply-chip-filters.js'

// Financial computations
export { computePositions } from './src/financial-computations/compute-positions.js'

// IR types (public — query construction and result matching)
export { IRFinancialQuery } from './src/types/ir-financial-query.js'

// Output types (public — consumers read query results with these shapes)
export { CategoryTreeNode } from './src/types/category-tree-node.js'
export { PositionTreeNode } from './src/types/position-tree-node.js'
