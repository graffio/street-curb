// ABOUTME: Code generation for toString methods
// ABOUTME: Generates named toString functions for Tagged and TaggedSum types

/*
 * Generate named toString function for a type
 * @sig generateNamedToString :: (String, String, FieldMap) -> String
 */
const generateNamedToString = (funcName, typeName, fields) => {
    const fieldKeys = Object.keys(fields)
    const fieldStrings = fieldKeys.map(f => `\${R._toString(this.${f})}`)

    // Estimate line length: "    return `TypeName(" + fields + ")`"
    const singleLineReturn = `${typeName}(${fieldStrings.join(', ')})`
    const estimatedLength = 12 + singleLineReturn.length // "    return `" + content + "`"

    // If too long, split across multiple lines
    if (estimatedLength > 120) {
        const indentedFields = fieldStrings.map(s => `        ${s}`).join(',\n')
        return `/**
 * Convert to string representation
 * @sig ${funcName} :: () -> String
 */
const ${funcName} = function () {
    return \`${typeName}(
${indentedFields},
    )\`
}`
    }

    return `/**
 * Convert to string representation
 * @sig ${funcName} :: () -> String
 */
const ${funcName} = function () {
    return \`${typeName}(${fieldStrings.join(', ')})\`
}`
}

export { generateNamedToString }
