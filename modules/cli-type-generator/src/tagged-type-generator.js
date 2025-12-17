// ABOUTME: Main type generator for Tagged and TaggedSum types
// ABOUTME: Orchestrates code generation modules to produce JavaScript type files

import { generateConstructorSig } from './codegen/constructor-sig.js'
import { generateImportsSection } from './codegen/imports.js'
import { generateIsMethod } from './codegen/is-method.js'
import { generateFromFirestoreField, generateToFirestoreValue } from './codegen/serialization.js'
import { generateNamedToJSON, generateNamedVariantToJSON } from './codegen/to-json.js'
import { generateNamedToString } from './codegen/to-string.js'
import FieldDescriptor from './descriptors/field-descriptor.js'
import { getExistingStandardFunctions } from './parse-type-definition-file.js'
import { prettierCode, stringifyObjectAsMultilineComment } from './prettier-code.js'
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
 * Validate that no fields use [Date] arrays, which are not supported by Firestore facade
 * @sig validateNoDateArrays :: (String, FieldMap) -> void
 */
const validateNoDateArrays = (typeName, fields) => {
    const hasAnUnhandledDateArrayField = fieldType => {
        const { baseType, arrayDepth } = FieldDescriptor.fromAny(fieldType)
        return baseType === 'Date' && arrayDepth > 0
    }

    if (Object.values(fields).some(hasAnUnhandledDateArrayField))
        throw new Error(`Type '${typeName}' has date array fields which are not supported by Firestore facade.`)
}

/*
 * Check if a field type is a LookupTable
 * @sig isLookupTableField :: (String | FieldDescriptor) -> Boolean
 */
const isLookupTableField = fieldType => FieldDescriptor.fromAny(fieldType).baseType === 'LookupTable'

/*
 * Extract child type name from a field (for LookupTable or Tagged types)
 * @sig getChildType :: (String | FieldDescriptor) -> String?
 */
const getChildType = fieldType => {
    const { baseType, taggedType } = FieldDescriptor.fromAny(fieldType)
    if (baseType !== 'LookupTable' && baseType !== 'Tagged') return undefined
    return taggedType
}

