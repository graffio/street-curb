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
            toString: { value: toString.${lowerVariant}, enumerable: false },
            toJSON: { value: toJSON.${lowerVariant}, enumerable: false },
            constructor: { value: ${variantName}Constructor, enumerable: false, writable: true, configurable: true }
        })`
}

/*
 * Generate all static method assignments grouped by method type
 * @sig generateAllStaticMethods :: (String, [String], VariantsMap) -> String
 */
const generateAllStaticMethods = (typeName, variantNames, variants) => {
    /*
     * Generate _from method assignment for a variant
     * @sig generateFromMethod :: String -> String
     */
    const generateFromMethod = vn => {
        const fullName = `${typeName}.${vn}`
        const fromCode = generateFrom('prototype', vn, fullName, variants[vn])
        return `${vn}Constructor._from = ${fromCode}`
    }

    const prototypes = variantNames.map(vn => `${vn}Constructor.prototype = ${vn}Prototype`)

    const isMethods = variantNames.map(vn => `${vn}Constructor.is = val => val && val.constructor === ${vn}Constructor`)

    const toStrings = variantNames.map(vn => `${vn}Constructor.toString = () => '${typeName}.${vn}'`)

    const _fromMethods = variantNames.map(generateFromMethod)

    const fromMethods = variantNames.map(vn => `${vn}Constructor.from = ${vn}Constructor._from`)

    return [
        prototypes.join('\n'),
        isMethods.join('\n'),
        toStrings.join('\n'),
        _fromMethods.join('\n'),
        fromMethods.join('\n'),
    ].join('\n\n')
}

/*
 * Generate constructor definition and parent assignment for a TaggedSum variant
 * @sig generateVariantConstructorDef :: (String, String, String) -> String
 */
const generateVariantConstructorDef = (typeName, variantName, constructorCode) =>
    `const ${variantName}Constructor = ${constructorCode.replace('prototype', `${variantName}Prototype`)}

        ${typeName}.${variantName} = ${variantName}Constructor`

export { generateVariantPrototype, generateAllStaticMethods, generateVariantConstructorDef }
