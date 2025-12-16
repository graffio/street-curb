// ABOUTME: Main type generator for Tagged and TaggedSum types
// ABOUTME: Generates JavaScript files with constructors, prototypes, and Firestore serialization

import { getExistingStandardFunctions } from './parse-type-definition-file.js'
import { prettierCode, stringifyObjectAsMultilineComment } from './prettier-code.js'
import TaggedFieldType from './tagged-field-type.js'
import Generator from './tagged-type-function-generators.js'

/*
 * Generate ABOUTME header comments for a type file
 * @sig generateAboutMe :: (String, String) -> String
 */
const generateAboutMe = (typeName, relativePath) => {
    const sourcePath = relativePath.replace(/.*modules/, 'modules')
    return `// ABOUTME: Generated type definition for ${typeName}
// ABOUTME: Auto-generated from ${sourcePath} - do not edit manually`
}

/*
 * Capitalize first letter of a string
 * @sig capitalize :: String -> String
 */
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1)

/*
 * Generate @sig comment for a constructor function
 * @sig generateConstructorSig :: (String, FieldMap) -> String
 */
const generateConstructorSig = (fullTypeName, fields) => {
    /**
     * Format a field entry as a type signature parameter
     * @sig formatFieldEntry :: ([String, FieldType]) -> String
     */
    const formatFieldEntry = ([fieldName, fieldType]) => {
        const parsed = TaggedFieldType.fromString(fieldType.toString())
        const { baseType, taggedType, optional, arrayDepth, regex } = parsed

        // For regex fields, create a type alias from the field name
        if (regex) {
            const typeName = capitalize(fieldName)
            regexDefs.push(`${typeName} = ${regex}`)
            const wrapped = arrayDepth > 0 ? '['.repeat(arrayDepth) + typeName + ']'.repeat(arrayDepth) : typeName
            return optional ? `${wrapped}?` : wrapped
        }

        // For LookupTable fields, show {Type} syntax
        if (baseType === 'LookupTable') {
            const base = `{${taggedType}}`
            return optional ? `${base}?` : base
        }

        const base = taggedType || baseType
        const wrapped = arrayDepth > 0 ? '['.repeat(arrayDepth) + base + ']'.repeat(arrayDepth) : base
        return optional ? `${wrapped}?` : wrapped
    }

    const regexDefs = []
    const fieldTypes = Object.entries(fields).map(formatFieldEntry)
    const params = fieldTypes.length > 0 ? `(${fieldTypes.join(', ')})` : '()'
    const regexLines = regexDefs.length > 0 ? `\n *     ${regexDefs.join('\n *     ')}` : ''

    return `/**
 * Construct a ${fullTypeName} instance
 * @sig ${fullTypeName.split('.').pop()} :: ${params} -> ${fullTypeName}${regexLines}
 */`
}

/*
 * Generate named toString function for a type
 * @sig generateNamedToString :: (String, String, FieldMap) -> String
 */
const generateNamedToString = (funcName, typeName, fields) => {
    const fieldKeys = Object.keys(fields)
    const fieldStrings = fieldKeys.map(f => `\${R._toString(this.${f})}`)

    // Estimate line length: "    return `TypeName(" + fields + ")`"
    const singleLineReturn = `${typeName}(${fieldStrings.join(', ')})`
    const estimatedLength = 12 + singleLineReturn.length // "    return `" + content + "`"

    // If too long, split across multiple lines
    if (estimatedLength > 120) {
        const indentedFields = fieldStrings.map(s => `        ${s}`).join(',\n')
        return `/**
 * Convert to string representation
 * @sig ${funcName} :: () -> String
 */
const ${funcName} = function () {
    return \`${typeName}(
${indentedFields},
    )\`
}`
    }

    return `/**
 * Convert to string representation
 * @sig ${funcName} :: () -> String
 */
const ${funcName} = function () {
    return \`${typeName}(${fieldStrings.join(', ')})\`
}`
}

/*
 * Generate named toJSON function for a simple tagged type
 * @sig generateNamedToJSON :: String -> String
 */
const generateNamedToJSON = funcName => `/**
 * Convert to JSON representation
 * @sig ${funcName} :: () -> Object
 */
const ${funcName} = function () {
    return this
}`

/*
 * Generate named toJSON function for a tagged sum variant (includes tagName)
 * @sig generateNamedVariantToJSON :: String -> String
 */
const generateNamedVariantToJSON = funcName => `/**
 * Convert to JSON representation with tag
 * @sig ${funcName} :: () -> Object
 */
const ${funcName} = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}`

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
 * Check if a field type is a LookupTable
 * @sig isLookupTableField :: FieldType -> Boolean
 */
