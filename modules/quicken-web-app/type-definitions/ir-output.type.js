// ABOUTME: Tagged type for query output configuration
// ABOUTME: Controls which fields to show and output format

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IROutput = {
    name: 'IROutput',
    kind: 'tagged',
    fields: {
        show:   '[String]?',
        format: 'String?',
    },
}
