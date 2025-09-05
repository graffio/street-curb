/*
 * Infrastructure Plan Executor
 *
 * Executes infrastructure plans by coordinating adapter operations in the
 * correct sequence. Handles validation, progress reporting, and error recovery.
 *
 * This orchestrates execution without knowing adapter specifics - it calls
 * adapter operations and manages the overall execution lifecycle.
 */

import { requireConfirmation } from '../ui/confirmations.js'
import {
    displayExecutionComplete,
    displayExecutionStart,
    displayStepComplete,
    displayStepProgress,
} from '../ui/display.js'
import { logInfrastructureOperation } from './audit.js'

/**
 * Execute a single infrastructure step
 * @sig executeStep :: (LookupTable<InfrastructureAdapter>, Step) -> Promise<StepResult>
 */
const executeStep = async (adapters, step) => {
    const adapter = adapters[step.adapter]
    if (!adapter) throw new Error(`No adapter found: ${step.adapter}`)

    const stepStart = Date.now()
    const result = await adapter.executeStep(step)
    const executionTime = Date.now() - stepStart

    return { ...result, executionTime }
}

/**
 * Execute infrastructure steps (core execution logic)
 * @sig executeSteps :: (Array<Step>, LookupTable<InfrastructureAdapter>) -> Promise<Array<ExecutedStep>>
 */
const executeSteps = async (steps, adapters) => {
    const result = []

    // for..of will *wait* for the await; map wouldn't
    for (const step of steps) {
        try {
            const stepResult = await executeStep(adapters, step)
            result.push({ step, result: stepResult, success: true })
        } catch (error) {
            // Record the failure and stop execution, but return results so far
            result.push({ step, success: false, error: error.message })
            break
        }
    }

    return result
}

/**
 * Rollback a single executed step
 * @sig rollbackStep :: (LookupTable<InfrastructureAdapter>, ExecutedStep) -> Promise<RollbackResult>
 */
const rollbackStep = async (adapters, executedStep) => {
    const { step } = executedStep

    if (!step.canRollback || !step.rollback) return { step, skipped: true, reason: 'not rollbackable' }

    const adapter = adapters[step.adapter]
    if (!adapter || !adapter.executeStep) throw new Error(`No adapter found: ${step.adapter}`)

    // Create rollback step
    const rollbackStepDef = {
        ...step,
        command: step.rollback,
        action: `rollback-${step.action}`,
        description: `Rollback: ${step.description}`,
    }

    const stepResult = await adapter.executeStep(rollbackStepDef)
    return { step, result: stepResult, success: true }
}

/**
 * Rollback executed steps in reverse order
 * @sig rollbackSteps :: (Array<ExecutedStep>, LookupTable<InfrastructureAdapter>) -> Promise<Array<RollbackResult>>
 */
export const rollbackSteps = async (executedSteps, adapters) => {
    const result = []

    // Rollback in reverse order
    const reversedSteps = executedSteps.reverse()
    for (const executedStep of reversedSteps) {
        try {
            const rollbackResult = await rollbackStep(adapters, executedStep)
            result.push(rollbackResult)

            // If step was skipped (not rollbackable), fail-fast
            if (rollbackResult.skipped) break
        } catch (error) {
            result.push({ step: executedStep.step, success: false, error: error.message })
            break
        }
    }

    return result
}

/**
 * Execute infrastructure plan with comprehensive orchestration
 *
 * This is the main execution engine that:
 * 1. Validates plan expiration and state consistency
 * 2. Requires user confirmation based on environment
 * 3. Executes steps with progress reporting
 * 4. Creates comprehensive audit log
 *
 * @sig executePlan :: (Plan, LookupTable<InfrastructureAdapter>, Object?) -> Promise<ExecutionResult>
 */
export const executePlan = async (plan, adapters, dependencies = {}) => {
    const {
        requireConfirmation: confirmFn = requireConfirmation,
        display = { displayExecutionStart, displayStepProgress, displayStepComplete, displayExecutionComplete },
        audit = logInfrastructureOperation,
    } = dependencies

    const executionStart = Date.now()

    // Validate plan is still valid
    if (plan.expiresAt < Date.now()) throw new Error('Plan has expired - please regenerate')

    // TODO: Implement drift detection in future phase

    // Require user confirmation
    const environment = plan.config.environment || 'unknown'
    await confirmFn(plan.operation, environment, {
        warning: plan.steps.some(s => !s.canRollback) ? 'Contains permanent operations' : null,
        impact: plan.steps.length > 1 ? `Will execute ${plan.steps.length} steps` : null,
    })

    // Execute plan with progress reporting
    display.displayExecutionStart(plan)

    const executedSteps = []
    let rollbackResults = []
    let rollbackAttempted = false

    // Execute all steps with progress reporting
    for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i]
        display.displayStepProgress(step, i + 1, plan.steps.length)

        try {
            const stepResult = await executeStep(adapters, step)
            executedSteps.push({ step, result: stepResult, success: true })
            display.displayStepComplete(step, stepResult)
        } catch (error) {
            // Record the failure and attempt rollback
            executedSteps.push({ step, success: false, error: error.message })
            rollbackAttempted = true
            rollbackResults = await rollbackSteps(executedSteps.slice(0, -1), adapters) // Don't rollback the failed step

            const result = {
                status: 'failed',
                planId: plan.id,
                operation: plan.operation,
                environment,
                executedSteps,
                rollbackResults,
                rollbackAttempted,
                error: error.message,
                duration: Date.now() - executionStart,
            }

            // Audit log the failure
            await audit('infrastructure-execution', { ...result, operator: process.env.USER || 'unknown' })

            throw error
        }
    }

    const result = {
        status: 'success',
        planId: plan.id,
        operation: plan.operation,
        environment,
        executedSteps,
        rollbackResults,
        rollbackAttempted,
        duration: Date.now() - executionStart,
    }

    // Audit log the execution
    await audit('infrastructure-execution', { ...result, operator: process.env.USER || 'unknown' })

    display.displayExecutionComplete(result)
    return result
}

export { executeSteps }
