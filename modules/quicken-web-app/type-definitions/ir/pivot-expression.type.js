// ABOUTME: TaggedSum type for per-column expressions in pivot query computed rows
// ABOUTME: Three variants — RowRef, Literal, Binary — separate from IRExpression because RowRef uses free-form names

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const PivotExpression = {
    name: 'PivotExpression',
    kind: 'taggedSum',
    variants: {
        RowRef:  { name: 'String' },
        Literal: { value: 'Number' },
        Binary:  { op: FieldTypes.arithmeticOp, left: 'PivotExpression', right: 'PivotExpression' },
    },
}
