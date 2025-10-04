/** @module Action */

/**
 * Action represents the different domain events that can be queued
 * @sig Action :: UserAdded | OrganizationAdded
 */

// prettier-ignore
export const Action = {
    name: 'Action',
    kind: 'taggedSum',
    variants: {
        UserAdded: {
            organizationId: 'String',
            user          : 'Object'
        },
        OrganizationAdded: {
            organizationId: 'String',
            metadata      : 'Object'
        }
    }
}

Action.toFirestore = action => JSON.stringify(action)

Action.fromFirestore = o => {
    if (o['@@tagName'] === 'UserAdded') return Action.UserAdded.from(o)
    if (o['@@tagName'] === 'OrganizationAdded') return Action.OrganizationAdded.from(o)
    throw new Error(`Unrecognized domain event ${o['@@tagName']}`)
}
