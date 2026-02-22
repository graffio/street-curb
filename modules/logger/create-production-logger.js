// ABOUTME: Production logger factory — structured JSON output for Cloud Logging
// ABOUTME: Redacts PII from Tagged types before logging, adds flow tracking via random word IDs

import { RuntimeForGeneratedTypes } from '@graffio/cli-type-generator'
import pickAWord from './words.js'

const { redact } = RuntimeForGeneratedTypes

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    /**
     * Recursively redact all Tagged types in an object
     * @sig toRedactedValue :: Any -> Any
     */
    toRedactedValue: obj => {
        if (!obj || typeof obj !== 'object') return obj
        if (Array.isArray(obj)) return obj.map(T.toRedactedValue)
        if (obj['@@tagName'] || obj['@@typeName']) return redact(obj)

        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, T.toRedactedValue(value)]))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const severityMap = { debug: 'DEBUG', info: 'INFO', log: 'INFO', warn: 'WARNING', error: 'ERROR' }

const E = {
    /**
     * Emit a structured log entry to Cloud Logging
     * @sig emitLogEntry :: (String, String, Object) -> void
     */
    emitLogEntry: (level, message, logValues = {}) => {
        const redactedValues = T.toRedactedValue(logValues)
        const entry = {
            severity: severityMap[level] || 'INFO',
            message,
            timestamp: new Date().toISOString(),
            ...redactedValues,
        }

        const output = JSON.stringify(entry)
        const logger = console[level]
        logger(output)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Create a production logger with flow tracking
 * @sig createProductionLogger :: () -> Logger
 */
const createProductionLogger = () => {
    const fourLetterWord = pickAWord()

    // prettier-ignore
    return {
        info : (message, extraData = {}) => E.emitLogEntry('info',  message, { ...extraData, flowId: fourLetterWord }),
        warn : (message, extraData = {}) => E.emitLogEntry('warn',  message, { ...extraData, flowId: fourLetterWord }),
        error: (message, extraData = {}) => E.emitLogEntry('error', message, { ...extraData, flowId: fourLetterWord }),
    }
}

export { createProductionLogger }
