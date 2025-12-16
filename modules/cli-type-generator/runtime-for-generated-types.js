// ABOUTME: Runtime utilities for generated Tagged types
// ABOUTME: Validation, serialization, and PII redaction functions

import { LookupTable } from '@graffio/functional'

/**
 * Create a match function for TaggedSum types
 * @sig match :: [String] -> (Object -> Any)
 */
const match = tagNames => {
    /**
     * Check that all TaggedSum variants are handled, throw if missing
     * @sig validateVariants :: Object -> void | throws TypeError
     */
    const validateVariants = variants => {
        const missing = tagNames.find(variant => !variants[variant])
        if (missing) throw new TypeError(`Constructors given to match didn't include: ${missing}`)
    }

    return function (variants) {
        validateVariants(variants)
        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    }
}

/**
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

/**
 * Convert LookupTable to Firestore map format with order preservation
 * @sig lookupTableToFirestore :: (Type, String, Boolean, LookupTable) -> Object
 */
const lookupTableToFirestore = (Type, idField, encodeTimestamps, lookupTable) => {
    /**
     * Convert a LookupTable item to Firestore format with order index
     * @sig itemToFirestoreEntry :: (item, index) -> [String, Object]
     */
    const itemToFirestoreEntry = (item, index) => [
        item[idField],
        { ...Type.toFirestore(item, encodeTimestamps), _order: index },
    ]

    return Object.fromEntries(lookupTable.map(itemToFirestoreEntry))
}

/**
 * Convert Firestore map back to LookupTable with order restoration
 * @sig lookupTableFromFirestore :: (Type, String, Boolean, Object) -> LookupTable
 */
const lookupTableFromFirestore = (Type, idField, decodeTimestamps, o) => {
    /**
     * Convert a Firestore item back to domain type (strips _order)
     * @sig firestoreItemToDomain :: Object -> Tagged
     */
    const firestoreItemToDomain = item => {
        const { _order, ...rest } = item
        return Type.fromFirestore(rest, decodeTimestamps)
    }

    return LookupTable(
        Object.values(o || {})
            .sort((a, b) => (a._order ?? 0) - (b._order ?? 0))
            .map(firestoreItemToDomain),
        Type,
        idField,
    )
}

/**
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

/**
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

/**
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

/**
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
const validateObject = (constructorName, field, optional, o) => {
    if (optional && o == null) return
    if (typeof o === 'object') return

    // eslint-disable-next-line no-debugger
    debugger
    const message = `In constructor ${constructorName}: expected ${field} to have type Object; found ${_toString(o)})`
    throw new TypeError(message)
}

/**
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

/**
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

/**
 * Validate that a field is a tagged type with specific @@typeName
 * @sig validateTag :: (String, String, String, Boolean, Any) -> void
 */
const validateTag = (constructorName, expectedType, field, optional, o) => {
    if (optional && o == null) return
    if (o?.['@@typeName'] === expectedType) return

    // eslint-disable-next-line no-debugger
    debugger
    const found = _toString(o)
    const message = `In constructor ${constructorName}: expected ${field} to have type ${expectedType}; found ${found}`
    throw new TypeError(message)
}

/**
 * Validate nested array types like [Number], [[String]], [[[Coord]]]
 * @sig validateArray :: (String, Number, String, String?, String, Boolean, Any) -> void
 */
const validateArray = (constructorName, arrayDepth, baseType, taggedType, field, optional, a) => {
    /**
     * Repeat a character n times - used for generating nested array type strings like [[[Type]]]
     * @sig repeatCharacter :: (String, Number) -> String
     */
    const repeatCharacter = (char, n) => Array(n).fill(char).join('')

    /**
     * Build nested type string like [[[Number]]]
     * @sig buildNestedTypeString :: () -> String
     */
    const buildNestedTypeString = () =>
        repeatCharacter('[', arrayDepth) + (taggedType ?? baseType) + repeatCharacter(']', arrayDepth)

    /**
     * Check if value at current depth is a valid array, return error info if not
     * @sig checkArrayAtDepth :: (Any, Number) -> { valid: Boolean, element: Any }
     */
    const checkArrayAtDepth = (value, currentDepth) => {
        if (!Array.isArray(value)) return { valid: false, element: null }
        if (value.length === 0) return { valid: true, element: null, empty: true }
        if (currentDepth + 1 >= arrayDepth) return { valid: true, element: value[0] }
        return checkArrayAtDepth(value[0], currentDepth + 1)
    }

    /**
     * Check if the deepest element matches expected base type
     * @sig isValidBaseType :: Any -> Boolean
     */
    const isValidBaseType = element => {
        if (baseType === 'String') return typeof element === 'string'
        if (baseType === 'Number') return typeof element === 'number'
        if (baseType === 'Object') return typeof element === 'object'
        if (baseType === 'Date') return element instanceof Date
        if (baseType === 'Any') return true
        if (baseType === 'Tagged') return element?.['@@typeName'] === taggedType
        return false
    }

    if (optional && a == null) return

    const { valid, empty, element } = checkArrayAtDepth(a, 0)
    const nestedType = buildNestedTypeString()
    const found = _toString(a)

    const prefix = `In constructor ${constructorName}`
    const expected = `expected ${field} to have type ${nestedType}`

    if (!valid) {
        // eslint-disable-next-line no-debugger
        debugger
        throw new TypeError(`${prefix}: ${expected}; found ${found}`)
    }

    if (empty) return
    if (isValidBaseType(element)) return

    // eslint-disable-next-line no-debugger
    debugger
    throw new TypeError(`${prefix}: ${expected}; found ${found}`)
}

