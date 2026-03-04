// ABOUTME: TaggedSum type for expression AST nodes in query compute clauses
// ABOUTME: Four variants — Literal, Binary, Call, Reference — used by parser, evaluator, and validator

import { FieldTypes } from './field-types.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// prettier-ignore
export const ExpressionNode = {
    name: 'ExpressionNode',
    kind: 'taggedSum',
    variants: {
        Literal:   { value: 'Number' },
        Binary:    { op: /^[/+*-]$/, left: 'ExpressionNode', right: 'ExpressionNode' },
        Call:      { fn: 'String', args: '[ExpressionNode]' },
        Reference: { source: FieldTypes.sourceName, field: 'String' },
    },
}
