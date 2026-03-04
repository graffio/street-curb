// ABOUTME: TaggedSum type for query source domains
// ABOUTME: Closed set of three — Transactions, Positions, Accounts

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRDomain = {
    name: 'IRDomain',
    kind: 'taggedSum',
    variants: { Transactions: {}, Positions: {}, Accounts: {} },
}
