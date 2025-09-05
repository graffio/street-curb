import { LookupTable } from '@graffio/functional'
import tap from 'tap'
import { createProductionAdapters, generatePlan, executePlan } from '../src/index.js'
import { InfrastructureAdapter } from '../src/types/index.js'

// Test CLI integration by validating production adapter functionality
tap.test('Given CLI integration', async t => {
    await t.test('When createProductionAdapters() is called', async t => {
        const adapters = createProductionAdapters()
        
        // Validate production adapter lookup table
        t.ok(adapters, 'Production adapters created')
        t.equal(adapters.length, 1, 'Production adapters has 1 adapter')
        
        // Find Firebase adapter
        const firebaseAdapter = adapters.find(a => a.name === 'firebase')
        
        t.ok(firebaseAdapter, 'Firebase adapter found')
        
        // Validate adapter types
        t.ok(InfrastructureAdapter.Firebase.is(firebaseAdapter), 'Firebase adapter has correct type')
        
        // Validate adapter prototype functions are available
        t.ok(typeof firebaseAdapter.getCurrentState === 'function', 'Firebase adapter has getCurrentState')
        t.ok(typeof firebaseAdapter.generateSteps === 'function', 'Firebase adapter has generateSteps')
        t.ok(typeof firebaseAdapter.executeStep === 'function', 'Firebase adapter has executeStep')
    })
    
    await t.test('When generating plan with production adapters', async t => {
        const config = { environment: 'iac-test', projectName: 'CLI Integration Test' }
        const plan = await generatePlan('create-environment', config, createProductionAdapters())
        
        // Validate plan structure
        t.ok(plan.id, 'Plan has ID')
        t.equal(plan.operation, 'create-environment', 'Plan has correct operation')
        t.same(plan.config, config, 'Plan has correct config')
        t.equal(plan.status, 'ready', 'Plan status is ready')
        
        // Validate plan references production adapters
        t.equal(plan.adapters.length, 1, 'Plan references 1 production adapter')
        t.same(plan.adapters, ['firebase'], 'Plan references firebase adapter')
        
        // Validate steps from production adapters  
        t.equal(plan.steps.length, 1, 'Plan has 1 step from production adapter')
        
        const firebaseStep = plan.steps.find(s => s.adapter === 'firebase')
        
        t.ok(firebaseStep, 'Firebase generated a step')
        
        // Validate state collection from production adapters
        t.ok(plan.expectedState.firebase, 'Plan expected state includes firebase')
    })
    
    await t.test('When executing plan with production adapters', async t => {
        // Generate a plan
        const config = { environment: 'iac-test', projectName: 'CLI Execution Test' }
        const adapters = createProductionAdapters()
        const plan = await generatePlan('create-environment', config, adapters)
        
        // Mock the confirmation and display dependencies to avoid UI interaction
        const mockDependencies = {
            requireConfirmation: async () => true, // Auto-confirm for test
            display: {
                displayExecutionStart: () => {},
                displayStepProgress: () => {},
                displayStepComplete: () => {},
                displayExecutionComplete: () => {}
            },
            audit: async () => {} // Mock audit logging
        }
        
        // Execute the plan
        const result = await executePlan(plan, adapters, mockDependencies)
        
        // Validate execution result
        t.equal(result.status, 'success', 'Execution completed successfully')
        t.equal(result.planId, plan.id, 'Result references correct plan ID')
        t.equal(result.operation, 'create-environment', 'Result has correct operation')
        t.equal(result.executedSteps.length, 1, 'Executed 1 step from production adapter')
        t.equal(result.rollbackAttempted, false, 'No rollback was attempted')
        
        // Validate Firebase execution result
        const firebaseExecution = result.executedSteps.find(es => es.step.adapter === 'firebase')
        
        t.ok(firebaseExecution, 'Firebase step was executed')
        t.equal(firebaseExecution.success, true, 'Firebase execution successful')
    })
    
    await t.test('When executing plan with audit logging', async t => {
        // Capture console.log output to verify audit logging
        const originalConsoleLog = console.log
        const auditLogs = []
        console.log = (message, ...args) => {
            if (message && message.includes('[AUDIT LOG]')) {
                auditLogs.push({ message, args })
            } else {
                originalConsoleLog(message, ...args)
            }
        }
        
        try {
            // Generate and execute a plan
            const config = { environment: 'iac-test', projectName: 'Audit Test' }
            const adapters = createProductionAdapters()
            const plan = await generatePlan('create-environment', config, adapters)
            
            const mockDependencies = {
                requireConfirmation: async () => true,
                display: {
                    displayExecutionStart: () => {},
                    displayStepProgress: () => {},
                    displayStepComplete: () => {},
                    displayExecutionComplete: () => {}
                }
                // Use default audit function to test actual audit logging
            }
            
            const result = await executePlan(plan, adapters, mockDependencies)
            
            // Validate audit logging occurred
            t.equal(auditLogs.length, 1, 'One audit log entry was created')
            
            const auditLog = auditLogs[0]
            t.ok(auditLog.message.includes('[AUDIT LOG] infrastructure-execution:'), 'Audit log has correct event type')
            
            // Parse the audit log JSON
            const logData = JSON.parse(auditLog.args[0])
            
            t.ok(logData.timestamp, 'Audit log has timestamp')
            t.equal(logData.eventType, 'infrastructure-execution', 'Audit log has correct event type')
            t.equal(logData.status, 'success', 'Audit log captures execution status')
            t.equal(logData.planId, plan.id, 'Audit log references correct plan ID')
            t.equal(logData.operation, 'create-environment', 'Audit log captures operation')
            t.equal(logData.environment, 'iac-test', 'Audit log captures environment')
            t.equal(logData.executedSteps.length, 1, 'Audit log includes executed steps')
            t.ok(logData.operator, 'Audit log includes operator')
            t.equal(logData.auditVersion, '1.0', 'Audit log includes version')
            t.ok(typeof logData.duration === 'number', 'Audit log includes execution duration')
            
        } finally {
            // Restore original console.log
            console.log = originalConsoleLog
        }
    })
})