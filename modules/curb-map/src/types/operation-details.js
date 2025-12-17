// ABOUTME: Generated type definition for OperationDetails
// ABOUTME: Auto-generated from modules/curb-map/type-definitions/operation-details.type.js - do not edit manually

/*  OperationDetails generated from: modules/curb-map/type-definitions/operation-details.type.js
 *
 *  ShellExecution
 *      command      : "String",
 *      duration     : "Number?",
 *      outputPreview: "String?"
 *  FirestoreOperation
 *      operation : "String",
 *      collection: "String",
 *      documentId: "String?"
 *  GcpProjectOperation
 *      projectId: "String",
 *      folderId : "String?",
 *      region   : "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// OperationDetails constructor
//
// -------------------------------------------------------------------------------------------------------------
const OperationDetails = {
    toString: () => 'OperationDetails',
}

// Add hidden properties
Object.defineProperty(OperationDetails, '@@typeName', { value: 'OperationDetails', enumerable: false })
Object.defineProperty(OperationDetails, '@@tagNames', {
    value: ['ShellExecution', 'FirestoreOperation', 'GcpProjectOperation'],
    enumerable: false,
})

// Type prototype with match method
const OperationDetailsPrototype = {}

Object.defineProperty(OperationDetailsPrototype, 'match', {
    value: R.match(OperationDetails['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(OperationDetailsPrototype, 'constructor', {
    value: OperationDetails,
    enumerable: false,
    writable: true,
    configurable: true,
})

OperationDetails.prototype = OperationDetailsPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.ShellExecution
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig shellExecutionToString :: () -> String
 */
const shellExecutionToString = function () {
    return `OperationDetails.ShellExecution(${R._toString(this.command)},
        ${R._toString(this.duration)},
        ${R._toString(this.outputPreview)})`
}

/*
 * Convert to JSON representation with tag
 * @sig shellExecutionToJSON :: () -> Object
 */
const shellExecutionToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a OperationDetails.ShellExecution instance
 * @sig ShellExecution :: (String, Number?, String?) -> OperationDetails.ShellExecution
 */
const ShellExecutionConstructor = function ShellExecution(command, duration, outputPreview) {
    const constructorName = 'OperationDetails.ShellExecution(command, duration, outputPreview)'

    R.validateString(constructorName, 'command', false, command)
    R.validateNumber(constructorName, 'duration', true, duration)
    R.validateString(constructorName, 'outputPreview', true, outputPreview)

    const result = Object.create(ShellExecutionPrototype)
    result.command = command
    if (duration != null) result.duration = duration
    if (outputPreview != null) result.outputPreview = outputPreview
    return result
}

OperationDetails.ShellExecution = ShellExecutionConstructor

const ShellExecutionPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'ShellExecution', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },
    toString: { value: shellExecutionToString, enumerable: false },
    toJSON: { value: shellExecutionToJSON, enumerable: false },
    constructor: { value: ShellExecutionConstructor, enumerable: false, writable: true, configurable: true },
})

ShellExecutionConstructor.prototype = ShellExecutionPrototype
ShellExecutionConstructor.is = val => val && val.constructor === ShellExecutionConstructor
ShellExecutionConstructor.toString = () => 'OperationDetails.ShellExecution'
ShellExecutionConstructor._from = _input => {
    const { command, duration, outputPreview } = _input
    return OperationDetails.ShellExecution(command, duration, outputPreview)
}
ShellExecutionConstructor.from = ShellExecutionConstructor._from

ShellExecutionConstructor.toFirestore = o => ({ ...o })
ShellExecutionConstructor.fromFirestore = ShellExecutionConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.FirestoreOperation
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig firestoreOperationToString :: () -> String
 */
const firestoreOperationToString = function () {
    return `OperationDetails.FirestoreOperation(${R._toString(this.operation)},
        ${R._toString(this.collection)},
        ${R._toString(this.documentId)})`
}

/*
 * Convert to JSON representation with tag
 * @sig firestoreOperationToJSON :: () -> Object
 */
const firestoreOperationToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a OperationDetails.FirestoreOperation instance
 * @sig FirestoreOperation :: (String, String, String?) -> OperationDetails.FirestoreOperation
 */
const FirestoreOperationConstructor = function FirestoreOperation(operation, collection, documentId) {
    const constructorName = 'OperationDetails.FirestoreOperation(operation, collection, documentId)'

    R.validateString(constructorName, 'operation', false, operation)
    R.validateString(constructorName, 'collection', false, collection)
    R.validateString(constructorName, 'documentId', true, documentId)

    const result = Object.create(FirestoreOperationPrototype)
    result.operation = operation
    result.collection = collection
    if (documentId != null) result.documentId = documentId
    return result
}

