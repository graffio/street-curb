// ABOUTME: Tagged type for named computed rows in IR queries
// ABOUTME: Each row has a name and an IRPivotExpression that is evaluated per column bucket

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRComputedRow = {
    name: 'IRComputedRow',
    kind: 'tagged',
    fields: {
        name:       'String',
        expression: 'IRPivotExpression',
    },
}
