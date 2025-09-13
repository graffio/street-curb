import tap from 'tap'
import { shellBuilder } from '../src/shell-builder.js'

tap.test('Given functional shell command builder', async t => {
    await t.test('When using forMigration API', async t => {
        const result = await shellBuilder('echo test')
            .forMigration('test-migration', 'test-operation')
            .dryRun(true)
            .run()

        t.equal(result.status, 'success', 'Then the command executes successfully')
        t.equal(result.output, 'dry-run', 'Then the output indicates dry-run mode')
    })

    await t.test('When chaining methods in different order', async t => {
        const result = await shellBuilder('echo fluent')
            .dryRun(true)
            .forMigration('test-migration', 'test-operation')
            .run()

        t.equal(result.status, 'success', 'Then method chaining works in any order')
    })
})
