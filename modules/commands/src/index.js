/*
 * Infrastructure Orchestration System - Public API
 *
 * Exports the core functionality for programmatic use.
 * For CLI usage, use the `curb-infra` command or `yarn cli`.
 *
 * This provides vanilla command execution with audit logging.
 */

// Core vanilla command functions
export { executeCommands, rollbackCommands, executePlan } from './core/executor.js'

// Optional utility functions (if they exist)
// export { logInfrastructureOperation } from './core/audit.js'
// export { displayPlan } from './ui/display.js'
// export { requireConfirmation } from './ui/confirmations.js'
