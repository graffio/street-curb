// ABOUTME: Public API for the @graffio/query-language module
// ABOUTME: Exports query engine, IR types, output types, and financial computation functions

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

// IR types (public — consumers construct queries with these)
export { FinancialQuery } from './src/types/ir-financial-query.js'
export { IRFilter } from './src/types/ir-filter.js'
export { IRGrouping } from './src/types/ir-grouping.js'
export { IRDateRange } from './src/types/ir-date-range.js'
export { IRComputedRow } from './src/types/ir-computed-row.js'
export { IRPivotExpression } from './src/types/ir-pivot-expression.js'

// Output types (public — consumers read query results with these shapes)
export { CategoryTreeNode } from './src/types/category-tree-node.js'
export { PositionTreeNode } from './src/types/position-tree-node.js'
