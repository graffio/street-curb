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
    Object.fromEntries(
        lookupTable.map((item, index) => [
            item[idField],
            { ...Type.toFirestore(item, encodeTimestamps), _order: index },
        ]),
    )

const lookupTableFromFirestore = (Type, idField, decodeTimestamps, o) =>
    LookupTable(
        Object.values(o || {})
            .sort((a, b) => (a._order ?? 0) - (b._order ?? 0))
            .map(item => {
                const { _order, ...rest } = item
                return Type.fromFirestore(rest, decodeTimestamps)
            }),
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

/*
 * Redaction patterns for known PII fields
 */
// prettier-ignore
const piiRedactions = {
    email      : v => v.replace(/(.).*(@.*)/                                                   , '$1***$2'),
    displayName: v => v.replace(/\b(\w)\w*/g                                                   , '$1***'),
    phoneNumber: v => v.replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)(\d{3}[-.\s]?)(\d{4})/, '***-***-$4'),
}

/*
 * Check if a value contains PII anywhere in its tree (recursively)
 * @sig hasPii :: Tagged -> Boolean
 */
const hasPii = value => {
    if (value == null) return false

    // Check direct PII fields
    const hasDirectPii = Object.keys(piiRedactions).some(field => value[field] && typeof value[field] === 'string')
    if (hasDirectPii) return true

    // Check nested structures recursively
    return Object.values(value).some(fieldValue => {
        if (Array.isArray(fieldValue)) return fieldValue.some(hasPii) // recurse into array/LookupTable
        if (typeof fieldValue === 'object') return hasPii(fieldValue) // recurse into object/Tagged type
        return false
    })
}

/*
 * Redact a single field value (recursively for nested types)
 * @sig redactField :: (String, Any, Tagged) -> Any
 */
const redactField = (k, v, originalValue) => {
    if (piiRedactions[k] && typeof v === 'string') return piiRedactions[k](v) // Redact PII fields
    if (v?.['@@tagName']) return redact(v) // Recurse into Tagged types
    if (LookupTable.is(v)) return LookupTable(v.map(redact), v.ItemType, v.idField) // Recurse into LookupTables
    if (Array.isArray(v) && v[0]?.['@@tagName']) return v.map(redact) // Recurse into arrays of Tagged types

    return v
}

/*
 * Mark an object as redacted (mutates and returns object)
 * @sig markAsRedacted :: Tagged -> Tagged
 */
const markAsRedacted = obj => {
    Object.defineProperty(obj, '__redacted', { value: true, enumerable: false, writable: false, configurable: false })
    return obj
}

/*
 * Universal PII redaction function for Tagged types
 * Redacts email, displayName, and phoneNumber fields recursively
 * Returns same object if already redacted (idempotent)
 *
 * @sig redact :: Tagged -> Tagged
 */
const redact = value => {
    if (value?.__redacted) return value // Already redacted - return same object
    if (!value?.['@@tagName']) return value // Not a Tagged type - return unchanged
    if (!hasPii(value)) return markAsRedacted(value) // Early exit: no PII found - mark and return original

    // PII found - create redacted version
    // Reconstruct Tagged type with redacted fields
    const redactedObject = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactField(k, v, value)]))
    const constructor = Object.getPrototypeOf(value).constructor
    return markAsRedacted(constructor.from(redactedObject))
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
    redact,
}
