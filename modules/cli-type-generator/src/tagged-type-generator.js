import { getExistingStandardFunctions } from './parse-type-definition-file.js'
import { prettierCode, stringifyObjectAsMultilineComment } from './prettier-code.js'
import TaggedFieldType from './tagged-field-type.js'
import Generator from './tagged-type-function-generators.js'

/*
 * Validate that no fields use [Date] arrays, which are not supported by Firestore facade
 * @sig validateNoDateArrays :: (String, FieldMap) -> void
 */
const validateNoDateArrays = (typeName, fields) => {
    const hasAnUnhandledDateArrayField = fieldType => {
        const parsedType = TaggedFieldType.fromString(fieldType)
        return parsedType.baseType === 'Date' && parsedType.arrayDepth > 0
    }

    if (Object.values(fields).some(hasAnUnhandledDateArrayField))
        throw new Error(`Type '${typeName}' has date array fields which are not supported by Firestore facade.`)
}

/*
 * Check if a field type needs special Firestore serialization (because it's a Date, Tagged type or LookupTable)
 * @sig needsFirestoreSerialization :: String -> Boolean
 */
const needsFirestoreSerialization = fieldType =>
    ['Date', 'Tagged', 'LookupTable'].includes(TaggedFieldType.fromString(fieldType).baseType)

/*
 * Generate the field serialization expression for toFirestore
 * @sig generateToFirestoreField :: (String, FieldType) -> String
 */
const generateToFirestoreValue = (fieldName, fieldType) => {
    const processLookupTable = () =>
        `R.lookupTableToFirestore(${parsed.taggedType}, '${parsed.idField}', encodeTimestamps, o.${fieldName})`

    // Handle Tagged type fields (might have nested serialization)
    const processTagged = () => `${parsed.taggedType}.toFirestore(o.${fieldName}, encodeTimestamps)`

    // Handle arrays of Tagged types
    const processArrayOfTagged = () => {
        // Build nested map calls for each array level
        const possiblyRecurse = (level, accessor) =>
            level === 0
                ? `${parsed.taggedType}.toFirestore(${accessor}, encodeTimestamps)`
                : `${accessor}.map(item${level} => ${possiblyRecurse(level - 1, `item${level}`)})`

        return possiblyRecurse(parsed.arrayDepth, `o.${fieldName}`)
    }

    const parsed = TaggedFieldType.fromString(fieldType.toString())

    // Handle Date fields
    if (parsed.baseType === 'Date') return `encodeTimestamps(o.${fieldName})`
    if (parsed.baseType === 'LookupTable') return processLookupTable()
    if (parsed.baseType === 'Tagged' && parsed.arrayDepth === 0) return processTagged()
    if (parsed.baseType === 'Tagged' && parsed.arrayDepth > 0) return processArrayOfTagged()

    return `o.${fieldName}`
}

const generateToFirestoreField = (fieldName, fieldType) =>
    `${fieldName}: ${generateToFirestoreValue(fieldName, fieldType)}`

/*
 * Generate toFirestore function code
 * @sig generateToFirestore :: (String, FieldMap) -> String
 */
const generateToFirestore = (typeName, fields) => {
    const fieldEntries = Object.entries(fields)
    const needsSerialization = fieldEntries.some(([_, fieldType]) => needsFirestoreSerialization(fieldType))

    // If no fields need serialization, generate a simple pass-through
    if (!needsSerialization) return `${typeName}._toFirestore = (o, encodeTimestamps) => ({ ...o })`

    // Separate required and optional fields
    const requiredFields = []
    const optionalFields = []

    for (const [fieldName, fieldType] of fieldEntries) {
        const fieldValue = generateToFirestoreValue(fieldName, fieldType)

        TaggedFieldType.fromString(fieldType).optional
            ? optionalFields.push({ fieldName, code: fieldValue })
            : requiredFields.push(`${fieldName}: ${fieldValue}`)
    }

    // Generate function body with explicit conditionals for optional fields
    const optionalFieldIfs = optionalFields.map(
        ({ fieldName, code }) => `if (o.${fieldName} != null) result.${fieldName} = ${code}`,
    )

    return `${typeName}._toFirestore = (o, encodeTimestamps) => {
        const result = {
            ${requiredFields.join(',\n        ')}
        }
        
        ${optionalFieldIfs.join('\n\n        ')}
        
        return result
    }`
}

/*
 * Generate the field deserialization expression for fromFirestore
 * @sig generateFromFirestoreField :: (String, FieldType) -> String
 */
