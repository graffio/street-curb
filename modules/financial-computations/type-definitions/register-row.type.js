// ABOUTME: RegisterRow type for bank/investment registers with running balance
// ABOUTME: Pairs a transaction with its computed running balance

// prettier-ignore
export const RegisterRow = {
    name: 'RegisterRow',
    kind: 'tagged',
    fields: {
        transaction:    'Transaction',
        runningBalance: 'Number',
    },
}
