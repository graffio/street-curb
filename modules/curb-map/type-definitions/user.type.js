// ABOUTME: User Tagged type definition for curb-map
// ABOUTME: An authenticated user with email, display name, and organization memberships
/** @module User */
import { FieldTypes } from './field-types.js'

/**
 * User represents a portion of a blockface with specific use
 * @sig User :: { use: String, length: Number }
 */

// prettier-ignore
export const User = {
    name: 'User',
    kind: 'tagged',
    firestore: true,
    fields: {
        id              : FieldTypes.userId,
        email           : FieldTypes.email,
        displayName     : "String",
        organizations   : "{OrganizationMember:organizationId}",
        
        createdAt       : 'Date',
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Date',
        updatedBy       : FieldTypes.userId,
    }
}