OperationDetails.FirestoreOperation = FirestoreOperationConstructor

const FirestoreOperationPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'FirestoreOperation', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },
    toString: { value: firestoreOperationToString, enumerable: false },
    toJSON: { value: firestoreOperationToJSON, enumerable: false },
    constructor: { value: FirestoreOperationConstructor, enumerable: false, writable: true, configurable: true },
})

FirestoreOperationConstructor.prototype = FirestoreOperationPrototype
FirestoreOperationConstructor.is = val => val && val.constructor === FirestoreOperationConstructor
FirestoreOperationConstructor.toString = () => 'OperationDetails.FirestoreOperation'
FirestoreOperationConstructor._from = _input => {
    const { operation, collection, documentId } = _input
    return OperationDetails.FirestoreOperation(operation, collection, documentId)
}
FirestoreOperationConstructor.from = FirestoreOperationConstructor._from

FirestoreOperationConstructor.toFirestore = o => ({ ...o })
FirestoreOperationConstructor.fromFirestore = FirestoreOperationConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.GcpProjectOperation
//
// -------------------------------------------------------------------------------------------------------------

/** JMG
 * Convert to string representation
 * @sig gcpProjectOperationToString :: () -> String
 */
const gcpProjectOperationToString = function () {
    return `OperationDetails.GcpProjectOperation(${R._toString(this.projectId)},
        ${R._toString(this.folderId)},
        ${R._toString(this.region)})`
}

/*
 * Convert to JSON representation with tag
 * @sig gcpProjectOperationToJSON :: () -> Object
 */
const gcpProjectOperationToJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

/*
 * Construct a OperationDetails.GcpProjectOperation instance
 * @sig GcpProjectOperation :: (String, String?, String?) -> OperationDetails.GcpProjectOperation
 */
const GcpProjectOperationConstructor = function GcpProjectOperation(projectId, folderId, region) {
    const constructorName = 'OperationDetails.GcpProjectOperation(projectId, folderId, region)'

    R.validateString(constructorName, 'projectId', false, projectId)
    R.validateString(constructorName, 'folderId', true, folderId)
    R.validateString(constructorName, 'region', true, region)

    const result = Object.create(GcpProjectOperationPrototype)
    result.projectId = projectId
    if (folderId != null) result.folderId = folderId
    if (region != null) result.region = region
    return result
}

OperationDetails.GcpProjectOperation = GcpProjectOperationConstructor

const GcpProjectOperationPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'GcpProjectOperation', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },
    toString: { value: gcpProjectOperationToString, enumerable: false },
    toJSON: { value: gcpProjectOperationToJSON, enumerable: false },
    constructor: { value: GcpProjectOperationConstructor, enumerable: false, writable: true, configurable: true },
})

GcpProjectOperationConstructor.prototype = GcpProjectOperationPrototype
GcpProjectOperationConstructor.is = val => val && val.constructor === GcpProjectOperationConstructor
GcpProjectOperationConstructor.toString = () => 'OperationDetails.GcpProjectOperation'
GcpProjectOperationConstructor._from = _input => {
    const { projectId, folderId, region } = _input
    return OperationDetails.GcpProjectOperation(projectId, folderId, region)
}
GcpProjectOperationConstructor.from = GcpProjectOperationConstructor._from

GcpProjectOperationConstructor.toFirestore = o => ({ ...o })
GcpProjectOperationConstructor.fromFirestore = GcpProjectOperationConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a OperationDetails instance
 * @sig is :: Any -> Boolean
 */
OperationDetails.is = v => {
    const { ShellExecution, FirestoreOperation, GcpProjectOperation } = OperationDetails
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === ShellExecution || constructor === FirestoreOperation || constructor === GcpProjectOperation
}

/**
 * Serialize OperationDetails to Firestore format
 * @sig _toFirestore :: (OperationDetails, Function) -> Object
 */
OperationDetails._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = OperationDetails[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize OperationDetails from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> OperationDetails
 */
OperationDetails._fromFirestore = (doc, decodeTimestamps) => {
    const { ShellExecution, FirestoreOperation, GcpProjectOperation } = OperationDetails
    const tagName = doc['@@tagName']
    if (tagName === 'ShellExecution') return ShellExecution.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'FirestoreOperation') return FirestoreOperation.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'GcpProjectOperation') return GcpProjectOperation.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized OperationDetails variant: ${tagName}`)
}

// Public aliases (can be overridden)
OperationDetails.toFirestore = OperationDetails._toFirestore
OperationDetails.fromFirestore = OperationDetails._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { OperationDetails }