const generateFromFirestoreField = (fieldName, fieldType) => {
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
        return `${fieldName}: ${taggedType}.fromFirestore ? ${taggedType}.fromFirestore(${accessor}, decodeTimestamps) : ${taggedType}.from(${accessor})`
    }

    // Handle arrays of Tagged types
    const processArrayOfTagged = () => {
        const { taggedType } = parsed
        const depth = parsed.arrayDepth

        const buildMapper = (level, accessor) => {
            if (level === 0)
                return `${taggedType}.fromFirestore ? ${taggedType}.fromFirestore(${accessor}, decodeTimestamps) : ${taggedType}.from(${accessor})`

            return `${accessor}.map(item${level} => ${buildMapper(level - 1, `item${level}`)})`
        }

        return `${fieldName}: ${buildMapper(depth, accessor)}`
    }

    const parsed = TaggedFieldType.fromString(fieldType.toString())
    const accessor = `doc.${fieldName}`

    if (parsed.baseType === 'Date') return processDate()
    if (parsed.baseType === 'LookupTable') return processLookupTable()
    if (parsed.baseType === 'Tagged' && parsed.arrayDepth === 0) return processTagged()
    if (parsed.baseType === 'Tagged' && parsed.arrayDepth > 0) return processArrayOfTagged()

    // Primitive fields pass through unchanged
    return `${fieldName}: ${accessor}`
}

/*
 * Generate fromFirestore function code
 * @sig generateFromFirestore :: (String, FieldMap) -> String
 */
const generateFromFirestore = (typeName, fields) => {
    const fieldEntries = Object.entries(fields)
    const needsSerialization = fieldEntries.some(([_, fieldType]) => needsFirestoreSerialization(fieldType))

    // If no fields need serialization, use the regular from method
    if (!needsSerialization) return `${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from(doc)`

    // Generate field deserializations
    const deserializedFields = fieldEntries
        .map(([fieldName, fieldType]) => generateFromFirestoreField(fieldName, fieldType))
        .join(',\n        ')

    return `${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from({
        ${deserializedFields}
    })`
}

/*
 * Check if a function should be generated
 * @sig shouldGenerate :: (String, [String]) -> Boolean
 */
const shouldGenerate = (functionName, existingFunctions) => !existingFunctions.includes(functionName)

/*
 * Generate static tagged type (single constructor)
 * @sig generateStaticTaggedType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedType = async typeDefinition => {
    const { name, fields, imports = [], functions = [] } = typeDefinition

    const existingStandard = getExistingStandardFunctions(functions)

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(name, fields)

    // Check if we need LookupTable import
    const needsLookupTable = Object.values(fields).some(fieldType => {
        const parsed = TaggedFieldType.fromString(fieldType.toString())
        return parsed.baseType === 'LookupTable'
    })

    // Collect child types from LookupTable and Tagged fields for import

    const childTypes = new Set()
    Object.values(fields).forEach(fieldType => {
        const parsed = TaggedFieldType.fromString(fieldType.toString())
        if (parsed.baseType === 'LookupTable' || parsed.baseType === 'Tagged')
            if (parsed.taggedType) childTypes.add(parsed.taggedType)
    })

    // Filter out child types that are already imported by the user
    // Import info has structure: { source, specifiers: [{ type, imported, local }] }
    const existingImports = new Set(imports.flatMap(imp => imp.specifiers.map(spec => spec.local)))
    const newChildTypes = Array.from(childTypes).filter(typeName => !existingImports.has(typeName))

    // Generate import statements for child types (only those not already imported)
    const childTypeImports = newChildTypes
        .map(
            typeName =>
                `import { ${typeName} } from './${typeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.js'`,
        )
        .join('\n        ')

    const code = `
        ${stringifyObjectAsMultilineComment(typeDefinition.fields, typeDefinition.relativePath, name)}

        ${generateImportsSection(imports)}
        
        import * as R from '@graffio/cli-type-generator'
        ${needsLookupTable ? "import { LookupTable } from '@graffio/functional'" : ''}
        ${childTypeImports || ''}

        // -------------------------------------------------------------------------------------------------------------
        //
        // main constructor
        //
        // -------------------------------------------------------------------------------------------------------------
        const ${name} = ${Generator.generateTypeConstructor(name, name, fields)}

        // -------------------------------------------------------------------------------------------------------------
        //
        // prototype
        //
        // -------------------------------------------------------------------------------------------------------------
        const prototype = Object.create(Object.prototype, {
            '@@typeName': { value: '${name}', enumerable: false },

            toString: {
                value: ${Generator.generateToString(name, fields)},
                enumerable: false
            },

            toJSON: {
                value: function() { return this },
                enumerable: false
            },

            constructor: {
                value: ${name},
                enumerable: false,
                writable: true,
                configurable: true
            }
        })

        ${name}.prototype = prototype

        // -------------------------------------------------------------------------------------------------------------
        //
        // static methods
        //
        // -------------------------------------------------------------------------------------------------------------
        ${name}.toString = () => '${name}'
        ${name}.is = v => v && v['@@typeName'] === '${name}'

        ${`${name}._from = ${Generator.generateFrom('prototype', name, name, fields)}`}
        ${shouldGenerate('from', existingStandard) ? `${name}.from = ${name}._from` : ''}

        ${generateToFirestore(name, fields)}
        
        ${generateFromFirestore(name, fields)}

        // Public aliases (override if necessary)
        ${shouldGenerate('toFirestore', existingStandard) ? `${name}.toFirestore = ${name}._toFirestore` : ''}
        ${shouldGenerate('fromFirestore', existingStandard) ? `${name}.fromFirestore = ${name}._fromFirestore` : ''}

        // -------------------------------------------------------------------------------------------------------------
        //
        // Additional functions copied from type definition file
        //
        // -------------------------------------------------------------------------------------------------------------
        
        ${functions.map(fn => `${fn.sourceCode}`).join('\n\n')}

        export { ${name} }
    `

    return await prettierCode(code)
}

/*
 * Generate constructor for a specific variant of a tagged sum type
 * @sig constructorForVariant :: (String, VariantMap, String) -> String
 */
