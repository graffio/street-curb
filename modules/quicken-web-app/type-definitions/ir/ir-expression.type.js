// ABOUTME: TaggedSum type for expression AST nodes in query compute clauses
// ABOUTME: Four variants — Literal, Binary, Call, Reference — used by evaluator and validator

import { FieldTypes } from '../field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const IRExpression = {
    name: 'IRExpression',
    kind: 'taggedSum',
    variants: {
        Literal:   { value: 'Number' },
        Binary:    { op: FieldTypes.arithmeticOp, left: 'IRExpression', right: 'IRExpression' },
        Call:      { fn: /^abs$/, args: '[IRExpression]' },
        Reference: { source: FieldTypes.sourceName, field: /^[a-zA-Z_][a-zA-Z0-9_]*$/ },
    },
}
