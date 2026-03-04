// ABOUTME: Tagged type for user data context used by query validator
// ABOUTME: Extracted from Redux state — categories, accounts, accountTypes, payees

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const DataSummary = {
    name: 'DataSummary',
    kind: 'tagged',
    fields: {
        categories:   '[String]',
        accounts:     '[AccountSummary]',
        accountTypes: '[String]',
        payees:       '[String]',
    },
}
