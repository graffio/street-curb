/*
 * Google Cloud Platform State Adapter  
 *
 * Analyzes current GCP project state including enabled APIs,
 * IAM policies, and monitoring configuration. Works alongside
 * Firebase adapter for comprehensive project state.
 */

import { execSync } from 'child_process'

/**
 * Get enabled APIs for a project
 * @sig getEnabledAPIs :: (String) -> Array<String>
 */
const getEnabledAPIs = (projectId) => {
    try {
        const output = execSync(`gcloud services list --enabled --project=${projectId}`, { 
            encoding: 'utf8',
            stdio: 'pipe'
        })
        
        return output.split('\n')
            .map(line => line.split(/\s+/)[0])
            .filter(service => service && !service.includes('NAME'))
    } catch (error) {
        return []
    }
}

/**
 * Get current GCP infrastructure state
 *
 * Analyzes GCP project configuration including enabled services
 * and monitoring setup. Used by planner to determine what
 * additional GCP setup is needed.
 *
 * @sig getCurrentState :: () -> Promise<Object>
 */
export const getCurrentState = async () => {
    try {
        // Get currently configured project
        const currentProject = execSync('gcloud config get-value project', { 
            encoding: 'utf8',
            stdio: 'pipe'
        }).trim()
        
        const enabledAPIs = currentProject ? getEnabledAPIs(currentProject) : []
        
        return {
            currentProject,
            enabledAPIs,
            timestamp: Date.now()
        }
    } catch (error) {
        return {
            currentProject: null,
            enabledAPIs: [],
            error: error.message,
            timestamp: Date.now()
        }
    }
}