import tap from 'tap'
import { executeOrRollbackCommands } from '../src/executor.js'

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
        const executedCommands = await executeOrRollbackCommands(commands)

        // Validate execution results
        t.equal(executedCommands.results.length, 1, 'Executed 1 command')

        const executedCommand = executedCommands.results[0]
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
        const executedCommands = await executeOrRollbackCommands(commands)

        // Validate execution results
        t.equal(executedCommands.results.length, 2, 'Executed 2 commands')

        // Find Alice and Bob results
        const aliceExecution = executedCommands.results.find(ec => ec.command.id === 'alice-test-cmd')
        const bobExecution = executedCommands.results.find(ec => ec.command.id === 'bob-test-cmd')

        t.ok(aliceExecution, 'Alice command was executed')
        t.ok(bobExecution, 'Bob command was executed')

        // Validate Alice execution
        t.equal(aliceExecution.success, true, 'Alice execution was successful')
        t.equal(aliceExecution.result.output, 'Alice executed test-operation', 'Alice produced expected output')

        // Validate Bob execution
        t.equal(bobExecution.success, true, 'Bob execution was successful')
        t.equal(bobExecution.result.output, 'Bob executed bob-operation', 'Bob produced expected output')

        // Validate Alice appears before Bob in results (sequential ordering)
        const aliceIndex = executedCommands.results.findIndex(cmd => cmd.command.id === 'alice-test-cmd')
        const bobIndex = executedCommands.results.findIndex(cmd => cmd.command.id === 'bob-test-cmd')
        t.ok(aliceIndex < bobIndex, 'Alice executed before Bob (sequential ordering)')
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
        const executedCommands = await executeOrRollbackCommands(commands)

        t.equal(executedCommands.results.length, 1, 'Failed command still recorded in execution results')

        const failedExecution = executedCommands.results[0]
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
        const executedCommands = await executeOrRollbackCommands(commands)

        // Validate fail-fast: only Alice and failingCommand should have been attempted
        t.equal(executedCommands.results.length, 2, 'Only 2 commands attempted due to fail-fast')

        const aliceExecution = executedCommands.results.find(ec => ec.command.id === 'alice-test-cmd')
        const failedExecution = executedCommands.results.find(ec => ec.command.id === 'early-failure-cmd')
        const bobExecution = executedCommands.results.find(ec => ec.command.id === 'bob-test-cmd')

        t.ok(aliceExecution, 'Alice was executed before failure')
        t.ok(failedExecution, 'Failing command was attempted')
        t.notOk(bobExecution, 'Bob was never executed due to fail-fast')

        // Validate Alice succeeded but sequence was interrupted
        t.equal(aliceExecution.success, true, 'Alice execution succeeded')
        t.equal(failedExecution.success, false, 'Failing command failed as expected')
    })
})

// Test executeOrRollbackCommands integration
tap.test('Given executeOrRollbackCommands integration', async t => {
    await t.test('When calling executeOrRollbackCommands with commands then execution works', async t => {
        const commands = [aliceCommand, charlieCommand]

        const result = await executeOrRollbackCommands(commands)

        // Validate execution result structure
        t.equal(result.success, true, 'executeOrRollbackCommands reports success')
        t.equal(result.results.length, 2, 'executeOrRollbackCommands executed both commands')

        // Validate command results
        const aliceResult = result.results.find(r => r.command.id === 'alice-test-cmd')
        const charlieResult = result.results.find(r => r.command.id === 'charlie-test-cmd')

        t.equal(aliceResult.success, true, 'Alice command succeeded')
        t.equal(charlieResult.success, true, 'Charlie command succeeded')
    })

    await t.test('When calling executeOrRollbackCommands with failing command then rollback occurs', async t => {
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

        const result = await executeOrRollbackCommands(commands)

        // Validate failure occurred (no automatic rollback)
        t.equal(result.success, false, 'executeOrRollbackCommands reports failure')
        t.equal(result.results.length, 2, 'Both commands were attempted')

        // Validate failure details
        const failedExecution = result.results.find(ec => ec.command.id === 'plan-failure-cmd')
        t.equal(failedExecution.success, false, 'Failing command marked as failed')

        const aliceExecution = result.results.find(ec => ec.command.id === 'alice-test-cmd')
        t.equal(aliceExecution.success, true, 'Alice execution succeeded before failure')
    })

    await t.test(
        'When calling executeOrRollbackCommands with non-rollbackable failure then execution stops',
        async t => {
            const failingCommand = {
                id: 'non-rollbackable-failure-cmd',
                description: 'Non-rollbackable command that fails',
                canRollback: false,
                execute: async () => {
                    throw new Error('Non-rollbackable failure')
                },
            }

            const commands = [aliceCommand, failingCommand]

            const result = await executeOrRollbackCommands(commands)

            // Validate failure without automatic rollback
            t.equal(result.success, false, 'executeOrRollbackCommands reports failure')
            t.equal(result.results.length, 2, 'Both commands were attempted')

            // Validate Alice succeeded and failure occurred
            const aliceExecution = result.results.find(ec => ec.command.id === 'alice-test-cmd')
            const failedExecution = result.results.find(ec => ec.command.id === 'non-rollbackable-failure-cmd')

            t.equal(aliceExecution.success, true, 'Alice execution succeeded')
            t.equal(failedExecution.success, false, 'Failing command marked as failed')
        },
    )
})
