import { spawn } from 'child_process'
import { getLogger } from './logger.js'

/**
 * Execute shell command with smart error detection for cloud CLIs
 * @sig executeShellCommand :: (String, Object?) -> Promise<Object>
 */
const executeShellCommand = async (command, options = {}) => {
    if (typeof command !== 'string') throw new Error('command must be a string')
    const logger = getLogger()

    const { errorPatterns = [], successPattern = '' } = options

    return new Promise((resolve, reject) => {
        const onClose = exitCode => {
            const stdoutOutput = stdout.trim()
            const stderrOutput = stderr.trim()
            const allOutput = stdoutOutput + stderrOutput

            // Smart success/failure detection beyond just exit code
            const hasErrorPatterns = errorPatterns.some(p => allOutput.toLowerCase().includes(p.toLowerCase()))
            const hasSuccessPattern = !successPattern || allOutput.includes(successPattern)

            // Firebase often returns 0 even on failure, so check patterns first
            const isSuccess = !hasErrorPatterns && hasSuccessPattern && exitCode === 0

            if (isSuccess) return resolve({ status: 'success', output: stdoutOutput })

            const error = new Error(`Command: '${command}' failed (see error.stdout and error.stderr for details)`)
            error.stdout = stdoutOutput
            error.stderr = stderrOutput
            reject(error)
        }

        logger.log(`    ${command}`)
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
