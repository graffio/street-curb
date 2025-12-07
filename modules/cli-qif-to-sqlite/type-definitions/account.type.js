export const Account = {
    name: 'Account',
    kind: 'tagged',
    fields: {
        id: 'Number',
        name: 'String',
        type: /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability)$/,
        description: 'String?',
        creditLimit: 'Number?',
    },
}
