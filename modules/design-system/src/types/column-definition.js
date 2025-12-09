/** {@link module:ColumnDefinition} */
/*  ColumnDefinition generated from: modules/design-system/type-definitions/column-definition.type.js
 *
 *  key       : "String",
 *  title     : "String",
 *  width     : "String?",
 *  flex      : "Number?",
 *  textAlign : "/(left|center|right)?",
 *  format    : "Format?",
 *  searchable: "Boolean?",
 *  sortable  : "Boolean?",
 *  hidden    : "Boolean?"
 *
 */

import * as R from '@graffio/cli-type-generator'

import { Format } from './format.js'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const ColumnDefinition = function ColumnDefinition(
    key,
    title,
    width,
    flex,
    textAlign,
    format,
    searchable,
    sortable,
    hidden,
) {
    const constructorName = 'ColumnDefinition(key, title, width, flex, textAlign, format, searchable, sortable, hidden)'

    R.validateString(constructorName, 'key', false, key)
    R.validateString(constructorName, 'title', false, title)
    R.validateString(constructorName, 'width', true, width)
    R.validateNumber(constructorName, 'flex', true, flex)
    R.validateString(constructorName, 'textAlign', true, textAlign)
    R.validateTag(constructorName, 'Format', 'format', true, format)
    R.validateBoolean(constructorName, 'searchable', true, searchable)
    R.validateBoolean(constructorName, 'sortable', true, sortable)
    R.validateBoolean(constructorName, 'hidden', true, hidden)

    const result = Object.create(prototype)
    result.key = key
    result.title = title
    if (width != null) result.width = width
    if (flex != null) result.flex = flex
    if (textAlign != null) result.textAlign = textAlign
    if (format != null) result.format = format
    if (searchable != null) result.searchable = searchable
    if (sortable != null) result.sortable = sortable
    if (hidden != null) result.hidden = hidden
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'ColumnDefinition', enumerable: false },

    toString: {
        value: function () {
            return `ColumnDefinition(${R._toString(this.key)}, ${R._toString(this.title)}, ${R._toString(this.width)}, ${R._toString(this.flex)}, ${R._toString(this.textAlign)}, ${R._toString(this.format)}, ${R._toString(this.searchable)}, ${R._toString(this.sortable)}, ${R._toString(this.hidden)})`
        },
        enumerable: false,
    },

    toJSON: {
        value: function () {
            return this
        },
        enumerable: false,
    },

    constructor: {
        value: ColumnDefinition,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

ColumnDefinition.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
ColumnDefinition.toString = () => 'ColumnDefinition'
ColumnDefinition.is = v => v && v['@@typeName'] === 'ColumnDefinition'

ColumnDefinition._from = o =>
    ColumnDefinition(o.key, o.title, o.width, o.flex, o.textAlign, o.format, o.searchable, o.sortable, o.hidden)
ColumnDefinition.from = ColumnDefinition._from

ColumnDefinition._toFirestore = (o, encodeTimestamps) => {
    const result = {
        key: o.key,
        title: o.title,
    }

    if (o.width != null) result.width = o.width

    if (o.flex != null) result.flex = o.flex

    if (o.textAlign != null) result.textAlign = o.textAlign

    if (o.format != null) result.format = Format.toFirestore(o.format, encodeTimestamps)

    if (o.searchable != null) result.searchable = o.searchable

    if (o.sortable != null) result.sortable = o.sortable

    if (o.hidden != null) result.hidden = o.hidden

    return result
}

ColumnDefinition._fromFirestore = (doc, decodeTimestamps) =>
    ColumnDefinition._from({
        key: doc.key,
        title: doc.title,
        width: doc.width,
        flex: doc.flex,
        textAlign: doc.textAlign,
        format: Format.fromFirestore ? Format.fromFirestore(doc.format, decodeTimestamps) : Format.from(doc.format),
        searchable: doc.searchable,
        sortable: doc.sortable,
        hidden: doc.hidden,
    })

// Public aliases (override if necessary)
ColumnDefinition.toFirestore = ColumnDefinition._toFirestore
ColumnDefinition.fromFirestore = ColumnDefinition._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ColumnDefinition }
