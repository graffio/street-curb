/**
 * Production logger - structured JSON output for Cloud Logging
 */

import { redact } from '@graffio/cli-type-generator'
import pickAWord from './words.js'

const severityMap = { debug: 'DEBUG', info: 'INFO', log: 'INFO', warn: 'WARNING', error: 'ERROR' }

/**
 * Recursively redact all Tagged types in an object
 */
const redactObject = obj => {
    if (!obj || typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(redactObject)
    if (obj['@@tagName'] || obj['@@typeName']) return redact(obj)

    const result = {}
    for (const [key, value] of Object.entries(obj)) result[key] = redactObject(value)

    return result
}

const log = (level, message, logValues = {}) => {
    const redactedValues = redactObject(logValues)
    const entry = {
        severity: severityMap[level] || 'INFO',
        message,
        timestamp: new Date().toISOString(),
        ...redactedValues,
    }

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
