/*
 * Firebase Infrastructure State Adapter
 *
 * Analyzes current Firebase project state by querying Firebase CLI.
 * Provides state information to the core planning system without
 * exposing Firebase-specific details.
 */

import { execSync } from 'child_process'

/**
 * Parse Firebase CLI project list output
 * @sig parseProjectList :: (String) -> Array<String>
 */
const parseProjectList = (output) => {
    const lines = output.split('\n')
    return lines
        .map(line => line.match(/^\s*(\S+)\s+/))
        .filter(match => match && !match[1].includes('Project') && match[1] !== '───────')
        .map(match => match[1])
}

/**
 * Get current Firebase infrastructure state
 *
 * Queries Firebase CLI to determine what projects currently exist.
 * This state is used by the planner to generate accurate plans.
 *
 * @sig getCurrentState :: () -> Promise<Object>
 */
export const getCurrentState = async () => {
    try {
        const projectListOutput = execSync('firebase projects:list', { encoding: 'utf8' })
        const existingProjects = parseProjectList(projectListOutput)
        
        return {
            existingProjects,
            timestamp: Date.now()
        }
    } catch (error) {
        throw new Error(`Failed to get Firebase state: ${error.message}`)
    }
}