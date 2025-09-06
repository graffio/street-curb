import { LookupTable } from '@graffio/functional'
import tap from 'tap'
import { executePlan, executeSteps, rollbackSteps } from '../src/core/executor.js'
import { generatePlan } from '../src/index.js'
import { InfrastructureAdapter, InfrastructureStep } from '../src/types/index.js'

// Function registry for test commands
InfrastructureStep.commands = {
    alice: {
        'test-operation': {
            execute: async (step, context) => ({
                status: 'success',
                output: `Alice executed ${step.action}`,
                duration: 30,
            }),
            rollback: async (step, forwardResult, context) => ({
                status: 'success',
                output: `Alice rolled back ${step.action}`,
                duration: 30,
            }),
        },
    },
    bob: {
        'bob-operation': {
            execute: async (step, context) => ({
                status: 'success',
                output: `Bob executed ${step.action}`,
                duration: 75,
            }),
            rollback: async (step, forwardResult, context) => {
                throw new Error('Bob operations cannot be rolled back')
            },
        },
    },
}

InfrastructureAdapter.Alice.prototype.verifyConfig = config => {}
InfrastructureAdapter.Alice.prototype.generateSteps = async (operation, config, currentState) => [
    InfrastructureStep.from({
        adapter: 'alice',
        action: 'test-operation',
        description: `Alice test: ${operation}`,
        canRollback: true,
    }),
]

// Add Bob adapter prototype functions
InfrastructureAdapter.Bob.prototype.verifyConfig = config => {}
InfrastructureAdapter.Bob.prototype.generateSteps = async (operation, config, currentState) => [
    InfrastructureStep.from({
        adapter: 'bob',
        action: 'bob-operation',
        description: `Bob handles: ${operation}`,
        canRollback: false,
    }),
]

