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

const log = (level, message, data, flowPrefix) => {
    const emoji = { debug: '🔍', info: ' ️', warn: '⚠️', error: '❌' }[level] || '📝'

    const formattedData = formatData(data)
    const prefix = flowPrefix ? `${flowPrefix} ${emoji}` : emoji
    const output = `${prefix} ${message.padEnd(40)} ${formattedData}`

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
        flowStart: (message, extraData) => {
            step = 0
            log('info', message, extraData, `${colorize.brightGreen('▶')} ${fourLetterWord}`)
        },

        flowStep: (message, extraData) => {
            step++
            log('info', message, extraData, `${step} ${fourLetterWord}`)
        },

        flowStop: (message, extraData) => {
            step = 0
            log('info', message, extraData, `${colorize.brightRed(colorize.red('■'))} ${fourLetterWord}`)
        },

        error: (message, extraData) => log('error', message, extraData, `${colorize.red('■')} ${fourLetterWord}`),
    }
}

export { createDevLogger }
