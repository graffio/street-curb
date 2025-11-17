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
        OrganizationCreated  : { organizationId: FieldTypes.organizationId, name: 'String' , projectId: FieldTypes.projectId, },
        OrganizationUpdated  : { organizationId: FieldTypes.organizationId, name: 'String?', status: '/^(active|suspended)$/?', },
        OrganizationDeleted  : { organizationId: FieldTypes.organizationId, },
        OrganizationSuspended: { organizationId: FieldTypes.organizationId, },
        
        // Organization Member Actions
        MemberAdded  : { userId: FieldTypes.userId, organizationId: FieldTypes.organizationId, role: FieldTypes.role, displayName: 'String'},
        RoleChanged  : { userId: FieldTypes.userId, organizationId: FieldTypes.organizationId, role: FieldTypes.role, },
        MemberRemoved: { userId: FieldTypes.userId, organizationId: FieldTypes.organizationId, },

        // User Actions
        UserCreated  : { userId: FieldTypes.userId, displayName: 'String', email: FieldTypes.email, authUid: 'String', },
        UserUpdated  : { userId: FieldTypes.userId, displayName: 'String?', },
        UserForgotten: { userId: FieldTypes.userId, reason     : 'String', },

        // Firebase Auth
        AuthenticationCompleted: { email: FieldTypes.email, displayName: 'String', },

        // Data Loading
        LoadAllInitialData: { currentUser: 'User', currentOrganization: 'Organization', },

        // Blockface Actions
        CreateBlockface: { id: 'String', geometry: 'Object', streetName: 'String', cnnId: 'String?', },
        SelectBlockface: { id: 'String', geometry: 'Object', streetName: 'String', cnnId: 'String?', },

        // Segment Actions
        UpdateSegmentUse   : { index: 'Number', use: 'String', },
        UpdateSegmentLength: { index: 'Number', newLength: 'Number', },
        AddSegmentLeft     : { index: 'Number', desiredLength: 'Number', },
        AddSegment         : { targetIndex: 'Number', },
        ReplaceSegments    : { segments: '[Segment]', },

    }
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
    if (tagName === 'OrganizationCreated'    ) return []
    if (tagName === 'OrganizationDeleted'    ) return []
    if (tagName === 'OrganizationSuspended'  ) return []
    if (tagName === 'OrganizationUpdated'    ) return []
    
    // organization member
    if (tagName === 'MemberAdded'            ) return ['displayName']
    if (tagName === 'MemberRemoved'          ) return []
    if (tagName === 'RoleChanged'            ) return []
    
    // user
    if (tagName === 'UserCreated'            ) return ['email', 'displayName']
    if (tagName === 'UserForgotten'          ) return []
    if (tagName === 'UserUpdated'            ) return ['displayName']
    
    // Auth
    if (tagName === 'AuthenticationCompleted') return ['email', 'displayName']

    // Data Loading
    if (tagName === 'LoadAllInitialData'     ) return []

    // Blockface Actions
    if (tagName === 'CreateBlockface'        ) return []
    if (tagName === 'SelectBlockface'        ) return []

    // Segment Actions
    if (tagName === 'UpdateSegmentUse'       ) return []
    if (tagName === 'UpdateSegmentLength'    ) return []
    if (tagName === 'AddSegment'             ) return []
    if (tagName === 'AddSegmentLeft'         ) return []
    if (tagName === 'ReplaceSegments'        ) return []

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
        OrganizationCreated    : ({ name })                     => ({ type: 'OrganizationCreated', name}),
        OrganizationDeleted    : ()                             => ({ type: 'OrganizationDeleted', }),
        OrganizationSuspended  : ()                             => ({ type: 'OrganizationSuspended', }),
        OrganizationUpdated    : ({ name, status })             => ({ type: 'OrganizationUpdated', name, status}),
        
        // member
        MemberAdded            : ({ displayName, role })        => ({ type: 'MemberAdded', displayName, role }),
        MemberRemoved          : ()                             => ({ type: 'MemberRemoved' }),
        RoleChanged            : ({ role })                     => ({ type: 'RoleChanged', role }),
        
        // user
        UserCreated            : ({ email, displayName })       => ({ type: 'UserCreated', email, displayName }),
        UserForgotten          : ({ reason })                   => ({ type: 'UserForgotten', reason }),
        UserUpdated            : ({ email, displayName, role }) => ({ type: 'UserUpdated', email, displayName, role }),
       
        // Auth
        AuthenticationCompleted: ({ email, displayName })       => ({ type: 'AuthenticationCompleted', email, displayName}),

        // Data Loading
        LoadAllInitialData     : ()                             => ({ type: 'LoadAllInitialData' }),

        // Blockface Actions
        CreateBlockface        : ({ id })                       => ({ type: 'CreateBlockface', id }),
        SelectBlockface        : ({ id })                       => ({ type: 'SelectBlockface', id }),

        // Segment Actions
        UpdateSegmentUse       : ({ index, use })               => ({ type: 'UpdateSegmentUse', index, use }),
        UpdateSegmentLength    : ({ index, newLength })         => ({ type: 'UpdateSegmentLength', index, newLength }),
        AddSegment             : ({ targetIndex })              => ({ type: 'AddSegment', targetIndex }),
        AddSegmentLeft         : ({ index, desiredLength })     => ({ type: 'AddSegmentLeft', index, desiredLength }),
        ReplaceSegments        : ({ segments })                 => ({ type: 'ReplaceSegments', segmentCount: segments.length }),
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
        if (tagName === 'AuthenticationCompleted') return ['email', 'displayName']

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
        OrganizationCreated    : a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationDeleted    : a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationSuspended  : a => ({ id: a.organizationId, type: 'organization' }),
        OrganizationUpdated    : a => ({ id: a.organizationId, type: 'organization' }),

        // organization member
        MemberAdded            : a => ({ id: a.userId,         type: 'user' }),
        MemberRemoved          : a => ({ id: a.userId,         type: 'user' }),
        RoleChanged            : a => ({ id: a.userId,         type: 'user' }),

        // user
        UserCreated            : a => ({ id: a.userId,         type: 'user' }),
        UserForgotten          : a => ({ id: a.userId,         type: 'user' }),
        UserUpdated            : a => ({ id: a.userId,         type: 'user' }),

        // Auth
        AuthenticationCompleted: a => ({ id: a.email,          type: 'user' }),

        // Data Loading
        LoadAllInitialData     : a => ({ id: a.currentUser.id, type: 'user' }),

        // Blockface Actions
        CreateBlockface        : a => ({ id: a.id,           type: 'blockface' }),
        SelectBlockface        : a => ({ id: a.id,           type: 'blockface' }),

        // Segment Actions (subject is the current blockface being edited)
        UpdateSegmentUse       : () => ({ id: 'current',     type: 'blockface' }),
        UpdateSegmentLength    : () => ({ id: 'current',     type: 'blockface' }),
        AddSegment             : () => ({ id: 'current',     type: 'blockface' }),
        AddSegmentLeft         : () => ({ id: 'current',     type: 'blockface' }),
        ReplaceSegments        : () => ({ id: 'current',     type: 'blockface' }),
    })

