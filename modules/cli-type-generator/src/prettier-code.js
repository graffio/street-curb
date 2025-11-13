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

const formatValueForComment = v => {
    if (v && v.__fieldTypesReference) return v.fullReference
    if (v instanceof RegExp) return v.toString()
    return JSON.stringify(v)
}

const formatFieldLine = (key, value, maxKeyLen, indent, isLast) => {
    const padded = key.padEnd(maxKeyLen, ' ')
    const comma = isLast ? '' : ','
    const spacing = '    '.repeat(indent)
    return `${spacing}${padded}: ${formatValueForComment(value)}${comma}`
}

const stringifyObjectAsMultilineComment = (o, generatedFrom, typeName) => {
    const processTagged = () => {
        const maxKeyLen = Math.max(...entries.map(([k]) => k.length))
        const fieldCount = entries.length
        const fieldLines = entries.map(([k, v], i) =>
            formatFieldLine(k, v, maxKeyLen, 1, i === fieldCount - 1).replace(/^ {2}/, ' *'),
        )
        return [link, header, ' *', ...fieldLines, footer].join('\n')
    }

    const processTaggedSumVariant = ([variantName, fields]) => {
        const fieldEntries = Object.entries(fields)
        const fieldCount = fieldEntries.length
        const maxKeyLen = Math.max(...fieldEntries.map(([k]) => k.length))
        const fieldLines = fieldEntries.map(([k, v], i) =>
            formatFieldLine(k, v, maxKeyLen, 2, i === fieldCount - 1).replace(/^ {2}/, ' *'),
        )
        return [` *  ${variantName}`, ...fieldLines].join('\n')
    }

    const processTaggedSum = () => [header, ' *', ...entries.map(processTaggedSumVariant), footer].join('\n')

    const entries = Object.entries(o)

    const link = `/** {@link module:${typeName}} */`
    const header = `/*  ${typeName} generated from: ${generatedFrom.replace(/.*modules/, 'modules')}`
    const footer = ' *\n*/'

    return entries.length > 1 && entries.every(([k, v]) => typeof v === 'object' && v !== null)
        ? processTaggedSum()
        : processTagged()
}

export { prettierCode, stringifyObject, stringifyObjectAsMultilineComment }
