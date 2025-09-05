/*
 * Infrastructure Management System - Public API
 *
 * Exports the core functionality for programmatic use.
 * For CLI usage, use the `curb-infra` command or `yarn cli`.
 *
 * This provides the clean plan/apply workflow that external systems
 * and scripts can use for infrastructure automation.
 */

import { LookupTable } from '@graffio/functional'
import { InfrastructureAdapter } from './types/index.js'

// Import adapters to register their prototype functions
import './adapters/firebase/index.js'

// Core functions
export { generatePlan } from './core/planner.js'
export { executePlan } from './core/executor.js'
export { logInfrastructureOperation } from './core/audit.js'
export { displayPlan } from './ui/display.js'
export { requireConfirmation } from './ui/confirmations.js'

/**
 * Create production adapter lookup table
 * @sig createProductionAdapters :: () -> LookupTable<InfrastructureAdapter>
 */
export const createProductionAdapters = () => {
    return LookupTable([
        InfrastructureAdapter.Firebase('firebase')
    ], InfrastructureAdapter, 'name')
}

/**
 * Convenience function for generating plans with production adapters
 * @sig plan :: (String, Object) -> Promise<Plan>
 */
export const plan = async (operation, config) => {
    const { generatePlan } = await import('./core/planner.js')
    const adapters = createProductionAdapters()
    return await generatePlan(operation, config, adapters)
}

/**
 * Convenience function for executing plans with production adapters
 * @sig apply :: (Plan) -> Promise<ExecutionResult>
 */
export const apply = async (plan) => {
    const { executePlan } = await import('./core/executor.js')
    const adapters = createProductionAdapters()
    return await executePlan(plan, adapters)
}