/*
 * Google Cloud Platform Planner
 *
 * Generates GCP-specific steps for infrastructure operations.
 * Handles API enablement, monitoring setup, and production-specific
 * configurations like audit logging.
 */

/**
 * Validate GCP configuration for operations
 * @sig validateConfig :: (String, Object, Object) -> Void
 */
export const validateConfig = (operation, config, currentState) => {
    if (operation === 'create-environment') {
        const projectId = config.projectId || `curb-map-${config.environment}`
        
        // Ensure we have the Firebase project that GCP will extend
        const firebaseState = currentState.adapters.firebase
        if (!firebaseState.existingProjects.includes(projectId)) {
            throw new Error(`GCP setup requires Firebase project ${projectId} to exist first`)
        }
    }
}

/**
 * Generate GCP steps for environment creation
 * @sig generateCreateSteps :: (Object, Object) -> Array<Step>
 */
const generateCreateSteps = (config, currentState) => {
    const projectId = config.projectId || `curb-map-${config.environment}`
    const steps = []
    
    // Enable required APIs
    steps.push({
        adapter: 'gcp',
        action: 'enable-apis',
        command: `gcloud services enable firebase.googleapis.com firestore.googleapis.com --project=${projectId}`,
        rollback: null, // API disabling is not typically needed/safe
        canRollback: false,
        description: `Enable Firebase APIs for ${projectId}`,
        projectId
    })
    
    // Production environments get audit logging
    if (config.environment === 'production') {
        steps.push({
            adapter: 'gcp',
            action: 'enable-audit-logging',
            command: `gcloud logging sinks create firebase-audit-sink --project=${projectId}`,
            rollback: `gcloud logging sinks delete firebase-audit-sink --project=${projectId}`,
            canRollback: true,
            description: 'Enable comprehensive audit logging for production',
            projectId
        })
    }
    
    return steps
}

/**
 * Generate GCP infrastructure steps for operations
 *
 * Creates GCP-specific steps that complement Firebase project setup.
 * Focuses on API enablement, monitoring, and compliance features.
 *
 * @sig generateSteps :: (String, Object, Object) -> Promise<Array<Step>>
 */
export const generateSteps = async (operation, config, currentState) => {
    switch (operation) {
        case 'create-environment':
            return generateCreateSteps(config, currentState)
        case 'delete-environment':
            // GCP resources are typically cleaned up when Firebase project is deleted
            return []
        default:
            return []
    }
}