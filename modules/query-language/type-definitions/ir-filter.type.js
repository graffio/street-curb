// ABOUTME: TaggedSum type for query source filter predicates
// ABOUTME: Boolean tree with leaf predicates and And/Or/Not combinators for compound filtering

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
        // Leaf predicates
        Equals:      { field: /^(category|account|payee|accountType)$/, value: 'String' },
        In:          { field: 'String', values: '[String]' },
        GreaterThan: { field: 'String', value: 'Number' },
        LessThan:    { field: 'String', value: 'Number' },
        Between:     { field: 'String', low: 'Number', high: 'Number' },
        Matches:     { field: 'String', pattern: 'String' },

        // Combinators
        And:         { filters: '[IRFilter]' },
        Or:          { filters: '[IRFilter]' },
        Not:         { filter: 'IRFilter' },
    },
}
