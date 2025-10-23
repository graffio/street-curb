/** @module Action */

import { FieldTypes } from './field-types.js'

/**
 * Action represents the different domain events that can be queued
 * @sig Action ::
 *
 *      // organization
 *      OrganizationCreated
 *      OrganizationDeleted
 *      OrganizationSuspended
 *      OrganizationUpdated
 *
 *      // organization member
 *      MemberAdded
 *      MemberRemoved
 *      RoleChanged
 *
 *      // user
 *      UserCreated
 *      UserForgotten
 *      UserUpdated
 *
 *      // authentication (F121 - deferred)
 *      PasscodeRequested
 *      PasscodeVerified
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
        OrganizationDeleted: {
            organizationId: FieldTypes.organizationId,
        },
        OrganizationSuspended: {
            organizationId: FieldTypes.organizationId,
        },
        OrganizationUpdated: {
            organizationId: FieldTypes.organizationId,
            name          : 'String?',
            status        : '/^(active|suspended)$/?',
        },
        
        // Organization Member Actions
        MemberAdded: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
            displayName   : 'String',
            role          : FieldTypes.role,
        },
        MemberRemoved: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
        },
        RoleChanged: {
            userId        : FieldTypes.userId,
            organizationId: FieldTypes.organizationId,
            role          : FieldTypes.role,
        },

        // User Actions
        UserCreated: {
            userId        : FieldTypes.userId,
            email         : FieldTypes.email,
            displayName   : 'String',
            authUid       : 'String',  // Firebase Auth UID (for userId claim sync)
        },
        UserForgotten: {
            userId        : FieldTypes.userId,
            reason        : 'String',
        },
        UserUpdated: {
            userId        : FieldTypes.userId,
            email         : '/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/?', // email address format: a@b.com
            displayName   : 'String?',
        },

        // Authentication Actions (F121 - Deferred)
        // IMPORTANT: PasscodeVerified must set userId claim BEFORE returning token
        // See docs/decisions.md#userid-claim-sync for architecture
        //
        // PasscodeRequested: {
        //     phoneNumber   : 'String',  // E.164 format: +14155551234
        // },
        // PasscodeVerified: {
        //     phoneNumber   : 'String',  // E.164 format: +14155551234
        //     passcode      : 'String',  // 6-digit code
        //     userId        : FieldTypes.userId,  // Server-generated, not client-provided
        // },

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

    // organization
    if (tagName === 'OrganizationCreated'  ) return Action.OrganizationCreated.from(o)
    if (tagName === 'OrganizationDeleted'  ) return Action.OrganizationDeleted.from(o)
    if (tagName === 'OrganizationSuspended') return Action.OrganizationSuspended.from(o)
    if (tagName === 'OrganizationUpdated'  ) return Action.OrganizationUpdated.from(o)
    
    // organization member
    if (tagName === 'MemberAdded'          ) return Action.MemberAdded.from(o)
    if (tagName === 'MemberRemoved'        ) return Action.MemberRemoved.from(o)
    if (tagName === 'RoleChanged'          ) return Action.RoleChanged.from(o)
    
    // user
    if (tagName === 'UserCreated'          ) return Action.UserCreated.from(o)
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
    
    // organization
    if (tagName === 'OrganizationCreated'  ) return []
    if (tagName === 'OrganizationDeleted'  ) return []
    if (tagName === 'OrganizationSuspended') return []
    if (tagName === 'OrganizationUpdated'  ) return []
    
    // organization member
    if (tagName === 'MemberAdded'          ) return ['displayName']
    if (tagName === 'MemberRemoved'        ) return []
    if (tagName === 'RoleChanged'          ) return []
   
    // user
    if (tagName === 'UserCreated'          ) return ['email', 'displayName']
    if (tagName === 'UserForgotten'        ) return []
    if (tagName === 'UserUpdated'          ) return ['email', 'displayName']

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
        // organization
        OrganizationCreated  : ({ name })                     => ({ type: 'OrganizationCreated', name}),
        OrganizationDeleted  : ()                             => ({ type: 'OrganizationDeleted', }),
        OrganizationSuspended: ()                             => ({ type: 'OrganizationSuspended', }),
        OrganizationUpdated  : ({ name, status })             => ({ type: 'OrganizationUpdated', name, status}),
       
        // member
        MemberAdded          : ({ displayName, role })        => ({ type: 'MemberAdded', displayName, role }),
        MemberRemoved        : ()                             => ({ type: 'MemberRemoved' }),
        RoleChanged          : ({ role })                     => ({ type: 'RoleChanged', role }),

        // user
        UserCreated          : ({ email, displayName })       => ({ type: 'UserCreated', email, displayName }),
        UserForgotten        : ({ reason })                   => ({ type: 'UserForgotten', reason }),
        UserUpdated          : ({ email, displayName, role }) => ({ type: 'UserUpdated', email, displayName, role }),
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
        // organization
        OrganizationCreated:   a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationDeleted:   a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationSuspended: a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationUpdated:   a => ({ id: a.organizationId, type: 'organization' }),
        
        // organization member
        MemberAdded:           a => ({ id: a.userId,         type: 'user' }),
        MemberRemoved:         a => ({ id: a.userId,         type: 'user' }),
        RoleChanged:           a => ({ id: a.userId,         type: 'user' }),
        
        // user
        UserCreated:           a => ({ id: a.userId,         type: 'user' }),
        UserForgotten:         a => ({ id: a.userId,         type: 'user' }),
        UserUpdated:           a => ({ id: a.userId,         type: 'user' }),
    })
