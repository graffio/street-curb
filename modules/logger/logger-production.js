// ABOUTME: Re-export wrapper for backward compatibility during migration
// ABOUTME: Delegates to create-production-logger.js — delete this file after migration

import { createProductionLogger } from './create-production-logger.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const LoggerProduction = createProductionLogger

export { LoggerProduction }
