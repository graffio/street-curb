/*
 * Infrastructure Command Executor
 *
 * Executes vanilla JavaScript command objects in sequential order with
 * fail-fast behavior and reverse-order rollback capabilities.
 *
 * Core functions:
 * - executeCommands: Sequential execution with fail-fast
 * - rollbackCommands: Reverse-order rollback with error capture
 * - executeOrRollbackCommands: Orchestration with audit logging integration
 */

const executeCommands = async (commands, isRollback) => {
    const prefix = command => commands.indexOf(command) + 1 + '.'

    const results = []

    for (const command of commands) {
        // Show command description before execution for better dry-run flow
        console.log(`${prefix(command)} ${command.id} → ${command.description}`)
        console.log() // Add blank line after description

        const startTime = Date.now()

        try {
            if (isRollback && !command.canRollback) throw new Error(`${command.description} cannot be rolled back`)

            const result = isRollback ? await command.rollback() : await command.execute()
            const executionTime = Date.now() - startTime
            results.push({ command, result, success: true, executionTime })
            console.log() // Add blank line after execution
        } catch (error) {
            const executionTime = Date.now() - startTime
            results.push({ command, result: null, success: false, error, executionTime })
            break // Fail-fast: stop execution on first failure
        }
    }

    return results
}

/**
 * Execute plan with comprehensive orchestration and audit logging
 * @sig executeOrRollbackCommands :: (Array<Command>, Object?) -> Promise<ExecutionResult>
 */
const executeOrRollbackCommands = async (commands, mode = 'execute') => {
    const results =
        mode === 'rollback' ? await executeCommands(commands.reverse(), true) : await executeCommands(commands, false)
    const allSucceeded = results.every(result => result.success)
    return { success: allSucceeded, results, mode }
}

export { executeOrRollbackCommands }