// Phase 1: Test adapter injection mechanism
tap.test('Given adapter injection', async t => {
    await t.test('When calling generatePlan with alice adapter for create-environment', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        const config = { environment: 'iac-test', projectName: 'Test Project' }
        const plan = await generatePlan('create-environment', config, testAdapters)

        // Validate plan structure
        t.ok(plan.id, 'Plan has ID')
        t.match(plan.id, /^plan-/, 'Plan ID has correct prefix')
        t.equal(plan.operation, 'create-environment', 'Plan has correct operation')
        t.same(plan.config, config, 'Plan has correct config')
        t.equal(plan.status, 'ready', 'Plan status is ready')
        t.ok(plan.expiresAt > Date.now(), 'Plan has future expiration')
        t.ok(plan.createdAt <= Date.now(), 'Plan creation time is reasonable')
        t.equal(plan.adapters.length, 1, 'Plan references 1 adapter')
        t.equal(plan.adapters[0], 'alice', 'Plan references alice adapter')

        // Validate steps generated
        t.equal(plan.steps.length, 1, 'Plan has 1 step')
        const step = plan.steps[0]
        t.equal(step.adapter, 'alice', 'Step uses alice adapter')
        t.equal(step.action, 'test-operation', 'Step has correct action')
        t.equal(step.description, 'Alice test: create-environment', 'Step description includes operation')
        t.equal(step.canRollback, true, 'Step is rollbackable')
        // Command functions are tested via execution, not as string fields
    })

    await t.test('When calling generatePlan with alice adapter for delete-environment', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')
        const deleteConfig = { environment: 'test-env', projectId: 'test-project' }

        const plan = await generatePlan('delete-environment', deleteConfig, testAdapters)

        // Validate operation-specific differences
        t.equal(plan.operation, 'delete-environment', 'Plan has correct operation')
        t.same(plan.config, deleteConfig, 'Plan has correct config')

        const step = plan.steps[0]
        t.equal(step.description, 'Alice test: delete-environment', 'Step description reflects different operation')
        // Command functions are tested via execution, not as string fields
    })

    await t.test('When calling generatePlan with different config values', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')
        const customConfig = { environment: 'staging', projectName: 'Custom Project', customField: 'test-value' }

        const plan = await generatePlan('create-environment', customConfig, testAdapters)

        // Validate config variations are preserved
        t.same(plan.config, customConfig, 'Plan preserves all config fields')
        t.equal(plan.config.environment, 'staging', 'Plan has correct environment')
        t.equal(plan.config.customField, 'test-value', 'Plan preserves custom fields')

        // Alice adapter should still generate same step structure regardless of config
        const step = plan.steps[0]
        t.equal(step.adapter, 'alice', 'Step still uses alice adapter')
        t.equal(step.action, 'test-operation', 'Alice generates same action regardless of config')
    })

    await t.test('When calling generatePlan with multiple adapters (Alice and Bob)', async t => {
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )
        const config = { environment: 'multi-test', projectName: 'Multi Adapter Test' }

        const plan = await generatePlan('create-environment', config, multiAdapters)

        // Validate plan references both adapters
        t.equal(plan.adapters.length, 2, 'Plan references 2 adapters')
        t.same(plan.adapters.sort(), ['alice', 'bob'], 'Plan references both alice and bob adapters')

        // Validate both adapters generated steps
        t.equal(plan.steps.length, 2, 'Plan has 2 steps (one from each adapter)')

        const aliceStep = plan.steps.find(s => s.adapter === 'alice')
        const bobStep = plan.steps.find(s => s.adapter === 'bob')

        t.ok(aliceStep, 'Alice generated a step')
        t.ok(bobStep, 'Bob generated a step')

        // Validate Alice step characteristics
        t.equal(aliceStep.action, 'test-operation', 'Alice step has correct action')
        t.equal(aliceStep.description, 'Alice test: create-environment', 'Alice step has correct description')
        t.equal(aliceStep.canRollback, true, 'Alice step is rollbackable')
        // Alice command function is tested via execution

        // Validate Bob step characteristics (different from Alice)
        t.equal(bobStep.action, 'bob-operation', 'Bob step has different action')
        t.equal(bobStep.description, 'Bob handles: create-environment', 'Bob step has different description pattern')
        t.equal(bobStep.canRollback, false, 'Bob step is not rollbackable')
        // Bob command function is tested via execution, rollback tested via canRollback flag
    })

    await t.test('When calling generatePlan with mixed adapter capabilities', async t => {
        // Test that adapters with different capabilities work together
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )

        const plan = await generatePlan('delete-environment', { projectId: 'test-proj' }, multiAdapters)

        // Both adapters should respond to the operation
        t.equal(plan.steps.length, 2, 'Both adapters generated steps for delete operation')

        const aliceStep = plan.steps.find(s => s.adapter === 'alice')
        const bobStep = plan.steps.find(s => s.adapter === 'bob')

        // Validate they responded differently to the same operation
        t.equal(aliceStep.description, 'Alice test: delete-environment', 'Alice adapted to delete operation')
        t.equal(bobStep.description, 'Bob handles: delete-environment', 'Bob adapted to delete operation')

        // Validate their different rollback capabilities are preserved
        t.equal(aliceStep.canRollback, true, 'Alice maintains rollback capability')
        t.equal(bobStep.canRollback, false, 'Bob maintains no rollback capability')
    })
})

