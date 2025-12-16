// ABOUTME: Intermediate representation for field types in type definitions
// ABOUTME: Normalizes string, regex, and object inputs into a consistent IR schema

// ---------------------------------------------------------------------------------------------------------------------
// IR Schema
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
 * Create an IR object with defaults for any unspecified fields
 * @sig createIR :: Object? -> FieldTypeIR
 */
const createIR = (overrides = {}) => ({
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
 * Parse a string field type into IR
 * @sig fromString :: String -> FieldTypeIR
 */
const fromString = input => {
    let s = String(input)

    // Check optional (must be first - removes trailing ?)
    const [withoutOptional, optional] = checkOptional(s)
    s = withoutOptional

    // Check LookupTable before array (it uses {} not [])
    const lookupTable = checkLookupTable(s)
    if (lookupTable)
        return createIR({
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
    if (regex) return createIR({ baseType: 'String', optional, arrayDepth, regex })

    // Check primitives
    if (s === 'String') return createIR({ baseType: 'String', optional, arrayDepth })
    if (s === 'Number') return createIR({ baseType: 'Number', optional, arrayDepth })
    if (s === 'Boolean') return createIR({ baseType: 'Boolean', optional, arrayDepth })
    if (s === 'Object') return createIR({ baseType: 'Object', optional, arrayDepth })
    if (s === 'Date') return createIR({ baseType: 'Date', optional, arrayDepth })
    if (s === 'Any') return createIR({ baseType: 'Any', optional, arrayDepth })

    // Default: Tagged type
    return createIR({ baseType: 'Tagged', optional, arrayDepth, taggedType: s })
}

// ---------------------------------------------------------------------------------------------------------------------
// fromObject - Parse object field type representations
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse an object field type into IR
 * Handles FieldTypes references and wrapper objects
 * @sig fromObject :: Object -> FieldTypeIR
 */
const fromObject = input => {
    const { isFieldTypesReference, optional, pattern, property, fullReference } = input

    // Check for wrapper syntax: { pattern: FieldTypes.X, optional: true }
    if (pattern?.isFieldTypesReference) {
        const { fullReference: patternRef, property: patternProp } = pattern
        return createIR({
            baseType: 'String',
            optional: optional === true,
            fieldTypesReference: { property: patternProp, fullReference: patternRef },
        })
    }

    // Check for direct FieldTypes reference
    if (isFieldTypesReference)
        return createIR({
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
 * Parse any field type input into IR
 * Handles strings, RegExp, and objects
 * @sig fromAny :: (String | RegExp | Object) -> FieldTypeIR
 */
const fromAny = input => {
    if (typeof input === 'string') return fromString(input)
    if (input instanceof RegExp) return createIR({ baseType: 'String', regex: input })
    if (typeof input === 'object' && input !== null) return fromObject(input)

    throw new Error(`Unknown field type input: ${input}`)
}

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

const FieldTypeIR = { fromString, fromObject, fromAny }

export default FieldTypeIR