/*
 * Generate static tagged type (single constructor)
 * @sig generateStaticTaggedType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedType = async typeDefinition => {
    /*
     * Check if a function should be generated
     * @sig shouldGenerate :: (String, [String]) -> Boolean
     */
    const shouldGenerate = (functionName, existingFunctions) => !existingFunctions.includes(functionName)

    /*
     * Check if a field type needs special Firestore serialization
     * @sig needsFirestoreSerialization :: (String | FieldDescriptor) -> Boolean
     */
    const needsFirestoreSerialization = ft =>
        ['Date', 'Tagged', 'LookupTable'].includes(FieldDescriptor.fromAny(ft).baseType)

    /*
     * Generate toFirestore function code
     * @sig generateToFirestore :: (String, FieldMap) -> String
     */
    const generateToFirestore = (typeName, flds) => {
        const isOptionalField = ([_, fieldType]) => FieldDescriptor.fromAny(fieldType).optional
        const formatRequired = ([fn, ft]) => `${fn}: ${generateToFirestoreValue(fn, ft)}`
        const formatOptional = ([fn, ft]) => ({ fieldName: fn, code: generateToFirestoreValue(fn, ft) })

        const fieldEntries = Object.entries(flds)
        const hasSerialization = fieldEntries.some(([_, ft]) => needsFirestoreSerialization(ft))

        if (!hasSerialization) return `${typeName}._toFirestore = (o, encodeTimestamps) => ({ ...o })`

        const requiredEntries = fieldEntries.filter(entry => !isOptionalField(entry))
        const optionalEntries = fieldEntries.filter(isOptionalField)
        const requiredFields = requiredEntries.map(formatRequired)
        const optionalFields = optionalEntries.map(formatOptional)
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
     * Generate fromFirestore function code
     * @sig generateFromFirestore :: (String, FieldMap) -> String
     */
    const generateFromFirestore = (typeName, flds) => {
        const fieldEntries = Object.entries(flds)
        const hasSerialization = fieldEntries.some(([_, ft]) => needsFirestoreSerialization(ft))

        if (!hasSerialization) return `${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from(doc)`

        const deserializedFields = fieldEntries
            .map(([fn, ft]) => generateFromFirestoreField(fn, ft))
            .join(',\n        ')

        return `${typeName}._fromFirestore = (doc, decodeTimestamps) => ${typeName}._from({
        ${deserializedFields}
    })`
    }

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
    const childTypes = new Set(Object.values(fields).map(getChildType).filter(Boolean))

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
 * Generate static tagged sum type (multiple variant constructors)
 * @sig generateStaticTaggedSumType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedSumType = async typeDefinition => {
    /*
     * Generate constructor for a specific variant of a tagged sum type
     * @sig constructorForVariant :: (String, VariantMap, String) -> String
     */
    const constructorForVariant = (nm, vars, vn) => {
        /*
         * Generate variant constructor for tagged sum
         * @sig generateVariantConstructor :: (String, String, FieldMap) -> String
         */
        const generateVariantConstructor = (typeName, vName, flds) => {
            /*
             * Generate Firestore serialization for a variant
             * @sig generateVariantFirestoreSerialization :: (String, FieldMap) -> String
             */
            const generateVariantFirestoreSerialization = (vnn, fs) => {
                /*
                 * Generate a single field entry for toFirestore object literal
                 * @sig generateToFirestoreField :: (String, FieldType) -> String
                 */
                const generateToFirestoreField = (fieldName, fieldType) =>
                    `${fieldName}: ${generateToFirestoreValue(fieldName, fieldType)}`

                const needsSerialization = ft =>
                    ['Date', 'Tagged', 'LookupTable'].includes(FieldDescriptor.fromAny(ft).baseType)
                const hasSerializableFields = Object.values(fs).some(needsSerialization)

                if (!hasSerializableFields)
                    // No custom serialization needed - simple pass-through
                    return `
        ${vnn}Constructor.toFirestore = o => ({ ...o })
        ${vnn}Constructor.fromFirestore = ${vnn}Constructor._from
        `

                const fieldNames = Object.keys(fs)
                const toFirestoreFields = Object.entries(fs).map(([fieldName, fieldType]) =>
                    generateToFirestoreField(fieldName, fieldType),
                )
                const fromFirestoreFields = Object.entries(fs).map(([fieldName, fieldType]) =>
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

            const fullName = `${typeName}.${vName}`
            const lowerVariant = vName.charAt(0).toLowerCase() + vName.slice(1)

            // Validate no [Date] arrays since Firestore facade can't handle them
            validateNoDateArrays(fullName, flds)

            const constructorCode = Generator.generateTypeConstructor(vName, fullName, flds)
            const fromCode = Generator.generateFrom('prototype', vName, fullName, flds)

            return `
        // -------------------------------------------------------------------------------------------------------------
        //
        // Variant ${typeName}.${vName}
        //
        // -------------------------------------------------------------------------------------------------------------
        ${generateNamedToString(lowerVariant + 'ToString', fullName, flds)}

        ${generateNamedVariantToJSON(lowerVariant + 'ToJSON')}

        ${generateConstructorSig(fullName, flds)}
        const ${vName}Constructor = ${constructorCode.replace('prototype', `${vName}Prototype`)}

        ${typeName}.${vName} = ${vName}Constructor

        const ${vName}Prototype = Object.create(${typeName}Prototype, {
            '@@tagName': { value: '${vName}', enumerable: false },
            '@@typeName': { value: '${typeName}', enumerable: false },
            toString: { value: ${lowerVariant}ToString, enumerable: false },
            toJSON: { value: ${lowerVariant}ToJSON, enumerable: false },
            constructor: { value: ${vName}Constructor, enumerable: false, writable: true, configurable: true }
        })

        ${vName}Constructor.prototype = ${vName}Prototype
        ${vName}Constructor.is = val => val && val.constructor === ${vName}Constructor
        ${vName}Constructor.toString = () => '${fullName}'
        ${vName}Constructor._from = ${fromCode}
        ${vName}Constructor.from = ${vName}Constructor._from

        ${generateVariantFirestoreSerialization(vName, flds)}
    `
        }

        const fields = vars[vn]
        return generateVariantConstructor(nm, vn, fields)
    }

    /*
     * Generate Firestore serialization for TaggedSum type
     * @sig generateTaggedSumFirestoreSerialization :: (String, Object) -> String
     */
    const generateTaggedSumFirestoreSerialization = (typeName, vars) => {
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

    const { name, variants, relativePath, imports = [], functions = [] } = typeDefinition
    const variantNames = Object.keys(variants)
    const constructorsForVariants = variantNames
        .map(variantName => constructorForVariant(name, variants, variantName))
        .join('\n\n')

    // Collect child types from all variant fields for imports
    const childTypes = new Set(
        Object.values(variants).flatMap(flds => Object.values(flds).map(getChildType).filter(Boolean)),
    )

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

export { generateStaticTaggedType, generateStaticTaggedSumType }