// prettier-ignore
Action.mayI = (action, actorRole, actorId) =>
    action.match({
        MemberAdded            : () => ['admin'].includes(actorRole),
        MemberRemoved          : () => ['admin'].includes(actorRole),
        OrganizationCreated    : () => ['admin'].includes(actorRole),
        OrganizationDeleted    : () => ['admin'].includes(actorRole),
        OrganizationSuspended  : () => ['admin'].includes(actorRole),
        OrganizationUpdated    : () => ['admin'].includes(actorRole),
        RoleChanged            : () => ['admin'].includes(actorRole),
        UserCreated            : () => ['admin'].includes(actorRole),
        
        // Self-modification support
        UserForgotten          : a => a.userId === actorId,
        UserUpdated            : a => a.userId === actorId,
        
        // Auth
        AuthenticationCompleted: () => true,

        // Data Loading
        LoadAllInitialData     : () => true,

        // Blockface Actions (any authenticated user can edit blockfaces)
        CreateBlockface        : () => true,
        SelectBlockface        : () => true,

        // Segment Actions (any authenticated user can edit segments)
        UpdateSegmentUse       : () => true,
        UpdateSegmentLength    : () => true,
        AddSegment             : () => true,
        AddSegmentLeft         : () => true,
        ReplaceSegments        : () => true,
    })