/**
 * Validate that a field is a LookupTable with specific item type
 * @sig validateLookupTable :: (String, String, String, Boolean, Any) -> void
 */
const validateLookupTable = (constructorName, expectedItemType, field, optional, lt) => {
    if (optional && lt == null) return

    // Check if it's a LookupTable (has idField property)
    if (!lt || typeof lt !== 'object' || !lt.idField) {
        // eslint-disable-next-line no-debugger
        debugger
        const found = _toString(lt)
        const message = `In constructor ${constructorName}: expected ${field} to be a LookupTable; found ${found}`
        throw new TypeError(message)
    }

    // If LookupTable is empty, that's valid
    if (lt.length === 0) return

    // Check the first item's type
    const firstItem = lt[0]
    if (firstItem?.['@@typeName'] === expectedItemType) return

    // eslint-disable-next-line no-debugger
    debugger
    const actualType = firstItem?.['@@typeName'] || 'unknown'
    const expected = `a LookupTable<${expectedItemType}>`
    const actual = `LookupTable<${actualType}>`
    throw new TypeError(`In constructor ${constructorName}: expected ${field} to be ${expected}; found ${actual}`)
}

// Redaction patterns for known PII fields
// prettier-ignore
const piiRedactions = {
    email      : v => v.replace(/(.).*(@.*)/                                                   , '$1***$2'),
    displayName: v => v.replace(/\b(\w)\w*/g                                                   , '$1***'),
    phoneNumber: v => v.replace(/(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)(\d{3}[-.\s]?)(\d{4})/, '***-***-$4'),
}

/**
 * Universal PII redaction function for Tagged types
 * Redacts email, displayName, and phoneNumber fields recursively
 * Returns same object if already redacted (idempotent)
 * @sig redact :: Tagged -> Tagged
 */
const redact = value => {
    /**
     * Check if a value contains PII anywhere in its tree (recursively)
     * @sig hasPii :: Tagged -> Boolean
     */
    const hasPii = v => {
        /**
         * Check if a single field value contains PII (recursively)
         * @sig fieldHasPii :: Any -> Boolean
         */
        const fieldHasPii = fieldValue => {
            if (Array.isArray(fieldValue)) return fieldValue.some(hasPii)
            if (typeof fieldValue === 'object') return hasPii(fieldValue)
            return false
        }

        if (v == null) return false

        // Check direct PII fields
        const hasDirectPii = Object.keys(piiRedactions).some(field => v[field] && typeof v[field] === 'string')
        if (hasDirectPii) return true

        // Check nested structures recursively
        return Object.values(v).some(fieldHasPii)
    }

    /**
     * Redact a single field value (recursively for nested types)
     * @sig redactField :: (String, Any, Tagged) -> Any
     */
    const redactField = (k, v) => {
        if (piiRedactions[k] && typeof v === 'string') return piiRedactions[k](v)
        if (v?.['@@typeName']) return redact(v)
        if (LookupTable.is(v)) return LookupTable(v.map(redact), v.ItemType, v.idField)
        if (Array.isArray(v) && v[0]?.['@@typeName']) return v.map(redact)

        return v
    }

    /**
     * Mark an object as redacted (mutates and returns object)
     * @sig markAsRedacted :: Tagged -> Tagged
     */
    const markAsRedacted = obj => {
        Object.defineProperty(obj, '__redacted', {
            value: true,
            enumerable: false,
            writable: false,
            configurable: false,
        })
        return obj
    }

    if (value?.__redacted) return value
    if (!value?.['@@typeName']) return value
    if (!hasPii(value)) return markAsRedacted(value)

    const redactedObject = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redactField(k, v)]))
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