// Phase 2: Test step execution mechanism
tap.test('Given step execution', async t => {
    await t.test('When calling executeSteps with alice adapter steps', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Generate a plan to get steps
        const config = { environment: 'test', projectName: 'Test Project' }
        const plan = await generatePlan('create-environment', config, testAdapters)

        // Execute the steps
        const executedSteps = await executeSteps(plan.steps, testAdapters)

        // Validate execution results
        t.equal(executedSteps.length, 1, 'Executed 1 step')

        const executedStep = executedSteps[0]
        t.ok(executedStep.step, 'Executed step has step reference')
        t.ok(executedStep.result, 'Executed step has result')
        t.equal(executedStep.success, true, 'Executed step marked as successful')

        // Validate command function was called and returned expected result
        t.equal(executedStep.result.status, 'success', 'Command function returned success')
        t.equal(
            executedStep.result.output,
            'Alice executed test-operation',
            'Alice command function returned expected output',
        )
        t.equal(executedStep.result.duration, 30, 'Alice command function returned expected duration')
        t.ok(executedStep.result.executionTime >= 0, 'Execution time was measured')
    })

    await t.test('When calling executeSteps with multiple adapter steps', async t => {
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )

        // Generate a plan to get steps from both adapters
        const config = { environment: 'multi-test', projectName: 'Multi Test' }
        const plan = await generatePlan('create-environment', config, multiAdapters)

        // Execute the steps
        const executedSteps = await executeSteps(plan.steps, multiAdapters)

        // Validate execution results
        t.equal(executedSteps.length, 2, 'Executed 2 steps')

        // Find Alice and Bob results
        const aliceExecution = executedSteps.find(es => es.step.adapter === 'alice')
        const bobExecution = executedSteps.find(es => es.step.adapter === 'bob')

        t.ok(aliceExecution, 'Alice step was executed')
        t.ok(bobExecution, 'Bob step was executed')

        // Validate Alice execution
        t.equal(aliceExecution.result.status, 'success', 'Alice execution successful')
        t.equal(aliceExecution.result.output, 'Alice executed test-operation', 'Alice returned expected result')

        // Validate Bob execution
        t.equal(bobExecution.result.status, 'success', 'Bob execution successful')
        t.equal(bobExecution.result.output, 'Bob executed bob-operation', 'Bob returned expected result')
    })

    await t.test('When calling executeSteps with missing command (non-rollbackable)', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Create a step that references a missing command
        const steps = [
            InfrastructureStep.from({
                adapter: 'missing-adapter',
                action: 'test',
                description: 'Test step',
                canRollback: false,
            }),
        ]

        // executeSteps should return failure result for missing command
        const executedSteps = await executeSteps(steps, testAdapters)

        t.equal(executedSteps.length, 1, 'One step result returned')

        const failedStep = executedSteps[0]
        t.equal(failedStep.success, false, 'Step marked as failed')
        t.ok(
            failedStep.error.includes('No command found for missing-adapter/test'),
            'Error message indicates missing command',
        )
        t.equal(failedStep.step.adapter, 'missing-adapter', 'Failed step reference preserved')
    })

    await t.test('When calling executeSteps with missing rollback function', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Add a command that has execute but no rollback function
        InfrastructureStep.commands.alice['no-rollback-operation'] = {
            execute: async (step, context) => ({
                status: 'success',
                output: `Alice executed ${step.action}`,
                duration: 30,
            }),
            // Intentionally no rollback function
        }

        // Create a step that CAN be rolled back but has no rollback function
        const steps = [
            InfrastructureStep.from({
                adapter: 'alice',
                action: 'no-rollback-operation',
                description: 'Test step with missing rollback',
                canRollback: true,
            }),
        ]

        // Execute the step first (should succeed)
        const executedSteps = await executeSteps(steps, testAdapters)
        t.equal(executedSteps[0].success, true, 'Step execution succeeded')

        // Now try to rollback - should fail with missing rollback function error
        const rollbackResults = await rollbackSteps(executedSteps, testAdapters)

        t.equal(rollbackResults.length, 1, 'One rollback result returned')
        const rollbackResult = rollbackResults[0]
        t.equal(rollbackResult.success, false, 'Rollback marked as failed')
        t.ok(
            rollbackResult.error.includes('No rollback function found for alice/no-rollback-operation'),
            'Error indicates missing rollback function',
        )

        // Clean up test command
        delete InfrastructureStep.commands.alice['no-rollback-operation']
    })
})

