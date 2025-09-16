import { spawn } from 'child_process'

/**
 * Execute shell command with smart error detection for cloud CLIs
 * @sig executeShellCommand :: (String, Object?) -> Promise<Object>
 */
const executeShellCommand = async (command, options = {}) => {
    if (typeof command !== 'string') throw new Error('command must be a string')

    const { errorPatterns = [], successPattern = '' } = options

    return new Promise((resolve, reject) => {
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

        console.log(`    [EXEC] ${command}`)
        const child = spawn(command, { shell: true, stdio: ['pipe', 'pipe', 'pipe'] })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', data => (stdout += data.toString()))
        child.stderr.on('data', data => (stderr += data.toString()))

        child.on('close', onClose)
        child.on('error', reject)
    })
}

// Backward compatibility wrapper
export { executeShellCommand }
