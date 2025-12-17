// ABOUTME: Code generation for Firestore serialization
// ABOUTME: Generates toFirestore and fromFirestore field expressions

import FieldDescriptor from '../descriptors/field-descriptor.js'

/*
 * Generate the field serialization expression for toFirestore
 * @sig generateToFirestoreValue :: (String, FieldType) -> String
 */
const generateToFirestoreValue = (fieldName, fieldType) => {
    const processLookupTable = () =>
        `R.lookupTableToFirestore(${parsed.taggedType}, '${parsed.idField}', encodeTimestamps, o.${fieldName})`

    // Handle Tagged type fields (might have nested serialization)
    const processTagged = () => `${parsed.taggedType}.toFirestore(o.${fieldName}, encodeTimestamps)`

    /**
     * Handle arrays of Tagged types
     * @sig processArrayOfTagged :: () -> String
     */
    const processArrayOfTagged = () => {
        // Build nested map calls for each array level
        const possiblyRecurse = (level, accessor) =>
            level === 0
                ? `${parsed.taggedType}.toFirestore(${accessor}, encodeTimestamps)`
                : `${accessor}.map(item${level} => ${possiblyRecurse(level - 1, `item${level}`)})`

        return possiblyRecurse(parsed.arrayDepth, `o.${fieldName}`)
    }

    const parsed = FieldDescriptor.fromAny(fieldType)
    const { baseType, arrayDepth } = parsed

    // Handle Date fields
    if (baseType === 'Date') return `encodeTimestamps(o.${fieldName})`
    if (baseType === 'LookupTable') return processLookupTable()
    if (baseType === 'Tagged' && arrayDepth === 0) return processTagged()
    if (baseType === 'Tagged' && arrayDepth > 0) return processArrayOfTagged()

    return `o.${fieldName}`
}

/*
 * Generate the field deserialization expression for fromFirestore
 * @sig generateFromFirestoreField :: (String, FieldType) -> String
 */
const generateFromFirestoreField = (fieldName, fieldType) => {
    // Generate fromFirestore call with fallback to from()
    const fromFirestoreCall = (type, acc) => {
        const firestoreCall = `${type}.fromFirestore(${acc}, decodeTimestamps)`
        const fromCall = `${type}.from(${acc})`
        return `${type}.fromFirestore ? ${firestoreCall} : ${fromCall}`
    }

    const processDate = () =>
        parsed.optional
            ? `${fieldName}: ${accessor} != null ? decodeTimestamps(${accessor}) : undefined`
            : `${fieldName}: decodeTimestamps(${accessor})`

    // Handle LookupTable fields - reconstruct from Firestore map {idValue: itemData}
    const processLookupTable = () => {
        const { taggedType, idField, optional } = parsed
        const values = `R.lookupTableFromFirestore(${taggedType}, '${idField}', decodeTimestamps, ${accessor})`
        return optional ? `${fieldName}: ${accessor} ? ${values}: undefined` : `${fieldName}: ${values}`
    }

    const processTagged = () => {
        const { taggedType } = parsed
        return `${fieldName}: ${fromFirestoreCall(taggedType, accessor)}`
    }

    /**
     * Handle arrays of Tagged types
     * @sig processArrayOfTagged :: () -> String
     */
    const processArrayOfTagged = () => {
        const buildMapper = (level, acc) => {
            if (level === 0) return fromFirestoreCall(taggedType, acc)
            return `${acc}.map(item${level} => ${buildMapper(level - 1, `item${level}`)})`
        }

        const { taggedType } = parsed
        const depth = parsed.arrayDepth

        return `${fieldName}: ${buildMapper(depth, accessor)}`
    }

    const parsed = FieldDescriptor.fromAny(fieldType)
    const { baseType, arrayDepth } = parsed
    const accessor = `doc.${fieldName}`

    if (baseType === 'Date') return processDate()
    if (baseType === 'LookupTable') return processLookupTable()
    if (baseType === 'Tagged' && arrayDepth === 0) return processTagged()
    if (baseType === 'Tagged' && arrayDepth > 0) return processArrayOfTagged()

    // Primitive fields pass through unchanged
    return `${fieldName}: ${accessor}`
}

export { generateToFirestoreValue, generateFromFirestoreField }
