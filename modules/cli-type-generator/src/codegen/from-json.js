// ABOUTME: Code generation for fromJSON deserialization methods
// ABOUTME: Generates static fromJSON that revives plain JSON into Tagged/TaggedSum instances

import { FieldDescriptor } from '../descriptors/field-descriptor.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    /*
     * Extract Tagged field info from a field descriptor, or undefined if not a Tagged field
     * @sig toTaggedFieldInfo :: (String, FieldType) -> { name, taggedType, arrayDepth, optional }?
     */
    toTaggedFieldInfo: (name, fieldType) => {
        const { baseType, taggedType, arrayDepth, optional } = FieldDescriptor.parseAny(fieldType)
        if (baseType !== 'Tagged' || !taggedType) return undefined
        if (arrayDepth > 1) return undefined
        return { name, taggedType, arrayDepth, optional }
    },

    /*
     * Generate a revival line for a single Tagged field
     * @sig toReviverLine :: ({ name, taggedType, arrayDepth, optional }, Boolean) -> String
     */
    toReviverLine: ({ name, taggedType, arrayDepth, optional }, alwaysGuard) => {
        const fromJSONCall = `${taggedType}.fromJSON`
        const revival =
            arrayDepth > 0
                ? `revived.${name} = revived.${name}.map(item => ${fromJSONCall}(item))`
                : `revived.${name} = ${fromJSONCall}(revived.${name})`

        return alwaysGuard || optional ? `if (revived.${name}) ${revival}` : revival
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    /*
     * Collect Tagged fields from a field map that need recursive revival
     * @sig collectTaggedFields :: FieldMap -> [{ name, taggedType, arrayDepth, optional }]
     */
    collectTaggedFields: fields =>
        Object.entries(fields)
            .map(([name, fieldType]) => T.toTaggedFieldInfo(name, fieldType))
            .filter(Boolean),

    /*
     * Collect unique Tagged fields across all variants (dedupe by field name)
     * @sig collectUniqueTaggedFields :: VariantsMap -> [{ name, taggedType, arrayDepth, optional }]
     */
    collectUniqueTaggedFields: variants => {
        /*
         * Add field to seen map, or verify consistency if already seen
         * @sig addOrVerify :: { name, taggedType, arrayDepth, optional } -> void
         */
        const addOrVerify = ({ name, taggedType, arrayDepth }) => {
            const existing = seen.get(name)
            if (!existing) return seen.set(name, { name, taggedType, arrayDepth })
            if (existing.taggedType !== taggedType || existing.arrayDepth !== arrayDepth)
                throw new Error(`fromJSON codegen: field '${name}' has conflicting types across variants`)
        }
        const seen = new Map()
        Object.values(variants).forEach(fields => A.collectTaggedFields(fields).forEach(addOrVerify))
        return Array.from(seen.values())
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Generate fromJSON for a Tagged type (single constructor, no variants)
 * @sig generateFromJSONForTagged :: (String, FieldMap) -> String
 */
const generateFromJSONForTagged = (typeName, fields) => {
    const taggedFields = A.collectTaggedFields(fields)

    if (taggedFields.length === 0) return `${typeName}.fromJSON = json => json == null ? json : ${typeName}._from(json)`

    const revivers = taggedFields.map(f => T.toReviverLine(f, false))

    return `${typeName}.fromJSON = json => {
        if (json == null) return json
        const revived = { ...json }
        ${revivers.join('\n        ')}
        return ${typeName}._from(revived)
    }`
}

/*
 * Generate fromJSON for a TaggedSum type (multiple variants)
 * All Tagged field revivals are guarded because different variants have different fields
 * @sig generateFromJSONForTaggedSum :: (String, VariantsMap) -> String
 */
const generateFromJSONForTaggedSum = (typeName, variants) => {
    const taggedFields = A.collectUniqueTaggedFields(variants)
    const missingError = `\`${typeName}.fromJSON: missing @@tagName on \${R._toString(json)}\``
    const unknownError = `\`${typeName}.fromJSON: unknown variant "\${tag}"\``
    const tagCheck = `const tag = json['@@tagName']
        if (!tag) throw new TypeError(${missingError})
        if (!${typeName}['@@tagNames'].includes(tag)) throw new TypeError(${unknownError})`

    if (taggedFields.length === 0)
        return `${typeName}.fromJSON = json => {
        if (json == null) return json
        ${tagCheck}
        return ${typeName}[tag]._from(json)
    }`

    const revivers = taggedFields.map(f => T.toReviverLine(f, true))

    return `${typeName}.fromJSON = json => {
        if (json == null) return json
        ${tagCheck}
        const revived = { ...json }
        ${revivers.join('\n        ')}
        return ${typeName}[tag]._from(revived)
    }`
}

const FromJson = { generateFromJSONForTagged, generateFromJSONForTaggedSum }

export { FromJson }
