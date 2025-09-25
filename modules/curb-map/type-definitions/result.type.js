/**
 * Result models success or failure outcomes for REST helpers
 * @sig Result a = Success { value: Object, status: String, message: String } | Failure { originalError: Object, message: String }
 */

export const Result = {
    name: 'Result',
    kind: 'taggedSum',
    variants: {
        Success: { value: 'Object', status: /^(exists|created|updated)$/, message: 'String' },
        Failure: { originalError: 'Object', message: 'String' },
    },
}
