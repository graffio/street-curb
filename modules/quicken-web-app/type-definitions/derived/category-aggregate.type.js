// ABOUTME: CategoryAggregate type for grouped spending totals
// ABOUTME: Represents summed amount and transaction count for a category group

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export const CategoryAggregate = {
    name: 'CategoryAggregate',
    kind: 'tagged',
    fields: { total: 'Number', count: 'Number' },
}
