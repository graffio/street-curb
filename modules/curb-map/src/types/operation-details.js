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
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return (
            constructor === OperationDetails.ShellExecution ||
            constructor === OperationDetails.FirestoreOperation ||
            constructor === OperationDetails.GcpProjectOperation
        )
    },
}

// -------------------------------------------------------------------------------------------------------------
//
// Set up OperationDetails's prototype as OperationDetailsPrototype
//
// -------------------------------------------------------------------------------------------------------------
// Type prototype with match method
const OperationDetailsPrototype = {}

Object.defineProperty(OperationDetailsPrototype, 'match', {
    value: function (variants) {
        // Validate all variants are handled
        const requiredVariants = ['ShellExecution', 'FirestoreOperation', 'GcpProjectOperation']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
    enumerable: false,
})

Object.defineProperty(OperationDetailsPrototype, 'constructor', {
    value: OperationDetails,
    enumerable: false,
    writable: true,
    configurable: true,
})

// Add hidden properties
Object.defineProperty(OperationDetails, '@@typeName', { value: 'OperationDetails', enumerable: false })
Object.defineProperty(OperationDetails, '@@tagNames', {
    value: ['ShellExecution', 'FirestoreOperation', 'GcpProjectOperation'],
    enumerable: false,
})

OperationDetails.prototype = OperationDetailsPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.ShellExecution constructor
//
// -------------------------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant OperationDetails.ShellExecution prototype
//
// -------------------------------------------------------------------------------------------------------------

const ShellExecutionPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'ShellExecution', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },

    toString: {
        value: function () {
            return `OperationDetails.ShellExecution(${R._toString(this.command)}, ${R._toString(this.duration)}, ${R._toString(this.outputPreview)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: ShellExecutionConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ShellExecutionConstructor.prototype = ShellExecutionPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.ShellExecution: static functions:
//
// -------------------------------------------------------------------------------------------------------------
ShellExecutionConstructor.is = val => val && val.constructor === ShellExecutionConstructor
ShellExecutionConstructor.toString = () => 'OperationDetails.ShellExecution'
ShellExecutionConstructor.from = o => OperationDetails.ShellExecution(o.command, o.duration, o.outputPreview)

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.FirestoreOperation constructor
//
// -------------------------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant OperationDetails.FirestoreOperation prototype
//
// -------------------------------------------------------------------------------------------------------------

const FirestoreOperationPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'FirestoreOperation', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },

    toString: {
        value: function () {
            return `OperationDetails.FirestoreOperation(${R._toString(this.operation)}, ${R._toString(this.collection)}, ${R._toString(this.documentId)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: FirestoreOperationConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

FirestoreOperationConstructor.prototype = FirestoreOperationPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.FirestoreOperation: static functions:
//
// -------------------------------------------------------------------------------------------------------------
FirestoreOperationConstructor.is = val => val && val.constructor === FirestoreOperationConstructor
FirestoreOperationConstructor.toString = () => 'OperationDetails.FirestoreOperation'
FirestoreOperationConstructor.from = o => OperationDetails.FirestoreOperation(o.operation, o.collection, o.documentId)

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.GcpProjectOperation constructor
//
// -------------------------------------------------------------------------------------------------------------
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

// -------------------------------------------------------------------------------------------------------------
//
// Set up Variant OperationDetails.GcpProjectOperation prototype
//
// -------------------------------------------------------------------------------------------------------------

const GcpProjectOperationPrototype = Object.create(OperationDetailsPrototype, {
    '@@tagName': { value: 'GcpProjectOperation', enumerable: false },
    '@@typeName': { value: 'OperationDetails', enumerable: false },

    toString: {
        value: function () {
            return `OperationDetails.GcpProjectOperation(${R._toString(this.projectId)}, ${R._toString(this.folderId)}, ${R._toString(this.region)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        },
        enumerable: false,
    },

    constructor: {
        value: GcpProjectOperationConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

GcpProjectOperationConstructor.prototype = GcpProjectOperationPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.GcpProjectOperation: static functions:
//
// -------------------------------------------------------------------------------------------------------------
GcpProjectOperationConstructor.is = val => val && val.constructor === GcpProjectOperationConstructor
GcpProjectOperationConstructor.toString = () => 'OperationDetails.GcpProjectOperation'
GcpProjectOperationConstructor.from = o => OperationDetails.GcpProjectOperation(o.projectId, o.folderId, o.region)

// -------------------------------------------------------------------------------------------------------------
// Additional functions copied from type definition file
// -------------------------------------------------------------------------------------------------------------
// Additional function: toFirestore
OperationDetails.toFirestore = o =>
    o.match({
        ShellExecution: _ => JSON.stringify(o),
        FirestoreOperation: _ => JSON.stringify(o),
        GcpProjectOperation: _ => JSON.stringify(o),
    })

// Additional function: fromFirestore
OperationDetails.fromFirestore = o => {
    if (o['@@tagName'] === 'ShellExecution') return OperationDetails.ShellExecution.from(o)
    if (o['@@tagName'] === 'FirestoreOperation') return OperationDetails.FirestoreOperation.from(o)
    if (o['@@tagName'] === 'GcpProjectOperation') return OperationDetails.GcpProjectOperation.from(o)
    throw new Error(`Unrecognized operation detail ${o['@@tagName']}`)
}

export { OperationDetails }
