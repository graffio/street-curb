// ABOUTME: Normalized descriptor for field types in type definitions
// ABOUTME: Normalizes string, regex, and object inputs into a consistent schema

// ---------------------------------------------------------------------------------------------------------------------
// FieldDescriptor Schema
// ---------------------------------------------------------------------------------------------------------------------
//
// {
//     baseType: 'String' | 'Number' | 'Boolean' | 'Object' | 'Date' | 'Any' | 'Tagged' | 'LookupTable',
//     optional: false,
//     arrayDepth: 0,
//     taggedType: null | 'Account',
//     idField: null | 'id',
//     regex: null | /pattern/,
//     fieldTypesReference: null | { property: 'E164Phone', fullReference: 'FieldTypes.E164Phone' }
// }
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Create a descriptor with defaults for any unspecified fields
 * @sig create :: Object? -> FieldDescriptor
 */
const create = (overrides = {}) => ({
    baseType: null,
    optional: false,
    arrayDepth: 0,
    taggedType: null,
    idField: null,
    regex: null,
    fieldTypesReference: null,
    ...overrides,
})

// ---------------------------------------------------------------------------------------------------------------------
// String Parsing Helpers
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Check and strip optional marker from end of string
 * @sig checkOptional :: String -> [String, Boolean]
 */
const checkOptional = s => (s[s.length - 1] === '?' ? [s.slice(0, -1), true] : [s, false])

/**
 * Check and strip array brackets, counting depth
 * @sig checkArray :: String -> [String, Number]
 */
const checkArray = (s, depth = 0) => (!s.match(/^\[.*]$/) ? [s, depth] : checkArray(s.slice(1, -1), depth + 1))

/**
 * Check if string is a regex pattern
 * @sig checkRegex :: String -> RegExp | null
 */
const checkRegex = s => {
    const match = s.match(/\/(.*)\/([dgimsuy]*)/)
    if (!match) return null

    const [, expression, flags] = match
    return RegExp(expression, flags)
}

/**
 * Check if string is LookupTable syntax
 * @sig checkLookupTable :: String -> { typeName: String, idField: String } | null
 */
const checkLookupTable = s => {
    const match = s.match(/^\{([A-Z][a-zA-Z0-9]*):([a-zA-Z][a-zA-Z0-9]*)\}$/)
    if (!match) return null

    const [, typeName, idField] = match
    return { typeName, idField }
}

// ---------------------------------------------------------------------------------------------------------------------
// fromString - Parse string field type syntax
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse a string field type into a descriptor
 * @sig fromString :: String -> FieldDescriptor
 */
const fromString = input => {
    let s = String(input)

    // Check optional (must be first - removes trailing ?)
    const [withoutOptional, optional] = checkOptional(s)
    s = withoutOptional

    // Check LookupTable before array (it uses {} not [])
    const lookupTable = checkLookupTable(s)
    if (lookupTable)
        return create({
            baseType: 'LookupTable',
            optional,
            taggedType: lookupTable.typeName,
            idField: lookupTable.idField,
        })

    // Check array depth
    const [withoutArray, arrayDepth] = checkArray(s)
    s = withoutArray

    // Check regex
    const regex = checkRegex(s)
    if (regex) return create({ baseType: 'String', optional, arrayDepth, regex })

    // Check primitives
    if (s === 'String') return create({ baseType: 'String', optional, arrayDepth })
    if (s === 'Number') return create({ baseType: 'Number', optional, arrayDepth })
    if (s === 'Boolean') return create({ baseType: 'Boolean', optional, arrayDepth })
    if (s === 'Object') return create({ baseType: 'Object', optional, arrayDepth })
    if (s === 'Date') return create({ baseType: 'Date', optional, arrayDepth })
    if (s === 'Any') return create({ baseType: 'Any', optional, arrayDepth })

    // Default: Tagged type
    return create({ baseType: 'Tagged', optional, arrayDepth, taggedType: s })
}

// ---------------------------------------------------------------------------------------------------------------------
// fromObject - Parse object field type representations
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse an object field type into a descriptor
 * Handles FieldTypes references and wrapper objects
 * @sig fromObject :: Object -> FieldDescriptor
 */
const fromObject = input => {
    const { isFieldTypesReference, optional, pattern, property, fullReference } = input

    // Check for wrapper syntax: { pattern: FieldTypes.X, optional: true }
    if (pattern?.isFieldTypesReference) {
        const { fullReference: patternRef, property: patternProp } = pattern
        return create({
            baseType: 'String',
            optional: optional === true,
            fieldTypesReference: { property: patternProp, fullReference: patternRef },
        })
    }

    // Check for direct FieldTypes reference
    if (isFieldTypesReference)
        return create({
            baseType: 'String',
            optional: optional === true,
            fieldTypesReference: { property, fullReference },
        })

    throw new Error(`Unknown object field type format: ${JSON.stringify(input)}`)
}

// ---------------------------------------------------------------------------------------------------------------------
// fromAny - Unified entry point
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse any field type input into a descriptor
 * Handles strings, RegExp, and objects
 * @sig fromAny :: (String | RegExp | Object) -> FieldDescriptor
 */
const fromAny = input => {
    if (typeof input === 'string') return fromString(input)
    if (input instanceof RegExp) return create({ baseType: 'String', regex: input })
    if (typeof input === 'object' && input !== null) return fromObject(input)

    throw new Error(`Unknown field type input: ${input}`)
}

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

const FieldDescriptor = { fromString, fromObject, fromAny }

export default FieldDescriptor
