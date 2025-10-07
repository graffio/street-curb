/** @module SystemFlags */

/**
 * SystemFlags represents overall control of the system, especially Firebase
 * @sig SystemFlags :: { triggersEnabled: Boolean }
 */

// prettier-ignore
export const SystemFlags = {
    name: 'SystemFlags',
    kind: 'tagged',
    fields: {
        id             : /flags/,
        triggersEnabled: 'Boolean'
    }}

SystemFlags.toFirestore = f => ({ ...f })
SystemFlags.fromFirestore = SystemFlags.from
