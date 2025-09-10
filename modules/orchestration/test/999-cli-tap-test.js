export default async function (config) {
    const execute = async () => ({ status: 'success', output: 'Test executed' })
    return [{ id: 'test-command', description: 'Test command for integration', canRollback: false, execute }]
}
