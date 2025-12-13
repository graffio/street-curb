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
    is: v => {
        if (typeof v !== 'object') return false
        const constructor = Object.getPrototypeOf(v).constructor
        return constructor === View.Register || constructor === View.Report || constructor === View.Reconciliation
    },
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
// Variant View.Register
//
// -------------------------------------------------------------------------------------------------------------
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

const RegisterPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Register', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },

    toString: {
        value: function () {
            return `View.Register(${R._toString(this.id)}, ${R._toString(this.accountId)}, ${R._toString(this.title)})`
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
        value: RegisterConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

RegisterConstructor.prototype = RegisterPrototype
RegisterConstructor.is = val => val && val.constructor === RegisterConstructor
RegisterConstructor.toString = () => 'View.Register'
RegisterConstructor._from = o => View.Register(o.id, o.accountId, o.title)
RegisterConstructor.from = RegisterConstructor._from

RegisterConstructor.toFirestore = o => ({ ...o })
RegisterConstructor.fromFirestore = RegisterConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant View.Report
//
// -------------------------------------------------------------------------------------------------------------
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

const ReportPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Report', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },

    toString: {
        value: function () {
            return `View.Report(${R._toString(this.id)}, ${R._toString(this.reportType)}, ${R._toString(this.title)})`
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
        value: ReportConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ReportConstructor.prototype = ReportPrototype
ReportConstructor.is = val => val && val.constructor === ReportConstructor
ReportConstructor.toString = () => 'View.Report'
ReportConstructor._from = o => View.Report(o.id, o.reportType, o.title)
ReportConstructor.from = ReportConstructor._from

ReportConstructor.toFirestore = o => ({ ...o })
ReportConstructor.fromFirestore = ReportConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant View.Reconciliation
//
// -------------------------------------------------------------------------------------------------------------
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

const ReconciliationPrototype = Object.create(ViewPrototype, {
    '@@tagName': { value: 'Reconciliation', enumerable: false },
    '@@typeName': { value: 'View', enumerable: false },

    toString: {
        value: function () {
            return `View.Reconciliation(${R._toString(this.id)}, ${R._toString(this.accountId)}, ${R._toString(this.title)})`
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
        value: ReconciliationConstructor,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ReconciliationConstructor.prototype = ReconciliationPrototype
ReconciliationConstructor.is = val => val && val.constructor === ReconciliationConstructor
ReconciliationConstructor.toString = () => 'View.Reconciliation'
ReconciliationConstructor._from = o => View.Reconciliation(o.id, o.accountId, o.title)
ReconciliationConstructor.from = ReconciliationConstructor._from

ReconciliationConstructor.toFirestore = o => ({ ...o })
ReconciliationConstructor.fromFirestore = ReconciliationConstructor._from

View._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = View[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

View._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Register') return View.Register.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Report') return View.Report.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Reconciliation') return View.Reconciliation.fromFirestore(doc, decodeTimestamps)
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
