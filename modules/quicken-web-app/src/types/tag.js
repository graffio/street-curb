/** {@link module:Tag} */
/*  Tag generated from: modules/quicken-web-app/type-definitions/tag.type.js
 *
 *  id         : /^tag_[a-f0-9]{12}$/,
 *  name       : "String",
 *  color      : "String?",
 *  description: "String?"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// main constructor
//
// -------------------------------------------------------------------------------------------------------------
const Tag = function Tag(id, name, color, description) {
    const constructorName = 'Tag(id, name, color, description)'

    R.validateRegex(constructorName, /^tag_[a-f0-9]{12}$/, 'id', false, id)
    R.validateString(constructorName, 'name', false, name)
    R.validateString(constructorName, 'color', true, color)
    R.validateString(constructorName, 'description', true, description)

    const result = Object.create(prototype)
    result.id = id
    result.name = name
    if (color != null) result.color = color
    if (description != null) result.description = description
    return result
}

// -------------------------------------------------------------------------------------------------------------
//
// prototype
//
// -------------------------------------------------------------------------------------------------------------
const prototype = Object.create(Object.prototype, {
    '@@typeName': { value: 'Tag', enumerable: false },

    toString: {
        value: function () {
            return `Tag(${R._toString(this.id)}, ${R._toString(this.name)}, ${R._toString(this.color)}, ${R._toString(this.description)})`
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
        value: Tag,
        enumerable: false,
        writable: true,
        configurable: true,
    },
})

Tag.prototype = prototype

// -------------------------------------------------------------------------------------------------------------
//
// static methods
//
// -------------------------------------------------------------------------------------------------------------
Tag.toString = () => 'Tag'
Tag.is = v => v && v['@@typeName'] === 'Tag'

Tag._from = o => Tag(o.id, o.name, o.color, o.description)
Tag.from = Tag._from

Tag._toFirestore = (o, encodeTimestamps) => ({ ...o })

Tag._fromFirestore = (doc, decodeTimestamps) => Tag._from(doc)

// Public aliases (override if necessary)
Tag.toFirestore = Tag._toFirestore
Tag.fromFirestore = Tag._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { Tag }
