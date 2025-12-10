export const Tag = {
    name: 'Tag',
    kind: 'tagged',
    fields: { id: /^tag_[a-f0-9]{12}$/, name: 'String', color: 'String?', description: 'String?' },
}
