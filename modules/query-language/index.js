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
export { buildFilterPredicate } from './src/build-filter-predicate.js'
export { CategoryTree } from './src/category-tree.js'

// Financial computations
export { computePositions } from './src/financial-computations/compute-positions.js'
export { buildPositionsTree } from './src/financial-computations/build-positions-tree.js'
export { MetricRegistry } from './src/financial-computations/metric-registry.js'
export { computeRealizedGains } from './src/financial-computations/compute-realized-gains.js'
export { computeDividendIncome } from './src/financial-computations/compute-dividend-income.js'
export { computeIrr } from './src/financial-computations/compute-irr.js'
export { computeBenchmarkReturn } from './src/financial-computations/compute-benchmark-return.js'
export { computeTotalReturn } from './src/financial-computations/compute-total-return.js'

// IR types (public — consumers construct queries with these)
export { FinancialQuery } from './src/types/ir-financial-query.js'
export { IRFilter } from './src/types/ir-filter.js'
export { IRGrouping } from './src/types/ir-grouping.js'
export { IRDateRange } from './src/types/ir-date-range.js'
export { IRComputedRow } from './src/types/ir-computed-row.js'
export { IRPivotExpression } from './src/types/ir-pivot-expression.js'
export { FieldTypes } from './src/types/field-types.js'

// Output types (public — consumers read query results with these shapes)
export { CategoryAggregate } from './src/types/category-aggregate.js'
export { CategoryTreeNode } from './src/types/category-tree-node.js'
export { PositionAggregate } from './src/types/position-aggregate.js'
export { PositionTreeNode } from './src/types/position-tree-node.js'
export { MetricDefinition } from './src/types/metric-definition.js'
