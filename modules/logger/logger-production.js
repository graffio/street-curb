/**
 * Production logger - structured JSON output for Cloud Logging
 */

import pickAWord from './words.js'

const severityMap = { debug: 'DEBUG', info: 'INFO', log: 'INFO', warn: 'WARNING', error: 'ERROR' }

const log = (level, message, logValues = {}) => {
    const entry = { severity: severityMap[level] || 'INFO', message, timestamp: new Date().toISOString(), ...logValues }

    const output = JSON.stringify(entry)
    const logger = console[level]
    logger(output)
}

const createProductionLogger = () => {
    const fourLetterWord = pickAWord()
    let step = 0

    return {
        flowStart: (message, logValues) => {
            step = 0
            log('info', message, { ...logValues, flowId: fourLetterWord, flowEvent: 'flowStart' })
        },

        flowStep: (message, logValues) => {
            step++
            log('info', message, { ...logValues, flowId: fourLetterWord, flowEvent: 'flowStep', flowStep: step })
        },

        flowStop: (message, logValues) => {
            step = 0
            log('info', message, { ...logValues, flowId: fourLetterWord, flowEvent: 'flowStop' })
        },

        error: (message, logValues) => log('error', message, { ...logValues, flowId: fourLetterWord }),
    }
}

export { createProductionLogger }
