/*
 * Infrastructure Plan Executor
 *
 * Executes infrastructure plans by coordinating adapter operations in the
 * correct sequence. Handles validation, progress reporting, and error recovery.
 *
 * This orchestrates execution without knowing adapter specifics - it calls
 * adapter operations and manages the overall execution lifecycle.
 */

import { InfrastructureStep } from '../types/index.js'
import { requireConfirmation } from '../ui/confirmations.js'
import {
    displayExecutionComplete,
    displayExecutionStart,
    displayStepComplete,
    displayStepProgress,
} from '../ui/display.js'
import { logInfrastructureOperation } from './audit.js'

/**
 * Execute a command (execute or rollback) for a single infrastructure step
 * @sig executeCommand :: (LookupTable<InfrastructureAdapter>, Step, Bool, StepResult?) -> Promise<ExecutionResult>
 */
const executeCommand = async (adapters, step, forwardResult) => {
    const isRollback = !!forwardResult

    const { canRollback, adapter, action } = step

    // Check rollback eligibility first for rollback commands
    if (isRollback && !canRollback) return { step, skipped: true, reason: 'not rollbackable' }

    const command = InfrastructureStep.commands[adapter]?.[action]
    if (!command) throw new Error(`No command found for ${adapter}/${action}`)

    const f = isRollback ? command.rollback : command.execute
    if (!f) throw new Error(`No ${isRollback ? 'rollback' : 'execute'} function found for ${adapter}/${action}`)

    const stepStart = Date.now()
    const stepResult = await f(step, forwardResult, { adapters })
    const executionTime = Date.now() - stepStart

    return { step, result: { ...stepResult, executionTime }, success: true }
}

/**
 * Execute infrastructure steps (core execution logic)
 * @sig executeSteps :: (Array<Step>, LookupTable<InfrastructureAdapter>) -> Promise<Array<ExecutionResult>>
 */
const executeSteps = async (steps, adapters) => {
    const result = []

    // for..of will *wait* for the await; map wouldn't
    for (const step of steps) {
        try {
            const executionResult = await executeCommand(adapters, step)
            result.push(executionResult)
        } catch (error) {
            // Record the failure and stop execution, but return results so far
            result.push({ step, success: false, error: error.message })
            break
        }
    }

    return result
}

/**
 * Rollback executed steps in reverse order
 * @sig rollbackSteps :: (Array<ExecutionResult>, LookupTable<InfrastructureAdapter>) -> Promise<Array<StepResult>>
 */
const rollbackSteps = async (executionResults, adapters) => {
    const result = []

    // Rollback in reverse order
    const reversedSteps = executionResults.reverse()
    for (const executionResult of reversedSteps) {
        try {
            const { step, result: forwardResult } = executionResult
            const rollbackResult = await executeCommand(adapters, step, forwardResult)
            result.push(rollbackResult)

            // If step was skipped (not rollbackable), fail-fast
            if (rollbackResult.skipped) break
        } catch (error) {
            result.push({ step: executionResult.step, success: false, error: error.message })
            break
        }
    }

    return result
}

const defaultDependencies = {
    requireConfirmation,
    display: { displayExecutionStart, displayStepProgress, displayStepComplete, displayExecutionComplete },
    audit: logInfrastructureOperation,
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
const executePlan = async (plan, adapters, dependencies = defaultDependencies) => {
    const executeStep = async i => {
        const step = plan.steps[i]
        display.displayStepProgress(step, i + 1, plan.steps.length)

        try {
            const stepResult = await executeCommand(adapters, step)
            executionResults.push({ step, result: stepResult, success: true })
            display.displayStepComplete(step, stepResult)
        } catch (error) {
            // Record the failure and attempt rollback
            executionResults.push({ step, success: false, error: error.message })
            rollbackAttempted = true
            rollbackResults = await rollbackSteps(executionResults.slice(0, -1), adapters) // Don't rollback the failed step

            // Throw a special error that contains the failure result
            const failureResult = {
                status: 'failed',
                planId: plan.id,
                operation: plan.operation,
                environment,
                executedSteps: executionResults,
                rollbackResults,
                rollbackAttempted,
                error: error.message,
                duration: Date.now() - executionStart,
            }

            const executionError = new Error('Step execution failed')
            executionError.failure = failureResult
            throw executionError
        }
    }

    const { requireConfirmation, display, audit } = dependencies

    const executionStart = Date.now()

    // Validate plan is still valid
    if (plan.expiresAt < Date.now()) throw new Error('Plan has expired - please regenerate')

    // TODO: Implement drift detection in future phase

    // Require user confirmation
    const environment = plan.config.environment || 'unknown'
    await requireConfirmation(plan.operation, environment, {
        warning: plan.steps.some(s => !s.canRollback) ? 'Contains permanent operations' : null,
        impact: plan.steps.length > 1 ? `Will execute ${plan.steps.length} steps` : null,
    })

    // Execute plan with progress reporting
    display.displayExecutionStart(plan)

    const executionResults = []
    let rollbackResults = []
    let rollbackAttempted = false
    const operator = process.env.USER || 'unknown'

    // Execute all steps with progress reporting
    try {
        for (let i = 0; i < plan.steps.length; i++) await executeStep(i)
    } catch (e) {
        if (e.failure) {
            await audit('infrastructure-execution', { ...e.failure, operator })
            return e.failure
        }

        throw e // Re-throw if it's not our special error
    }

    const success = {
        status: 'success',
        planId: plan.id,
        operation: plan.operation,
        environment,
        executedSteps: executionResults,
        rollbackResults,
        rollbackAttempted,
        duration: Date.now() - executionStart,
    }

    // Audit log the execution
    await audit('infrastructure-execution', { ...success, operator })
    display.displayExecutionComplete(success)
    return success
}

export { executeSteps, rollbackSteps, executePlan }
