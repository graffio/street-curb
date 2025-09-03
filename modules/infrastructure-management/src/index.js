/*
 * Infrastructure Management System - Public API
 *
 * Exports the core functionality for programmatic use.
 * For CLI usage, use the `curb-infra` command or `yarn cli`.
 *
 * This provides the clean plan/apply workflow that external systems
 * and scripts can use for infrastructure automation.
 */

export { generatePlan } from './core/planner.js'
export { executePlan } from './core/executor.js'
export { logInfrastructureOperation } from './core/audit.js'
export { displayPlan } from './ui/display.js'
export { requireConfirmation } from './ui/confirmations.js'