// Phase 3: Test rollback mechanism
tap.test('Given rollback scenarios', async t => {
    await t.test('When calling rollbackSteps with alice adapter (rollbackable steps)', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Generate and execute steps first
        const config = { environment: 'test', projectName: 'Test Rollback' }
        const plan = await generatePlan('create-environment', config, testAdapters)
        const executedSteps = await executeSteps(plan.steps, testAdapters)

        // Now rollback the executed steps
        const rollbackResults = await rollbackSteps(executedSteps, testAdapters)

        // Validate rollback results
        t.equal(rollbackResults.length, 1, 'Rolled back 1 step')

        const rollbackResult = rollbackResults[0]
        t.ok(rollbackResult.step, 'Rollback result has step reference')
        t.ok(rollbackResult.result, 'Rollback result has execution result')
        t.equal(rollbackResult.success, true, 'Rollback was successful')

        // Validate rollback function was called
        t.equal(rollbackResult.result.status, 'success', 'Adapter rollback execution successful')
        t.equal(rollbackResult.result.output, 'Alice rolled back test-operation', 'Alice executed rollback action')
    })

    await t.test('When calling rollbackSteps with bob adapter (non-rollbackable steps)', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Bob('bob')], InfrastructureAdapter, 'name')

        // Generate and execute steps first
        const config = { environment: 'test', projectName: 'Test Bob Rollback' }
        const plan = await generatePlan('create-environment', config, testAdapters)
        const executedSteps = await executeSteps(plan.steps, testAdapters)

        // Now rollback the executed steps
        const rollbackResults = await rollbackSteps(executedSteps, testAdapters)

        // Validate rollback results
        t.equal(rollbackResults.length, 1, 'Processed 1 step for rollback')

        const rollbackResult = rollbackResults[0]
        t.ok(rollbackResult.step, 'Rollback result has step reference')
        t.equal(rollbackResult.skipped, true, 'Bob step was skipped')
        t.equal(rollbackResult.reason, 'not rollbackable', 'Correct skip reason')
        t.notOk(rollbackResult.result, 'No execution result for skipped step')
    })

    await t.test('When calling rollbackSteps with mixed adapter capabilities (fail-fast)', async t => {
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )

        // Generate and execute steps from both adapters
        const config = { environment: 'mixed-test', projectName: 'Mixed Rollback Test' }
        const plan = await generatePlan('create-environment', config, multiAdapters)
        const executedSteps = await executeSteps(plan.steps, multiAdapters)

        // Rollback should process steps in reverse order (Bob first, then Alice)
        // But with fail-fast, it stops at Bob since Bob is not rollbackable
        const rollbackResults = await rollbackSteps(executedSteps, multiAdapters)

        // Validate rollback results - should stop at first non-rollbackable step (Bob)
        t.equal(rollbackResults.length, 1, 'Processed 1 step before stopping (fail-fast)')

        // Should only have Bob result (first step in reverse order)
        const bobRollback = rollbackResults[0]
        t.equal(bobRollback.step.adapter, 'bob', 'Bob was the first step processed in rollback')
        t.equal(bobRollback.skipped, true, 'Bob rollback was skipped')
        t.equal(bobRollback.reason, 'not rollbackable', 'Bob skip reason correct')

        // Alice should not have been processed due to fail-fast behavior
        const aliceRollback = rollbackResults.find(r => r.step.adapter === 'alice')
        t.notOk(aliceRollback, 'Alice rollback was not processed due to fail-fast')
    })

    await t.test('When rollback function throws error', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Mock Alice's rollback function to fail
        const originalRollback = InfrastructureStep.commands.alice['test-operation'].rollback
        InfrastructureStep.commands.alice['test-operation'].rollback = async (step, forwardResult, context) => {
            throw new Error('Rollback function failed')
        }

        try {
            // Generate and execute steps first
            const config = { environment: 'fail-test', projectName: 'Failing Rollback Test' }
            const plan = await generatePlan('create-environment', config, testAdapters)
            const executedSteps = await executeSteps(plan.steps, testAdapters)

            // Rollback should handle the failure gracefully
            const rollbackResults = await rollbackSteps(executedSteps, testAdapters)

            // Validate rollback failure was captured
            t.equal(rollbackResults.length, 1, 'Processed 1 step for rollback')

            const rollbackResult = rollbackResults[0]
            t.equal(rollbackResult.success, false, 'Rollback marked as failed')
            t.equal(rollbackResult.error, 'Rollback function failed', 'Error message captured')
            t.notOk(rollbackResult.result, 'No result for failed rollback')
        } finally {
            // Restore original rollback function
            InfrastructureStep.commands.alice['test-operation'].rollback = originalRollback
        }
    })
})

