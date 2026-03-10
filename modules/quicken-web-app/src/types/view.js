// ABOUTME: Generated type definition for View
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ui-state/view.type.js - do not edit manually

/*  View generated from: modules/quicken-web-app/type-definitions/ui-state/view.type.js
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

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// View constructor
//
// -------------------------------------------------------------------------------------------------------------
const View = { toString: () => 'View' }

// Add hidden properties
Object.defineProperty(View, '@@typeName', { value: 'View', enumerable: false })
Object.defineProperty(View, '@@tagNames', { value: ['Register', 'Report', 'Reconciliation'], enumerable: false })

// Type prototype with match method
const ViewPrototype = {}

Object.defineProperty(ViewPrototype, 'match', { value: R.match(View['@@tagNames']), enumerable: false })

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
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor.prototype = RegisterPrototype
ReportConstructor.prototype = ReportPrototype
ReconciliationConstructor.prototype = ReconciliationPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor.is = val => val && val.constructor === RegisterConstructor
ReportConstructor.is = val => val && val.constructor === ReportConstructor
ReconciliationConstructor.is = val => val && val.constructor === ReconciliationConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor.toString = () => 'View.Register'
ReportConstructor.toString = () => 'View.Report'
ReconciliationConstructor.toString = () => 'View.Reconciliation'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor._from = _input => {
    const { id, accountId, title } = _input
    return View.Register(id, accountId, title)
}
ReportConstructor._from = _input => {
    const { id, reportType, title } = _input
    return View.Report(id, reportType, title)
}
ReconciliationConstructor._from = _input => {
    const { id, accountId, title } = _input
    return View.Reconciliation(id, accountId, title)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
RegisterConstructor.from = RegisterConstructor._from
ReportConstructor.from = ReportConstructor._from
ReconciliationConstructor.from = ReconciliationConstructor._from

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

View.fromJSON = json => {
    if (json == null) return json
    const tag = json['@@tagName']
    if (!tag) throw new TypeError(`View.fromJSON: missing @@tagName on ${R._toString(json)}`)
    if (!View['@@tagNames'].includes(tag)) throw new TypeError(`View.fromJSON: unknown variant "${tag}"`)
    return View[tag]._from(json)
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

View.CATEGORY_DIMENSION_LAYOUTS = {
    category: { title: 'Spending by Category', subtitle: 'View spending breakdown by category hierarchy' },
    account: { title: 'Spending by Account', subtitle: 'View spending breakdown by account' },
    payee: { title: 'Spending by Payee', subtitle: 'View spending breakdown by payee' },
    month: { title: 'Spending by Month', subtitle: 'View spending breakdown by month' },
}

View.POSITIONS_DIMENSION_LAYOUTS = {
    account: { title: 'Positions by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Positions by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Positions by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Positions by Goal', subtitle: 'View portfolio positions by investment goal' },
}

View.DEFAULT_PAGE_TITLE = { title: 'Dashboard', subtitle: '' }

View.toReportTitle = (reportType, groupBy) => {
    if (reportType === 'positions')
        return View.POSITIONS_DIMENSION_LAYOUTS[groupBy || 'account'] || View.POSITIONS_DIMENSION_LAYOUTS.account
    return View.CATEGORY_DIMENSION_LAYOUTS[groupBy || 'category'] || View.CATEGORY_DIMENSION_LAYOUTS.category
}

export { View }
