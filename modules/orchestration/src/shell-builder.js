/*
 * Functional shell command builder using closure pattern
 * @sig shell :: Object
 */
import { logOrRunShellCommand } from './audit.js'

const shellBuilder = command => {
    let soc2Data = {}
    let isDryRun = false

    const forMigration = (migrationId, operation) => {
        soc2Data = {
            migrationId,
            operation,
            sessionId: `cli-${Date.now()}`,
            userId: process.env.USER || 'system',
            sourceIP: '127.0.0.1',
            resource: 'infrastructure',
        }
        return { forMigration, dryRun, run }
    }

    const dryRun = isDryRunFlag => {
        isDryRun = isDryRunFlag
        return { forMigration, dryRun, run }
    }

    const run = async () => await logOrRunShellCommand(isDryRun, command, soc2Data)

    return { forMigration, dryRun, run }
}

export { shellBuilder }
