/*
 * Interactive Prompts System
 *
 * Provides interactive prompts for gathering configuration information
 * from users. Handles validation and provides helpful defaults.
 *
 * Used by CLI commands that need to gather information interactively
 * rather than through command-line arguments.
 */

import { createInterface } from 'readline'

/**
 * Get user input with readline interface
 * @sig getUserInput :: (String) -> Promise<String>
 */
const getUserInput = async (prompt) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    
    const getAnswer = (resolve) => {
        rl.question(prompt, resolve)
    }
    
    const answer = await new Promise(getAnswer)
    rl.close()
    return answer.trim()
}

/**
 * Prompt for environment selection with validation
 * @sig promptEnvironment :: () -> Promise<String>
 */
export const promptEnvironment = async () => {
    const validEnvironments = ['iac-test', 'development', 'staging', 'production']
    
    console.log('\nAvailable environments:')
    validEnvironments.forEach((env, index) => {
        console.log(`  ${index + 1}. ${env}`)
    })
    
    const answer = await getUserInput('Select environment (1-4): ')
    const envIndex = parseInt(answer) - 1
    
    if (envIndex < 0 || envIndex >= validEnvironments.length) {
        throw new Error('Invalid environment selection')
    }
    
    return validEnvironments[envIndex]
}

/**
 * Prompt for project configuration
 * @sig promptProjectConfig :: (String) -> Promise<Object>
 */
export const promptProjectConfig = async (environment) => {
    const projectName = await getUserInput(`Project display name for ${environment}: `)
    const owner = await getUserInput('Project owner email: ')
    
    // Optional custom project ID
    const defaultProjectId = `curb-map-${environment}`
    const customId = await getUserInput(`Project ID (default: ${defaultProjectId}): `)
    
    return {
        environment,
        projectName,
        owner,
        projectId: customId || defaultProjectId
    }
}