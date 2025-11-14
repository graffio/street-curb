/** @module Organization */
import { FieldTypes } from './field-types.js'
import { Member } from './member.js'

/**
 * Organization represents a collection of users working on projects
 */

// prettier-ignore
export const Organization = {
    name: 'Organization',
    kind: 'tagged',
    fields: {
        id              : FieldTypes.organizationId,
        name            : "String",
        status          : /active|suspended/,
        defaultProjectId: FieldTypes.projectId,
        members         : '{Member:userId}', // LookupTable of members

        createdAt       : 'Date',
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Date',
        updatedBy       : FieldTypes.userId,
    }
}

Organization.roleChanged = (organization, action) => {
    const { userId, role } = action

    const oldMember = organization.members[userId]
    const newMember = Member.from({ ...oldMember, role })
    const members = organization.members.addItemWithId(newMember)

    return Organization.from({ ...organization, members })
}

Organization.role = (organization, userId) => organization?.members?.[userId]?.role
Organization.isAdmin = (organization, userId) => Organization.role(organization, userId) === 'admin'
