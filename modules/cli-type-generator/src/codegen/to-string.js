// ABOUTME: Code generation for toString methods
// ABOUTME: Generates named toString functions for Tagged and TaggedSum types

/*
 * Generate toString object containing all variant toString methods
 * @sig generateToStringObject :: ([(String, String, FieldMap)]) -> String
 */
const generateToStringObject = variants => {
    /*
     * Generate a single toString entry for a variant
     * @sig toStringEntry :: (String, String, FieldMap, Number) -> String
     */
    const toStringEntry = (variantKey, typeName, fields, maxKeyLen) => {
        const fieldKeys = Object.keys(fields)
        const fieldStrings = fieldKeys.map(f => `\${R._toString(this.${f})}`)
        const paddedKey = variantKey.padEnd(maxKeyLen)
        return `${paddedKey}: function () { return \`${typeName}(${fieldStrings.join(', ')})\` }`
    }

    const maxKeyLen = Math.max(...variants.map(([key]) => key.length))
    const entries = variants.map(([key, typeName, fields]) => toStringEntry(key, typeName, fields, maxKeyLen))
    return `// prettier-ignore
        const toString = {
    ${entries.join(',\n    ')},
}`
}

/*
 * Generate named toString function for a type
 * @sig generateNamedToString :: (String, String, FieldMap) -> String
 */
const generateNamedToString = (funcName, typeName, fields) => {
    /*
     * Return a string on a single line < 120 characters
     * @sig singleLineReturnStatement = () -> String
     */
    const singleLineReturnStatement = () => `

        /**
         * Convert to string representation
         * @sig ${funcName} :: () -> String
         */
        const ${funcName} = function () {
            return \`${typeName}(${fieldStrings.join(', ')})\`
        }`

    /*
     * Return a string on a multiple lines to keep the line length < 120 characters
     * @sig multipleLineReturnStatement = () -> String
     */
    const multipleLineReturnStatement = () => {
        const indentedFields = fieldStrings.join(',\n        ')
        return `

            /*
             * Convert to string representation
             * @sig ${funcName} :: () -> String
             */
            const ${funcName} = function () {
                return \`${typeName}(${indentedFields})\`
            }`
    }

    const fieldKeys = Object.keys(fields)
    const fieldStrings = fieldKeys.map(f => `\${R._toString(this.${f})}`)

    // Estimate line length: "    return `TypeName(" + fields + ")`"
    const singleLineReturn = `${typeName}(${fieldStrings.join(', ')})`
    const estimatedLength = 12 + singleLineReturn.length // "    return `" + content + "`"

    // If too long, split across multiple lines
    return estimatedLength > 120 ? multipleLineReturnStatement() : singleLineReturnStatement()
}

export { generateNamedToString, generateToStringObject }
