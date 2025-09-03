/*
 * Firebase Infrastructure Executor
 *
 * Executes Firebase-specific infrastructure operations by calling
 * the Firebase CLI. Handles authentication, error reporting, and
 * result processing.
 */

import { execSync } from 'child_process'

/**
 * Check if running in test context to avoid real Firebase operations
 * @sig isTestContext :: () -> Boolean
 */
const isTestContext = () => process.env.NODE_ENV === 'test' || 
                            process.env.TAP === '1' ||
                            process.argv.some(arg => arg.includes('tap'))

/**
 * Execute Firebase CLI command with error handling
 * @sig executeFirebaseCommand :: (String) -> String
 */
const executeFirebaseCommand = (command) => {
    if (isTestContext()) {
        console.log(`[TEST MODE] Would execute: ${command}`)
        return 'test-output'
    }
    
    try {
        return execSync(command, { 
            encoding: 'utf8',
            stdio: 'pipe'
        })
    } catch (error) {
        throw new Error(`Firebase CLI error: ${error.message}\nCommand: ${command}`)
    }
}

/**
 * Execute Firebase infrastructure step
 *
 * Executes a single Firebase infrastructure operation. Handles different
 * action types and provides consistent result format back to the executor.
 *
 * @sig executeStep :: (Step) -> Promise<StepResult>
 */
export const executeStep = async (step) => {
    let output
    
    switch (step.action) {
        case 'create-project':
            output = executeFirebaseCommand(step.command)
            return {
                status: 'success',
                output: output.trim(),
                projectId: step.projectId
            }
            
        case 'delete-project':
            output = executeFirebaseCommand(step.command)
            return {
                status: 'success',
                output: output.trim(),
                projectId: step.projectId
            }
            
        default:
            throw new Error(`Unknown Firebase action: ${step.action}`)
    }
}