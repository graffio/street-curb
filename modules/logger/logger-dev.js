/**
 * Development logger - human-readable output with flow tracking
 */
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

const formatLogValues = logValues => {
    if (!logValues || Object.keys(logValues).length === 0) return ''

    const keys = Object.keys(logValues)
    const parts = keys.map(key => `${colorize.brightBlue(key)}=${logValues[key]}`).join(' ')
    return ` [${parts}]`
}

const log = (level, message, logValues, flowPrefix) => {
    const emoji = { debug: '🔍', info: ' ️', warn: '⚠️', error: '❌' }[level] || '📝'

    const logValuesAsString = formatLogValues(logValues)
    const prefix = flowPrefix ? `${flowPrefix} ${emoji}` : emoji
    const output = `${prefix} ${message.padEnd(40)}${logValuesAsString}`

    console[level](output)
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
        flowStart: (message, logValues) => {
            step = 0
            log('info', message, logValues, `${colorize.brightGreen('▶')} ${fourLetterWord}`)
        },

        flowStep: (message, logValues) => {
            step++
            log('info', message, logValues, `${step} ${fourLetterWord}`)
        },

        flowStop: (message, logValues) => {
            step = 0
            log('info', message, logValues, `${colorize.brightRed(colorize.red('■'))} ${fourLetterWord}`)
        },

        error: (message, logValues) => log('error', message, logValues, `${colorize.red('■')} ${fourLetterWord}`),
    }
}

export { createDevLogger }