const constructorForVariant = (name, variants, variantName) => {
    const fields = variants[variantName]

    // Unit variants (no fields) are not supported
    if (Object.keys(fields).length === 0)
        throw new Error(
            `Type '${name}' has unit variant '${variantName}' (no fields).\n` +
                `Unit variants are not supported. Use a variant with at least one field instead.`,
        )

    return generateVariantConstructor(name, variantName, fields)
}

/*
 * Generate static tagged sum type (multiple variant constructors)
 * @sig generateStaticTaggedSumType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedSumType = async typeDefinition => {
    const { name, variants, imports = [], functions = [] } = typeDefinition
    const variantNames = Object.keys(variants)
    const constructorsForVariants = variantNames
        .map(variantName => constructorForVariant(name, variants, variantName))
        .join('\n\n')

    // Collect child types from all variant fields for imports
    const childTypes = new Set()
    Object.values(variants).forEach(variantFields => {
        Object.values(variantFields).forEach(fieldType => {
            const parsed = TaggedFieldType.fromString(fieldType.toString())
            if (parsed.baseType === 'LookupTable' || parsed.baseType === 'Tagged')
                if (parsed.taggedType) childTypes.add(parsed.taggedType)
        })
    })

    // Filter out child types that are already imported by the user
    const existingImports = new Set(imports.flatMap(imp => imp.specifiers.map(spec => spec.local)))
    const newChildTypes = Array.from(childTypes).filter(typeName => !existingImports.has(typeName))

    // Generate import statements for child types (only those not already imported)
    const childTypeImports = newChildTypes
        .map(
            typeName =>
                `import { ${typeName} } from './${typeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.js'`,
        )
        .join('\n        ')

    const code = `
        ${stringifyObjectAsMultilineComment(typeDefinition.variants, typeDefinition.relativePath, name)}

        ${generateImportsSection(imports)}
        import * as R from '@graffio/cli-type-generator'
        ${childTypeImports || ''}

        // -------------------------------------------------------------------------------------------------------------
        //
        // ${name} constructor
        //
        // -------------------------------------------------------------------------------------------------------------
        const ${name} = {
            toString: () => '${name}',
            is: v => {
                if (typeof v !== 'object') return false
                const constructor = Object.getPrototypeOf(v).constructor
                return ${variantNames.map(v => `constructor === ${name}.${v}`).join(' || ')}
            }
        }

        // Add hidden properties
        Object.defineProperty(${name}, '@@typeName', { value: '${name}', enumerable: false })
        Object.defineProperty(${name}, '@@tagNames', { value: [${variantNames.map(v => `'${v}'`).join(', ')}], enumerable: false })

        // Type prototype with match method
        const ${name}Prototype = {}

        Object.defineProperty(${name}Prototype, 'match', {
            value: R.match(${name}['@@tagNames']),
            enumerable: false
        })

        Object.defineProperty(${name}Prototype, 'constructor', {
            value: ${name},
            enumerable: false,
            writable: true,
            configurable: true
       })

        ${name}.prototype = ${name}Prototype

        ${constructorsForVariants}

        ${generateTaggedSumFirestoreSerialization(name, variants)}

        // -------------------------------------------------------------------------------------------------------------
        //
        // Additional functions copied from type definition file
        //
        // -------------------------------------------------------------------------------------------------------------
        
        ${functions.map(fn => `${fn.sourceCode}`).join('\n\n')}

        export { ${name} }
    `

    return await prettierCode(code)
}

/*
 * Generate Firestore serialization for a variant
 * @sig generateVariantFirestoreSerialization :: (String, FieldMap) -> String
 */
