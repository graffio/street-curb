/*
 * Format generated code with prettier
 * @sig formatCode :: String -> String
 */
import prettier from 'prettier'

const prettierCode = async code => {
    try {
        return await prettier.format(code, {
            parser: 'babel',
            tabWidth: 4,
            singleQuote: true,
            arrowParens: 'avoid',
            printWidth: 120,
            semi: false,
        })
    } catch (error) {
        console.warn('⚠️  Prettier formatting failed:', error.message)
        return code // Return unformatted code if prettier fails
    }
}

/*
 * JSON.stringify without the clutter: no quotes around keys and spaces after the commas
 *
 *   {"num":"Number","s":"String","o":"Object","a":"Any"}  =>
 *   { num: 'Number', s: 'String', o: 'Object', a: 'Any' }
 *
 * @sig stringifyObject :: {k:v} -> String
 */
const stringifyObject = o =>
    JSON.stringify(o)
        .replace(/"([^"]*)":/g, '$1: ') // remove double-quotes from keys
        .replace(/,([^ ])/g, ', $1') // add a space after commas
        .replace(/{/g, '{ ') // add a space just inside starting braces
        .replace(/([^}])}/g, '$1 }') // add a space just inside closing braces

export { prettierCode, stringifyObject }
