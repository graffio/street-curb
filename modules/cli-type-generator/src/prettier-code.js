// ABOUTME: Code formatting utilities for generated type files
// ABOUTME: Uses prettier for JS formatting and custom utilities for comment blocks

import prettier from 'prettier'

import FieldDescriptor from './descriptors/field-descriptor.js'

/**
 * Format generated code with prettier
 * @sig prettierCode :: String -> Promise String
 */
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

/**
 * JSON.stringify without the clutter: no quotes around keys and spaces after the commas
 * @sig stringifyObject :: {k:v} -> String
 */
const stringifyObject = o =>
    JSON.stringify(o)
        .replace(/"([^"]*)":/g, '$1: ') // remove double-quotes from keys
        .replace(/,([^ ])/g, ', $1') // add a space after commas
        .replace(/{/g, '{ ') // add a space just inside starting braces
        .replace(/([^}])}/g, '$1 }') // add a space just inside closing braces

/**
 * Convert an object to a multiline JSDoc comment block
 * @sig stringifyObjectAsMultilineComment :: (Object, String, String) -> String
 */
const stringifyObjectAsMultilineComment = (o, generatedFrom, typeName) => {
    /*
     * Check if value looks like a FieldDescriptor (has baseType property)
     * @sig isFieldDescriptor :: Any -> Boolean
     */
    const isFieldDescriptor = v => v && typeof v === 'object' && typeof v.baseType === 'string'

    /*
     * Format a single field line for a comment block
     * @sig formatFieldLine :: (String, Any, Number, Number, Boolean) -> String
     */
    const formatFieldLine = (key, value, maxKeyLen, indent, isLast) => {
        /*
         * Format a value for display in a comment block
         * @sig formatValueForComment :: Any -> String
         */
        const formatValueForComment = v => {
            // Convert FieldDescriptor to concise syntax first
            if (isFieldDescriptor(v)) v = FieldDescriptor.toSyntax(v)

            if (v && v.isFieldTypesReference) return v.fullReference
            if (v instanceof RegExp) return v.toString()
            return JSON.stringify(v)
        }

        const padded = key.padEnd(maxKeyLen, ' ')
        const comma = isLast ? '' : ','
        const spacing = '    '.repeat(indent)
        return `${spacing}${padded}: ${formatValueForComment(value)}${comma}`
    }

    /*
     * Process a tagged type into comment lines
     * @sig processTagged :: () -> String
     */
    const processTagged = () => {
        const maxKeyLen = Math.max(...entries.map(([k]) => k.length))
        const fieldCount = entries.length
        const fieldLines = entries.map(([k, v], i) =>
            formatFieldLine(k, v, maxKeyLen, 1, i === fieldCount - 1).replace(/^ {2}/, ' *'),
        )
        return [link, header, ' *', ...fieldLines, footer].join('\n')
    }

    /*
     * Process a single taggedSum variant into comment lines
     * @sig processTaggedSumVariant :: [String, Object] -> String
     */
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

    // TaggedSum has variants as values (objects containing fields)
    // Tagged has FieldDescriptors as values directly
    // If any value is a FieldDescriptor, it's Tagged; if values are objects with field entries, it's TaggedSum
    const isTaggedSum =
        entries.length > 1 && entries.every(([, v]) => typeof v === 'object' && v !== null && !isFieldDescriptor(v))

    return isTaggedSum ? processTaggedSum() : processTagged()
}

export { prettierCode, stringifyObject, stringifyObjectAsMultilineComment }
