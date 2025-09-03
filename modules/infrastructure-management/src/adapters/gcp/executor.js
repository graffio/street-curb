/*
 * Google Cloud Platform Executor
 *
 * Executes GCP-specific infrastructure operations using gcloud CLI.
 * Handles authentication, project context switching, and error reporting.
 */

import { execSync } from 'child_process'

/**
 * Check if running in test context to avoid real GCP operations
 * @sig isTestContext :: () -> Boolean
 */
const isTestContext = () => process.env.NODE_ENV === 'test' || 
                            process.env.TAP === '1' ||
                            process.argv.some(arg => arg.includes('tap'))

/**
 * Execute gcloud command with error handling
 * @sig executeGCloudCommand :: (String) -> String
 */
const executeGCloudCommand = (command) => {
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
        throw new Error(`GCloud CLI error: ${error.message}\nCommand: ${command}`)
    }
}

/**
 * Execute GCP infrastructure step
 *
 * Executes a single GCP infrastructure operation. Handles different
 * action types and provides consistent result format back to the executor.
 *
 * @sig executeStep :: (Step) -> Promise<StepResult>
 */
export const executeStep = async (step) => {
    let output
    
    switch (step.action) {
        case 'enable-apis':
            output = executeGCloudCommand(step.command)
            return {
                status: 'success',
                output: output.trim(),
                projectId: step.projectId
            }
            
        case 'enable-audit-logging':
            output = executeGCloudCommand(step.command)
            return {
                status: 'success',
                output: output.trim(),
                projectId: step.projectId
            }
            
        default:
            throw new Error(`Unknown GCP action: ${step.action}`)
    }
}