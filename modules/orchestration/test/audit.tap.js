import tap from 'tap'

import { logOrRunShellCommand } from '../src/audit.js'

const soc2Data = {
    migrationId: 'test',
    operation: 'operation',
    sessionId: 'sessionId',
    userId: 'userId',
    sourceIP: '127.0.0.1',
    resource: 'resource',
}

tap.test('Given dry-run helper functions', async t => {
    await t.test('When calling logOrRunShellCommand in dry-run mode', async t => {
        const result = await logOrRunShellCommand(true, 'echo test', soc2Data)

        t.equal(result.status, 'success', 'Returns success status for dry-run')
        t.equal(result.output, 'dry-run', 'Returns dry-run output')
    })

    await t.test('When calling logOrRunShellCommand in execution mode', async t => {
        const result = await logOrRunShellCommand(false, 'echo "test execution"', soc2Data)

        t.equal(result.status, 'success', 'Returns success status for execution')
        t.match(result.output, /test execution/, 'Returns actual command output')
    })
})
