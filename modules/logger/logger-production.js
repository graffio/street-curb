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

    // prettier-ignore
    return {
        info : (message, extraData = {}) => log('info',  message, { ...extraData, flowId: fourLetterWord }),
        warn : (message, extraData = {}) => log('warn',  message, { ...extraData, flowId: fourLetterWord }),
        error: (message, extraData = {}) => log('error', message, { ...extraData, flowId: fourLetterWord }),
    }
}

export { createProductionLogger }
