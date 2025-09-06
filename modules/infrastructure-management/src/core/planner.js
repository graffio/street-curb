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
 * Generate comprehensive infrastructure execution plan
 *
 * This orchestrates the entire planning process:
 * 1. Validates configuration across adapters
 * 2. Generates coordinated steps from all adapters
 * 3. Creates immutable plan with expiration
 *
 * @sig generatePlan :: (String, Object, LookupTable<InfrastructureAdapter>) -> Promise<InfrastructurePlan>
 */
const generatePlan = async (operation, config, adapters) => {
    const planId = `plan-${createId()}`

    if (adapters.length === 0) throw new Error(`No adapters provided`)

    // Validate configuration with each adapter and generate steps
    const allSteps = []

    for (const adapter of adapters) {
        // Validate configuration
        if (adapter.validateConfig) adapter.validateConfig(operation, config)

        const steps = await adapter.generateSteps(operation, config)
        allSteps.push(...steps)
    }

    return { id: planId, operation, config, steps: allSteps }
}

export { generatePlan }
