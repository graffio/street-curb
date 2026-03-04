// ABOUTME: TaggedSum type for query source filter predicates
// ABOUTME: Two variants — Equals for exact match, OlderThan for date-relative filtering

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRFilter = {
    name: 'IRFilter',
    kind: 'taggedSum',
    variants: {
        Equals:    { field: /^(category|account|payee|accountType)$/, value: 'String' },
        OlderThan: { field: /^lastActivity$/, days: 'Number' },
    },
}
