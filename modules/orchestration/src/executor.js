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
    const nullAuditLogger = () => {}
    const { auditLogger = nullAuditLogger, auditContext, mode = 'execute' } = dependencies

    const operationType = mode === 'rollback' ? 'rollback' : 'execution'

    // Log operation start
    auditLogger({
        type: operationType,
        phase: 'start',
        commandCount: commands.length,
        timestamp: new Date().toISOString(),
        ...(auditContext || {}),
    })

    // Execute or rollback commands based on mode
    const results =
        mode === 'rollback'
            ? await rollbackCommands(commands.map(cmd => ({ command: cmd, success: true })))
            : await executeCommands(commands)

    // Log individual command results
    results.forEach(result => {
        auditLogger({
            type: operationType,
            phase: result.success ? 'success' : 'failure',
            commandId: result.command.id,
            commandDescription: result.command.description,
            success: result.success,
            error: result.error?.message,
            duration: result.executionTime,
            timestamp: new Date().toISOString(),
            ...(auditContext || {}),
        })
    })

    // Determine overall success (all commands succeeded)
    const allSucceeded = results.every(result => result.success)

    // Log completion
    auditLogger({
        type: operationType,
        phase: 'complete',
        success: allSucceeded,
        commandCount: results.length,
        timestamp: new Date().toISOString(),
        ...(auditContext || {}),
    })

    return { success: allSucceeded, results, mode }
}

export { executeCommands, rollbackCommands, executePlan }
