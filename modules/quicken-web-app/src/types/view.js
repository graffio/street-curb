// ABOUTME: Generated type definition for View
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/view.type.js - do not edit manually

/*  View generated from: modules/quicken-web-app/type-definitions/view.type.js
 *
 *  Register
 *      id       : FieldTypes.viewId,
 *      accountId: "String",
 *      title    : "String"
 *  Report
 *      id        : FieldTypes.viewId,
 *      reportType: "String",
 *      title     : "String"
 *  Reconciliation
 *      id       : FieldTypes.viewId,
 *      accountId: "String",
 *      title    : "String"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// View constructor
//
// -------------------------------------------------------------------------------------------------------------
const View = {
    toString: () => 'View',
}

// Add hidden properties
Object.defineProperty(View, '@@typeName', { value: 'View', enumerable: false })
Object.defineProperty(View, '@@tagNames', { value: ['Register', 'Report', 'Reconciliation'], enumerable: false })

// Type prototype with match method
const ViewPrototype = {}

Object.defineProperty(ViewPrototype, 'match', {
    value: R.match(View['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ViewPrototype, 'constructor', {
    value: View,
    enumerable: false,
    writable: true,
    configurable: true,
})

View.prototype = ViewPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
            register      : function () { return `View.Register(${R._toString(this.id)}, ${R._toString(this.accountId)}, ${R._toString(this.title)})` },
            report        : function () { return `View.Report(${R._toString(this.id)}, ${R._toString(this.reportType)}, ${R._toString(this.title)})` },
            reconciliation: function () { return `View.Reconciliation(${R._toString(this.id)}, ${R._toString(this.accountId)}, ${R._toString(this.title)})` },
        }

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    register      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    report        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    reconciliation: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a View.Register instance
 * @sig Register :: (String, String, String) -> View.Register
 */
const RegisterConstructor = function Register(id, accountId, title) {
    const constructorName = 'View.Register(id, accountId, title)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateString(constructorName, 'accountId', false, accountId)
    R.validateString(constructorName, 'title', false, title)

    const result = Object.create(RegisterPrototype)
    result.id = id
    result.accountId = accountId
    result.title = title
    return result
}

View.Register = RegisterConstructor

/*
 * Construct a View.Report instance
 * @sig Report :: (String, String, String) -> View.Report
 */
const ReportConstructor = function Report(id, reportType, title) {
    const constructorName = 'View.Report(id, reportType, title)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateString(constructorName, 'reportType', false, reportType)
    R.validateString(constructorName, 'title', false, title)

    const result = Object.create(ReportPrototype)
    result.id = id
    result.reportType = reportType
    result.title = title
    return result
}

View.Report = ReportConstructor

/*
 * Construct a View.Reconciliation instance
 * @sig Reconciliation :: (String, String, String) -> View.Reconciliation
 */
const ReconciliationConstructor = function Reconciliation(id, accountId, title) {
    const constructorName = 'View.Reconciliation(id, accountId, title)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateString(constructorName, 'accountId', false, accountId)
    R.validateString(constructorName, 'title', false, title)

    const result = Object.create(ReconciliationPrototype)
    result.id = id
    result.accountId = accountId
    result.title = title
    return result
}

View.Reconciliation = ReconciliationConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const RegisterPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Register', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },
    toString: { value: toString.register, enumerable: false },
    toJSON: { value: toJSON.register, enumerable: false },
    constructor: { value: RegisterConstructor, enumerable: false, writable: true, configurable: true },
})

const ReportPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Report', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },
    toString: { value: toString.report, enumerable: false },
    toJSON: { value: toJSON.report, enumerable: false },
    constructor: { value: ReportConstructor, enumerable: false, writable: true, configurable: true },
})

const ReconciliationPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Reconciliation', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },
    toString: { value: toString.reconciliation, enumerable: false },
    toJSON: { value: toJSON.reconciliation, enumerable: false },
    constructor: { value: ReconciliationConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
//
// Variant static methods
//
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor.prototype = RegisterPrototype
RegisterConstructor.is = val => val && val.constructor === RegisterConstructor
RegisterConstructor.toString = () => 'View.Register'
RegisterConstructor._from = _input => {
    const { id, accountId, title } = _input
    return View.Register(id, accountId, title)
}
RegisterConstructor.from = RegisterConstructor._from

ReportConstructor.prototype = ReportPrototype
ReportConstructor.is = val => val && val.constructor === ReportConstructor
ReportConstructor.toString = () => 'View.Report'
ReportConstructor._from = _input => {
    const { id, reportType, title } = _input
    return View.Report(id, reportType, title)
}
ReportConstructor.from = ReportConstructor._from

ReconciliationConstructor.prototype = ReconciliationPrototype
ReconciliationConstructor.is = val => val && val.constructor === ReconciliationConstructor
ReconciliationConstructor.toString = () => 'View.Reconciliation'
ReconciliationConstructor._from = _input => {
    const { id, accountId, title } = _input
    return View.Reconciliation(id, accountId, title)
}
ReconciliationConstructor.from = ReconciliationConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

RegisterConstructor.toFirestore = o => ({ ...o })
RegisterConstructor.fromFirestore = RegisterConstructor._from

ReportConstructor.toFirestore = o => ({ ...o })
ReportConstructor.fromFirestore = ReportConstructor._from

ReconciliationConstructor.toFirestore = o => ({ ...o })
ReconciliationConstructor.fromFirestore = ReconciliationConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a View instance
 * @sig is :: Any -> Boolean
 */
View.is = v => {
    const { Register, Report, Reconciliation } = View
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === Register || constructor === Report || constructor === Reconciliation
}

/**
 * Serialize View to Firestore format
 * @sig _toFirestore :: (View, Function) -> Object
 */
View._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = View[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize View from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> View
 */
View._fromFirestore = (doc, decodeTimestamps) => {
    const { Register, Report, Reconciliation } = View
    const tagName = doc['@@tagName']
    if (tagName === 'Register') return Register.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Report') return Report.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Reconciliation') return Reconciliation.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized View variant: ${tagName}`)
}

// Public aliases (can be overridden)
View.toFirestore = View._toFirestore
View.fromFirestore = View._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { View }
