import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { mkdir, rm, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
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

// Helper function to create minimal test setup
const createTestSetup = async testDir => {
    const migrationsDir = join(testDir, 'migrations')
    const configDir = join(migrationsDir, 'config')

    await mkdir(configDir, { recursive: true })

    // Create simple test migration
    await writeFile(
        join(migrationsDir, '001-test.js'),
        `
        export default async function(environment, config) {
            return [{
                id: 'test-command',
                description: 'Test command for integration',
                canRollback: false,
                execute: async () => ({ status: 'success', output: 'Test executed', duration: 10, result: {} })
            }]
        }
        `,
    )

    // Create test config
    await writeFile(join(configDir, 'test.json'), JSON.stringify({ projectId: 'test-project' }))

    return { testDir, migrationsDir, configDir }
}

// Helper function to clean up test directory
const cleanupTestDirectory = async testDir => {
    if (existsSync(testDir)) await rm(testDir, { recursive: true, force: true })
}

tap.test('Given CLI integration', async t => {
    const testDir = join(process.cwd(), 'test-temp-cli-integration')

    t.beforeEach(async () => {
        await cleanupTestDirectory(testDir)
        await createTestSetup(testDir)
    })

    t.afterEach(async () => await cleanupTestDirectory(testDir))

    await t.test('When running dry-run (default behavior)', async t => {
        const result = await runCLI(['test', 'execute', '001'], testDir)

        t.equal(result.code, 0, 'Then CLI exits successfully')
        t.match(result.stdout, /DRY RUN/, 'Then indicates dry-run mode')
        t.match(result.stdout, /Test command for integration/, 'Then shows command description')
        t.match(result.stdout, /use --apply to execute for real/, 'Then suggests --apply flag')
    })

    await t.test('When running with --apply flag', async t => {
        const result = await runCLI(['test', 'execute', '001', '--apply'], testDir)

        t.equal(result.code, 0, 'Then CLI executes successfully with --apply')
        t.notMatch(result.stdout, /DRY RUN/, 'Then does not indicate dry-run mode')
        t.match(result.stdout, /Executing execute for migration/, 'Then indicates real execution')
        t.match(result.stdout, /completed successfully/, 'Then reports successful completion')
    })
})
