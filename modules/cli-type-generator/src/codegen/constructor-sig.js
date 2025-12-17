// ABOUTME: Code generation for constructor JSDoc signatures
// ABOUTME: Generates @sig comments showing type signatures for constructors

import FieldDescriptor from '../descriptors/field-descriptor.js'

/*
 * Generate @sig comment for a constructor function
 * @sig generateConstructorSig :: (String, FieldMap) -> String
 */
const generateConstructorSig = (fullTypeName, fields) => {
    /*
     * Capitalize first letter of a string
     * @sig capitalize :: String -> String
     */
    const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

    /*
     * Format a field entry as a type signature parameter
     * @sig formatFieldEntry :: ([String, FieldType]) -> String
     */
    const formatFieldEntry = ([fieldName, fieldType]) => {
        const parsed = FieldDescriptor.fromAny(fieldType)
        const { baseType, taggedType, optional, arrayDepth, regex } = parsed

        // For regex fields, create a type alias from the field name
        if (regex) {
            const typeName = capitalize(fieldName)
            regexDefs.push(`${typeName} = ${regex}`)
            const wrapped = arrayDepth > 0 ? '['.repeat(arrayDepth) + typeName + ']'.repeat(arrayDepth) : typeName
            return optional ? `${wrapped}?` : wrapped
        }

        // For LookupTable fields, show {Type} syntax
        if (baseType === 'LookupTable') return optional ? `{${taggedType}}?` : `{${taggedType}}`

        const base = taggedType || baseType
        const wrapped = arrayDepth > 0 ? '['.repeat(arrayDepth) + base + ']'.repeat(arrayDepth) : base
        return optional ? `${wrapped}?` : wrapped
    }

    const regexDefs = []
    const fieldTypes = Object.entries(fields).map(formatFieldEntry)
    const params = fieldTypes.length > 0 ? `(${fieldTypes.join(', ')})` : '()'
    const regexLines = regexDefs.length > 0 ? `\n *     ${regexDefs.join('\n *     ')}` : ''
    const shortName = fullTypeName.split('.').pop()

    return `
        /*
         * Construct a ${fullTypeName} instance
         * @sig ${shortName} :: ${params} -> ${fullTypeName}${regexLines}
         */`
}

export { generateConstructorSig }