const isLookupTableField = fieldType => TaggedFieldType.fromString(fieldType.toString()).baseType === 'LookupTable'

/*
 * Extract child type name from a field (for LookupTable or Tagged types)
 * @sig getChildType :: FieldType -> String?
 */
const getChildType = fieldType => {
    const { baseType, taggedType } = TaggedFieldType.fromString(fieldType.toString())
    if (baseType !== 'LookupTable' && baseType !== 'Tagged') return undefined
    return taggedType
}

/*
 * Get array of child type names from a fields object
 * @sig childTypesFromFields :: FieldMap -> [String]
 */
const childTypesFromFields = fields => Object.values(fields).map(getChildType).filter(Boolean)

/*
 * Collect unique child types from a fields object as a Set
 * @sig collectChildTypesFromFields :: FieldMap -> Set<String>
 */
const collectChildTypesFromFields = fields => new Set(childTypesFromFields(fields))

/*
 * Collect unique child types from all variants of a TaggedSum type
 * @sig collectChildTypesFromVariants :: VariantMap -> Set<String>
 */
const collectChildTypesFromVariants = variants => new Set(Object.values(variants).flatMap(childTypesFromFields))

/*
 * Generate the field serialization expression for toFirestore
 * @sig generateToFirestoreField :: (String, FieldType) -> String
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

    const parsed = TaggedFieldType.fromString(fieldType.toString())
    const { baseType, arrayDepth } = parsed

    // Handle Date fields
    if (baseType === 'Date') return `encodeTimestamps(o.${fieldName})`
    if (baseType === 'LookupTable') return processLookupTable()
    if (baseType === 'Tagged' && arrayDepth === 0) return processTagged()
    if (baseType === 'Tagged' && arrayDepth > 0) return processArrayOfTagged()

    return `o.${fieldName}`
}

/*
 * Generate a single field entry for toFirestore object literal
 * @sig generateToFirestoreField :: (String, FieldType) -> String
 */
const generateToFirestoreField = (fieldName, fieldType) =>
    `${fieldName}: ${generateToFirestoreValue(fieldName, fieldType)}`

/*
 * Generate toFirestore function code
 * @sig generateToFirestore :: (String, FieldMap) -> String
 */
