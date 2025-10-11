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
 * Return a subset of interesting fields to log
 * @sig toLog = Action -> Object
 */
// prettier-ignore
Action.toLog = a =>
    a.match({
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
