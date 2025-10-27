import { prettierCode, stringifyObjectAsMultilineComment } from './prettier-code.js'
import TaggedFieldType from './tagged-field-type.js'
import Generator from './tagged-type-function-generators.js'

/*
 * Validate that no fields use [Date] arrays, which are not supported by Firestore facade
 * @sig validateNoDateArrays :: (String, FieldMap) -> void
 */
const validateNoDateArrays = (typeName, fields) => {
    const dateArrayFields = Object.entries(fields)
        .filter(([_, fieldType]) => {
            const parsedType = TaggedFieldType.fromString(fieldType.toString())
            return parsedType.baseType === 'Date' && parsedType.arrayDepth > 0
        })
        .map(([fieldName, fieldType]) => `${fieldName}: ${fieldType}`)

    if (dateArrayFields.length > 0) 
        throw new Error(
            `Type '${typeName}' has Date array fields which are not supported by Firestore facade:\n  ${dateArrayFields.join('\n  ')}\n\n` +
                `The timestampFields property is used by FirestoreAdminFacade to convert between Date and Firestore Timestamp,\n` +
                `but it only handles individual Date values, not arrays.\n\n` +
                `Please use a different approach for storing arrays of dates (e.g., store as milliseconds: [Number]).`,
        )
    
}

/*
 * Extract field names that have Date type (Date or Date? only, not arrays)
 * @sig getDateFields :: FieldMap -> [String]
 */
const getDateFields = fields =>
    Object.entries(fields)
        .filter(([_, fieldType]) => {
            const parsedType = TaggedFieldType.fromString(fieldType.toString())
            return parsedType.baseType === 'Date' && parsedType.arrayDepth === 0
        })
        .map(([fieldName, _]) => fieldName)

/*
 * Generate timestampFields static property if type has Date fields
 * @sig generateTimestampFieldsSection :: (String, FieldMap) -> String
 */
const generateTimestampFieldsSection = (typeName, fields) => {
    const dateFields = getDateFields(fields)
    if (dateFields.length === 0) return ''

    return `
        // -------------------------------------------------------------------------------------------------------------
        // timestamp fields
        // -------------------------------------------------------------------------------------------------------------
        ${typeName}.timestampFields = [${dateFields.map(f => `'${f}'`).join(', ')}]
    `
}

/*
 * Generate static tagged type (single constructor)
 * @sig generateStaticTaggedType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedType = async typeDefinition => {
    const { name, fields, imports = [], functions = [] } = typeDefinition

    // Validate no [Date] arrays since Firestore facade can't handle them
    validateNoDateArrays(name, fields)

    const timestampFieldsSection = generateTimestampFieldsSection(name, fields)

    const code = `
        ${stringifyObjectAsMultilineComment(typeDefinition.fields, typeDefinition.relativePath, name)}
        
        ${generateImportsSection(imports)}
        import * as R from '@graffio/cli-type-generator'
        
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
        ${name}.from = ${Generator.generateFrom('prototype', name, name, fields)}

        ${timestampFieldsSection}

        ${generateFunctionsSection(functions)}

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

    // Handle unit types (no fields)
    if (Object.keys(fields).length === 0) return generateUnitVariant(name, variantName)

    return generateVariantConstructor(name, variantName, fields)
}

/*
 * Generate static tagged sum type (multiple variant constructors)
 * @sig generateStaticTaggedSumType :: TypeDefinition -> Promise<String>
 */
