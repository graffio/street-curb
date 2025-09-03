/*
 * Infrastructure State Management
 *
 * Analyzes current infrastructure state across all adapters to provide
 * a unified view for plan generation. Detects drift, validates prerequisites,
 * and ensures plans are generated against accurate current state.
 *
 * This orchestrates state collection from all adapters without knowing
 * the specifics of each infrastructure type.
 */

/**
 * Generate hash for drift detection
 * @sig generateStateHash :: (Object) -> String
 */
const generateStateHash = (state) => JSON.stringify(state, null, 0)

/**
 * Collect current state from all relevant adapters
 * @sig collectCurrentState :: (Array<String>) -> Promise<Object>
 */
export const collectCurrentState = async (adapterNames) => {
    const state = {
        timestamp: Date.now(),
        adapters: {}
    }
    
    // Dynamic import of adapters based on what's needed
    for (const adapterName of adapterNames) {
        try {
            const adapter = await import(`../adapters/${adapterName}/state.js`)
            state.adapters[adapterName] = await adapter.getCurrentState()
        } catch (error) {
            console.warn(`Could not collect state from ${adapterName}: ${error.message}`)
            state.adapters[adapterName] = { error: error.message }
        }
    }
    
    state.hash = generateStateHash(state.adapters)
    return state
}


/**
 * Detect infrastructure drift by comparing expected vs actual state
 * @sig detectDrift :: (Object, Object) -> Array<Object>
 */
export const detectDrift = (expectedState, actualState) => {
    const driftItems = []
    
    // Handle case where expectedState might not have adapters property
    const expectedAdapters = expectedState.adapters || {}
    const actualAdapters = actualState.adapters || {}
    
    // Check all adapters that existed in expected state
    Object.keys(expectedAdapters).forEach(adapterName => {
        const expected = expectedAdapters[adapterName]
        const actual = actualAdapters[adapterName]
        
        if (!actual) {
            driftItems.push({
                adapter: adapterName,
                type: 'adapter-disappeared',
                description: `${adapterName} adapter no longer available`
            })
        } else if (JSON.stringify(expected) !== JSON.stringify(actual)) {
            // Detect specific changes for Firebase
            if (adapterName === 'firebase' && expected.existingProjects && actual.existingProjects) {
                const expectedProjects = new Set(expected.existingProjects)
                const actualProjects = new Set(actual.existingProjects)
                
                const added = [...actualProjects].filter(p => !expectedProjects.has(p))
                const removed = [...expectedProjects].filter(p => !actualProjects.has(p))
                
                if (added.length > 0) {
                    driftItems.push({
                        adapter: adapterName,
                        type: 'projects-added',
                        description: `Projects added: ${added.join(', ')}`
                    })
                }
                if (removed.length > 0) {
                    driftItems.push({
                        adapter: adapterName,
                        type: 'projects-removed', 
                        description: `Projects removed: ${removed.join(', ')}`
                    })
                }
            } else {
                driftItems.push({
                    adapter: adapterName,
                    type: 'state-changed',
                    description: `${adapterName} configuration changed`
                })
            }
        }
    })
    
    // Check for new adapters
    Object.keys(actualAdapters).forEach(adapterName => {
        if (!expectedAdapters[adapterName]) {
            driftItems.push({
                adapter: adapterName,
                type: 'adapter-appeared',
                description: `${adapterName} adapter newly available`
            })
        }
    })
    
    return driftItems
}