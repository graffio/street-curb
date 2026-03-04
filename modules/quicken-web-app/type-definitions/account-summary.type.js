// ABOUTME: Tagged type for account name/type pairs in DataSummary
// ABOUTME: Replaces loose {name, type} objects — validates account type enum

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const AccountSummary = {
    name: 'AccountSummary',
    kind: 'tagged',
    fields: {
        name: 'String',
        type: /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/,
    },
}
