// ABOUTME: Low-level code generation for constructor expressions
// ABOUTME: Generates type checks, assignments, and constructor bodies

import FieldDescriptor from '../descriptors/field-descriptor.js'

/*
 * Generate a Type Constructor function given its name and its fields
 * @sig generateTypeConstructor :: (String, String, FieldMap) -> String
 */
const generateTypeConstructor = (typeName, fullTypeName, fields) => {
    /*
     * Generate guards that validate actual parameter types vs declared types
     * @sig generateTypeCheck :: (String, String, FieldType) -> String
     */
    // prettier-ignore
    const generateTypeCheck = (cName, name, fieldType) => {
        const descriptor = FieldDescriptor.fromAny(fieldType)
        const { arrayDepth, baseType, fieldTypesReference, optional, regex, taggedType } = descriptor
        const tag = taggedType ? `"${taggedType}"` : undefined

        // Handle FieldTypes references (regex patterns imported from FieldTypes)
        if (fieldTypesReference) return `R.validateRegex(constructorName, ${fieldTypesReference.fullReference}, '${name}', ${optional}, ${name})`

        if (baseType === 'Any')         return ''
        if (arrayDepth)                 return `R.validateArray(constructorName, ${arrayDepth}, '${baseType}', ${tag}, '${name}', ${optional}, ${name})`
        if (baseType === 'LookupTable') return `R.validateLookupTable(constructorName, '${taggedType}', '${name}', ${optional}, ${name})`
        if (regex)                      return `R.validateRegex(constructorName, ${regex}, '${name}', ${optional}, ${name})`
        if (baseType === 'String')      return `R.validateString(constructorName, '${name}', ${optional}, ${name})`
        if (baseType === 'Number')      return `R.validateNumber(constructorName, '${name}', ${optional}, ${name})`
        if (baseType === 'Boolean')     return `R.validateBoolean(constructorName, '${name}', ${optional}, ${name})`
        if (baseType === 'Object')      return `R.validateObject(constructorName, '${name}', ${optional}, ${name})`
        if (baseType === 'Date')        return `R.validateDate(constructorName, '${name}', ${optional}, ${name})`
        if (baseType === 'Tagged')      return `R.validateTag(constructorName, '${taggedType}', '${name}', ${optional}, ${name})`
    }

    /*
     * Generate assignment code for a field - handles optional fields
     * @sig generateAssignment :: String -> String
     */
    const generateAssignment = f => {
        const { optional } = FieldDescriptor.fromAny(fields[f])

        // x != is JavaScript magic for NEITHER null NOR undefined
        return optional ? `if (${f} != null) result.${f} = ${f}` : `result.${f} = ${f}`
    }

    const keys = Object.keys(fields)
    const parameterNames = keys.join(', ')
    const constructorName = `${fullTypeName}(${parameterNames})`
    const typeChecks = Object.entries(fields).map(([name, type]) => generateTypeCheck(constructorName, name, type))
    const assignments = keys.map(generateAssignment)

    // if there are optional values, skip the parameter count check
    const hasOptional = Object.values(fields).some(f => FieldDescriptor.fromAny(f).optional)
    const countCheck = hasOptional ? '' : `R.validateArgumentLength(constructorName, ${keys.length}, arguments)`

    return `function ${typeName}(${parameterNames}) {
        const constructorName = '${constructorName}'
        ${countCheck}
        ${typeChecks.join('\n    ')}

        const result = Object.create(prototype)
        ${assignments.join('\n    ')}
        return result
    }`
}

/*
 * Generate a TypeConstructor.from function
 * @sig generateFrom :: (String, String, String, FieldMap) -> String
 */
const generateFrom = (protoName, typeName, fullName, fields) => {
    const fieldNames = Object.keys(fields)

    // If 3+ fields, destructure to avoid chain-extraction violations in generated code
    // Use _input to avoid collision with fields named 'o'
    return fieldNames.length >= 3
        ? ` _input => {
            const { ${fieldNames.join(', ')} } = _input
            return ${fullName}(${fieldNames.join(', ')})
        }`
        : `_input => ${fullName}(${fieldNames.map(f => `_input.${f}`).join(', ')})`
}

/*
 * Generate a prototype toString function
 * @sig generateToString :: (String, FieldMap) -> String
 */
const generateToString = (fieldType, fields) => {
    const generateValueString = name => `\${R._toString(this.${name})}`
    const parameters = `${Object.keys(fields).map(generateValueString).join(', ')}`

    return `

        function() {
            return \`${fieldType}(${parameters})\`
        }`
}

export { generateTypeConstructor, generateFrom, generateToString }
