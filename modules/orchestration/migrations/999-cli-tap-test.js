export default async function (environment, config) {
    const execute = async () => ({ status: 'success', output: 'Test executed' })
    execute.command = 'woohoo: execute!'
    return [{ id: 'test-command', description: 'Test command for integration', canRollback: false, execute }]
}
