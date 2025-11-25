/**
 * Development logger - human-readable output with flow tracking
 */
import isObject from '@graffio/functional/src/ramda-like/internal/is-object.js'

const effect = v => `\x1b[` + v + `m`
const reset = `\x1b[0m`

// prettier-ignore
const colorize = {
    // Standard colors (30-37)
   black         : s => effect(30) + s + reset,
   red           : s => effect(31) + s + reset,
   green         : s => effect(32) + s + reset,
   yellow        : s => effect(33) + s + reset,
   blue          : s => effect(34) + s + reset,
   magenta       : s => effect(35) + s + reset,
   cyan          : s => effect(36) + s + reset,
   white         : s => effect(37) + s + reset,
   
   // Bright/bold colors (90-97)
   brightBlack   : s => effect(90) + s + reset,  // Gray
   brightRed     : s => effect(91) + s + reset,
   brightGreen   : s => effect(92) + s + reset,
   brightYellow  : s => effect(93) + s + reset,
   brightBlue    : s => effect(94) + s + reset,
   brightMagenta : s => effect(95) + s + reset,
   brightCyan    : s => effect(96) + s + reset,
   brightWhite   : s => effect(97) + s + reset,
   
   // Styles: eg. colorize.underline(colorize.red('■'))
   bold          : s => effect(1)  + s + reset,
   dim           : s => effect(2)  + s + reset,
   italic        : s => effect(3)  + s + reset,
   underline     : s => effect(4)  + s + reset,
}

const formatData = data => {
    const logKey = (value, key) => (isObject(value) ? colorize.brightRed(key) : colorize.brightBlue(key))
    const logValue = value => (isObject(value) ? formatData(value) : value)
    const logEntry = ([key, value]) => `${logKey(value, key)}=${logValue(value)}`

    if (!data || Object.keys(data).length === 0) return ''
    const parts = Object.entries(data).map(logEntry).join(' ')
    return `[${parts}]`
}

/**
 * Strip ANSI color codes to calculate actual display length
 */

// eslint-disable-next-line no-control-regex
const stripAnsi = str => str.replace(/\x1b\[\d+m/g, '')

/**
 * Wrap text at maxWidth, breaking at spaces when possible
 * Returns array of lines
 */
const wrapText = (text, maxWidth, indent) => {
    if (stripAnsi(text).length <= maxWidth) return [text]

    const lines = []
    let currentLine = ''
    let currentLength = 0

    // Split by spaces but keep track of the actual parts (with ANSI codes)
    const parts = text.split(' ')

    const wrapPart = part => {
        const partLength = stripAnsi(part).length

        // Would this overflow the current line?
        if (currentLength > 0 && currentLength + 1 + partLength > maxWidth) {
            lines.push(currentLine)
            currentLine = ' '.repeat(indent) + part
            currentLength = indent + partLength
            return
        }

        // Determine prefix: nothing (first line start), space (same line), or indent (continuation line start)
        let prefix = ''
        if (currentLength > 0) prefix = ' '
        else if (lines.length > 0) prefix = ' '.repeat(indent) // continuation line

        currentLine += prefix + part
        currentLength += prefix.length + partLength
    }

    parts.forEach(wrapPart)

    if (currentLine) lines.push(currentLine)

    return lines
}

const ACTION_STRING_LENGTH = 25
const log = (level, message, extraData, maxLineLength = 300) => {
    // prettier-ignore
    const formatMessage = s => {
        if (level === 'debug') return colorize.green(       '🔍 ' + s.padEnd(ACTION_STRING_LENGTH    ))
        if (level === 'info')  return colorize.brightGreen(         s.padEnd(ACTION_STRING_LENGTH + 2))
        if (level === 'warn')  return colorize.brightYellow('⚠️ ' + s.padEnd(ACTION_STRING_LENGTH    ))
    }

    const firstLine = `${formatMessage(message)} ${formatData(extraData)}`

    // Wrap if the line is too long
    const wrappedLines = wrapText(firstLine, maxLineLength, ACTION_STRING_LENGTH + 4)

    console[level](wrappedLines.join('\n'))
}

const logError = (error, extraData, maxLineLength = 200) => {
    const formattedData = wrapText(formatData(extraData), maxLineLength, 5)
    console.error(`\n❌ ${error.stack}\n\n    ${formattedData.join('\n')}\n`)
}

/*
 *
 * @sig createDevLogger :: F -> Logger
 *  F = () -> Any
 */
// prettier-ignore
const createDevLogger = () => ({
    debug: (message, extraData = {}) => log('debug', message, extraData),
    info:  (message, extraData = {}) => log('info',  message, extraData),
    warn:  (message, extraData = {}) => log('warn',  message, extraData),
    error: (error,   extraData = {}) => logError(    error,   extraData),
})

export { createDevLogger }
