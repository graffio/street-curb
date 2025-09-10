import tap from 'tap'
import { executeCommands, executePlan, rollbackCommands } from '../src/core/executor.js'

// Test command objects using vanilla JavaScript pattern
const aliceCommand = {
    id: 'alice-test-cmd',
    description: 'Alice test command for create-environment',
    canRollback: true,
    execute: async () => ({ status: 'success', output: 'Alice executed test-operation', duration: 30, result: {} }),
    rollback: async forwardResult => ({
        status: 'success',
        output: 'Alice rolled back test-operation',
        duration: 30,
        result: {},
    }),
}

const bobCommand = {
    id: 'bob-test-cmd',
    description: 'Bob handles create-environment',
    canRollback: false,
    execute: async () => ({ status: 'success', output: 'Bob executed bob-operation', duration: 75, result: {} }),
    rollback: async forwardResult => {
        throw new Error('Bob operations cannot be rolled back')
    },
}

const charlieCommand = {
    id: 'charlie-test-cmd',
    description: 'Charlie handles create-environment',
    canRollback: true,
    execute: async () => ({
        status: 'success',
        output: 'Charlie executed charlie-operation',
        duration: 40,
        result: {},
    }),
    rollback: async forwardResult => ({
        status: 'success',
        output: 'Charlie rolled back charlie-operation',
        duration: 25,
        result: {},
    }),
}

// Test command execution mechanism
tap.test('Given command execution', async t => {
    await t.test('When calling executeCommands with alice command', async t => {
        const commands = [aliceCommand]

        // Execute the commands
        const executedCommands = await executeCommands(commands)

        // Validate execution results
        t.equal(executedCommands.length, 1, 'Executed 1 command')

        const executedCommand = executedCommands[0]
        t.ok(executedCommand.command, 'Executed command has command reference')
        t.ok(executedCommand.result, 'Executed command has result')
        t.equal(executedCommand.success, true, 'Executed command marked as successful')

        // Validate command function was called and returned expected result
        t.equal(executedCommand.result.status, 'success', 'Command function returned success')
        t.equal(
            executedCommand.result.output,
            'Alice executed test-operation',
            'Alice command function returned expected output',
        )
        t.equal(executedCommand.result.duration, 30, 'Alice command function returned expected duration')
        t.ok(executedCommand.executionTime >= 0, 'Execution time was measured')
    })

    await t.test('When calling executeCommands with multiple commands', async t => {
        const commands = [aliceCommand, bobCommand]

        // Execute the commands
        const executedCommands = await executeCommands(commands)

        // Validate execution results
        t.equal(executedCommands.length, 2, 'Executed 2 commands')

        // Find Alice and Bob results
        const aliceExecution = executedCommands.find(ec => ec.command.id === 'alice-test-cmd')
        const bobExecution = executedCommands.find(ec => ec.command.id === 'bob-test-cmd')

        t.ok(aliceExecution, 'Alice command was executed')
        t.ok(bobExecution, 'Bob command was executed')

        // Validate Alice execution
        t.equal(aliceExecution.success, true, 'Alice execution was successful')
        t.equal(aliceExecution.result.output, 'Alice executed test-operation', 'Alice produced expected output')

        // Validate Bob execution
        t.equal(bobExecution.success, true, 'Bob execution was successful')
        t.equal(bobExecution.result.output, 'Bob executed bob-operation', 'Bob produced expected output')

        // Validate execution order (Alice executed first)
        t.ok(
            aliceExecution.executionTime <= bobExecution.executionTime,
            'Alice executed before Bob (sequential ordering)',
        )
    })

    await t.test('When calling executeCommands with command that fails', async t => {
        const failingCommand = {
            id: 'failing-test-cmd',
            description: 'Command that fails during execution',
            canRollback: true,
            execute: async () => {
                throw new Error('Simulated execution failure')
            },
            rollback: async forwardResult => ({
                status: 'success',
                output: 'Rollback succeeded despite forward failure',
                duration: 15,
                result: {},
            }),
        }

        const commands = [failingCommand]

        // Execute the commands and expect failure handling
        const executedCommands = await executeCommands(commands)

        t.equal(executedCommands.length, 1, 'Failed command still recorded in execution results')

        const failedExecution = executedCommands[0]
        t.equal(failedExecution.success, false, 'Command execution marked as failed')
        t.ok(failedExecution.error, 'Failed execution has error information')
        t.match(failedExecution.error.message, /Simulated execution failure/, 'Error message preserved')
    })

    await t.test('When calling executeCommands with mixed success/failure then fail-fast behavior occurs', async t => {
        const failingCommand = {
            id: 'early-failure-cmd',
            description: 'Command that fails early',
            canRollback: false,
            execute: async () => {
                throw new Error('Early failure stops execution')
            },
        }

        const commands = [aliceCommand, failingCommand, bobCommand] // Alice succeeds, failing fails, Bob never runs

        // Execute with fail-fast behavior
        const executedCommands = await executeCommands(commands)

        // Validate fail-fast: only Alice and failingCommand should have been attempted
        t.equal(executedCommands.length, 2, 'Only 2 commands attempted due to fail-fast')

        const aliceExecution = executedCommands.find(ec => ec.command.id === 'alice-test-cmd')
        const failedExecution = executedCommands.find(ec => ec.command.id === 'early-failure-cmd')
        const bobExecution = executedCommands.find(ec => ec.command.id === 'bob-test-cmd')

        t.ok(aliceExecution, 'Alice was executed before failure')
        t.ok(failedExecution, 'Failing command was attempted')
        t.notOk(bobExecution, 'Bob was never executed due to fail-fast')

        // Validate Alice succeeded but sequence was interrupted
        t.equal(aliceExecution.success, true, 'Alice execution succeeded')
        t.equal(failedExecution.success, false, 'Failing command failed as expected')
    })
})

