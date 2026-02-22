// ABOUTME: Logger factory — selects dev or production logger based on environment
// ABOUTME: Dev logger uses console methods, production logger emits structured JSON

import { createDevLogger } from './logger-dev.js'
import { createProductionLogger } from './create-production-logger.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Create or retrieve a logger instance
 * F = () => AsyncLocalContext
 * @sig createLogger :: (/dev|production/, F) -> Logger
 */
const createLogger = logType => {
    const loggerCreators = { dev: createDevLogger, production: createProductionLogger }
    const logNames = Object.keys(loggerCreators)

    if (!logNames.includes(logType)) throw new Error(`Logger must be in [${logNames.join(', ')}]; found ${logType}`)

    const loggerCreator = loggerCreators[logType]
    return loggerCreator()
}

export { createLogger }
