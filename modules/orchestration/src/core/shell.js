import { spawn } from 'child_process'

/**
 * Run shell command with comprehensive output capture
 * @sig runShellCommand :: (String, Array<String>, Object?) -> Promise<CommandResult>
 */
const runShellCommand = async (command, args, options = {}) => {
    const startTime = Date.now()
    const commandLine = `${command} ${args.join(' ')}`

    // Log command execution attempt
    console.log(`🔧 Running: ${commandLine}`)

    return new Promise((resolve, reject) => {
        const onError = error => {
            console.error(`💥 Command spawn error:`, error)
            reject(error)
        }

        const onClose = exitCode => {
            const duration = Date.now() - startTime
            const result = { command: commandLine, exitCode, stdout: stdout.trim(), stderr: stderr.trim(), duration }
            console.log(`📋 Command completed:`, JSON.stringify(result, null, 2))
            resolve(result)
        }

        let stdout = ''
        let stderr = ''

        const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], ...options })
        child.on('close', onClose)
        child.on('error', onError)
        child.stdout.on('data', data => (stdout += data.toString()))
        child.stderr.on('data', data => (stderr += data.toString()))
    })
}

/**
 * Create command object with smart error detection
 * @sig createShellCommand :: (String, Array<String>, Object?) -> Object
 */
const createShellCommand = (commandName, args, options = {}) => {
    // turn a whitespace separated command and turn it into a command and args array needed by runShellCommand
    if (typeof commandName === 'string' && typeof args === 'undefined') {
        const fields = commandName.split(/\s+/g)
        commandName = fields[0]
        args = fields.slice(1)
    }

    const { successPattern = [], errorPatterns = [] } = options
    const command = `${commandName} ${args.join(' ')}`

    const execute = async () => {
        const result = await runShellCommand(commandName, args)

        // Smart success/failure detection
        const hasErrors = errorPatterns.some(
            pattern => result.stdout.includes(pattern) || result.stderr.includes(pattern),
        )

        const isSuccess = result.exitCode === 0 && !hasErrors && result.stdout.includes(successPattern)
        if (!isSuccess) throw new Error(`Command failed: ${result.stderr || result.stdout}`)

        return {
            status: 'success',
            output: result.stdout,
            duration: result.duration,
            result: { commandOutput: result },
        }
    }

    execute.command = command
    return execute
}

export { createShellCommand, runShellCommand }
