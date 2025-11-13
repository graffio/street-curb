import { spawn } from 'child_process'
import { resolve } from 'path'
import tap from 'tap'

// Helper function to run CLI command and capture output
const runCLI = async (args, cwd = process.cwd()) => {
    const cliPath = resolve(process.cwd(), 'src/cli.js')
    return new Promise((resolve, reject) => {
        const child = spawn('node', [cliPath, ...args], { cwd, stdio: ['pipe', 'pipe', 'pipe'] })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', data => (stdout += data.toString()))
        child.stderr.on('data', data => (stderr += data.toString()))

        // Store timeout reference for cleanup
        const timeoutId = setTimeout(() => {
            child.kill('SIGTERM')
            reject(new Error('CLI command timed out'))
        }, 5000)

        child.on('close', code => {
            clearTimeout(timeoutId)
            resolve({ code, stdout, stderr })
        })
        child.on('error', err => {
            clearTimeout(timeoutId)
            reject(err)
        })
    })
}

tap.test('Given CLI integration', async t => {
    const configPath = resolve(process.cwd(), 'test/cli.tap.config.js')
    const migrationPath = resolve(process.cwd(), 'test/999-cli-tap-test.js')

    await t.test('When running dry-run (default behavior)', async t => {
        const result = await runCLI([configPath, migrationPath])

        t.equal(result.code, 0, 'Then CLI exits successfully')
        t.match(result.stdout, /DRY RUN/, 'Then shows dry run mode')
        t.match(result.stdout, /Test command for integration/, 'Then shows command description')
    })

    await t.test('When running with --apply flag', async t => {
        const result = await runCLI([configPath, migrationPath, '--apply'])

        t.equal(result.code, 0, 'Then CLI executes successfully with --apply')
        t.match(result.stdout, /completed successfully/, 'Then reports successful completion')
    })
})
