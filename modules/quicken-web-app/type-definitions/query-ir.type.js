// ABOUTME: Tagged type for parsed query intermediate representation
// ABOUTME: Central artifact between parser and executor — name, sources, computation, output

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const QueryIR = {
    name: 'QueryIR',
    kind: 'tagged',
    fields: {
        name:        'String',
        description: 'String?',
        sources:     '{QuerySource:name}',
        computation: 'Computation',
        output:      'QueryOutput?',
    },
}
