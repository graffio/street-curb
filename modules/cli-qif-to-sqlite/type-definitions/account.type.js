export const Account = {
    name: 'Account',
    kind: 'tagged',
    fields: {
        id: /^acc_[a-f0-9]{12}$/,
        name: 'String',
        type: /^(Bank|Cash|Credit Card|Investment|Other Asset|Other Liability)$/,
        description: 'String?',
        creditLimit: 'Number?',
    },
}
