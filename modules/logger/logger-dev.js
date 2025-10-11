/**
 * Development logger - human-readable output with flow tracking
 */
import isObject from '@graffio/functional/src/ramda-like/internal/is-object.js'
import pickAWord from './words.js'

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
    const logValue = value => (isObject(value) ? formatData(value) : value)
    const logEntry = ([key, value]) => `${colorize.brightBlue(key)}=${logValue(value)}`

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

const log = (level, message, data, flowPrefix, maxLineLength = 300) => {
    const emoji = { debug: '🔍', info: ' ️', warn: '⚠️', error: '❌' }[level] || '📝'

    const formattedData = formatData(data)
    const prefix = flowPrefix ? `${flowPrefix} ${emoji}` : emoji
    const messagePadded = message.padEnd(40)
    const firstLine = `${prefix} ${messagePadded} ${formattedData}`

    // Calculate the indentation for continuation lines (align with data section)
    const indent = stripAnsi(prefix).length + 1 + 40 + 1

    // Wrap if the line is too long
    const wrappedLines = wrapText(firstLine, maxLineLength, indent)

    console[level](wrappedLines.join('\n'))
}

const logError = (error, extraData, flowPrefix) => {
    const formattedData = formatData(extraData)
    console.error(`${flowPrefix} ❌ ${error.stack}\n\n    ${formattedData}`)
}

/*
 *
 * @sig createDevLogger :: F -> Logger
 *  F = () -> Any
 */
const createDevLogger = () => {
    const fourLetterWord = pickAWord()
    let step = 0

    return {
        flowStart: (message, extraData = {}) => {
            step = 0
            log('info', message, extraData, `${colorize.brightGreen('▶')} ${fourLetterWord}`)
        },

        flowStep: (message, extraData = {}) => {
            step++
            log('info', message, extraData, `${step} ${fourLetterWord}`)
        },

        flowStop: (message, extraData = {}) => {
            step = 0
            log('info', message, extraData, `${colorize.brightRed(colorize.red('■'))} ${fourLetterWord}`)
        },

        error: (error, extraData) => logError(error, extraData, `${colorize.red('■')} ${fourLetterWord}`),
    }
}

export { createDevLogger }
