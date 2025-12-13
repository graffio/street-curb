// ABOUTME: View type definition for tab content types
// ABOUTME: Tagged sum with Register, Report, and Reconciliation variants

import { FieldTypes } from './field-types.js'

// prettier-ignore
export const View = {
    name: 'View',
    kind: 'taggedSum',
    variants: {
        Register:       { id: FieldTypes.viewId, accountId: 'String', title: 'String' },
        Report:         { id: FieldTypes.viewId, reportType: 'String', title: 'String' },
        Reconciliation: { id: FieldTypes.viewId, accountId: 'String', title: 'String' },
    },
}
