// ABOUTME: Generated type definition for Project
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/project.type.js - do not edit manually

/** {@link module:Project} */
/*  Project generated from: modules/curb-map/type-definitions/project.type.js
 *
 *  id            : FieldTypes.projectId,
 *  organizationId: FieldTypes.organizationId,
 *  name          : "String",
 *  createdAt     : "Date",
 *  createdBy     : FieldTypes.userId,
 *  updatedAt     : "Date",
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
/**
 * Construct a Project instance
 * @sig Project :: ([Object], [Object], String, Date, [Object], Date, [Object]) -> Project
 */
const Project = function Project(id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy) {
    const constructorName = 'Project(id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy)'
    R.validateArgumentLength(constructorName, 7, arguments)
    R.validateRegex(constructorName, FieldTypes.projectId, 'id', false, id)
    R.validateRegex(constructorName, FieldTypes.organizationId, 'organizationId', false, organizationId)
    R.validateString(constructorName, 'name', false, name)
    R.validateDate(constructorName, 'createdAt', false, createdAt)
    R.validateRegex(constructorName, FieldTypes.userId, 'createdBy', false, createdBy)
    R.validateDate(constructorName, 'updatedAt', false, updatedAt)
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
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig projectToString :: () -> String
 */
const projectToString = function () {
    return `Project(
        ${R._toString(this.id)},
        ${R._toString(this.organizationId)},
        ${R._toString(this.name)},
        ${R._toString(this.createdAt)},
        ${R._toString(this.createdBy)},
        ${R._toString(this.updatedAt)},
        ${R._toString(this.updatedBy)},
    )`
}

/**
 * Convert to JSON representation
 * @sig projectToJSON :: () -> Object
 */
const projectToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Project', enumerable: false },
    toString: { value: projectToString, enumerable: false },
    toJSON: { value: projectToJSON, enumerable: false },
    constructor: { value: Project, enumerable: false, writable: true, configurable: true },
})

Project.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Project.toString = () => 'Project'
Project.is = v => v && v['@@typeName'] === 'Project'

Project._from = o => {
    const { id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy } = o
    return Project(id, organizationId, name, createdAt, createdBy, updatedAt, updatedBy)
}
Project.from = Project._from

Project._toFirestore = (o, encodeTimestamps) => {
    const result = {
        id: o.id,
        organizationId: o.organizationId,
        name: o.name,
        createdAt: encodeTimestamps(o.createdAt),
        createdBy: o.createdBy,
        updatedAt: encodeTimestamps(o.updatedAt),
        updatedBy: o.updatedBy,
    }

    return result
}

Project._fromFirestore = (doc, decodeTimestamps) =>
    Project._from({
        id: doc.id,
        organizationId: doc.organizationId,
        name: doc.name,
        createdAt: decodeTimestamps(doc.createdAt),
        createdBy: doc.createdBy,
        updatedAt: decodeTimestamps(doc.updatedAt),
        updatedBy: doc.updatedBy,
    })

// Public aliases (override if necessary)
Project.toFirestore = Project._toFirestore
Project.fromFirestore = Project._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Project }
