// ABOUTME: TaggedSum type for per-column expressions in IR computed rows
// ABOUTME: Three variants — RowRef, Literal, Binary — RowRef uses free-form row names

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRPivotExpression = {
    name: 'IRPivotExpression',
    kind: 'taggedSum',
    variants: {
        RowRef:  { name: 'String' },
        Literal: { value: 'Number' },
        Binary:  { op: FieldTypes.arithmeticOp, left: 'IRPivotExpression', right: 'IRPivotExpression' },
    },
}
