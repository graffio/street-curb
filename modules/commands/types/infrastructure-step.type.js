export const InfrastructureStep = {
    name: 'InfrastructureStep',
    kind: 'tagged',
    fields: {
        adapter: 'String',
        action: 'String',
        description: 'String',
        canRollback: 'Boolean',

        additional: 'Object?', // All adapter-specific fields
    },
}
