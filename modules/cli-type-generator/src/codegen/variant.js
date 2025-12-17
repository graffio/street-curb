// ABOUTME: Code generation for TaggedSum variant prototypes and static methods
// ABOUTME: Generates prototype objects, is(), toString(), from() for variants

import { generateFrom } from './expressions.js'

/*
 * Generate prototype definition for a TaggedSum variant
 * @sig generateVariantPrototype :: (String, String) -> String
 */
const generateVariantPrototype = (typeName, variantName) => {
    const lowerVariant = variantName.charAt(0).toLowerCase() + variantName.slice(1)

    return `const ${variantName}Prototype = Object.create(${typeName}Prototype, {
            '@@tagName': { value: '${variantName}', enumerable: false },
            '@@typeName': { value: '${typeName}', enumerable: false },
            toString: { value: ${lowerVariant}ToString, enumerable: false },
            toJSON: { value: ${lowerVariant}ToJSON, enumerable: false },
            constructor: { value: ${variantName}Constructor, enumerable: false, writable: true, configurable: true }
        })`
}

/*
 * Generate static method assignments for a TaggedSum variant
 * @sig generateVariantStaticMethods :: (String, String, FieldMap) -> String
 */
const generateVariantStaticMethods = (typeName, variantName, fields) => {
    const fullName = `${typeName}.${variantName}`
    const fromCode = generateFrom('prototype', variantName, fullName, fields)

    return `${variantName}Constructor.prototype = ${variantName}Prototype
        ${variantName}Constructor.is = val => val && val.constructor === ${variantName}Constructor
        ${variantName}Constructor.toString = () => '${fullName}'
        ${variantName}Constructor._from = ${fromCode}
        ${variantName}Constructor.from = ${variantName}Constructor._from`
}

/*
 * Generate constructor definition and parent assignment for a TaggedSum variant
 * @sig generateVariantConstructorDef :: (String, String, String) -> String
 */
const generateVariantConstructorDef = (typeName, variantName, constructorCode) =>
    `const ${variantName}Constructor = ${constructorCode.replace('prototype', `${variantName}Prototype`)}

        ${typeName}.${variantName} = ${variantName}Constructor`

export { generateVariantPrototype, generateVariantStaticMethods, generateVariantConstructorDef }
