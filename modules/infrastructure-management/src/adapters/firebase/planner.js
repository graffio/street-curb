/*
 * Firebase Infrastructure Planner
 *
 * Generates Firebase-specific steps for infrastructure operations.
 * Understands Firebase project lifecycle and generates appropriate
 * commands for the Firebase CLI.
 */

/**
 * Validate configuration for Firebase operations
 * @sig validateConfig :: (String, Object, Object) -> Void
 */
export const validateConfig = (operation, config, currentState) => {
    if (operation === 'create-environment') {
        if (!config.environment) {
            throw new Error('Environment is required for Firebase project creation')
        }
        if (!config.projectName) {
            throw new Error('Project name is required for Firebase project creation')
        }
        
        const projectId = config.projectId || `curb-map-${config.environment}`
        const firebaseState = currentState.adapters.firebase
        
        if (firebaseState.existingProjects.includes(projectId)) {
            throw new Error(`Firebase project ${projectId} already exists`)
        }
    }
    
    if (operation === 'delete-environment') {
        if (!config.projectId) {
            throw new Error('Project ID is required for Firebase project deletion')
        }
        
        const firebaseState = currentState.adapters.firebase
        if (!firebaseState.existingProjects.includes(config.projectId)) {
            throw new Error(`Firebase project ${config.projectId} does not exist`)
        }
    }
}

/**
 * Generate Firebase-specific steps for environment creation
 * @sig generateCreateSteps :: (Object, Object) -> Array<Step>
 */
const generateCreateSteps = (config, currentState) => {
    const projectId = config.projectId || `curb-map-${config.environment}`
    
    return [{
        adapter: 'firebase',
        action: 'create-project',
        command: `firebase projects:create ${projectId} --display-name "${config.projectName}"`,
        rollback: `firebase projects:delete ${projectId}`,
        canRollback: true,
        description: `Create Firebase project: ${projectId}`,
        projectId
    }]
}

/**
 * Generate Firebase-specific steps for environment deletion
 * @sig generateDeleteSteps :: (Object, Object) -> Array<Step>
 */
const generateDeleteSteps = (config, currentState) => {
    return [{
        adapter: 'firebase',
        action: 'delete-project',
        command: `firebase projects:delete ${config.projectId}`,
        rollback: null,
        canRollback: false,
        description: `Delete Firebase project: ${config.projectId}`,
        projectId: config.projectId,
        warning: 'Project deletion is permanent and cannot be undone'
    }]
}

/**
 * Generate Firebase infrastructure steps for operations
 *
 * Creates Firebase-specific execution steps based on the operation type.
 * Each step includes the command to run, rollback information, and metadata.
 *
 * @sig generateSteps :: (String, Object, Object) -> Promise<Array<Step>>
 */
export const generateSteps = async (operation, config, currentState) => {
    switch (operation) {
        case 'create-environment':
            return generateCreateSteps(config, currentState)
        case 'delete-environment':
            return generateDeleteSteps(config, currentState)
        default:
            return [] // This adapter doesn't handle this operation
    }
}