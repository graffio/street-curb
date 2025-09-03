/*
 * Infrastructure Plan Executor
 *
 * Executes infrastructure plans by coordinating adapter operations in the
 * correct sequence. Handles validation, progress reporting, and error recovery.
 *
 * This orchestrates execution without knowing adapter specifics - it calls
 * adapter operations and manages the overall execution lifecycle.
 */

import { logInfrastructureOperation } from './audit.js'
import { requireConfirmation } from '../ui/confirmations.js'
import { displayExecutionStart, displayStepProgress, displayStepComplete, displayExecutionComplete } from '../ui/display.js'

/**
 * Validate plan hasn't expired
 * @sig validatePlanExpiration :: (Plan) -> Void
 */
const validatePlanExpiration = (plan) => {
    if (plan.expiresAt < Date.now()) {
        throw new Error('Plan has expired - please regenerate')
    }
}

/**
 * Load adapter executors for plan execution
 * @sig loadAdapterExecutors :: (Array<String>) -> Promise<Object>
 */
const loadAdapterExecutors = async (adapterNames) => {
    const executors = {}
    
    for (const adapterName of adapterNames) {
        try {
            const adapter = await import(`../adapters/${adapterName}/executor.js`)
            executors[adapterName] = adapter.executeStep
        } catch (error) {
            throw new Error(`Failed to load ${adapterName} executor: ${error.message}`)
        }
    }
    
    return executors
}

/**
 * Execute a single infrastructure step
 * @sig executeStep :: (Object, Step) -> Promise<StepResult>
 */
const executeStep = async (executors, step) => {
    const executor = executors[step.adapter]
    if (!executor) {
        throw new Error(`No executor found for adapter: ${step.adapter}`)
    }
    
    const stepStart = Date.now()
    const result = await executor(step)
    
    return {
        ...result,
        duration: Date.now() - stepStart
    }
}

/**
 * Execute infrastructure plan with comprehensive orchestration
 *
 * This is the main execution engine that:
 * 1. Validates plan expiration and state consistency
 * 2. Requires user confirmation based on environment
 * 3. Loads all required adapter executors
 * 4. Executes steps with progress reporting
 * 5. Creates comprehensive audit log
 *
 * @sig executePlan :: (Plan) -> Promise<ExecutionResult>
 */
export const executePlan = async (plan) => {
    const executionStart = Date.now()
    
    // Validate plan is still valid
    validatePlanExpiration(plan)
    
    // Collect current state and handle drift
    const { collectCurrentState, detectDrift } = await import('./state-manager.js')
    const currentState = await collectCurrentState(plan.requiredAdapters)
    
    if (plan.stateHash !== currentState.hash) {
        console.log('\n🔄 Infrastructure state has changed since plan was generated')
        
        // Calculate what changed
        const drift = detectDrift({ adapters: plan.expectedState || {} }, currentState)
        if (drift.length > 0) {
            console.log('Changes detected:')
            drift.forEach(change => {
                console.log(`  • ${change.adapter}: ${change.type}`)
            })
        }
        
        // Auto-refresh the plan with current state
        console.log('\n🔄 Auto-refreshing plan with current infrastructure state...')
        const { generatePlan } = await import('./planner.js')
        const refreshedPlan = await generatePlan(plan.operation, plan.config)
        
        console.log(`✅ Plan refreshed: ${refreshedPlan.id}`)
        console.log('Proceeding with updated plan...')
        
        // Execute the refreshed plan (recursive call with updated state)
        return executePlan(refreshedPlan)
    }
    
    // Require user confirmation
    const environment = plan.config.environment || 'unknown'
    await requireConfirmation(plan.operation, environment, {
        warning: plan.steps.some(s => !s.canRollback) ? 'Contains permanent operations' : null,
        impact: plan.steps.length > 1 ? `Will execute ${plan.steps.length} steps` : null
    })
    
    // Load adapter executors
    const executors = await loadAdapterExecutors(plan.requiredAdapters)
    
    // Execute plan
    displayExecutionStart(plan)
    const executedSteps = []
    
    for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i]
        
        displayStepProgress(step, i + 1, plan.steps.length)
        
        const stepResult = await executeStep(executors, step)
        executedSteps.push({ step, result: stepResult, success: true })
        
        displayStepComplete(step, stepResult)
    }
    
    const result = {
        status: 'success',
        planId: plan.id,
        operation: plan.operation,
        environment,
        executedSteps,
        duration: Date.now() - executionStart,
        rollbackAttempted: false
    }
    
    // Audit log the execution
    await logInfrastructureOperation('infrastructure-execution', {
        ...result,
        operator: process.env.USER || 'unknown'
    })
    
    displayExecutionComplete(result)
    return result
}