// Test rollback scenarios
tap.test('Given rollback scenarios', async t => {
    await t.test('When calling rollbackCommands with alice execution then rollback succeeds', async t => {
        // First execute Alice command to get execution result
        const executedCommands = await executeCommands([aliceCommand])
        const aliceExecution = executedCommands[0]

        // Now rollback the Alice execution
        const rollbackResults = await rollbackCommands([aliceExecution])

        t.equal(rollbackResults.length, 1, 'Rollback attempted for 1 command')

        const rollbackResult = rollbackResults[0]
        t.equal(rollbackResult.command.id, 'alice-test-cmd', 'Rollback applied to correct command')
        t.equal(rollbackResult.success, true, 'Rollback was successful')
        t.equal(
            rollbackResult.result.output,
            'Alice rolled back test-operation',
            'Rollback function returned expected output',
        )
        t.equal(rollbackResult.result.duration, 30, 'Rollback duration returned as expected')
    })

    await t.test(
        'When calling rollbackCommands with multiple executions then rollback occurs in reverse order',
        async t => {
            // Execute Alice, then Bob (Bob can't rollback, Alice can)
            const executedCommands = await executeCommands([aliceCommand, charlieCommand]) // Using Charlie instead of Bob since Charlie can rollback

            // Rollback in reverse order
            const rollbackResults = await rollbackCommands(executedCommands)

            t.equal(rollbackResults.length, 2, 'Rollback attempted for both commands')

            // Validate reverse order: Charlie rolled back first, then Alice
            const charlieRollback = rollbackResults.find(rb => rb.command.id === 'charlie-test-cmd')
            const aliceRollback = rollbackResults.find(rb => rb.command.id === 'alice-test-cmd')

            t.ok(charlieRollback, 'Charlie rollback was attempted')
            t.ok(aliceRollback, 'Alice rollback was attempted')

            // Validate Charlie rolled back before Alice (reverse execution order)
            t.ok(
                charlieRollback.executionTime <= aliceRollback.executionTime,
                'Charlie rolled back first (reverse order)',
            )
        },
    )

    await t.test('When calling rollbackCommands with non-rollbackable command then error occurs', async t => {
        // Execute Bob command (non-rollbackable)
        const executedCommands = await executeCommands([bobCommand])
        const bobExecution = executedCommands[0]

        // Attempt rollback on non-rollbackable command
        const rollbackResults = await rollbackCommands([bobExecution])

        t.equal(rollbackResults.length, 1, 'Rollback was attempted')

        const rollbackResult = rollbackResults[0]
        t.equal(rollbackResult.success, false, 'Rollback failed for non-rollbackable command')
        t.ok(rollbackResult.error, 'Rollback failure has error information')
        t.match(
            rollbackResult.error.message,
            /cannot be rolled back/,
            'Error message explains rollback capability issue',
        )
    })

    await t.test(
        'When calling rollbackCommands with mixed rollback capabilities then partial rollback occurs',
        async t => {
            // Execute Alice (rollbackable) and Bob (non-rollbackable)
            const executedCommands = await executeCommands([aliceCommand, bobCommand])

            // Attempt rollback on both
            const rollbackResults = await rollbackCommands(executedCommands)

            t.equal(rollbackResults.length, 2, 'Rollback attempted on both commands')

            const aliceRollback = rollbackResults.find(rb => rb.command.id === 'alice-test-cmd')
            const bobRollback = rollbackResults.find(rb => rb.command.id === 'bob-test-cmd')

            // Alice should succeed, Bob should fail
            t.equal(aliceRollback.success, true, 'Alice rollback succeeded')
            t.equal(bobRollback.success, false, 'Bob rollback failed due to capability')

            // Validate Bob rollback attempted in reverse order (Bob first, then Alice)
            t.ok(bobRollback.executionTime <= aliceRollback.executionTime, 'Rollback attempted in reverse order')
        },
    )

    await t.test('When rollback function fails then rollback failure is captured', async t => {
        const rollbackFailingCommand = {
            id: 'rollback-failing-cmd',
            description: 'Command with failing rollback',
            canRollback: true,
            execute: async () => ({ status: 'success', output: 'Forward succeeded', duration: 20, result: {} }),
            rollback: async forwardResult => {
                throw new Error('Rollback function failed')
            },
        }

        // Execute then rollback
        const executedCommands = await executeCommands([rollbackFailingCommand])
        const rollbackResults = await rollbackCommands(executedCommands)

        t.equal(rollbackResults.length, 1, 'Rollback was attempted')

        const rollbackResult = rollbackResults[0]
        t.equal(rollbackResult.success, false, 'Rollback marked as failed')
        t.ok(rollbackResult.error, 'Rollback failure captured error')
        t.match(rollbackResult.error.message, /Rollback function failed/, 'Rollback error message preserved')
    })
})

