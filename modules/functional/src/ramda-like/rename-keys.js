/*
 * Transform an object using a strategy defined by "replacements." For example, given:
 *
 *    replacements = {             o = {              output = {
 *      a: 'x',                      a: 1,    ====>     x: 1,
 *      b: ['y', o => o.b + 3]       b: 2,    ====>     y: 5,
 *                                   c: 3               c: 3,
 *    }                            }                  }
 *
 *
 * The output is { x: 1, y: 5, c: 3 }, because
 *
 *   'a' is transformed to 'x' by the simple replacement a: 'x'
 *   'b' is transformed to 'y' with a value defined by calling the function o => o.b + 3 on o
 *   'c' is just copied to the output since there is no 'c' key in replacements
 */
const renameKeys = (replacements, o) => {
    const result = {}

    for (const k in o)
        if (Array.isArray(replacements[k])) {
            const [replacementKey, f] = replacements[k]
            result[replacementKey] = f(o)
        } else {
            const replacementKey = replacements[k] || k
            result[replacementKey] = o[k]
        }

    return result
}

export default renameKeys