// Phase 4: Test executePlan integration
tap.test('Given executePlan integration', async t => {
    await t.test('When executing successful plan with mocked dependencies', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')
        const config = { environment: 'integration-test', projectName: 'ExecutePlan Test' }
        const plan = await generatePlan('create-environment', config, testAdapters)

        // Mock dependencies to capture interactions
        const auditLogs = []
        const output = []
        const confirmationCalls = []

        const display = {
            displayExecutionStart: plan => output.push({ type: 'start', plan }),
            displayStepProgress: (step, current, total) => output.push({ type: 'progress', step, current, total }),
            displayStepComplete: (step, result) => output.push({ type: 'complete', step, result }),
            displayExecutionComplete: result => output.push({ type: 'executionComplete', result }),
        }

        const mockDependencies = {
            requireConfirmation: async (operation, environment, options) => {
                confirmationCalls.push({ operation, environment, options })
                return true
            },
            display,
            audit: async (eventType, data) => auditLogs.push({ eventType, data }),
        }

        // Execute the plan
        const result = await executePlan(plan, testAdapters, mockDependencies)

        // Validate execution result
        t.equal(result.status, 'success', 'Plan execution successful')
        t.equal(result.planId, plan.id, 'Result references correct plan ID')
        t.equal(result.operation, 'create-environment', 'Result has correct operation')
        t.equal(result.environment, 'integration-test', 'Result captures environment')
        t.equal(result.executedSteps.length, 1, 'One step was executed')
        t.equal(result.rollbackAttempted, false, 'No rollback was attempted')
        t.ok(typeof result.duration === 'number', 'Execution duration recorded')

        // Validate step execution
        const executedStep = result.executedSteps[0]
        t.equal(executedStep.step.adapter, 'alice', 'Alice step was executed')
        t.equal(executedStep.success, true, 'Step execution succeeded')
        t.equal(executedStep.result.result.status, 'success', 'Step result has correct status')

        // Validate confirmation interaction
        t.equal(confirmationCalls.length, 1, 'Confirmation was requested')
        const confirmation = confirmationCalls[0]
        t.equal(confirmation.operation, 'create-environment', 'Confirmation for correct operation')
        t.equal(confirmation.environment, 'integration-test', 'Confirmation for correct environment')

        // Validate display interactions
        const startCalls = output.filter(c => c.type === 'start')
        const progressCalls = output.filter(c => c.type === 'progress')
        const completeCalls = output.filter(c => c.type === 'complete')
        const executionCompleteCalls = output.filter(c => c.type === 'executionComplete')

        t.equal(startCalls.length, 1, 'Execution start displayed')
        t.equal(progressCalls.length, 1, 'Step progress displayed')
        t.equal(completeCalls.length, 1, 'Step completion displayed')
        t.equal(executionCompleteCalls.length, 1, 'Execution completion displayed')

        // Validate audit logging
        t.equal(auditLogs.length, 1, 'One audit log created')
        const auditLog = auditLogs[0]
        t.equal(auditLog.eventType, 'infrastructure-execution', 'Correct audit event type')
        t.equal(auditLog.data.status, 'success', 'Audit captures success status')
        t.equal(auditLog.data.planId, plan.id, 'Audit references correct plan')
        t.ok(auditLog.data.operator, 'Audit includes operator')
        t.equal(auditLog.data.executedSteps.length, 1, 'Audit includes execution results')
    })

    await t.test('When executing failing plan with rollback', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')

        // Mock Alice's execute function to fail
        const originalExecute = InfrastructureStep.commands.alice['test-operation'].execute
        InfrastructureStep.commands.alice['test-operation'].execute = async (step, context) => {
            throw new Error('Simulated execution failure')
        }

        try {
            const config = { environment: 'fail-test', projectName: 'Failing ExecutePlan Test' }
            const plan = await generatePlan('create-environment', config, testAdapters)

            // Mock dependencies
            const auditLogs = []
            const output = []

            const mockDependencies = {
                requireConfirmation: async () => true,
                display: {
                    displayExecutionStart: plan => output.push({ type: 'start' }),
                    displayStepProgress: step => output.push({ type: 'progress' }),
                    displayStepComplete: step => output.push({ type: 'complete' }),
                    displayExecutionComplete: result => output.push({ type: 'executionComplete' }),
                },
                audit: async (eventType, data) => auditLogs.push({ eventType, data }),
            }

            // Execute the plan (should return failed result, not throw)
            const result = await executePlan(plan, testAdapters, mockDependencies)

            // Validate failure result
            t.equal(result.status, 'failed', 'Plan execution failed')
            t.equal(result.error, 'Simulated execution failure', 'Error message captured')
            t.equal(result.executedSteps.length, 1, 'Failed step recorded')
            t.equal(result.executedSteps[0].success, false, 'Step marked as failed')
            t.equal(result.rollbackAttempted, true, 'Rollback was attempted')
            t.equal(result.rollbackResults.length, 0, 'No steps to rollback (first step failed)')

            // Validate audit logging for failure
            t.equal(auditLogs.length, 1, 'Failure was audited')
            const auditLog = auditLogs[0]
            t.equal(auditLog.data.status, 'failed', 'Audit captures failure status')
            t.equal(auditLog.data.error, 'Simulated execution failure', 'Audit captures error message')
            t.equal(auditLog.data.rollbackAttempted, true, 'Audit captures rollback attempt')
        } finally {
            // Restore original execute function
            InfrastructureStep.commands.alice['test-operation'].execute = originalExecute
        }
    })

    await t.test('When executing plan with mixed success and failure', async t => {
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )

        // Mock Bob's execute function to fail
        const originalExecute = InfrastructureStep.commands.bob['bob-operation'].execute
        InfrastructureStep.commands.bob['bob-operation'].execute = async (step, context) => {
            throw new Error('Bob execution failed')
        }

        try {
            const config = { environment: 'mixed-test', projectName: 'Mixed ExecutePlan Test' }
            const plan = await generatePlan('create-environment', config, multiAdapters)

            // Mock dependencies
            const auditLogs = []
            const mockDependencies = {
                requireConfirmation: async () => true,
                display: {
                    displayExecutionStart: () => {},
                    displayStepProgress: () => {},
                    displayStepComplete: () => {},
                    displayExecutionComplete: () => {},
                },
                audit: async (eventType, data) => auditLogs.push({ eventType, data }),
            }

            // Execute the plan
            const result = await executePlan(plan, multiAdapters, mockDependencies)

            // Validate mixed execution result
            t.equal(result.status, 'failed', 'Overall execution failed')
            t.equal(result.executedSteps.length, 2, 'Both steps attempted')

            // First step should succeed, second should fail
            const firstStep = result.executedSteps[0]
            const secondStep = result.executedSteps[1]

            t.equal(firstStep.success, true, 'First step succeeded')
            t.equal(secondStep.success, false, 'Second step failed')
            t.equal(secondStep.error, 'Bob execution failed', 'Correct error captured')

            // Validate rollback was attempted for the successful step
            t.equal(result.rollbackAttempted, true, 'Rollback attempted')
            t.equal(result.rollbackResults.length, 1, 'One step rolled back')

            const rollbackResult = result.rollbackResults[0]
            t.equal(rollbackResult.step.adapter, 'alice', 'Alice step was rolled back')
            t.equal(rollbackResult.success, true, 'Rollback succeeded')
        } finally {
            // Restore original execute function
            InfrastructureStep.commands.bob['bob-operation'].execute = originalExecute
        }
    })

    await t.test('When executing plan with complete round-trip rollback success', async t => {
        const multiAdapters = LookupTable(
            [InfrastructureAdapter.Alice('alice'), InfrastructureAdapter.Bob('bob')],
            InfrastructureAdapter,
            'name',
        )

        // Track state changes to validate round-trip
        const aliceState = { resources: [] }
        const bobState = { resources: [] }

        // Mock Alice with stateful operations
        const originalAliceExecute = InfrastructureStep.commands.alice['test-operation'].execute
        const originalAliceRollback = InfrastructureStep.commands.alice['test-operation'].rollback

        InfrastructureStep.commands.alice['test-operation'].execute = async (step, context) => {
            aliceState.resources.push('alice-resource-created')
            return {
                status: 'success',
                output: 'Alice created resource',
                duration: 30,
                resourceId: 'alice-resource-created',
            }
        }

        InfrastructureStep.commands.alice['test-operation'].rollback = async (step, forwardResult, context) => {
            // Remove the resource that was created
            const resourceToRemove = forwardResult.result.resourceId
            aliceState.resources = aliceState.resources.filter(r => r !== resourceToRemove)
            return {
                status: 'success',
                output: 'Alice removed resource during rollback',
                duration: 20,
                removedResource: resourceToRemove,
            }
        }

        // Mock Bob to fail after Alice succeeds
        const originalBobExecute = InfrastructureStep.commands.bob['bob-operation'].execute
        InfrastructureStep.commands.bob['bob-operation'].execute = async (step, context) => {
            // Bob should fail, triggering rollback
            throw new Error('Bob deployment failed - infrastructure conflict')
        }

        try {
            const config = { environment: 'roundtrip-test', projectName: 'Complete Rollback Test' }
            const plan = await generatePlan('create-environment', config, multiAdapters)

            // Mock dependencies
            const auditLogs = []
            const mockDependencies = {
                requireConfirmation: async () => true,
                display: {
                    displayExecutionStart: () => {},
                    displayStepProgress: () => {},
                    displayStepComplete: () => {},
                    displayExecutionComplete: () => {},
                },
                audit: async (eventType, data) => auditLogs.push({ eventType, data }),
            }

            // Verify initial state
            t.same(aliceState.resources, [], 'Alice starts with no resources')
            t.same(bobState.resources, [], 'Bob starts with no resources')

            // Execute the plan
            const result = await executePlan(plan, multiAdapters, mockDependencies)

            // Validate execution result shows failure with successful rollback
            t.equal(result.status, 'failed', 'Overall execution failed due to Bob')
            t.equal(result.executedSteps.length, 2, 'Both steps were attempted')

            // Validate Alice succeeded initially
            const aliceStep = result.executedSteps[0]
            t.equal(aliceStep.success, true, 'Alice step succeeded')
            t.equal(aliceStep.result.result.resourceId, 'alice-resource-created', 'Alice created resource')

            // Validate Bob failed
            const bobStep = result.executedSteps[1]
            t.equal(bobStep.success, false, 'Bob step failed')
            t.equal(bobStep.error, 'Bob deployment failed - infrastructure conflict', 'Bob error captured')

            // Validate rollback was attempted and succeeded
            t.equal(result.rollbackAttempted, true, 'Rollback was attempted')
            t.equal(result.rollbackResults.length, 1, 'One rollback operation performed')

            const aliceRollback = result.rollbackResults[0]
            t.equal(aliceRollback.step.adapter, 'alice', 'Alice was rolled back')
            t.equal(aliceRollback.success, true, 'Alice rollback succeeded')
            t.equal(aliceRollback.result.removedResource, 'alice-resource-created', 'Rollback removed correct resource')

            // CRITICAL: Validate system returned to initial state
            t.same(aliceState.resources, [], 'Alice state restored to initial (no resources)')
            t.same(bobState.resources, [], 'Bob state unchanged (never succeeded)')

            // Validate comprehensive audit trail
            t.equal(auditLogs.length, 1, 'Complete operation was audited')
            const auditLog = auditLogs[0]
            t.equal(auditLog.data.status, 'failed', 'Audit captures overall failure')
            t.equal(auditLog.data.executedSteps.length, 2, 'Audit captures all execution attempts')
            t.equal(auditLog.data.rollbackResults.length, 1, 'Audit captures successful rollback')
            t.ok(auditLog.data.rollbackAttempted, 'Audit confirms rollback was attempted')
        } finally {
            // Restore all original functions
            InfrastructureStep.commands.alice['test-operation'].execute = originalAliceExecute
            InfrastructureStep.commands.alice['test-operation'].rollback = originalAliceRollback
            InfrastructureStep.commands.bob['bob-operation'].execute = originalBobExecute
        }
    })
})
