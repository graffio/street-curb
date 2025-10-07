/**
 * @graffio/logger - Environment-aware structured logging with flow tracking
 *
 * Usage:
 *   import { createLogger } from '@graffio/logger'
 *
 *   const logger = createLogger('dev', getContext)
 *   logger.flowStart('Processing started', { queueItemId: '123' })
 *   logger.flowStep('Reading data', {})
 *   logger.flowStop('Processing completed', { durationMs: 45 })
 */

import { createDevLogger } from './logger-dev.js'
import { createProductionLogger } from './logger-production.js'

/**
 * Create or retrieve a logger instance
 * @sig createLogger :: (/dev|production/, F) -> Logger
 *  F = () => AsyncLocalContext
 */
const createLogger = logType => {
    const loggerCreators = { dev: createDevLogger, production: createProductionLogger }
    const logNames = Object.keys(loggerCreators)

    if (!logNames.includes(logType)) throw new Error(`Logger must be in [${logNames.join(', ')}]; found ${logType}`)

    const loggerCreator = loggerCreators[logType]
    return loggerCreator()
}

export { createLogger }
