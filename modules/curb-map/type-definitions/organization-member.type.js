import { FieldTypes } from './field-types.js'

/*
 * Represents a user's membership in an organization
 * Used in User.organizations LookupTable
 */

// prettier-ignore
export const OrganizationMember = {
    name: 'OrganizationMember',
    kind: 'tagged',
    fields: {
        organizationId: FieldTypes.organizationId, // Index field for LookupTable
        role          : FieldTypes.role, // 'owner', 'admin', 'member', etc.
    },
}
