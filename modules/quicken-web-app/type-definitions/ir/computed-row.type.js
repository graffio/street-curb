// ABOUTME: Tagged type for named computed rows in pivot queries
// ABOUTME: Each row has a name and a PivotExpression that is evaluated per column bucket

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const ComputedRow = {
    name: 'ComputedRow',
    kind: 'tagged',
    fields: {
        name:       'String',
        expression: 'PivotExpression',
    },
}
