// TaggedSum type for FieldType union
// This represents the union of String | RegExp | ImportPlaceholder

export const FieldType = {
    name: 'FieldType',
    kind: 'taggedSum',
    variants: {
        StringType: { value: 'String' },
        RegexType: { value: 'RegExp' },
        ImportPlaceholder: { __importPlaceholder: 'Boolean', source: 'String', localName: 'String' },
    },
}
