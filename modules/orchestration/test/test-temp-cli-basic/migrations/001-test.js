export default async function (environment, config) {
    return [
        {
            id: 'test-command',
            description: 'Test command',
            canRollback: true,
            execute: async () => ({ status: 'success', output: 'Test executed' }),
            rollback: async () => ({ status: 'success', output: 'Test rolled back' }),
        },
    ]
}