const generateStaticTaggedSumType = async typeDefinition => {
    const { name, variants, imports = [], functions = [] } = typeDefinition
    const variantNames = Object.keys(variants)
    const variantConstructors = variantNames
        .map(variantName => constructorForVariant(name, variants, variantName))
        .join('\n\n')
    const matchFunction = generateMatchFunction(variantNames)

    const code = `
        ${stringifyObjectAsMultilineComment(typeDefinition.variants, typeDefinition.relativePath, name)}

        ${generateImportsSection(imports)}
        import * as R from '@graffio/cli-type-generator'

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

        // -------------------------------------------------------------------------------------------------------------
        //
        // Set up ${name}'s prototype as ${name}Prototype
        //
        // -------------------------------------------------------------------------------------------------------------
        // Type prototype with match method
        const ${name}Prototype = {}

        Object.defineProperty(${name}Prototype, 'match', {
            value: ${matchFunction},
            enumerable: false
        })

        Object.defineProperty(${name}Prototype, 'constructor', {
            value: ${name},
            enumerable: false,
            writable: true,
            configurable: true
       })

        // Add hidden properties
        Object.defineProperty(${name}, '@@typeName', { value: '${name}', enumerable: false }, )
        Object.defineProperty(${name}, '@@tagNames', { value: [${variantNames.map(v => `'${v}'`).join(', ')}], enumerable: false })

        ${name}.prototype = ${name}Prototype

        ${variantConstructors}

        ${generateFunctionsSection(functions)}

        export { ${name} }
    `

    return await prettierCode(code)
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
    const timestampFieldsSection = generateTimestampFieldsSection(`${variantName}Constructor`, fields)

    return `
        // -------------------------------------------------------------------------------------------------------------
        //
        // Variant ${typeName}.${variantName} constructor
        //
        // -------------------------------------------------------------------------------------------------------------
        const ${variantName}Constructor = ${constructorCode.replace('prototype', `${variantName}Prototype`)}

        ${typeName}.${variantName} = ${variantName}Constructor

        // -------------------------------------------------------------------------------------------------------------
        //
        // Set up Variant ${typeName}.${variantName} prototype
        //
        // -------------------------------------------------------------------------------------------------------------

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

        // -------------------------------------------------------------------------------------------------------------
        //
        // Variant ${typeName}.${variantName}: static functions:
        //
        // -------------------------------------------------------------------------------------------------------------
        ${variantName}Constructor.is = val => val && val.constructor === ${variantName}Constructor
        ${variantName}Constructor.toString = () => '${fullName}'
        ${variantName}Constructor.from = ${fromCode}

        ${timestampFieldsSection}
    `
}

/*
 * Generate unit variant (no fields) for tagged sum
 * @sig generateUnitVariant :: (String, String) -> String
 */
const generateUnitVariant = (typeName, variantName) => {
    const unitConstructorCode = Generator.generateUnitConstructor('unitPrototype', variantName)

    return `
        // Unit variant: ${variantName}
        const ${variantName}UnitPrototype = Object.create(${typeName}Prototype)
        Object.defineProperty(${variantName}UnitPrototype, '@@tagName', { value: '${variantName}' })
        Object.defineProperty(${variantName}UnitPrototype, '@@typeName', { value: '${typeName}' })

        const ${variantName}UnitConstructor = ${unitConstructorCode}
        ${variantName}UnitConstructor.prototype = ${variantName}UnitPrototype

        const ${variantName}Instance = new ${variantName}UnitConstructor()
        ${variantName}Instance.from = () => ${variantName}Instance
        ${variantName}Instance.toString = () => '${typeName}.${variantName}'
        ${variantName}Instance.toJSON = function() {
            return { '@@tagName': '${variantName}' }
        }

        Object.defineProperty(${variantName}UnitPrototype, 'constructor', { value: ${variantName}Instance })
        Object.defineProperty(${variantName}UnitPrototype, 'is', { value: val => ${variantName}Instance === val })

        ${typeName}.${variantName} = ${variantName}Instance
    `
}

/*
 * Generate match function for tagged sum types
 * @sig generateMatchFunction :: [String] -> String
 */
const generateMatchFunction = variantNames => `
    function(variants) {
        // Validate all variants are handled
        const requiredVariants = [${variantNames.map(v => `'${v}'`).join(', ')}]
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })
        
        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    }`

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

/*
 * Generate functions section for generated file
 * @sig generateFunctionsSection :: [FunctionInfo] -> String
 */
const generateFunctionsSection = functions => {
    if (!functions || functions.length === 0) return ''

    const functionCode = functions
        .map(fn => `        // Additional function: ${fn.functionName}\n        ${fn.sourceCode}`)
        .join('\n\n')

    return `
        // -------------------------------------------------------------------------------------------------------------
        // Additional functions copied from type definition file
        // -------------------------------------------------------------------------------------------------------------
        ${functionCode}
    `
}

export { generateStaticTaggedType, generateStaticTaggedSumType }
