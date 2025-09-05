import { LookupTable } from '@graffio/functional'
import tap from 'tap'
import { generatePlan } from '../src/index.js'
import { executeSteps, rollbackSteps } from '../src/core/executor.js'
import { InfrastructureAdapter, InfrastructureStep } from '../src/types/index.js'

InfrastructureAdapter.Alice.prototype.verifyConfig = config => {}
InfrastructureAdapter.Alice.prototype.generateSteps = async (operation, config, currentState) => [
    InfrastructureStep.from({
        adapter: 'alice',
        action: 'test-operation',
        description: `Alice test: ${operation}`,
        canRollback: true,
        command: `echo "Alice implementing operation: ${operation}"`,
        rollback: `echo "Alice rolling back operation: ${operation}"`,
    }),
]
InfrastructureAdapter.Alice.prototype.getCurrentState = async () => ({
    aliceData: ['alice-resource-1', 'alice-resource-2'],
    timestamp: Date.now(),
})
InfrastructureAdapter.Alice.prototype.executeStep = async step => ({
    success: true,
    mockResult: `Alice executed ${step.action}`,
    duration: 30,
})

// Add Bob adapter prototype functions
InfrastructureAdapter.Bob.prototype.verifyConfig = config => {}
InfrastructureAdapter.Bob.prototype.generateSteps = async (operation, config, currentState) => [
    InfrastructureStep.from({
        adapter: 'bob',
        action: 'bob-operation',
        description: `Bob handles: ${operation}`,
        canRollback: false,
        command: `echo "Bob executing: ${operation}"`,
        rollback: undefined,
    }),
]
InfrastructureAdapter.Bob.prototype.getCurrentState = async () => ({
    bobData: ['bob-resource-x', 'bob-resource-y'],
    timestamp: Date.now(),
})
InfrastructureAdapter.Bob.prototype.executeStep = async step => ({
    success: true,
    mockResult: `Bob executed ${step.action}`,
    duration: 75,
})

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
        t.equal(step.command, 'echo "Alice implementing operation: create-environment"', 'Step has correct command')
        t.equal(step.rollback, 'echo "Alice rolling back operation: create-environment"', 'Step has correct rollback')

        // Validate state collection occurred
        t.ok(plan.stateHash, 'Plan has state hash')
        t.ok(plan.expectedState, 'Plan has expected state')
        t.ok(plan.expectedState.alice, 'Plan expected state includes alice')
        t.ok(plan.expectedState.alice.aliceData, 'Alice state includes alice data')
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
        t.equal(
            step.command,
            'echo "Alice implementing operation: delete-environment"',
            'Step command reflects different operation',
        )
        t.equal(
            step.rollback,
            'echo "Alice rolling back operation: delete-environment"',
            'Step rollback reflects different operation',
        )
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
        t.equal(
            aliceStep.command,
            'echo "Alice implementing operation: create-environment"',
            'Alice step has correct command',
        )

        // Validate Bob step characteristics (different from Alice)
        t.equal(bobStep.action, 'bob-operation', 'Bob step has different action')
        t.equal(bobStep.description, 'Bob handles: create-environment', 'Bob step has different description pattern')
        t.equal(bobStep.canRollback, false, 'Bob step is not rollbackable')
        t.equal(bobStep.command, 'echo "Bob executing: create-environment"', 'Bob step has different command pattern')
        t.equal(bobStep.rollback, undefined, 'Bob step has no rollback command')

        // Validate state collection from both adapters
        t.ok(plan.expectedState.alice, 'Plan expected state includes alice')
        t.ok(plan.expectedState.bob, 'Plan expected state includes bob')
        t.ok(plan.expectedState.alice.aliceData, 'Alice state has aliceData')
        t.ok(plan.expectedState.bob.bobData, 'Bob state has bobData')
        t.not(
            plan.expectedState.alice.aliceData,
            plan.expectedState.bob.bobData,
            'Alice and Bob have different state data',
        )
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
        
        // Validate adapter executeStep was called and returned expected result
        t.equal(executedStep.result.success, true, 'Adapter executeStep returned success')
        t.equal(executedStep.result.mockResult, 'Alice executed test-operation', 'Alice executeStep returned expected mock result')
        t.equal(executedStep.result.duration, 30, 'Alice executeStep returned expected duration')
        t.ok(executedStep.result.executionTime >= 0, 'Execution time was measured')
    })
    
    await t.test('When calling executeSteps with multiple adapter steps', async t => {
        const multiAdapters = LookupTable([
            InfrastructureAdapter.Alice('alice'),
            InfrastructureAdapter.Bob('bob')
        ], InfrastructureAdapter, 'name')
        
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
        t.equal(aliceExecution.result.success, true, 'Alice execution successful')
        t.equal(aliceExecution.result.mockResult, 'Alice executed test-operation', 'Alice returned expected result')
        
        // Validate Bob execution
        t.equal(bobExecution.result.success, true, 'Bob execution successful')
        t.equal(bobExecution.result.mockResult, 'Bob executed bob-operation', 'Bob returned expected result')
    })
    
    await t.test('When calling executeSteps with missing adapter', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')
        
        // Create a step that references a missing adapter
        const steps = [InfrastructureStep.from({
            adapter: 'missing-adapter',
            action: 'test',
            description: 'Test step',
            canRollback: false
        })]
        
        // executeSteps should return failure result for missing adapter
        const executedSteps = await executeSteps(steps, testAdapters)
        
        t.equal(executedSteps.length, 1, 'One step result returned')
        
        const failedStep = executedSteps[0]
        t.equal(failedStep.success, false, 'Step marked as failed')
        t.ok(failedStep.error.includes('No adapter found: missing-adapter'), 'Error message indicates missing adapter')
        t.equal(failedStep.step.adapter, 'missing-adapter', 'Failed step reference preserved')
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
        
        // Validate adapter executeStep was called with rollback step
        t.equal(rollbackResult.result.success, true, 'Adapter rollback execution successful')
        t.equal(rollbackResult.result.mockResult, 'Alice executed rollback-test-operation', 'Alice executed rollback action')
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
        const multiAdapters = LookupTable([
            InfrastructureAdapter.Alice('alice'),
            InfrastructureAdapter.Bob('bob')
        ], InfrastructureAdapter, 'name')
        
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
    
    await t.test('When rollback execution fails', async t => {
        const testAdapters = LookupTable([InfrastructureAdapter.Alice('alice')], InfrastructureAdapter, 'name')
        
        // Mock Alice's executeStep to fail on rollback operations
        const originalExecuteStep = InfrastructureAdapter.Alice.prototype.executeStep
        InfrastructureAdapter.Alice.prototype.executeStep = async (step) => {
            if (step.action.startsWith('rollback-')) {
                throw new Error('Rollback operation failed')
            }
            return originalExecuteStep.call(this, step)
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
            t.equal(rollbackResult.error, 'Rollback operation failed', 'Error message captured')
            t.notOk(rollbackResult.result, 'No result for failed rollback')
        } finally {
            // Restore original executeStep
            InfrastructureAdapter.Alice.prototype.executeStep = originalExecuteStep
        }
    })
})
