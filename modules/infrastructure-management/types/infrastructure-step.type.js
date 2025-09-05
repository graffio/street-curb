/**
 * Blockface represents a street segment with geometry, metadata, and curb segments
 * @sig Blockface :: { id: String, geometry: Object, streetName: String, cnnId: String?, segments: [Segment] }
 */
export const InfrastructureStep = {
    name: 'InfrastructureStep',
    kind: 'tagged',
    fields: {
        adapter: 'String',
        action: 'String',
        description: 'String',
        canRollback: 'Boolean',
        command: 'String?', // shell script to perform step
        rollback: 'String?', // undo command

        additional: 'Object?', // All adapter-specific fields
    },
}
