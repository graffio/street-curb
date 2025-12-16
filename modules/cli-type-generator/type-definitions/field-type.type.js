/** @module FieldType */

// TaggedSum type for FieldType union
// This represents the union of String | RegExp | ImportPlaceholder

export const FieldType = {
    name: 'FieldType',
    kind: 'taggedSum',
    variants: {
        StringType: { value: 'String' },
        RegexType: { value: 'RegExp' },
        ImportPlaceholder: { isImportPlaceholder: 'Boolean', source: 'String', localName: 'String' },
    },
}