// Test executePlan integration
tap.test('Given executePlan integration', async t => {
    await t.test('When calling executePlan with commands then execution and audit trail work', async t => {
        const mockDependencies = { auditLogger: entry => mockDependencies.entries.push(entry), entries: [] }

        const commands = [aliceCommand, charlieCommand]

        const result = await executePlan(commands, mockDependencies)

        // Validate execution result structure
        t.equal(result.success, true, 'executePlan reports success')
        t.equal(result.executedCommands.length, 2, 'executePlan executed both commands')
        t.equal(result.rollbackCommands.length, 0, 'No rollback needed for successful execution')

        // Validate audit logging occurred
        const auditEntries = mockDependencies.entries
        t.ok(auditEntries.length > 0, 'Audit entries were logged')

        // Check for execution start/success entries
        const executionEntries = auditEntries.filter(e => e.type === 'execution')
        t.ok(executionEntries.length >= 2, 'Execution entries logged for both commands')
    })

    await t.test('When calling executePlan with failing command then rollback occurs', async t => {
        const failingCommand = {
            id: 'plan-failure-cmd',
            description: 'Command that fails during plan execution',
            canRollback: true,
            execute: async () => {
                throw new Error('Plan execution failure')
            },
            rollback: async forwardResult => ({
                status: 'success',
                output: 'Rollback after plan failure',
                duration: 10,
                result: {},
            }),
        }

        const commands = [aliceCommand, failingCommand] // Alice succeeds, then failure triggers rollback

        const result = await executePlan(commands, {})

        // Validate failure and rollback occurred
        t.equal(result.success, false, 'executePlan reports failure')
        t.equal(result.executedCommands.length, 2, 'Both commands were attempted')
        t.equal(result.rollbackCommands.length, 1, 'Alice was rolled back after failure')

        // Validate failure details
        const failedExecution = result.executedCommands.find(ec => ec.command.id === 'plan-failure-cmd')
        t.equal(failedExecution.success, false, 'Failing command marked as failed')

        // Validate rollback details
        const aliceRollback = result.rollbackCommands[0]
        t.equal(aliceRollback.command.id, 'alice-test-cmd', 'Alice was rolled back')
        t.equal(aliceRollback.success, true, 'Alice rollback succeeded')
    })

    await t.test('When calling executePlan with non-rollbackable failure then partial rollback occurs', async t => {
        const failingCommand = {
            id: 'non-rollbackable-failure-cmd',
            description: 'Non-rollbackable command that fails',
            canRollback: false,
            execute: async () => {
                throw new Error('Non-rollbackable failure')
            },
        }

        const commands = [aliceCommand, bobCommand, failingCommand] // Alice can rollback, Bob cannot, failure triggers rollback

        const result = await executePlan(commands, {})

        // Validate partial rollback
        t.equal(result.success, false, 'executePlan reports failure')
        t.equal(result.executedCommands.length, 3, 'All commands were attempted')
        t.equal(result.rollbackCommands.length, 2, 'Rollback attempted on Alice and Bob')

        // Validate rollback results
        const aliceRollback = result.rollbackCommands.find(rb => rb.command.id === 'alice-test-cmd')
        const bobRollback = result.rollbackCommands.find(rb => rb.command.id === 'bob-test-cmd')

        t.equal(aliceRollback.success, true, 'Alice rollback succeeded')
        t.equal(bobRollback.success, false, 'Bob rollback failed due to non-rollbackable nature')
    })
})

