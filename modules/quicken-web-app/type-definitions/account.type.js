// ABOUTME: Account type definition for bank, investment, and credit accounts
// ABOUTME: Validates account ID format and account type enum

import { FieldTypes } from './field-types.js'

export const Account = {
    name: 'Account',
    kind: 'tagged',
    fields: {
        id: FieldTypes.accountId,
        name: 'String',
        type: /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability|401\(k\)\/403\(b\))$/,
        description: 'String?',
        creditLimit: 'Number?',
    },
}

// Checks if an account is an investment-class account (Investment or 401(k)/403(b))
// @sig isInvestment :: Account -> Boolean
Account.isInvestment = account => account.type === 'Investment' || account.type === '401(k)/403(b)'
