// ABOUTME: Generated type definition for ViewUiState
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/view-ui-state.type.js - do not edit manually

/** {@link module:ViewUiState} */
/*  ViewUiState generated from: modules/quicken-web-app/type-definitions/view-ui-state.type.js
 *
 *  id                    : FieldTypes.viewId,
 *  filterPopoverId       : "String?",
 *  filterPopoverSearch   : "String",
 *  filterPopoverHighlight: "Number",
 *  currentRowIndex       : "Number",
 *  currentSearchIndex    : "Number",
 *  treeExpansion         : "Object?",
 *  columnSizing          : "Object?",
 *  columnOrder           : "[String]?"
 *
 */

import { FieldTypes } from './field-types.js'

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ViewUiState instance
 * @sig ViewUiState :: (String, String?, String, Number, Number, Number, Object?, Object?, [String]?) -> ViewUiState
 */
const ViewUiState = function ViewUiState(
    id,
    filterPopoverId,
    filterPopoverSearch,
    filterPopoverHighlight,
    currentRowIndex,
    currentSearchIndex,
    treeExpansion,
    columnSizing,
    columnOrder,
) {
    const constructorName =
        'ViewUiState(id, filterPopoverId, filterPopoverSearch, filterPopoverHighlight, currentRowIndex, currentSearchIndex, treeExpansion, columnSizing, columnOrder)'

    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateString(constructorName, 'filterPopoverId', true, filterPopoverId)
    R.validateString(constructorName, 'filterPopoverSearch', false, filterPopoverSearch)
    R.validateNumber(constructorName, 'filterPopoverHighlight', false, filterPopoverHighlight)
    R.validateNumber(constructorName, 'currentRowIndex', false, currentRowIndex)
    R.validateNumber(constructorName, 'currentSearchIndex', false, currentSearchIndex)
    R.validateObject(constructorName, 'treeExpansion', true, treeExpansion)
    R.validateObject(constructorName, 'columnSizing', true, columnSizing)
    R.validateArray(constructorName, 1, 'String', undefined, 'columnOrder', true, columnOrder)

    const result = Object.create(prototype)
    result.id = id
    if (filterPopoverId != null) result.filterPopoverId = filterPopoverId
    result.filterPopoverSearch = filterPopoverSearch
    result.filterPopoverHighlight = filterPopoverHighlight
    result.currentRowIndex = currentRowIndex
    result.currentSearchIndex = currentSearchIndex
    if (treeExpansion != null) result.treeExpansion = treeExpansion
    if (columnSizing != null) result.columnSizing = columnSizing
    if (columnOrder != null) result.columnOrder = columnOrder
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig viewuistateToString :: () -> String
 */
const viewuistateToString = function () {
    return `ViewUiState(${R._toString(this.id)},
        ${R._toString(this.filterPopoverId)},
        ${R._toString(this.filterPopoverSearch)},
        ${R._toString(this.filterPopoverHighlight)},
        ${R._toString(this.currentRowIndex)},
        ${R._toString(this.currentSearchIndex)},
        ${R._toString(this.treeExpansion)},
        ${R._toString(this.columnSizing)},
        ${R._toString(this.columnOrder)})`
}

/*
 * Convert to JSON representation
 * @sig viewuistateToJSON :: () -> Object
 */
const viewuistateToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ViewUiState', enumerable: false },
    toString: { value: viewuistateToString, enumerable: false },
    toJSON: { value: viewuistateToJSON, enumerable: false },
    constructor: { value: ViewUiState, enumerable: false, writable: true, configurable: true },
})

ViewUiState.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ViewUiState.toString = () => 'ViewUiState'
ViewUiState.is = v => v && v['@@typeName'] === 'ViewUiState'

ViewUiState._from = _input => {
    const {
        id,
        filterPopoverId,
        filterPopoverSearch,
        filterPopoverHighlight,
        currentRowIndex,
        currentSearchIndex,
        treeExpansion,
        columnSizing,
        columnOrder,
    } = _input
    return ViewUiState(
        id,
        filterPopoverId,
        filterPopoverSearch,
        filterPopoverHighlight,
        currentRowIndex,
        currentSearchIndex,
        treeExpansion,
        columnSizing,
        columnOrder,
    )
}
ViewUiState.from = ViewUiState._from

ViewUiState._toFirestore = (o, encodeTimestamps) => ({ ...o })

ViewUiState._fromFirestore = (doc, decodeTimestamps) => ViewUiState._from(doc)

// Public aliases (override if necessary)
ViewUiState.toFirestore = ViewUiState._toFirestore
ViewUiState.fromFirestore = ViewUiState._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ViewUiState }
