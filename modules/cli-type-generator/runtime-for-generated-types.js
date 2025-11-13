import { LookupTable } from '@graffio/functional'

/*
 * Create a match function for TaggedSum types
 * @sig match :: [String] -> (Object -> Any)
 */
const match = tagNames =>
    function (variants) {
        // Validate all variants are handled
        for (const variant of tagNames)
            if (!variants[variant]) throw new TypeError(`Constructors given to match didn't include: ${variant}`)

        // Call the appropriate variant handler
        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    }

/*
 * Convert any value to a readable string representation for error messages
 * @sig _toString :: Any -> String
 */
const _toString = value => {
    if (typeof value === 'undefined') return 'undefined'
    if (value['@@typeName']) return value.toString()
    if (Array.isArray(value)) return '[' + value.map(item => _toString(item)).join(', ') + ']'
    if (typeof value === 'string') return '"' + value + '"'
    if (value instanceof Date) return value.toISOString()
    if (value instanceof RegExp) return value.toString()
    if (typeof value === 'object') return JSON.stringify(value)

    return value
}

const lookupTableToFirestore = (Type, idField, encodeTimestamps, lookupTable) =>
    Object.fromEntries(lookupTable.map(item => [item[idField], Type.toFirestore(item, encodeTimestamps)]))

const lookupTableFromFirestore = (Type, idField, decodeTimestamps, o) =>
    LookupTable(
        Object.values(o || {}).map(item => Type.fromFirestore(item, decodeTimestamps)),
        Type,
        idField,
    )

/*
 * Validate that a constructor was called with the correct number of arguments
 * @sig validateArgumentLength :: (String, Number, Arguments) -> void
 */
const validateArgumentLength = (constructorName, expectedCount, args) => {
    if (args.length === expectedCount) return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${expectedCount} arguments, found ${args.length}`
    throw new TypeError(message)
}

/*
 * Validate that a string field matches a regular expression
 * @sig validateRegex :: (String, RegExp, String, Boolean, String) -> void
 */
const validateRegex = (constructorName, regex, field, optional, s) => {
    validateString(constructorName, field, optional, s)

    if (optional && s == null) return
    if (s.match(regex)) return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to match ${regex}; found ${_toString(s)})`
    throw new TypeError(message)
}

/*
 * Validate that a field is a number
 * @sig validateNumber :: (String, String, Boolean, Any) -> void
 */
const validateNumber = (constructorName, field, optional, n) => {
    if (optional && n == null) return
    if (typeof n === 'number') return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type Number; found ${_toString(n)})`
    throw new TypeError(message)
}

/*
 * Validate that a field is a string
 * @sig validateString :: (String, String, Boolean, Any) -> void
 */
const validateString = (constructorName, field, optional, s) => {
    if (optional && s == null) return
    if (typeof s === 'string') return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type String; found ${_toString(s)})`
    throw new TypeError(message)
}

/**
 * Validate that a field is an object
 * @sig validateObject :: (String, String, Boolean, Any) -> void
 */
/*
 * Validate that a field is an object
 * @sig validateObject :: (String, String, Boolean, Any) -> void
 */
const validateObject = (constructorName, field, optional, o) => {
    if (optional && o == null) return
    if (typeof o === 'object') return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type Object; found ${_toString(o)})`
    throw new TypeError(message)
}

/*
 * Validate that a field is a Date
 * @sig validateDate :: (String, String, Boolean, Any) -> void
 */
const validateDate = (constructorName, field, optional, d) => {
    if (optional && d == null) return
    if (d instanceof Date) return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type Date; found ${_toString(d)})`
    throw new TypeError(message)
}

/*
 * Validate that a field is a boolean
 * @sig validateBoolean :: (String, String, Boolean, Any) -> void
 */
const validateBoolean = (constructorName, field, optional, b) => {
    if (optional && b == null) return
    if (typeof b === 'boolean') return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type Boolean; found ${_toString(b)})`
    throw new TypeError(message)
}

/*
 * Validate that a field is a tagged type with specific @@typeName
 * @sig validateTag :: (String, String, String, Boolean, Any) -> void
 */
const validateTag = (constructorName, expectedType, field, optional, o) => {
    if (optional && o == null) return
    if (o?.['@@typeName'] === expectedType) return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type ${expectedType}; found ${_toString(o)}`
    throw new TypeError(message)
}

/*
 * Repeat a character n times - used for generating nested array type strings like [[[Type]]]
 * @sig repeatCharacter :: (String, Number) -> String
 */
const repeatCharacter = (char, n) => Array(n).fill(char).join('')

/*
 * Validate nested array types like [Number], [[String]], [[[Coord]]]
 * Validates both array nesting depth and the type of the deepest element
 *
 * Algorithm:
 * 1. Check each nesting level is actually an array
 * 2. Drill down to the first element at the target depth
 * 3. Validate the deepest element matches the expected base type
 *
 * @sig validateArray :: (String, Number, String, String?, String, Boolean, Any) -> void
 */
const validateArray = (constructorName, arrayDepth, baseType, taggedType, field, optional, a) => {
    if (optional && a == null) return

    let d = 0
    let o = a
    do {
        if (!Array.isArray(o)) {
            // eslint-disable-next-line no-debugger
            debugger
            const nestedType = repeatCharacter('[', arrayDepth) + baseType + repeatCharacter(']', arrayDepth)
            const message = `In constructor ${constructorName}: expected ${field} to have type ${nestedType}; found ${_toString(a)}`
            throw new TypeError(message)
        }

        // Empty arrays are always valid regardless of declared element type
        if (o.length === 0) return

        o = o[0]
        d++
    } while (d < arrayDepth)

    if (baseType === 'String' && typeof o === 'string') return
    if (baseType === 'Number' && typeof o === 'number') return
    if (baseType === 'Object' && typeof o === 'object') return
    if (baseType === 'Date' && o instanceof Date) return
    if (baseType === 'Any') return
    if (baseType === 'Tagged' && o?.['@@typeName'] === taggedType) return

    // eslint-disable-next-line no-debugger
    debugger
    const nestedType = repeatCharacter('[', arrayDepth) + (taggedType ?? baseType) + repeatCharacter(']', arrayDepth)
    const message = `In constructor ${constructorName}: expected ${field} to have type ${nestedType}; found ${_toString(a)}`
    throw new TypeError(message)
}

/*
 * Validate that a field is a LookupTable with specific item type
 * @sig validateLookupTable :: (String, String, String, Boolean, Any) -> void
 */
const validateLookupTable = (constructorName, expectedItemType, field, optional, lt) => {
    if (optional && lt == null) return

    // Check if it's a LookupTable (has idField property)
    if (!lt || typeof lt !== 'object' || !lt.idField) {
        // eslint-disable-next-line no-debugger
        debugger
        const message = `In constructor ${constructorName}: expected ${field} to be a LookupTable; found ${_toString(lt)}`
        throw new TypeError(message)
    }

    // If LookupTable is empty, that's valid
    if (lt.length === 0) return

    // Check the first item's type
    const firstItem = lt[0]
    if (firstItem?.['@@typeName'] === expectedItemType) return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to be a LookupTable<${expectedItemType}>; found LookupTable<${firstItem?.['@@typeName'] || 'unknown'}>`
    throw new TypeError(message)
}

export {
    validateArgumentLength,
    validateArray,
    validateBoolean,
    validateDate,
    validateNumber,
    validateObject,
    validateString,
    validateTag,
    validateRegex,
    validateLookupTable,
    lookupTableToFirestore,
    lookupTableFromFirestore,
    match,
    _toString,
}
