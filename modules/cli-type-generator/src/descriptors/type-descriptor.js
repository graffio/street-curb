// ABOUTME: Normalized descriptor for entire type definitions
// ABOUTME: Converts parsed type definitions into a normalized structure for code generation

import FieldDescriptor from './field-descriptor.js'

// ---------------------------------------------------------------------------------------------------------------------
// TypeDescriptor Schema
// ---------------------------------------------------------------------------------------------------------------------
//
// Tagged:
// {
//     kind: 'Tagged',
//     name: 'Account',
//     fields: { id: FieldDescriptor, balance: FieldDescriptor },
//     childTypes: ['Category'],      // Referenced Tagged types (for imports)
//     needsLookupTable: false,       // Any field uses LookupTable
//     imports: [...],
//     functions: [...]
// }
//
// TaggedSum:
// {
//     kind: 'TaggedSum',
//     name: 'View',
//     variants: {
//         Register: {
//             fields: { id: FieldDescriptor, accountId: FieldDescriptor },
//             childTypes: [],
//         },
//         ...
//     },
//     needsLookupTable: false,
//     imports: [...],
//     functions: [...]
// }
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Normalize a parse result into a TypeDescriptor
 * @sig normalize :: ParseResult -> TypeDescriptor
 */
const normalize = parseResult => {
    /**
     * Normalize a field map to FieldDescriptor objects, computing childTypes
     * @sig normalizeFields :: Object -> { fields: Object, childTypes: [String], hasLookupTable: Boolean }
     */
    const normalizeFields = fieldMap => {
        /**
         * Process a single field entry, mutating the accumulator
         * @sig processField :: ([String, Any], Object) -> void
         */
        const processField = ([fieldName, fieldType], acc) => {
            const descriptor = FieldDescriptor.fromAny(fieldType)
            const { baseType, taggedType } = descriptor
            acc.fields[fieldName] = descriptor

            const isChildTypeField = baseType === 'Tagged' || baseType === 'LookupTable'
            if (isChildTypeField && taggedType && !acc.childTypes.includes(taggedType)) acc.childTypes.push(taggedType)

            if (baseType === 'LookupTable') acc.hasLookupTable = true
        }

        const acc = { fields: {}, childTypes: [], hasLookupTable: false }
        Object.entries(fieldMap).forEach(entry => processField(entry, acc))
        return acc
    }

    /**
     * Normalize a Tagged type definition
     * @sig normalizeTagged :: ParseResult -> TypeDescriptor
     */
    const normalizeTagged = pr => {
        const { typeDefinition, imports, functions } = pr
        const { name, fields: rawFields } = typeDefinition
        const { fields, childTypes, hasLookupTable } = normalizeFields(rawFields)

        return { kind: 'Tagged', name, fields, childTypes, needsLookupTable: hasLookupTable, imports, functions }
    }

    /**
     * Normalize a TaggedSum type definition
     * @sig normalizeTaggedSum :: ParseResult -> TypeDescriptor
     */
    const normalizeTaggedSum = pr => {
        /**
         * Process a single variant, mutating the variants object
         * @sig processVariant :: [String, Object] -> void
         */
        const processVariant = ([variantName, variantFields]) => {
            const { fields, childTypes, hasLookupTable } = normalizeFields(variantFields)
            variants[variantName] = { fields, childTypes }
            if (hasLookupTable) needsLookupTable = true
        }

        const { typeDefinition, imports, functions } = pr
        const { name, variants: rawVariants } = typeDefinition

        const variants = {}
        let needsLookupTable = false
        Object.entries(rawVariants).forEach(processVariant)

        return { kind: 'TaggedSum', name, variants, needsLookupTable, imports, functions }
    }

    const { kind } = parseResult.typeDefinition

    if (kind === 'tagged') return normalizeTagged(parseResult)
    if (kind === 'taggedSum') return normalizeTaggedSum(parseResult)

    throw new Error(`Unknown type definition kind: ${kind}`)
}

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

const TypeDescriptor = { normalize }

export default TypeDescriptor
