// ABOUTME: TaggedSum type for query source domains
// ABOUTME: Closed set of three — Transactions, Holdings, Accounts

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const Domain = {
    name: 'Domain',
    kind: 'taggedSum',
    variants: { Transactions: {}, Holdings: {}, Accounts: {} },
}
