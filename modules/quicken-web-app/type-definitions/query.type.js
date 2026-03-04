// ABOUTME: Tagged type for query intermediate representation
// ABOUTME: Central artifact between Claude and executor — name, sources, computation, output

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const Query = {
    name: 'Query',
    kind: 'tagged',
    fields: {
        name:        'String',
        description: 'String?',
        sources:     '{IRSource:name}',
        computation: 'IRComputation',
        output:      'IROutput?',
    },
}
