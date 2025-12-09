export const Price = {
    name: 'Price',
    kind: 'tagged',
    fields: { id: /^prc_[a-f0-9]{12}$/, securityId: /^sec_[a-f0-9]{12}$/, date: 'String', price: 'Number' },
}
