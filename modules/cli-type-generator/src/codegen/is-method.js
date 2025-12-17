// ABOUTME: Code generation for is() type-checking methods
// ABOUTME: Generates is methods for TaggedSum types with variant detection

/*
 * Generate is method for TaggedSum - uses destructuring if 3+ variants
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

export { generateIsMethod }