const generateToFirestore = (typeName, fields) => {
    const isOptionalField = ([_, fieldType]) => TaggedFieldType.fromString(fieldType).optional

    const formatRequired = ([fieldName, fieldType]) => `${fieldName}: ${generateToFirestoreValue(fieldName, fieldType)}`

    const formatOptional = ([fieldName, fieldType]) => ({
        fieldName,
        code: generateToFirestoreValue(fieldName, fieldType),
    })

    const fieldEntries = Object.entries(fields)
    const needsSerialization = fieldEntries.some(([_, fieldType]) => needsFirestoreSerialization(fieldType))

    // If no fields need serialization, generate a simple pass-through
    if (!needsSerialization) return `${typeName}._toFirestore = (o, encodeTimestamps) => ({ ...o })`

    // Separate required and optional fields
    const requiredEntries = fieldEntries.filter(entry => !isOptionalField(entry))
    const optionalEntries = fieldEntries.filter(isOptionalField)

    const requiredFields = requiredEntries.map(formatRequired)
    const optionalFields = optionalEntries.map(formatOptional)

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

    const parsed = TaggedFieldType.fromString(fieldType.toString())
    const { baseType, arrayDepth } = parsed
    const accessor = `doc.${fieldName}`

    if (baseType === 'Date') return processDate()
    if (baseType === 'LookupTable') return processLookupTable()
    if (baseType === 'Tagged' && arrayDepth === 0) return processTagged()
    if (baseType === 'Tagged' && arrayDepth > 0) return processArrayOfTagged()

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
    const { name, fields, relativePath, imports = [], functions = [] } = typeDefinition

    const existingStandard = getExistingStandardFunctions(functions)

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(name, fields)

    // Filter out child types that are already imported by the user
    // Import info has structure: { source, specifiers: [{ type, imported, local }] }
    const existingImports = new Set(imports.flatMap(imp => imp.specifiers.map(spec => spec.local)))

    // Check if we need LookupTable import (and user hasn't already imported it)
    const needsLookupTable = !existingImports.has('LookupTable') && Object.values(fields).some(isLookupTableField)

    // Collect child types from LookupTable and Tagged fields for import
    const childTypes = collectChildTypesFromFields(fields)

    // Filter out types already imported and self-references (recursive types)
    const newChildTypes = Array.from(childTypes)
        .filter(typeName => !existingImports.has(typeName))
        .filter(typeName => typeName !== name)

    // Generate import statements for child types (only those not already imported)
    const childTypeImports = newChildTypes
        .map(
            typeName =>
                `import { ${typeName} } from './${typeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.js'`,
        )
        .join('\n        ')

    const code = `
        ${generateAboutMe(name, relativePath)}

        ${stringifyObjectAsMultilineComment(fields, relativePath, name)}

        ${generateImportsSection(imports)}
        
        import * as R from '@graffio/cli-type-generator'
        ${needsLookupTable ? "import { LookupTable } from '@graffio/functional'" : ''}
        ${childTypeImports || ''}

        // -------------------------------------------------------------------------------------------------------------
        //
        // main constructor
        //
        // -------------------------------------------------------------------------------------------------------------
        ${generateConstructorSig(name, fields)}
        const ${name} = ${Generator.generateTypeConstructor(name, name, fields)}

        // -------------------------------------------------------------------------------------------------------------
        //
        // prototype methods
        //
        // -------------------------------------------------------------------------------------------------------------
        ${generateNamedToString(name.toLowerCase() + 'ToString', name, fields)}

        ${generateNamedToJSON(name.toLowerCase() + 'ToJSON')}

        // -------------------------------------------------------------------------------------------------------------
        //
        // prototype
        //
        // -------------------------------------------------------------------------------------------------------------
        const prototype = Object.create(Object.prototype, {
            '@@typeName': { value: '${name}', enumerable: false },
            toString: { value: ${name.toLowerCase()}ToString, enumerable: false },
            toJSON: { value: ${name.toLowerCase()}ToJSON, enumerable: false },
            constructor: { value: ${name}, enumerable: false, writable: true, configurable: true }
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
    // if (Object.keys(fields).length === 0)
    //     throw new Error(
    //         `Type '${name}' has unit variant '${variantName}' (no fields).\n` +
    //             `Unit variants are not supported. Use a variant with at least one field instead.`,
    //     )

    return generateVariantConstructor(name, variantName, fields)
}

/*
 * Generate static tagged sum type (multiple variant constructors)
 * @sig generateStaticTaggedSumType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedSumType = async typeDefinition => {
    /**
     * Generate is method - use destructuring if 3+ variants
     * @sig generateIsMethod :: (String, [String]) -> String
     */
    const generateIsMethod = (typeName, variants) => {
        if (variants.length >= 3) {
            const destructure = `const { ${variants.join(', ')} } = ${typeName}`
            const checks = variants.map(v => `constructor === ${v}`).join(' || ')
            return `/**
         * Check if value is a ${typeName} instance
         * @sig is :: Any -> Boolean
         */
        ${typeName}.is = v => {
            ${destructure}
            if (typeof v !== 'object') return false
            const constructor = Object.getPrototypeOf(v).constructor
            return ${checks}
        }`
        }
        const checks = variants.map(v => `constructor === ${typeName}.${v}`).join(' || ')
        return `/**
         * Check if value is a ${typeName} instance
         * @sig is :: Any -> Boolean
         */
        ${typeName}.is = v => {
            if (typeof v !== 'object') return false
            const constructor = Object.getPrototypeOf(v).constructor
            return ${checks}
        }`
    }

    const { name, variants, relativePath, imports = [], functions = [] } = typeDefinition
    const variantNames = Object.keys(variants)
    const constructorsForVariants = variantNames
        .map(variantName => constructorForVariant(name, variants, variantName))
        .join('\n\n')

    // Collect child types from all variant fields for imports
    const childTypes = collectChildTypesFromVariants(variants)

    // Filter out types already imported and self-references (recursive types like FilterSpec.Compound.filters)
    const existingImports = new Set(imports.flatMap(imp => imp.specifiers.map(spec => spec.local)))
    const newChildTypes = Array.from(childTypes)
        .filter(typeName => !existingImports.has(typeName))
        .filter(typeName => typeName !== name)

    // Generate import statements for child types (only those not already imported)
    const childTypeImports = newChildTypes
        .map(
            typeName =>
                `import { ${typeName} } from './${typeName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}.js'`,
        )
        .join('\n        ')

    // Pre-compute tag names list for the template
    const tagNamesList = variantNames.map(v => `'${v}'`).join(', ')

    const code = `
        ${generateAboutMe(name, relativePath)}

        ${stringifyObjectAsMultilineComment(variants, relativePath, name)}

        ${generateImportsSection(imports)}
        import * as R from '@graffio/cli-type-generator'
        ${childTypeImports || ''}

        // -------------------------------------------------------------------------------------------------------------
        //
        // ${name} constructor
        //
        // -------------------------------------------------------------------------------------------------------------
        const ${name} = {
            toString: () => '${name}'
        }

        // Add hidden properties
        Object.defineProperty(${name}, '@@typeName', { value: '${name}', enumerable: false })
        Object.defineProperty(${name}, '@@tagNames', { value: [${tagNamesList}], enumerable: false })

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

        // Define is method after variants are attached (allows destructuring)
        ${generateIsMethod(name, variantNames)}

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

    const fieldNames = Object.keys(fields)
    const toFirestoreFields = Object.entries(fields).map(([fieldName, fieldType]) =>
        generateToFirestoreField(fieldName, fieldType),
    )
    const fromFirestoreFields = Object.entries(fields).map(([fieldName, fieldType]) =>
        generateFromFirestoreField(fieldName, fieldType),
    )

    // Use block body with destructuring if 2+ fields to avoid chain-extraction violations
    if (fieldNames.length >= 2) {
        const oDestructure = `const { ${fieldNames.join(', ')} } = o`
        const docDestructure = `const { ${fieldNames.join(', ')} } = doc`

        // Replace o.fieldName with fieldName in serialization
        const toFieldsDestructured = toFirestoreFields.map(f => f.replace(/o\.(\w+)/g, '$1'))
        const fromFieldsDestructured = fromFirestoreFields.map(f => f.replace(/doc\.(\w+)/g, '$1'))

        return `
        /**
         * Serialize to Firestore format
         * @sig _toFirestore :: (${variantName}, Function) -> Object
         */
        ${variantName}Constructor._toFirestore = (o, encodeTimestamps) => {
            ${oDestructure}
            return {
                ${toFieldsDestructured.join(',\n                ')}
            }
        }

        /**
         * Deserialize from Firestore format
         * @sig _fromFirestore :: (Object, Function) -> ${variantName}
         */
        ${variantName}Constructor._fromFirestore = (doc, decodeTimestamps) => {
            ${docDestructure}
            return ${variantName}Constructor._from({
                ${fromFieldsDestructured.join(',\n                ')}
            })
        }

        // Public aliases (can be overridden)
        ${variantName}Constructor.toFirestore = ${variantName}Constructor._toFirestore
        ${variantName}Constructor.fromFirestore = ${variantName}Constructor._fromFirestore
    `
    }

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

    // If 3+ variants, destructure to avoid chain-extraction violations
    if (variantNames.length >= 3) {
        const destructure = `const { ${variantNames.join(', ')} } = ${typeName}`
        const fromFirestoreCases = variantNames
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

    const fromFirestoreCases = variantNames
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

/*
 * Generate variant constructor for tagged sum
 * @sig generateVariantConstructor :: (String, String, FieldMap) -> String
 */
const generateVariantConstructor = (typeName, variantName, fields) => {
    const fullName = `${typeName}.${variantName}`
    const lowerVariant = variantName.charAt(0).toLowerCase() + variantName.slice(1)

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(fullName, fields)

    const constructorCode = Generator.generateTypeConstructor(variantName, fullName, fields)
    const fromCode = Generator.generateFrom('prototype', variantName, fullName, fields)

    return `
        // -------------------------------------------------------------------------------------------------------------
        //
        // Variant ${typeName}.${variantName}
        //
        // -------------------------------------------------------------------------------------------------------------
        ${generateNamedToString(lowerVariant + 'ToString', fullName, fields)}

        ${generateNamedVariantToJSON(lowerVariant + 'ToJSON')}

        ${generateConstructorSig(fullName, fields)}
        const ${variantName}Constructor = ${constructorCode.replace('prototype', `${variantName}Prototype`)}

        ${typeName}.${variantName} = ${variantName}Constructor

        const ${variantName}Prototype = Object.create(${typeName}Prototype, {
            '@@tagName': { value: '${variantName}', enumerable: false },
            '@@typeName': { value: '${typeName}', enumerable: false },
            toString: { value: ${lowerVariant}ToString, enumerable: false },
            toJSON: { value: ${lowerVariant}ToJSON, enumerable: false },
            constructor: { value: ${variantName}Constructor, enumerable: false, writable: true, configurable: true }
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
    /**
     * Format an import specifier for code generation
     * @sig formatSpecifier :: ImportSpecifier -> String
     */
    const formatSpecifier = spec => {
        const { type, imported, local } = spec
        if (type === 'ImportDefaultSpecifier') return local
        if (type === 'ImportNamespaceSpecifier') return `* as ${local}`
        return imported === local ? imported : `${imported} as ${local}`
    }

    const formatImport = imp => {
        const specifiers = imp.specifiers.map(formatSpecifier).join(', ')
        return `import { ${specifiers} } from '${imp.source}'`
    }

    if (!imports || imports.length === 0) return ''
    return imports.map(formatImport).join('\n') + '\n'
}

export { generateStaticTaggedType, generateStaticTaggedSumType }
