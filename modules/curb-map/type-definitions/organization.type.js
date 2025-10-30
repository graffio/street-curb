/** @module Organization */
import { assoc, LookupTable } from '@graffio/functional'
import { Member } from '../types/index.js'
import { FieldTypes } from './field-types.js'

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
        members         : '[Member]',

        createdAt       : 'Date',
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Date',
        updatedBy       : FieldTypes.userId,
    }
}

// Organization has nested Members stored as map - decode timestamps for each member
// Firestore stores: { members: { "usr_abc": { userId: "usr_abc", displayName, role, ... } } }
// We convert to: LookupTable([ Member({ userId: "usr_abc", displayName, role, ... }) ])
// Note: userId is in both the key and the value for self-describing data
Organization.fromFirestore = (data, decodeTimestamps) => {
    const memberFromFirestore = ([userId, memberData]) => {
        const decoded = decodeTimestamps(Member, memberData)
        return Member.fromFirestore(decoded, decodeTimestamps)
    }

    const memberEntries = data.members ? Object.entries(data.members) : []
    const members = memberEntries.map(memberFromFirestore)
    return Organization.from({ ...data, members: LookupTable(members, Member, 'userId') })
}

// Organization toFirestore - convert LookupTable to map with userId as keys
// We convert: LookupTable([ Member({ userId, displayName, role, ... }) ])
// To Firestore: { members: { "usr_abc": { userId: "usr_abc", displayName, role, ... } } }
// Note: userId is duplicated (as key and in value) for self-describing data
Organization.toFirestore = (data, encodeTimestamps) => {
    const reducer = (acc, member) => {
        const encoded = encodeTimestamps(Member, member)
        const memberData = Member.toFirestore(encoded, encodeTimestamps)
        return assoc(member.userId, memberData, acc)
    }

    return { ...data, members: data.members.reduce(reducer, {}) }
}
