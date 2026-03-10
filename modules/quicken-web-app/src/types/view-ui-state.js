// ABOUTME: Generated type definition for ViewUiState
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ui-state/view-ui-state.type.js - do not edit manually

/** {@link module:ViewUiState} */
/*  ViewUiState generated from: modules/quicken-web-app/type-definitions/ui-state/view-ui-state.type.js
 *
 *  id                    : FieldTypes.viewId,
 *  filterPopoverId       : "String?",
 *  filterPopoverSearch   : "String",
 *  filterPopoverHighlight: "Number",
 *  currentRowIndex       : "Number",
 *  currentSearchIndex    : "Number",
 *  treeExpansion         : "Object?",
 *  columnSizing          : "Object?",
 *  columnOrder           : "[String]?",
 *  highlightedRowId      : "String?"
 *
 */

import { FieldTypes } from './field-types.js'

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ViewUiState instance
 * @sig ViewUiState :: (String, String?, String, Number, Number, Number, Object?, Object?, [String]?, String?) -> ViewUiState
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
    highlightedRowId,
) {
    const constructorName =
        'ViewUiState(id, filterPopoverId, filterPopoverSearch, filterPopoverHighlight, currentRowIndex, currentSearchIndex, treeExpansion, columnSizing, columnOrder, highlightedRowId)'

    R.validateRegex(constructorName, FieldTypes.viewId, 'id', false, id)
    R.validateString(constructorName, 'filterPopoverId', true, filterPopoverId)
    R.validateString(constructorName, 'filterPopoverSearch', false, filterPopoverSearch)
    R.validateNumber(constructorName, 'filterPopoverHighlight', false, filterPopoverHighlight)
    R.validateNumber(constructorName, 'currentRowIndex', false, currentRowIndex)
    R.validateNumber(constructorName, 'currentSearchIndex', false, currentSearchIndex)
    R.validateObject(constructorName, 'treeExpansion', true, treeExpansion)
    R.validateObject(constructorName, 'columnSizing', true, columnSizing)
    R.validateArray(constructorName, 1, 'String', undefined, 'columnOrder', true, columnOrder)
    R.validateString(constructorName, 'highlightedRowId', true, highlightedRowId)

    const result = Object.create(prototype)
    result.id = id
    if (filterPopoverId !== undefined) result.filterPopoverId = filterPopoverId
    result.filterPopoverSearch = filterPopoverSearch
    result.filterPopoverHighlight = filterPopoverHighlight
    result.currentRowIndex = currentRowIndex
    result.currentSearchIndex = currentSearchIndex
    if (treeExpansion !== undefined) result.treeExpansion = treeExpansion
    if (columnSizing !== undefined) result.columnSizing = columnSizing
    if (columnOrder !== undefined) result.columnOrder = columnOrder
    if (highlightedRowId !== undefined) result.highlightedRowId = highlightedRowId
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
        ${R._toString(this.columnOrder)},
        ${R._toString(this.highlightedRowId)})`
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
        highlightedRowId,
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
        highlightedRowId,
    )
}
ViewUiState.from = ViewUiState._from

ViewUiState.fromJSON = json => (json == null ? json : ViewUiState._from(json))

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ViewUiState }
