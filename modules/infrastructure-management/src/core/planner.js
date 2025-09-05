/*
 * Infrastructure Plan Generator
 *
 * Orchestrates plan generation by coordinating multiple adapters to create
 * comprehensive execution plans. This is the "terraform plan" equivalent
 * that analyzes current state and generates step-by-step operations.
 *
 * This module doesn't know about specific infrastructure - it coordinates
 * adapters and assembles their individual plans into unified execution plans.
 */

import { createId } from '@paralleldrive/cuid2'

/**
 * Collect current state from all adapters
 * @sig collectCurrentState :: (LookupTable<InfrastructureAdapter>) -> Promise<Object>
 */
const collectCurrentState = async adapters => {
    const adapterStates = {}
    let combinedHash = ''

    for (const adapter of adapters) {
        try {
            const state = await adapter.getCurrentState()
            adapterStates[adapter.name] = state
            combinedHash += JSON.stringify(state)
        } catch (error) {
            console.warn(`Could not collect state from ${adapter.name}: ${error.message}`)
            adapterStates[adapter.name] = { error: error.message }
        }
    }

    // Simple hash of combined state
    const hash = combinedHash.length.toString(36) + combinedHash.slice(-8)

    return { adapters: adapterStates, hash, timestamp: Date.now() }
}


/**
 * Generate comprehensive infrastructure execution plan
 *
 * This orchestrates the entire planning process:
 * 1. Collects current infrastructure state from adapters
 * 2. Validates configuration across adapters
 * 3. Generates coordinated steps from all adapters
 * 4. Creates immutable plan with expiration
 *
 * @sig generatePlan :: (String, Object, LookupTable<InfrastructureAdapter>) -> Promise<Plan>
 */
const generatePlan = async (operation, config, adapters) => {
    const planId = `plan-${createId()}`
    const expiresAt = Date.now() + 15 * 60 * 1000 // 15 minutes

    if (adapters.length === 0) throw new Error(`No adapters provided`)

    // Collect current state from all adapters
    const currentState = await collectCurrentState(adapters)

    // Validate configuration with each adapter and generate steps
    const allSteps = []

    for (const adapter of adapters) {
        // Validate configuration
        if (adapter.validateConfig) adapter.validateConfig(operation, config, currentState)

        const steps = await adapter.generateSteps(operation, config, currentState)
        allSteps.push(...steps)
    }

    return {
        id: planId,
        operation,
        config,
        steps: allSteps,
        expiresAt,
        createdAt: Date.now(),
        stateHash: currentState.hash,
        expectedState: currentState.adapters, // Store expected state for drift detection
        status: 'ready',
        adapters: adapters.map(a => a.name),
    }
}

export { generatePlan }
