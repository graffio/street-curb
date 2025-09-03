/*
 * Infrastructure Plan Generator
 *
 * Orchestrates plan generation by coordinating multiple adapters to create
 * comprehensive execution plans. This is the "terraform plan" equivalent
 * that analyzes current state and generates step-by-step operations.
 *
 * This module doesn't know about specific infrastructure - it coordinates
 * adapters and assembles their individual plans into unified execution plans.
 */

import { createId } from '@paralleldrive/cuid2'
import { collectCurrentState } from './state-manager.js'

/**
 * Determine which adapters are needed for a given operation
 * @sig getRequiredAdapters :: (String, Object) -> Array<String>
 */
const getRequiredAdapters = (operation, config) => {
    const adapterMap = {
        'create-environment': ['firebase', 'gcp'],
        'delete-environment': ['firebase', 'gcp'],
        'setup-monitoring': ['gcp'],
        'configure-payments': ['stripe'],
        'setup-error-tracking': ['sentry']
    }
    
    return adapterMap[operation] || []
}

/**
 * Load and validate adapter plan capabilities
 * @sig loadAdapterPlanners :: (Array<String>) -> Promise<Array<Object>>
 */
const loadAdapterPlanners = async (adapterNames) => {
    const planners = []
    
    for (const adapterName of adapterNames) {
        try {
            const adapter = await import(`../adapters/${adapterName}/planner.js`)
            planners.push({
                name: adapterName,
                generateSteps: adapter.generateSteps,
                validateConfig: adapter.validateConfig || (() => {})
            })
        } catch (error) {
            throw new Error(`Failed to load ${adapterName} adapter: ${error.message}`)
        }
    }
    
    return planners
}

/**
 * Generate comprehensive infrastructure execution plan
 *
 * This orchestrates the entire planning process:
 * 1. Determines required adapters for the operation
 * 2. Collects current infrastructure state
 * 3. Validates configuration across adapters
 * 4. Generates coordinated steps from all adapters
 * 5. Creates immutable plan with expiration
 *
 * @sig generatePlan :: (String, Object) -> Promise<Plan>
 */
export const generatePlan = async (operation, config) => {
    const planId = `plan-${createId()}`
    const expiresAt = Date.now() + (15 * 60 * 1000) // 15 minutes
    
    // Determine what adapters we need
    const requiredAdapters = getRequiredAdapters(operation, config)
    if (requiredAdapters.length === 0) {
        throw new Error(`Unknown operation: ${operation}`)
    }
    
    // Collect current state from all required adapters
    const currentState = await collectCurrentState(requiredAdapters)
    
    // Load adapter planners
    const planners = await loadAdapterPlanners(requiredAdapters)
    
    // Validate configuration with each adapter
    planners.forEach(planner => {
        planner.validateConfig(operation, config, currentState)
    })
    
    // Generate steps from all adapters
    const allSteps = []
    for (const planner of planners) {
        const steps = await planner.generateSteps(operation, config, currentState)
        allSteps.push(...steps)
    }
    
    return {
        id: planId,
        operation,
        config,
        steps: allSteps,
        expiresAt,
        createdAt: Date.now(),
        stateHash: currentState.hash,
        expectedState: currentState.adapters, // Store expected state for drift detection
        status: 'ready',
        requiredAdapters
    }
}