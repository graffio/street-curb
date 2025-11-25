/** @module Action */

import { FieldTypes } from './field-types.js'

/**
 * Action represents the different domain events that can be queued
 * @sig Action ::
 *
 *      // organization
 *      OrganizationCreated
 *      OrganizationDeleted
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
        OrganizationUpdated  : { name: 'String?' },
        OrganizationDeleted  : { },

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
        UserLoaded        : { user: 'User' },
        OrganizationSynced: { organization: 'Organization' },
        BlockfacesSynced  : { blockfaces: '[Blockface]' },

        // Blockface Actions
        BlockfaceCreated :  { blockface: 'Blockface' },
        BlockfaceSelected: { blockface: 'Blockface' },
        BlockfaceSaved   :    { blockface: 'Blockface' },

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
    if (tagName === 'UserLoaded'             ) return []
    if (tagName === 'OrganizationSynced'     ) return []
    if (tagName === 'BlockfacesSynced'       ) return []

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

Action.redactField = (acc, field) => {
    if (!acc[field]) return acc // skip, there's no actual value for this field

    if (field.match(/email/)) return { ...acc, [field]: acc[field].replace(/(.).*(@.*)/, '$1***$2') }
    if (field.match(/displayName/)) return { ...acc, [field]: acc[field].replace(/\b(\w)\w*/g, '$1***') }

    return { ...acc, [field]: `[REDACTED length: ${acc[field].length}]` }
}

/*
 * Return a subset of interesting fields to log, with PII redacted.
 * Automatically applies PII redaction as a security layer
 * @sig toLog = Action -> Object
 */
Action.toLog = a => {
    // prettier-ignore
    let result = a.match({
        // organization
        OrganizationCreated    : ({ name })                     => ({ type: 'OrganizationCreated', name}),
        OrganizationDeleted    : ()                             => ({ type: 'OrganizationDeleted', }),
        OrganizationUpdated    : ({ name })                     => ({ type: 'OrganizationUpdated', name }),
        
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
        UserLoaded               : ()                           => ({ type: 'UserLoaded' }),
        OrganizationSynced       : ({ organization })           => ({ type: 'OrganizationSynced', organizationId: organization.id }),
        BlockfacesSynced         : ({ blockfaces })             => ({ type: 'BlockfacesSynced', count: blockfaces.length }),

        // Blockface Actions
        BlockfaceCreated       : ({ blockface })                => ({ type: 'BlockfaceCreated', blockface }),
        BlockfaceSelected      : ({ blockface })                => ({ type: 'BlockfaceSelected', blockface }),
        BlockfaceSaved         : ({ blockface })                => ({ type: 'BlockfaceSaved', blockface }),

        // Segment Actions
        SegmentUseUpdated      : ({ index, use })               => ({ type: 'SegmentUseUpdated', index, use }),
        SegmentLengthUpdated   : ({ index, newLength })         => ({ type: 'SegmentLengthUpdated', index, newLength }),
        SegmentAdded           : ({ targetIndex })              => ({ type: 'SegmentAdded', targetIndex }),
        SegmentAddedLeft       : ({ index, desiredLength })     => ({ type: 'SegmentAddedLeft', index, desiredLength }),
        SegmentsReplaced       : ({ segments })                 => ({ type: 'SegmentsReplaced', segmentCount: segments.length }),
    })

    result = Action.piiFields(a).reduce(Action.redactField, result)
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
    const piiFields = () => {
        const tagName = rawData['@@tagName']

        if (tagName === 'UserCreated') return ['email', 'displayName']
        if (tagName === 'UserUpdated') return ['email', 'displayName']
        if (tagName === 'AuthenticationCompleted') return ['email', 'displayName']

        return []
    }

    return piiFields().reduce(Action.redactField, { ...rawData })
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
        UserLoaded             : a => ({ id: a.user.id,         type: 'user' }),
        OrganizationSynced     : a => ({ id: a.organization.id, type: 'organization' }),
        BlockfacesSynced       : () => ({ id: 'collection',     type: 'blockfaces' }),

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
        OrganizationUpdated    : () => ['admin'].includes(actorRole),
        RoleChanged            : () => ['admin'].includes(actorRole),
        UserCreated            : () => ['admin'].includes(actorRole),

        // Self-modification support
        UserForgotten          : a => a.userId === actorId,
        UserUpdated            : a => a.userId === actorId,

        // Auth
        AuthenticationCompleted: () => true,

        // Data Loading
        UserLoaded             : () => true,
        OrganizationSynced     : () => true,
        BlockfacesSynced       : () => true,

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

/**
 * Get metadata for an action
 * Declares authorization requirements and documents that need validation
 * @sig Action.metadata :: Action -> ActionMetadata
 */
// prettier-ignore
Action.metadata = action => {
    const f = (requiresUser, requiresOrganization, requiresProject, authStrategy, writesTo = [], validateInput = null) =>
        ({ requiresUser, requiresOrganization, requiresProject, authStrategy, writesTo, validateInput })
    
    return action.match({
        //                               user   org    proj   strategy
        AuthenticationCompleted: () => f(false, false, false, 'allowAll'),
        OrganizationCreated    : () => f(true,  false, false, 'requireOrganizationLimit'),
        UserCreated            : () => f(false, false, false, 'requireSystem'),
        UserForgotten          : () => f(true,  false, false, 'requireSelfOnly'),
        UserUpdated            : () => f(true,  false, false, 'requireSelfOnly'),
        MemberAdded            : () => f(true,  true,  false, 'requireActorIsOrganizationMember'),
        MemberRemoved          : () => f(true,  true,  false, 'requireActorIsOrganizationMember'),
        OrganizationDeleted    : () => f(true,  true,  false, 'requireActorIsOrganizationMember'),
        OrganizationUpdated    : () => f(true,  true,  false, 'requireActorIsOrganizationMember'),
        RoleChanged            : () => f(true,  true,  false, 'requireActorIsOrganizationMember'),
        BlockfaceSaved         : () => f(
            true,  true,  true,  'requireActorIsOrganizationMember',
            [{ collection: 'blockfaces', path: 'action.blockface.id' }],
            (action, actionRequest, existingDocs) => {
                const { blockface } = action

                // Validate tenant boundaries (both creates and updates)
                if (blockface.organizationId !== actionRequest.organizationId) throw new Error(`Organization ids in blockface and ActionRequest cannot differ`)
                if (blockface.projectId !== actionRequest.projectId) throw new Error(`Project ids in blockface and ActionRequest cannot differ`)
            }
        ),
        
        // Local-only actions (throw errors if they reach server)
        BlockfaceCreated       : () => { throw new Error('BlockfaceCreated is local-only') },
        BlockfaceSelected      : () => { throw new Error('BlockfaceSelected is local-only') },
        BlockfacesSynced       : () => { throw new Error('BlockfacesSynced is local-only') },
        OrganizationSynced     : () => { throw new Error('OrganizationSynced is local-only') },
        SegmentAdded           : () => { throw new Error('SegmentAdded is local-only') },
        SegmentAddedLeft       : () => { throw new Error('SegmentAddedLeft is local-only') },
        SegmentLengthUpdated   : () => { throw new Error('SegmentLengthUpdated is local-only') },
        SegmentUseUpdated      : () => { throw new Error('SegmentUseUpdated is local-only') },
        SegmentsReplaced       : () => { throw new Error('SegmentsReplaced is local-only') },
        UserLoaded             : () => { throw new Error('UserLoaded is local-only') },
    })
}
