// ABOUTME: Generated type definition for ColumnDefinition
// ABOUTME: Auto-generated from modules/design-system/type-definitions/column-definition.type.js - do not edit manually

/** {@link module:ColumnDefinition} */
/*  ColumnDefinition generated from: modules/design-system/type-definitions/column-definition.type.js
 *
 *  id            : "String",
 *  accessorKey   : "String?",
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

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Construct a ColumnDefinition instance
 * @sig ColumnDefinition :: (String, String?, String, Number?, Number?, Number?, String?, Boolean?, Boolean?, Object?, Any) -> ColumnDefinition
 */
const ColumnDefinition = function ColumnDefinition(
    id,
    accessorKey,
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
        'ColumnDefinition(id, accessorKey, header, size, minSize, maxSize, textAlign, enableSorting, enableResizing, meta, cell)'

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
    if (accessorKey != null) result.accessorKey = accessorKey
    result.header = header
    if (size != null) result.size = size
    if (minSize != null) result.minSize = minSize
    if (maxSize != null) result.maxSize = maxSize
    if (textAlign != null) result.textAlign = textAlign
    if (enableSorting != null) result.enableSorting = enableSorting
    if (enableResizing != null) result.enableResizing = enableResizing
    if (meta != null) result.meta = meta
    result.cell = cell
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype methods
//
// -------------------------------------------------------------------------------------------------------------
/**
 * Convert to string representation
 * @sig columndefinitionToString :: () -> String
 */
const columndefinitionToString = function () {
    return `ColumnDefinition(
        ${R._toString(this.id)},
        ${R._toString(this.accessorKey)},
        ${R._toString(this.header)},
        ${R._toString(this.size)},
        ${R._toString(this.minSize)},
        ${R._toString(this.maxSize)},
        ${R._toString(this.textAlign)},
        ${R._toString(this.enableSorting)},
        ${R._toString(this.enableResizing)},
        ${R._toString(this.meta)},
        ${R._toString(this.cell)},
    )`
}

/**
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

ColumnDefinition._from = o => {
    const { id, accessorKey, header, size, minSize, maxSize, textAlign, enableSorting, enableResizing, meta, cell } = o
    return ColumnDefinition(
        id,
        accessorKey,
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