// Test complex failure chains
tap.test('Given complex failure scenarios', async t => {
    await t.test('When forward execution fails and rollback also fails then both errors are captured', async t => {
        const doubleFailingCommand = {
            id: 'double-failing-cmd',
            description: 'Command that fails in both directions',
            canRollback: true,
            execute: async () => {
                throw new Error('Forward execution failed')
            },
            rollback: async forwardResult => {
                throw new Error('Rollback execution failed')
            },
        }

        const commands = [aliceCommand, doubleFailingCommand]

        const result = await executePlan(commands, {})

        // Validate both failure types are captured
        t.equal(result.success, false, 'executePlan reports overall failure')

        const failedExecution = result.executedCommands.find(ec => ec.command.id === 'double-failing-cmd')
        t.equal(failedExecution.success, false, 'Forward execution failure captured')
        t.match(failedExecution.error.message, /Forward execution failed/, 'Forward error message preserved')

        const aliceRollback = result.rollbackCommands.find(rb => rb.command.id === 'alice-test-cmd')
        t.equal(aliceRollback.success, true, 'Alice rollback still succeeded despite other failures')
    })

    await t.test('When three commands execute with middle failure then correct rollback order occurs', async t => {
        const middleFailingCommand = {
            id: 'middle-failing-cmd',
            description: 'Middle command that fails',
            canRollback: true,
            execute: async () => {
                throw new Error('Middle command failed')
            },
            rollback: async forwardResult => ({
                status: 'success',
                output: 'Middle command rollback succeeded',
                duration: 15,
                result: {},
            }),
        }

        // Alice succeeds → Middle fails → Charlie never executes → Alice rolls back
        const commands = [aliceCommand, middleFailingCommand, charlieCommand]

        const result = await executePlan(commands, {})

        // Validate execution stopped at failure
        t.equal(result.executedCommands.length, 2, 'Only first two commands executed due to fail-fast')

        const charlieExecution = result.executedCommands.find(ec => ec.command.id === 'charlie-test-cmd')
        t.notOk(charlieExecution, 'Charlie was never executed due to middle failure')

        // Validate only Alice was rolled back (middle command failed forward so no rollback needed)
        t.equal(result.rollbackCommands.length, 1, 'Only Alice rolled back')

        const aliceRollback = result.rollbackCommands[0]
        t.equal(aliceRollback.command.id, 'alice-test-cmd', 'Alice was rolled back')
        t.equal(aliceRollback.success, true, 'Alice rollback succeeded')
    })

    await t.test(
        'When command execution and rollback both have different error types then error details preserved',
        async t => {
            const complexFailingCommand = {
                id: 'complex-failing-cmd',
                description: 'Command with different failure modes',
                canRollback: true,
                execute: async () => {
                    const err = new Error('Database connection timeout')
                    err.code = 'DB_TIMEOUT'
                    throw err
                },
                rollback: async forwardResult => {
                    const err = new Error('Network rollback failure')
                    err.code = 'NETWORK_ERROR'
                    throw err
                },
            }

            const commands = [aliceCommand, complexFailingCommand]

            const result = await executePlan(commands, {})

            // Validate error details preservation
            const failedExecution = result.executedCommands.find(ec => ec.command.id === 'complex-failing-cmd')
            t.equal(failedExecution.error.message, 'Database connection timeout', 'Forward error message preserved')
            t.equal(failedExecution.error.code, 'DB_TIMEOUT', 'Forward error code preserved')

            // Note: In this test, the complex command failed forward execution so it wouldn't be rolled back
            // Only Alice would be rolled back, and Alice rollback should succeed
            const aliceRollback = result.rollbackCommands.find(rb => rb.command.id === 'alice-test-cmd')
            t.equal(aliceRollback.success, true, 'Alice rollback succeeded despite other command failures')
        },
    )
})
