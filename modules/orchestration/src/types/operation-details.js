/*  OperationDetails generated from: modules/types/src/operation-details.type.js

    ShellExecution
        command      : "String",
        duration     : "Number?",
        outputPreview: "String?"
    FirestoreOperation
        operation : "String",
        collection: "String",
        documentId: "String?"
    GcpProjectOperation
        projectId: "String",
        folderId : "String?",
        region   : "String?"

*/

import * as R from '@graffio/types-generation'

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
const OperationDetailsPrototype = {
    match(variants) {
        // Validate all variants are handled
        const requiredVariants = ['ShellExecution', 'FirestoreOperation', 'GcpProjectOperation']
        requiredVariants.map(variant => {
            if (!variants[variant]) throw new TypeError("Constructors given to match didn't include: " + variant)
            return variant
        })

        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    },
}

// Add hidden properties
Object.defineProperty(OperationDetails, '@@typeName', { value: 'OperationDetails' })
Object.defineProperty(OperationDetails, '@@tagNames', {
    value: ['ShellExecution', 'FirestoreOperation', 'GcpProjectOperation'],
})

OperationDetailsPrototype.constructor = OperationDetails
OperationDetails.prototype = OperationDetailsPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant OperationDetails.ShellExecution constructor
//
// -------------------------------------------------------------------------------------------------------------
const ShellExecutionConstructor = function ShellExecution(command, duration, outputPreview) {
    R.validateString('OperationDetails.ShellExecution(command, duration, outputPreview)', 'command', false, command)
    R.validateNumber('OperationDetails.ShellExecution(command, duration, outputPreview)', 'duration', true, duration)
    R.validateString(
        'OperationDetails.ShellExecution(command, duration, outputPreview)',
        'outputPreview',
        true,
        outputPreview,
    )

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
const ShellExecutionPrototype = Object.create(OperationDetailsPrototype)
Object.defineProperty(ShellExecutionPrototype, '@@tagName', { value: 'ShellExecution' })
Object.defineProperty(ShellExecutionPrototype, '@@typeName', { value: 'OperationDetails' })

ShellExecutionPrototype.toString = function () {
    return `OperationDetails.ShellExecution(${R._toString(this.command)}, ${R._toString(this.duration)}, ${R._toString(this.outputPreview)})`
}

ShellExecutionPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

ShellExecutionConstructor.prototype = ShellExecutionPrototype
ShellExecutionPrototype.constructor = ShellExecutionConstructor

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
    R.validateString(
        'OperationDetails.FirestoreOperation(operation, collection, documentId)',
        'operation',
        false,
        operation,
    )
    R.validateString(
        'OperationDetails.FirestoreOperation(operation, collection, documentId)',
        'collection',
        false,
        collection,
    )
    R.validateString(
        'OperationDetails.FirestoreOperation(operation, collection, documentId)',
        'documentId',
        true,
        documentId,
    )

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
const FirestoreOperationPrototype = Object.create(OperationDetailsPrototype)
Object.defineProperty(FirestoreOperationPrototype, '@@tagName', { value: 'FirestoreOperation' })
Object.defineProperty(FirestoreOperationPrototype, '@@typeName', { value: 'OperationDetails' })

FirestoreOperationPrototype.toString = function () {
    return `OperationDetails.FirestoreOperation(${R._toString(this.operation)}, ${R._toString(this.collection)}, ${R._toString(this.documentId)})`
}

FirestoreOperationPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

FirestoreOperationConstructor.prototype = FirestoreOperationPrototype
FirestoreOperationPrototype.constructor = FirestoreOperationConstructor

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
    R.validateString('OperationDetails.GcpProjectOperation(projectId, folderId, region)', 'projectId', false, projectId)
    R.validateString('OperationDetails.GcpProjectOperation(projectId, folderId, region)', 'folderId', true, folderId)
    R.validateString('OperationDetails.GcpProjectOperation(projectId, folderId, region)', 'region', true, region)

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
const GcpProjectOperationPrototype = Object.create(OperationDetailsPrototype)
Object.defineProperty(GcpProjectOperationPrototype, '@@tagName', { value: 'GcpProjectOperation' })
Object.defineProperty(GcpProjectOperationPrototype, '@@typeName', { value: 'OperationDetails' })

GcpProjectOperationPrototype.toString = function () {
    return `OperationDetails.GcpProjectOperation(${R._toString(this.projectId)}, ${R._toString(this.folderId)}, ${R._toString(this.region)})`
}

GcpProjectOperationPrototype.toJSON = function () {
    return Object.assign({ '@@tagName': this['@@tagName'] }, this)
}

GcpProjectOperationConstructor.prototype = GcpProjectOperationPrototype
GcpProjectOperationPrototype.constructor = GcpProjectOperationConstructor

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
OperationDetails.fromFirestore = o =>
    o.match({
        ShellExecution: _ => OperationDetails.from(o),
        FirestoreOperation: _ => OperationDetails.from(o),
        GcpProjectOperation: _ => OperationDetails.from(o),
    })

export { OperationDetails }
