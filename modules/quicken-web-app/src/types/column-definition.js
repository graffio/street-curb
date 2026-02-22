// ABOUTME: Generated type definition for ColumnDefinition
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/column-definition.type.js - do not edit manually

/** {@link module:ColumnDefinition} */
/*  ColumnDefinition generated from: modules/quicken-web-app/type-definitions/column-definition.type.js
 *
 *  id            : "String",
 *  accessorKey   : "String?",
 *  accessorFn    : "Any?",
 *  header        : "String",
 *  size          : "Number?",
 *  minSize       : "Number?",
 *  maxSize       : "Number?",
 *  textAlign     : "String?",
 *  enableSorting : "Boolean?",
 *  enableResizing: "Boolean?",
 *  meta          : "Object?",
 *  cell          : "Any"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ColumnDefinition instance
 * @sig ColumnDefinition :: (String, String?, Any?, String, Number?, Number?, Number?, String?, Boolean?, Boolean?, Object?, Any) -> ColumnDefinition
 */
const ColumnDefinition = function ColumnDefinition(
    id,
    accessorKey,
    accessorFn,
    header,
    size,
    minSize,
    maxSize,
    textAlign,
    enableSorting,
    enableResizing,
    meta,
    cell,
) {
    const constructorName =
        'ColumnDefinition(id, accessorKey, accessorFn, header, size, minSize, maxSize, textAlign, enableSorting, enableResizing, meta, cell)'

    R.validateString(constructorName, 'id', false, id)
    R.validateString(constructorName, 'accessorKey', true, accessorKey)

    R.validateString(constructorName, 'header', false, header)
    R.validateNumber(constructorName, 'size', true, size)
    R.validateNumber(constructorName, 'minSize', true, minSize)
    R.validateNumber(constructorName, 'maxSize', true, maxSize)
    R.validateString(constructorName, 'textAlign', true, textAlign)
    R.validateBoolean(constructorName, 'enableSorting', true, enableSorting)
    R.validateBoolean(constructorName, 'enableResizing', true, enableResizing)
    R.validateObject(constructorName, 'meta', true, meta)

    const result = Object.create(prototype)
    result.id = id
    if (accessorKey !== undefined) result.accessorKey = accessorKey
    if (accessorFn !== undefined) result.accessorFn = accessorFn
    result.header = header
    if (size !== undefined) result.size = size
    if (minSize !== undefined) result.minSize = minSize
    if (maxSize !== undefined) result.maxSize = maxSize
    if (textAlign !== undefined) result.textAlign = textAlign
    if (enableSorting !== undefined) result.enableSorting = enableSorting
    if (enableResizing !== undefined) result.enableResizing = enableResizing
    if (meta !== undefined) result.meta = meta
    result.cell = cell
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Convert to string representation
 * @sig columndefinitionToString :: () -> String
 */
const columndefinitionToString = function () {
    return `ColumnDefinition(${R._toString(this.id)},
        ${R._toString(this.accessorKey)},
        ${R._toString(this.accessorFn)},
        ${R._toString(this.header)},
        ${R._toString(this.size)},
        ${R._toString(this.minSize)},
        ${R._toString(this.maxSize)},
        ${R._toString(this.textAlign)},
        ${R._toString(this.enableSorting)},
        ${R._toString(this.enableResizing)},
        ${R._toString(this.meta)},
        ${R._toString(this.cell)})`
}

/*
 * Convert to JSON representation
 * @sig columndefinitionToJSON :: () -> Object
 */
const columndefinitionToJSON = function () {
    return this
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ColumnDefinition', enumerable: false },
    toString: { value: columndefinitionToString, enumerable: false },
    toJSON: { value: columndefinitionToJSON, enumerable: false },
    constructor: { value: ColumnDefinition, enumerable: false, writable: true, configurable: true },
})

ColumnDefinition.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ColumnDefinition.toString = () => 'ColumnDefinition'
ColumnDefinition.is = v => v && v['@@typeName'] === 'ColumnDefinition'

ColumnDefinition._from = _input => {
    const {
        id,
        accessorKey,
        accessorFn,
        header,
        size,
        minSize,
        maxSize,
        textAlign,
        enableSorting,
        enableResizing,
        meta,
        cell,
    } = _input
    return ColumnDefinition(
        id,
        accessorKey,
        accessorFn,
        header,
        size,
        minSize,
        maxSize,
        textAlign,
        enableSorting,
        enableResizing,
        meta,
        cell,
    )
}
ColumnDefinition.from = ColumnDefinition._from

ColumnDefinition._toFirestore = (o, encodeTimestamps) => ({ ...o })

ColumnDefinition._fromFirestore = (doc, decodeTimestamps) => ColumnDefinition._from(doc)

// Public aliases (override if necessary)
ColumnDefinition.toFirestore = ColumnDefinition._toFirestore
ColumnDefinition.fromFirestore = ColumnDefinition._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ColumnDefinition }
