/** @module Violation */

// Tagged type for style violation reports
export const Violation = {
    name: 'Violation',
    kind: 'tagged',
    fields: { type: 'String', line: 'Number', column: 'Number', priority: 'Number', message: 'String', rule: 'String' },
}
