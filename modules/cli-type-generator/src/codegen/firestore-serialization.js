// ABOUTME: Code generation for Firestore serialization
// ABOUTME: Generates toFirestore and fromFirestore functions for Tagged and TaggedSum types

import FieldDescriptor from '../descriptors/field-descriptor.js'

// ---------------------------------------------------------------------------------------------------------------------
// Internal helpers - field-level expression generators
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Generate the field serialization expression for toFirestore
 * @sig generateToFirestoreValue :: (String, FieldType) -> String
 */
const generateToFirestoreValue = (fieldName, fieldType) => {
    const processLookupTable = () =>
        `R.lookupTableToFirestore(${parsed.taggedType}, '${parsed.idField}', encodeTimestamps, o.${fieldName})`

    const processTagged = () => `${parsed.taggedType}.toFirestore(o.${fieldName}, encodeTimestamps)`

    /*
     * Build nested .map() calls for array-of-Tagged serialization
     * @sig processArrayOfTagged :: () -> String
     */
    const processArrayOfTagged = () => {
        const possiblyRecurse = (level, accessor) =>
            level === 0
                ? `${parsed.taggedType}.toFirestore(${accessor}, encodeTimestamps)`
                : `${accessor}.map(item${level} => ${possiblyRecurse(level - 1, `item${level}`)})`

        return possiblyRecurse(parsed.arrayDepth, `o.${fieldName}`)
    }

    const parsed = FieldDescriptor.fromAny(fieldType)
    const { baseType, arrayDepth } = parsed

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
    const fromFirestoreCall = (type, acc) => {
        const firestoreCall = `${type}.fromFirestore(${acc}, decodeTimestamps)`
        const fromCall = `${type}.from(${acc})`
        return `${type}.fromFirestore ? ${firestoreCall} : ${fromCall}`
    }

    const processDate = () =>
        parsed.optional
            ? `${fieldName}: ${accessor} != null ? decodeTimestamps(${accessor}) : undefined`
            : `${fieldName}: decodeTimestamps(${accessor})`

    const processLookupTable = () => {
        const { taggedType, idField, optional } = parsed
        const values = `R.lookupTableFromFirestore(${taggedType}, '${idField}', decodeTimestamps, ${accessor})`
        return optional ? `${fieldName}: ${accessor} ? ${values}: undefined` : `${fieldName}: ${values}`
    }

    const processTagged = () => {
        const { taggedType } = parsed
        return `${fieldName}: ${fromFirestoreCall(taggedType, accessor)}`
    }

    /*
     * Build nested .map() calls for array-of-Tagged deserialization
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

    return `${fieldName}: ${accessor}`
}

/*
 * Check if a field type needs special Firestore serialization
 * @sig needsFirestoreSerialization :: (String | FieldDescriptor) -> Boolean
 */
const needsFirestoreSerialization = ft =>
    ['Date', 'Tagged', 'LookupTable'].includes(FieldDescriptor.fromAny(ft).baseType)

// ---------------------------------------------------------------------------------------------------------------------
// Tagged type Firestore serialization
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Generate Firestore serialization for Tagged type
 * @sig generateFirestoreSerializationForTagged :: (String, FieldMap) -> String
 */
const generateFirestoreSerializationForTagged = (typeName, flds) => {
    const isOptionalField = ([_, fieldType]) => FieldDescriptor.fromAny(fieldType).optional
    const formatRequired = ([fn, ft]) => `${fn}: ${generateToFirestoreValue(fn, ft)}`
    const formatOptional = ([fn, ft]) => ({ fieldName: fn, code: generateToFirestoreValue(fn, ft) })

    const fieldEntries = Object.entries(flds)
    const hasSerialization = fieldEntries.some(([_, ft]) => needsFirestoreSerialization(ft))

    if (!hasSerialization)
        return `${typeName}._toFirestore = (o, encodeTimestamps) => ({ ...o })

        ${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from(doc)`

    const requiredEntries = fieldEntries.filter(entry => !isOptionalField(entry))
    const optionalEntries = fieldEntries.filter(isOptionalField)
    const requiredFields = requiredEntries.map(formatRequired)
    const optionalFields = optionalEntries.map(formatOptional)
    const optionalFieldIfs = optionalFields.map(
        ({ fieldName, code }) => `if (o.${fieldName} != null) result.${fieldName} = ${code}`,
    )
    const deserializedFields = fieldEntries.map(([fn, ft]) => generateFromFirestoreField(fn, ft)).join(',\n        ')

    return `${typeName}._toFirestore = (o, encodeTimestamps) => {
        const result = {
            ${requiredFields.join(',\n        ')}
        }

        ${optionalFieldIfs.join('\n\n        ')}

        return result
    }

    ${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from({
        ${deserializedFields}
    })`
}

// ---------------------------------------------------------------------------------------------------------------------
// TaggedSum Firestore functions
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Generate Firestore serialization for a TaggedSum variant
 * @sig generateFirestoreSerializationForTaggedSumVariant :: (String, FieldMap) -> String
 */
const generateFirestoreSerializationForTaggedSumVariant = (vnn, fs) => {
    const formatToFirestoreField = (fieldName, fieldType) =>
        `${fieldName}: ${generateToFirestoreValue(fieldName, fieldType)}`

    const hasSerializableFields = Object.values(fs).some(needsFirestoreSerialization)

    if (!hasSerializableFields)
        return `
        ${vnn}Constructor.toFirestore = o => ({ ...o })
        ${vnn}Constructor.fromFirestore = ${vnn}Constructor._from
        `

    const fieldNames = Object.keys(fs)
    const toFirestoreFields = Object.entries(fs).map(([fn, ft]) => formatToFirestoreField(fn, ft))
    const fromFirestoreFields = Object.entries(fs).map(([fn, ft]) => generateFromFirestoreField(fn, ft))

    // Use block body with destructuring if 2+ fields to avoid chain-extraction violations
    if (fieldNames.length >= 2) {
        const oDestructure = `const { ${fieldNames.join(', ')} } = o`
        const docDestructure = `const { ${fieldNames.join(', ')} } = doc`
        const toFieldsDestructured = toFirestoreFields.map(f => f.replace(/o\.(\w+)/g, '$1'))
        const fromFieldsDestructured = fromFirestoreFields.map(f => f.replace(/doc\.(\w+)/g, '$1'))

        return `
        /**
         * Serialize to Firestore format
         * @sig _toFirestore :: (${vnn}, Function) -> Object
         */
        ${vnn}Constructor._toFirestore = (o, encodeTimestamps) => {
            ${oDestructure}
            return {
                ${toFieldsDestructured.join(',\n                ')}
            }
        }

        /**
         * Deserialize from Firestore format
         * @sig _fromFirestore :: (Object, Function) -> ${vnn}
         */
        ${vnn}Constructor._fromFirestore = (doc, decodeTimestamps) => {
            ${docDestructure}
            return ${vnn}Constructor._from({
                ${fromFieldsDestructured.join(',\n                ')}
            })
        }

        // Public aliases (can be overridden)
        ${vnn}Constructor.toFirestore = ${vnn}Constructor._toFirestore
        ${vnn}Constructor.fromFirestore = ${vnn}Constructor._fromFirestore
    `
    }

    return `
        ${vnn}Constructor._toFirestore = (o, encodeTimestamps) => ({
            ${toFirestoreFields.join(',\n            ')}
        })

        ${vnn}Constructor._fromFirestore = (doc, decodeTimestamps) =>
            ${vnn}Constructor._from({
                ${fromFirestoreFields.join(',\n                ')}
            })

        // Public aliases (can be overridden)
        ${vnn}Constructor.toFirestore = ${vnn}Constructor._toFirestore
        ${vnn}Constructor.fromFirestore = ${vnn}Constructor._fromFirestore
    `
}

/*
 * Generate Firestore serialization for TaggedSum type
 * @sig generateFirestoreSerializationForTaggedSum :: (String, Object) -> String
 */
const generateFirestoreSerializationForTaggedSum = (typeName, vars) => {
    const variantNms = Object.keys(vars)

    // If 3+ variants, destructure to avoid chain-extraction violations
    if (variantNms.length >= 3) {
        const destructure = `const { ${variantNms.join(', ')} } = ${typeName}`
        const fromFirestoreCases = variantNms
            .map(v => `if (tagName === '${v}') return ${v}.fromFirestore(doc, decodeTimestamps)`)
            .join('\n            ')

        return `
        /**
         * Serialize ${typeName} to Firestore format
         * @sig _toFirestore :: (${typeName}, Function) -> Object
         */
        ${typeName}._toFirestore = (o, encodeTimestamps) => {
            const tagName = o['@@tagName']
            const variant = ${typeName}[tagName]
            return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
        }

        /**
         * Deserialize ${typeName} from Firestore format
         * @sig _fromFirestore :: (Object, Function) -> ${typeName}
         */
        ${typeName}._fromFirestore = (doc, decodeTimestamps) => {
            ${destructure}
            const tagName = doc['@@tagName']
            ${fromFirestoreCases}
            throw new Error(\`Unrecognized ${typeName} variant: \${tagName}\`)
        }

        // Public aliases (can be overridden)
        ${typeName}.toFirestore = ${typeName}._toFirestore
        ${typeName}.fromFirestore = ${typeName}._fromFirestore
    `
    }

    const fromFirestoreCases = variantNms
        .map(v => `if (tagName === '${v}') return ${typeName}.${v}.fromFirestore(doc, decodeTimestamps)`)
        .join('\n        ')

    return `
        /**
         * Serialize ${typeName} to Firestore format
         * @sig _toFirestore :: (${typeName}, Function) -> Object
         */
        ${typeName}._toFirestore = (o, encodeTimestamps) => {
            const tagName = o['@@tagName']
            const variant = ${typeName}[tagName]
            return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
        }

        /**
         * Deserialize ${typeName} from Firestore format
         * @sig _fromFirestore :: (Object, Function) -> ${typeName}
         */
        ${typeName}._fromFirestore = (doc, decodeTimestamps) => {
            const tagName = doc['@@tagName']
            ${fromFirestoreCases}
            throw new Error(\`Unrecognized ${typeName} variant: \${tagName}\`)
        }

        // Public aliases (can be overridden)
        ${typeName}.toFirestore = ${typeName}._toFirestore
        ${typeName}.fromFirestore = ${typeName}._fromFirestore
    `
}

export {
    generateFirestoreSerializationForTagged,
    generateFirestoreSerializationForTaggedSum,
    generateFirestoreSerializationForTaggedSumVariant,
}
