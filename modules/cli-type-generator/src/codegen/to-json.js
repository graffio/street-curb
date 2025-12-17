// ABOUTME: Code generation for toJSON methods
// ABOUTME: Generates named toJSON functions for Tagged and TaggedSum types

/*
 * Generate named toJSON function for a simple tagged type
 * @sig generateNamedToJSON :: String -> String
 */
const generateNamedToJSON = funcName => `
    /*
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
const generateNamedVariantToJSON = funcName => `
    /*
     * Convert to JSON representation with tag
     * @sig ${funcName} :: () -> Object
     */
    const ${funcName} = function () {
        return Object.assign({ '@@tagName': this['@@tagName'] }, this)
    }`

export { generateNamedToJSON, generateNamedVariantToJSON }
