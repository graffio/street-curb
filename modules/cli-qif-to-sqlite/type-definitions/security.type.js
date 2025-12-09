export const Security = {
    name: 'Security',
    kind: 'tagged',
    fields: { id: /^sec_[a-f0-9]{12}$/, name: 'String', symbol: 'String?', type: 'String?', goal: 'String?' },
}
