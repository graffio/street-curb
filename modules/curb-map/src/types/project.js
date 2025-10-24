/** {@link module:Project} */
/*  Project generated from: modules/curb-map/type-definitions/project.type.js
 *
 *  id            : FieldTypes.projectId,
 *  organizationId: FieldTypes.organizationId,
 *  name          : "String",
 *  createdAt     : "Object",
 *  createdBy     : FieldTypes.userId,
 *  updatedAt     : "Object",
 *  updatedBy     : FieldTypes.userId
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Project = function Project(id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy) {
    const constructorName = 'Project(id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy)'
    R.validateArgumentLength(constructorName, 7, arguments)
    R.validateRegex(constructorName, FieldTypes.projectId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'name', false, name)
    R.validateObject(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateObject(constructorName, 'updatedAt', false, updatedAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'updatedBy', false, updatedBy)

    const result = Object.create(prototype)
    result.id = id
    result.organizationId = organizationId
    result.name = name
    result.createdAt = createdAt
    result.createdBy = createdBy
    result.updatedAt = updatedAt
    result.updatedBy = updatedBy
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Project', enumerable: false },

    toString: {
        value: function () {
            return `Project(${R._toString(this.id)}, ${R._toString(this.organizationId)}, ${R._toString(this.name)}, ${R._toString(this.createdAt)}, ${R._toString(this.createdBy)}, ${R._toString(this.updatedAt)}, ${R._toString(this.updatedBy)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: Project,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Project.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Project.toString = () => 'Project'
Project.is = v => v && v['@@typeName'] === 'Project'
Project.from = o => Project(o.id, o.organizationId, o.name, o.createdAt, o.createdBy, o.updatedAt, o.updatedBy)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: timestampFields
Project.timestampFields = ['createdAt', 'updatedAt']

// Additional function: fromFirestore
Project.fromFirestore = Project.from

// Additional function: toFirestore
Project.toFirestore = o => ({ ...o })

export { Project }
