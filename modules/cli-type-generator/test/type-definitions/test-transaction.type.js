// Test type definition for validating the generator
export const TestTransaction = {
    name: 'TestTransaction',
    kind: 'taggedSum',
    variants: {
        Bank: { id: 'Number', accountId: 'Number', amount: 'Number', date: 'String', payee: 'String?' },
        Investment: {
            id: 'Number',
            accountId: 'Number',
            date: 'String',
            securityId: 'Number?',
            quantity: 'Number?',
            price: 'Number?',
        },
    },
}
