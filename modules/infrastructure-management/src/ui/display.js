/*
 * Infrastructure Display System
 *
 * Handles all user-facing display of infrastructure plans, progress reporting,
 * and operation results. Provides consistent formatting across all adapters
 * and operations.
 *
 * This module focuses purely on presentation - it doesn't execute anything,
 * just formats and displays information provided by the core system.
 */

/**
 * Display a comprehensive infrastructure plan
 * @sig displayPlan :: (Plan) -> Void
 */
export const displayPlan = plan => {
    console.log('\n=== INFRASTRUCTURE OPERATION PLAN ===')
    console.log(`Operation: ${plan.operation.toUpperCase()}`)
    console.log(`Plan ID: ${plan.id}`)
    console.log(`Environment: ${plan.config.environment || 'unknown'}`)
    console.log(`Created: ${new Date(plan.createdAt).toISOString()}`)
    console.log(`Expires: ${new Date(plan.expiresAt).toISOString()}`)

    console.log('\n📋 Steps to execute:')
    plan.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.description}`)
        console.log(`     Adapter: ${step.adapter}`)
        console.log(`     Action: ${step.action}`)
        if (!step.canRollback) {
            console.log(`     ⚠️  Cannot rollback: ${step.warning || 'Permanent operation'}`)
        }
    })

    const dangerousSteps = plan.steps.filter(step => !step.canRollback)
    if (dangerousSteps.length > 0) {
        console.log('\n⚠️  PERMANENT OPERATIONS WARNING:')
        dangerousSteps.forEach(step => {
            console.log(`   ${step.action}: ${step.warning || 'Cannot be automatically rolled back'}`)
        })
    }
}

/**
 * Display execution progress for a single step
 * @sig displayStepProgress :: (Step, Number, Number) -> Void
 */
export const displayStepProgress = (step, current, total) => {
    console.log(`\n📋 Step ${current}/${total}: ${step.description}`)
    console.log(`🔧 Adapter: ${step.adapter}`)
    console.log(`⚡ Action: ${step.action}`)
}

/**
 * Display successful step completion
 * @sig displayStepComplete :: (Step, StepResult) -> Void
 */
export const displayStepComplete = (step, result) => {
    console.log(`✅ Completed: ${step.description}`)
    if (result.duration > 1000) {
        console.log(`⏱️  Duration: ${(result.duration / 1000).toFixed(1)}s`)
    }
}

/**
 * Display execution start banner
 * @sig displayExecutionStart :: (Plan) -> Void
 */
export const displayExecutionStart = plan => {
    console.log('\n🚀 EXECUTING INFRASTRUCTURE PLAN')
    console.log(`Plan ID: ${plan.id}`)
    console.log(`Operation: ${plan.operation}`)
    console.log(`Environment: ${plan.config.environment || 'unknown'}`)
}

/**
 * Display execution completion banner
 * @sig displayExecutionComplete :: (ExecutionResult) -> Void
 */
export const displayExecutionComplete = result => {
    console.log('\n✅ PLAN EXECUTION COMPLETED SUCCESSFULLY')
    console.log(`Total Duration: ${(result.duration / 1000).toFixed(1)}s`)
    console.log(`Steps Executed: ${result.executedSteps.length}`)
}
