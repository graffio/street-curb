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

// ---------------------------------------------------------------------------------------------------------------------
// fromAny - Unified entry point with all parsing logic
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse any field type input into a descriptor
 * Handles strings, RegExp, objects, and already-normalized descriptors
 * @sig fromAny :: (String | RegExp | Object | FieldDescriptor) -> FieldDescriptor
 */
const fromAny = input => {
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

    /**
     * Check if an object is already a FieldDescriptor
     * @sig isFieldDescriptor :: Object -> Boolean
     */
    const isFieldDescriptor = obj => {
        const knownBaseTypes = ['String', 'Number', 'Boolean', 'Object', 'Date', 'Any', 'Tagged', 'LookupTable']
        return obj && typeof obj.baseType === 'string' && knownBaseTypes.includes(obj.baseType)
    }

    /**
     * Parse a string field type into a descriptor
     * @sig parseString :: String -> FieldDescriptor
     */
    const parseString = str => {
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

        let s = String(str)

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

    /**
     * Parse an object field type into a descriptor
     * Handles FieldTypes references and wrapper objects
     * @sig parseObject :: Object -> FieldDescriptor
     */
    const parseObject = obj => {
        const { isFieldTypesReference, optional, pattern, property, fullReference } = obj

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

        throw new Error(`Unknown object field type format: ${JSON.stringify(obj)}`)
    }

    if (typeof input === 'string') return parseString(input)
    if (input instanceof RegExp) return create({ baseType: 'String', regex: input })
    if (typeof input !== 'object' || input === null) throw new Error(`Unknown field type input: ${input}`)

    // Object input: either already a FieldDescriptor or needs parsing
    if (isFieldDescriptor(input)) return input
    return parseObject(input)
}

// ---------------------------------------------------------------------------------------------------------------------
// Public API - Entry points that delegate to fromAny
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Parse a string field type into a descriptor
 * @sig fromString :: String -> FieldDescriptor
 */
const fromString = input => fromAny(input)

/**
 * Parse an object field type into a descriptor
 * @sig fromObject :: Object -> FieldDescriptor
 */
const fromObject = input => fromAny(input)

// ---------------------------------------------------------------------------------------------------------------------
// toSyntax - Convert descriptor back to concise syntax for display
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Convert a FieldDescriptor back to the concise type definition syntax
 * @sig toSyntax :: FieldDescriptor -> String | RegExp | Object
 */
const toSyntax = descriptor => {
    const { baseType, optional, arrayDepth, taggedType, idField, regex, fieldTypesReference } = descriptor

    // FieldTypes reference - return object with isFieldTypesReference flag for formatValueForComment
    if (fieldTypesReference) return { isFieldTypesReference: true, fullReference: fieldTypesReference.fullReference }

    // Regex field - return the regex directly
    if (regex) return regex

    // LookupTable - {Type:idField}
    if (baseType === 'LookupTable') {
        const core = `{${taggedType}:${idField}}`
        return optional ? `${core}?` : core
    }

    // Build the type string
    let core = baseType === 'Tagged' ? taggedType : baseType

    // Wrap in array brackets
    core = '['.repeat(arrayDepth) + core + ']'.repeat(arrayDepth)

    // Add optional marker
    return optional ? `${core}?` : core
}

// ---------------------------------------------------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------------------------------------------------

const FieldDescriptor = { fromString, fromObject, fromAny, toSyntax }

export default FieldDescriptor
