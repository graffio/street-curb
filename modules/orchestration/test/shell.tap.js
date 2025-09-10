import tap from 'tap'
import { createShellCommand, runShellCommand } from '../src/core/shell.js'

tap.test('Given runShellCommand', async t => {
    await t.test('When running successful command', async t => {
        const result = await runShellCommand('echo', ['hello', 'world'])

        t.equal(result.exitCode, 0, 'Then exit code is 0')
        t.equal(result.stdout, 'hello world', 'Then stdout captured correctly')
        t.equal(result.stderr, '', 'Then stderr is empty')
        t.ok(result.duration >= 0, 'Then duration measured')
        t.equal(result.command, 'echo hello world', 'Then command string recorded')
    })

    await t.test('When running command that fails', async t => {
        const result = await runShellCommand('ls', ['/nonexistent/directory'])

        t.equal(result.exitCode, 1, 'Then exit code is non-zero')
        t.ok(result.stderr.length > 0, 'Then stderr contains error message')
        t.ok(result.duration >= 0, 'Then duration measured')
    })

    await t.test('When running command with mixed output', async t => {
        // Use a command that writes to both stdout and stderr
        const result = await runShellCommand('sh', ['-c', 'echo "stdout message"; echo "stderr message" >&2'])

        t.equal(result.stdout, 'stdout message', 'Then stdout captured')
        t.equal(result.stderr, 'stderr message', 'Then stderr captured')
    })
})

tap.test('Given createShellCommand', async t => {
    await t.test('When creating simple command', async t => {
        const shellCmd = createShellCommand('echo', ['test'])

        t.equal(shellCmd.command, 'echo test', 'Then description matches command')
        t.equal(typeof shellCmd, 'function', 'Then execute is a function')
    })

    await t.test('When executing successful shell command', async t => {
        const shellCmd = createShellCommand('echo', ['success'])
        const result = await shellCmd()

        t.equal(result.status, 'success', 'Then status is success')
        t.equal(result.output, 'success', 'Then output captured')
        t.ok(result.duration >= 0, 'Then duration measured')
        t.ok(result.result.commandOutput, 'Then raw command output included')
    })

    await t.test('When command fails with error patterns', async t => {
        const shellCmd = createShellCommand('echo', ['Error: something failed'], { errorPatterns: ['failed'] })

        try {
            await shellCmd()
            t.fail('Then should throw error')
        } catch (error) {
            t.ok(error.message.includes('Command failed'), 'Then error thrown with failure message')
        }
    })

    await t.test('When command succeeds despite error pattern in output', async t => {
        // Command that returns 0 but mentions "error" in output
        const shellCmd = createShellCommand('echo', ['no actual error here'], {
            errorPatterns: ['Error:', 'failed'], // Patterns that don't match
        })

        const result = await shellCmd()
        t.equal(result.status, 'success', 'Then status is success when patterns do not match')
    })

    await t.test('When command has non-zero exit code', async t => {
        const shellCmd = createShellCommand('ls', ['/nonexistent'])

        try {
            await shellCmd()
            t.fail('Then should throw error for non-zero exit code')
        } catch (error) {
            t.ok(error.message.includes('Command failed'), 'Then error thrown for non-zero exit')
        }
    })
})
