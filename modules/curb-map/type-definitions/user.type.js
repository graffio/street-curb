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
    fields: {
        id              : FieldTypes.userId,
        email           : FieldTypes.email,
        displayName     : "String",
        organizations   : "Object",
        
        createdAt       : 'Date',
        createdBy       : FieldTypes.userId,
        updatedAt       : 'Date',
        updatedBy       : FieldTypes.userId,
    }
}

User.fromFirestore = User.from
User.toFirestore = o => ({ ...o })
