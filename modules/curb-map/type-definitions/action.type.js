/** @module Action */

import { FieldTypes } from './field-types.js'

/**
 * Action represents the different domain events that can be queued
 * @sig Action ::
 *      OrganizationCreated | OrganizationUpdated | OrganizationDeleted | OrganizationSuspended |
 *      UserCreated         | UserUpdated         | UserDeleted         | UserForgotten | RoleAssigned
 */

// prettier-ignore
export const Action = {
    name: 'Action',
    kind: 'taggedSum',
    variants: {
        // Organization Actions
        OrganizationCreated: {
            organizationId: FieldTypes.organizationId,
            projectId     : FieldTypes.projectId,
            name          : 'String',
        },
        OrganizationUpdated: {
            organizationId: FieldTypes.organizationId,
            name          : 'String?',
            status        : '/^(active|suspended)$/?',
        },
        OrganizationSuspended: {
            organizationId: FieldTypes.organizationId,
        },
        OrganizationDeleted: {
            organizationId: FieldTypes.organizationId,
        },

        // User Actions
        UserCreated: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
            email         : FieldTypes.email,
            displayName   : 'String',
            role          : /^(admin|member|viewer)$/,
        },
        UserUpdated: {
            userId        : FieldTypes.userId,
            email         : '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/?', // email address format: a@b.com
            displayName   : 'String?',
        },
        UserDeleted: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
        },
        UserForgotten: {
            userId        : FieldTypes.userId,
            reason        : 'String',
        },
        RoleAssigned: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
            role          : /^(admin|member|viewer)$/,
        }
    }
}

/*
 * Serialize action to Firestore format
 * @sig toFirestore :: Action -> Object
 */
Action.toFirestore = action => ({ ...action, '@@tagName': action['@@tagName'] })

/*
 * Deserialize action from Firestore format
 * @sig fromFirestore :: Object -> Action
 */
// prettier-ignore
Action.fromFirestore = o => {
    const tagName = o['@@tagName']

    if (tagName === 'OrganizationCreated'  ) return Action.OrganizationCreated.from(o)
    if (tagName === 'OrganizationDeleted'  ) return Action.OrganizationDeleted.from(o)
    if (tagName === 'OrganizationSuspended') return Action.OrganizationSuspended.from(o)
    if (tagName === 'OrganizationUpdated'  ) return Action.OrganizationUpdated.from(o)
    if (tagName === 'RoleAssigned'         ) return Action.RoleAssigned.from(o)
    if (tagName === 'UserCreated'          ) return Action.UserCreated.from(o)
    if (tagName === 'UserDeleted'          ) return Action.UserDeleted.from(o)
    if (tagName === 'UserForgotten'        ) return Action.UserForgotten.from(o)
    if (tagName === 'UserUpdated'          ) return Action.UserUpdated.from(o)

    throw new Error(`Unrecognized domain event ${tagName}`)
}

/*
 * Returns list of PII field names for a given action type.
 * These fields contain personally identifiable information and should be redacted in logs.
 * This is the definitive security boundary - separate from toLog which controls relevance.
 *
 * IMPORTANT: Accepts raw data (plain object) because it's used when Action construction fails.
 * Cannot use .match() since the Action may not be constructed yet.
 *
 * @sig piiFields :: Object -> [String]
 */
// prettier-ignore
Action.piiFields = rawData => {
    const tagName = rawData['@@tagName']
    if (tagName === 'OrganizationCreated'  ) return []
    if (tagName === 'OrganizationUpdated'  ) return []
    if (tagName === 'OrganizationSuspended') return []
    if (tagName === 'OrganizationDeleted'  ) return []
    if (tagName === 'UserCreated'          ) return ['email', 'displayName']
    if (tagName === 'UserUpdated'          ) return ['email', 'displayName']
    if (tagName === 'UserDeleted'          ) return []
    if (tagName === 'UserForgotten'        ) return []
    if (tagName === 'RoleAssigned'         ) return []

    return []  // Fallback for unrecognized types
}

/*
 * Return a subset of interesting fields to log, with PII redacted.
 * Automatically applies PII redaction as a security layer
 * @sig toLog = Action -> Object
 */
Action.toLog = a => {
    const redactField = field => {
        if (result[field]) result[field] = `${field}: ${result[field].length}`
    }

    // prettier-ignore
    const result = a.match({
        OrganizationCreated  : ({ name })                     => ({ type: 'OrganizationCreated', name}),
        OrganizationUpdated  : ({ name, status })             => ({ type: 'OrganizationUpdated', name, status}),
        OrganizationDeleted  : ()                             => ({ type: 'OrganizationDeleted', }),
        OrganizationSuspended: ()                             => ({ type: 'OrganizationSuspended', }),

        UserCreated          : ({ email, displayName, role }) => ({ type: 'UserCreated', email, displayName, role }),
        UserUpdated          : ({ email, displayName, role }) => ({ type: 'UserUpdated', email, displayName, role }),
        UserDeleted          : ()                             => ({ type: 'UserDeleted',  }),
        UserForgotten        : ({ reason })                   => ({ type: 'UserForgotten', reason }),
        RoleAssigned         : ({ role })                     => ({ type: 'RoleAssigned', role }),
    })

    Action.piiFields(a).forEach(redactField)
    return result
}

/*
 * Redacts PII fields from raw action data for safe logging.
 * Unlike omit(), this preserves field presence and structure for debugging.
 *
 * Examples:
 *   email: "user@example.com" -> email: "[EMAIL:16chars]"
 *   displayName: "John Doe" -> displayName: "[NAME:8chars]"
 *
 * @sig redactPii :: Object -> Object
 */
Action.redactPii = rawData => {
    const redactField = field => {
        if (result[field]) result[field] = `${field}: ${result[field].length}`
    }

    const piiFields = () => {
        const tagName = rawData['@@tagName']

        if (tagName === 'UserCreated') return ['email', 'displayName']
        if (tagName === 'UserUpdated') return ['email', 'displayName']

        return []
    }

    const result = { ...rawData }
    piiFields().forEach(redactField)
    return result
}

// Additional function: getSubject
// Returns the subject (entity being acted upon) for an action
// @sig getSubject :: Action -> { id: String, type: String }
// prettier-ignore
Action.getSubject = action =>
    action.match({
        OrganizationCreated:   a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationUpdated:   a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationSuspended: a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationDeleted:   a => ({ id: a.organizationId, type: 'organization' }),
        UserCreated:           a => ({ id: a.userId,         type: 'user' }),
        UserUpdated:           a => ({ id: a.userId,         type: 'user' }),
        UserDeleted:           a => ({ id: a.userId,         type: 'user' }),
        UserForgotten:         a => ({ id: a.userId,         type: 'user' }),
        RoleAssigned:          a => ({ id: a.userId,         type: 'user' }),
    })
