// ABOUTME: Main type generator for Tagged and TaggedSum types
// ABOUTME: Orchestrates code generation modules to produce JavaScript type files

import { generateConstructorSig } from './codegen/constructor-sig.js'
import { generateFrom, generateTypeConstructor } from './codegen/expressions.js'
import {
    generateFirestoreSerializationForTagged,
    generateFirestoreSerializationForTaggedSum,
    generateFirestoreSerializationForTaggedSumVariant,
} from './codegen/firestore-serialization.js'
import { generateImportsSection } from './codegen/imports.js'
import { generateIsMethod } from './codegen/is-method.js'
import { generateNamedToJSON, generateNamedVariantToJSON } from './codegen/to-json.js'
import { generateNamedToString } from './codegen/to-string.js'
import FieldDescriptor from './descriptors/field-descriptor.js'
import { getExistingStandardFunctions } from './parse-type-definition-file.js'
import { prettierCode, stringifyObjectAsMultilineComment } from './prettier-code.js'

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

    const { name, fields, relativePath, imports = [], functions = [] } = typeDefinition

    const existingStandard = getExistingStandardFunctions(functions)

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(name, fields)

    // Filter out child types that are already imported by the user
    // Import info has structure: { source, specifiers: [{ type, imported, local }] }
    const existingImports = new Set(imports.flatMap(imp => imp.specifiers.map(spec => spec.local)))

    // Check if we need LookupTable import (and user hasn't already imported it)
    const needsLookupTable =
        !existingImports.has('LookupTable') &&
        Object.values(fields).some(ft => FieldDescriptor.fromAny(ft).baseType === 'LookupTable')

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
        const ${name} = ${generateTypeConstructor(name, name, fields)}

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

        ${`${name}._from = ${generateFrom('prototype', name, name, fields)}`}
        ${shouldGenerate('from', existingStandard) ? `${name}.from = ${name}._from` : ''}

        ${generateFirestoreSerializationForTagged(name, fields)}

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
     * Generate variant constructor for TaggedSum
     * @sig generateVariantConstructor :: (String, String, FieldMap) -> String
     */
    const generateVariantConstructor = (typeName, vName, flds) => {
        const fullName = `${typeName}.${vName}`
        const lowerVariant = vName.charAt(0).toLowerCase() + vName.slice(1)

        validateNoDateArrays(fullName, flds)

        const constructorCode = generateTypeConstructor(vName, fullName, flds)
        const fromCode = generateFrom('prototype', vName, fullName, flds)

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

        ${generateFirestoreSerializationForTaggedSumVariant(vName, flds)}
    `
    }

    const { name, variants, relativePath, imports = [], functions = [] } = typeDefinition
    const variantNames = Object.keys(variants)
    const constructorsForVariants = variantNames
        .map(variantName => generateVariantConstructor(name, variantName, variants[variantName]))
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

        ${generateFirestoreSerializationForTaggedSum(name, variants)}

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
