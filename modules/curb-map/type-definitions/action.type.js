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
        OrganizationCreated  : { name: 'String' , projectId: FieldTypes.projectId, },
        OrganizationUpdated  : { name: 'String?', status: '/^(active|suspended)$/?', },
        OrganizationDeleted  : { },
        OrganizationSuspended: { },

        // Organization Member Actions
        MemberAdded  : { userId: FieldTypes.userId, role: FieldTypes.role, displayName: 'String'},
        RoleChanged  : { userId: FieldTypes.userId, role: FieldTypes.role, },
        MemberRemoved: { userId: FieldTypes.userId, },

        // User Actions
        UserCreated  : { userId: FieldTypes.userId, displayName: 'String', email: FieldTypes.email },
        UserUpdated  : { userId: FieldTypes.userId, displayName: 'String?', },
        UserForgotten: { userId: FieldTypes.userId, reason     : 'String', },

        // Firebase Auth
        AuthenticationCompleted: { email: FieldTypes.email, displayName: 'String', },

        // Data Loading
        AllInitialDataLoaded: { currentUser: 'User', currentOrganization: 'Organization?', },
        OrganizationUpdatedFromListener: { organization: 'Organization' },
        BlockfacesLoadedFromListener: { blockfaces: '[Blockface]' },

        // Blockface Actions
        BlockfaceCreated:  { blockface: 'Blockface' },
        BlockfaceSelected: { blockface: 'Blockface' },
        BlockfaceSaved:    { blockface: 'Blockface' },

        // Segment Actions
        SegmentUseUpdated   : { index: 'Number', use: 'String', },
        SegmentLengthUpdated: { index: 'Number', newLength: 'Number', },
        SegmentAddedLeft    : { index: 'Number', desiredLength: 'Number', },
        SegmentAdded        : { targetIndex: 'Number', },
        SegmentsReplaced    : { segments: '[Segment]', },

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
    if (tagName === 'AllInitialDataLoaded'   ) return []
    if (tagName === 'OrganizationUpdatedFromListener') return []
    if (tagName === 'BlockfacesLoadedFromListener') return []

    // Blockface Actions
    if (tagName === 'BlockfaceCreated'       ) return []
    if (tagName === 'BlockfaceSelected'      ) return []
    if (tagName === 'BlockfaceSaved'         ) return []

    // Segment Actions
    if (tagName === 'SegmentUseUpdated'      ) return []
    if (tagName === 'SegmentLengthUpdated'   ) return []
    if (tagName === 'SegmentAdded'           ) return []
    if (tagName === 'SegmentAddedLeft'       ) return []
    if (tagName === 'SegmentsReplaced'       ) return []

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
        AllInitialDataLoaded     : ()                           => ({ type: 'AllInitialDataLoaded' }),
        OrganizationUpdatedFromListener: ({ organization })     => ({ type: 'OrganizationUpdatedFromListener', organizationId: organization.id }),
        BlockfacesLoadedFromListener: ({ blockfaces })          => ({ type: 'BlockfacesLoadedFromListener', count: blockfaces.length }),

        // Blockface Actions
        BlockfaceCreated       : ({ blockface })                => ({ type: 'BlockfaceCreated', blockfaceId: blockface.id }),
        BlockfaceSelected      : ({ blockface })                => ({ type: 'BlockfaceSelected', blockfaceId: blockface.id }),
        BlockfaceSaved         : ({ blockface })                => ({ type: 'BlockfaceSaved', blockfaceId: blockface.id }),

        // Segment Actions
        SegmentUseUpdated      : ({ index, use })               => ({ type: 'SegmentUseUpdated', index, use }),
        SegmentLengthUpdated   : ({ index, newLength })         => ({ type: 'SegmentLengthUpdated', index, newLength }),
        SegmentAdded           : ({ targetIndex })              => ({ type: 'SegmentAdded', targetIndex }),
        SegmentAddedLeft       : ({ index, desiredLength })     => ({ type: 'SegmentAddedLeft', index, desiredLength }),
        SegmentsReplaced       : ({ segments })                 => ({ type: 'SegmentsReplaced', segmentCount: segments.length }),
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
// @sig getSubject :: (Action, String) -> { id: String, type: String }
// prettier-ignore
Action.getSubject = (action, organizationId) =>
    action.match({
        // organization
        OrganizationCreated    : () => ({ id: organizationId, type: 'organization' }),
        OrganizationDeleted    : () => ({ id: organizationId, type: 'organization' }),
        OrganizationSuspended  : () => ({ id: organizationId, type: 'organization' }),
        OrganizationUpdated    : () => ({ id: organizationId, type: 'organization' }),

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
        AllInitialDataLoaded   : a => ({ id: a.currentUser.id, type: 'user' }),
        OrganizationUpdatedFromListener: a => ({ id: a.organization.id, type: 'organization' }),
        BlockfacesLoadedFromListener: () => ({ id: 'collection', type: 'blockfaces' }),

        // Blockface Actions
        BlockfaceCreated       : a => ({ id: a.blockface.id, type: 'blockface' }),
        BlockfaceSelected      : a => ({ id: a.blockface.id, type: 'blockface' }),
        BlockfaceSaved         : a => ({ id: a.blockface.id, type: 'blockface' }),

        // Segment Actions (subject is the current blockface being edited)
        SegmentUseUpdated      : () => ({ id: 'current',     type: 'blockface' }),
        SegmentLengthUpdated   : () => ({ id: 'current',     type: 'blockface' }),
        SegmentAdded           : () => ({ id: 'current',     type: 'blockface' }),
        SegmentAddedLeft       : () => ({ id: 'current',     type: 'blockface' }),
        SegmentsReplaced       : () => ({ id: 'current',     type: 'blockface' }),
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
        AllInitialDataLoaded   : () => true,
        OrganizationUpdatedFromListener: () => true,
        BlockfacesLoadedFromListener: () => true,

        // Blockface Actions (any authenticated user can edit blockfaces)
        BlockfaceCreated       : () => ['admin', 'editor'].includes(actorRole),
        BlockfaceSelected      : () => true,
        BlockfaceSaved         : () => ['admin', 'editor'].includes(actorRole),

        // Segment Actions (any authenticated user can edit segments)
        SegmentUseUpdated      : () => true,
        SegmentLengthUpdated   : () => true,
        SegmentAdded           : () => true,
        SegmentAddedLeft       : () => true,
        SegmentsReplaced       : () => true,
    })
