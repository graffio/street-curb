// ABOUTME: TaggedSum type for query source filter predicates
// ABOUTME: Two variants — Equals for exact match, OlderThan for date-relative filtering

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const QueryFilter = {
    name: 'QueryFilter',
    kind: 'taggedSum',
    variants: {
        Equals:    { field: 'String', value: 'String' },
        OlderThan: { field: 'String', days: 'Number' },
    },
}
