import { spawn } from 'child_process'

/**
 * Simple shell command executor for migration commands
 * @sig createShellCommand :: (String, Array<String>?, Object?) -> Function
 */
const createShellCommand = (command, args = [], options = {}) => {
    // Handle string commands by splitting them
    if (typeof command === 'string' && !args.length) {
        const parts = command.split(/\s+/)
        command = parts[0]
        args = parts.slice(1)
    }

    const { errorPatterns = [], successPattern = '' } = options

    const execute = async () =>
        new Promise((resolve, reject) => {
            const onClose = exitCode => {
                const output = stdout.trim()
                const errors = stderr.trim()
                const allOutput = output + errors

                // Smart success/failure detection beyond just exit code
                const hasErrorPatterns = errorPatterns.some(p => allOutput.toLowerCase().includes(p.toLowerCase()))
                const hasSuccessPattern = !successPattern || allOutput.includes(successPattern)

                // Firebase often returns 0 even on failure, so check patterns first
                const isSuccess = !hasErrorPatterns && hasSuccessPattern && exitCode === 0

                isSuccess
                    ? resolve({ status: 'success', output })
                    : reject(new Error(`Command failed: ${errors || output || `Command exited with code ${exitCode}`}`))
            }

            const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] })

            let stdout = ''
            let stderr = ''

            child.stdout.on('data', data => (stdout += data.toString()))
            child.stderr.on('data', data => (stderr += data.toString()))

            child.on('close', onClose)
            child.on('error', reject)
        })

    execute.command = `${command} ${args.join(' ')}`
    return execute
}

export { createShellCommand }
