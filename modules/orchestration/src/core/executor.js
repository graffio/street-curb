/*
 * Infrastructure Command Executor
 *
 * Executes vanilla JavaScript command objects in sequential order with
 * fail-fast behavior and reverse-order rollback capabilities.
 *
 * Core functions:
 * - executeCommands: Sequential execution with fail-fast
 * - rollbackCommands: Reverse-order rollback with error capture
 * - executePlan: Orchestration with audit logging integration
 */

/**
 * Execute commands sequentially with fail-fast behavior
 * @sig executeCommands :: Array<Command> -> Promise<Array<ExecutionResult>>
 */
const executeCommands = async commands => {
    const results = []

    for (const command of commands) {
        const startTime = Date.now()

        try {
            const result = await command.execute()
            const executionTime = Date.now() - startTime
            results.push({ command, result, success: true, executionTime })
        } catch (error) {
            const executionTime = Date.now() - startTime
            results.push({ command, result: null, success: false, error, executionTime })
            break // Fail-fast: stop execution on first failure
        }
    }

    return results
}

/**
 * Rollback executed commands in reverse order
 * @sig rollbackCommands :: Array<ExecutionResult> -> Promise<Array<RollbackResult>>
 */
const rollbackCommands = async executedCommands => {
    const rollbackResults = []

    // Process in reverse order for rollback
    const reversedCommands = [...executedCommands].reverse()

    for (const executedCommand of reversedCommands) {
        const { command } = executedCommand
        const startTime = Date.now()

        try {
            // Check if command can be rolled back
            if (!command.canRollback) throw new Error(`${command.description} cannot be rolled back`)
            const result = await command.rollback(executedCommand.result)
            const executionTime = Date.now() - startTime
            rollbackResults.push({ command, result, success: true, executionTime })
        } catch (error) {
            const executionTime = Date.now() - startTime
            rollbackResults.push({ command, result: null, success: false, error, executionTime })
        }
    }

    return rollbackResults
}

/**
 * Execute plan with comprehensive orchestration and audit logging
 * @sig executePlan :: (Array<Command>, Object?) -> Promise<ExecutionResult>
 */
const executePlan = async (commands, dependencies = {}) => {
    const { auditLogger, auditContext } = dependencies

    // Log execution start if audit logger provided
    if (auditLogger) {
        auditLogger.log({
            type: 'execution',
            phase: 'start',
            commandCount: commands.length,
            timestamp: new Date().toISOString(),
            ...(auditContext || {}),
        })
    }

    // Execute commands
    const executedCommands = await executeCommands(commands)

    // Log individual command executions
    if (auditLogger) {
        executedCommands.forEach(execution => {
            auditLogger.log({
                type: 'execution',
                phase: execution.success ? 'success' : 'failure',
                commandId: execution.command.id,
                commandDescription: execution.command.description,
                success: execution.success,
                error: execution.error?.message,
                duration: execution.executionTime,
                timestamp: new Date().toISOString(),
                ...(auditContext || {}),
            })
        })
    }

    // Check if any command failed
    const failedCommand = executedCommands.find(cmd => !cmd.success)

    if (failedCommand) {
        // Need to rollback successfully executed commands (excluding the failed one)
        const successfulCommands = executedCommands.filter(cmd => cmd.success)

        let rollbackResults = []
        if (successfulCommands.length > 0) {
            if (auditLogger) {
                auditLogger.log({
                    type: 'rollback',
                    phase: 'start',
                    commandCount: successfulCommands.length,
                    timestamp: new Date().toISOString(),
                    ...(auditContext || {}),
                })
            }

            rollbackResults = await rollbackCommands(successfulCommands)

            // Log rollback results
            if (auditLogger) {
                rollbackResults.forEach(rollback => {
                    auditLogger.log({
                        type: 'rollback',
                        phase: rollback.success ? 'success' : 'failure',
                        commandId: rollback.command.id,
                        commandDescription: rollback.command.description,
                        success: rollback.success,
                        error: rollback.error?.message,
                        duration: rollback.executionTime,
                        timestamp: new Date().toISOString(),
                        ...(auditContext || {}),
                    })
                })
            }
        }

        return { success: false, executedCommands, rollbackCommands: rollbackResults }
    }

    // All commands succeeded
    if (auditLogger) {
        auditLogger.log({
            type: 'execution',
            phase: 'complete',
            success: true,
            commandCount: executedCommands.length,
            timestamp: new Date().toISOString(),
            ...(auditContext || {}),
        })
    }

    return { success: true, executedCommands, rollbackCommands: [] }
}

export { executeCommands, rollbackCommands, executePlan }