const generateVariantFirestoreSerialization = (variantName, fields) => {
    const hasSerializableFields = Object.values(fields).some(needsFirestoreSerialization)

    if (!hasSerializableFields)
        // No custom serialization needed - simple pass-through
        return `
        ${variantName}Constructor.toFirestore = o => ({ ...o })
        ${variantName}Constructor.fromFirestore = ${variantName}Constructor._from
        `

    const toFirestoreFields = Object.entries(fields).map(([fieldName, fieldType]) =>
        generateToFirestoreField(fieldName, fieldType),
    )
    const fromFirestoreFields = Object.entries(fields).map(([fieldName, fieldType]) =>
        generateFromFirestoreField(fieldName, fieldType),
    )

    return `
        ${variantName}Constructor._toFirestore = (o, encodeTimestamps) => ({
            ${toFirestoreFields.join(',\n            ')}
        })

        ${variantName}Constructor._fromFirestore = (doc, decodeTimestamps) =>
            ${variantName}Constructor._from({
                ${fromFirestoreFields.join(',\n                ')}
            })

        // Public aliases (can be overridden)
        ${variantName}Constructor.toFirestore = ${variantName}Constructor._toFirestore
        ${variantName}Constructor.fromFirestore = ${variantName}Constructor._fromFirestore
    `
}

/*
 * Generate Firestore serialization for TaggedSum type
 * @sig generateTaggedSumFirestoreSerialization :: (String, Object) -> String
 */
const generateTaggedSumFirestoreSerialization = (typeName, variants) => {
    const variantNames = Object.keys(variants)
    const fromFirestoreCases = variantNames
        .map(v => `if (tagName === '${v}') return ${typeName}.${v}.fromFirestore(doc, decodeTimestamps)`)
        .join('\n        ')

    return `
        ${typeName}._toFirestore = (o, encodeTimestamps) => {
            const tagName = o['@@tagName']
            const variant = ${typeName}[tagName]
            return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
        }

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

/*
 * Generate variant constructor for tagged sum
 * @sig generateVariantConstructor :: (String, String, FieldMap) -> String
 */
const generateVariantConstructor = (typeName, variantName, fields) => {
    const fullName = `${typeName}.${variantName}`

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(fullName, fields)

    const constructorCode = Generator.generateTypeConstructor(variantName, fullName, fields)
    const toStringCode = Generator.generateToString(fullName, fields)
    const fromCode = Generator.generateFrom('prototype', variantName, fullName, fields)

    return `
        // -------------------------------------------------------------------------------------------------------------
        //
        // Variant ${typeName}.${variantName}
        //
        // -------------------------------------------------------------------------------------------------------------
        const ${variantName}Constructor = ${constructorCode.replace('prototype', `${variantName}Prototype`)}

        ${typeName}.${variantName} = ${variantName}Constructor

        const ${variantName}Prototype = Object.create(${typeName}Prototype, {
            '@@tagName' : { value: '${variantName}', enumerable: false },
            '@@typeName': { value: '${typeName}', enumerable: false    },

            toString: {
                value: ${toStringCode},
                enumerable: false
            },

            toJSON: {
                value: function() { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
                enumerable: false
            },

            constructor: {
                value: ${variantName}Constructor,
                enumerable: false,
                writable: true,
                configurable: true
            }
        })

        ${variantName}Constructor.prototype = ${variantName}Prototype
        ${variantName}Constructor.is = val => val && val.constructor === ${variantName}Constructor
        ${variantName}Constructor.toString = () => '${fullName}'
        ${variantName}Constructor._from = ${fromCode}
        ${variantName}Constructor.from = ${variantName}Constructor._from

        ${generateVariantFirestoreSerialization(variantName, fields)}
    `
}

/*
 * Generate imports section for generated file
 * @sig generateImportsSection :: [ImportInfo] -> String
 */
const generateImportsSection = imports => {
    if (!imports || imports.length === 0) return ''

    // Filter out internal imports (like string-types) that don't need to be in generated files
    const externalImports = imports.filter(imp => !imp.source.startsWith('./string-types'))

    if (externalImports.length === 0) return ''

    const importStatements = externalImports
        .map(imp => {
            const specifiers = imp.specifiers
                .map(spec => {
                    if (spec.type === 'ImportDefaultSpecifier') return spec.local
                    else if (spec.type === 'ImportNamespaceSpecifier') return `* as ${spec.local}`
                    else return spec.imported === spec.local ? spec.imported : `${spec.imported} as ${spec.local}`
                })
                .join(', ')

            return `import { ${specifiers} } from '${imp.source}'`
        })
        .join('\n')

    return importStatements + '\n'
}

export { generateStaticTaggedType, generateStaticTaggedSumType }
