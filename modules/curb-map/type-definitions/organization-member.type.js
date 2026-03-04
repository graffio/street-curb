// ABOUTME: OrganizationMember Tagged type definition for curb-map
// ABOUTME: A user's membership in an organization, stored in the User.organizations LookupTable
import { FieldTypes } from './field-types.js'

/*
 * Represents a user's membership in an organization
 * Used in User.organizations LookupTable
 */

// prettier-ignore
export const OrganizationMember = {
    name: 'OrganizationMember',
    kind: 'tagged',
    firestore: true,
    fields: {
        organizationId: FieldTypes.organizationId, // Index field for LookupTable
        role          : FieldTypes.role, // 'owner', 'admin', 'member', etc.
    },
}
