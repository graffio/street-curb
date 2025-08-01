/*
 * Metaprogramming to generate constructors based on
 *
 * - https://www.npmjs.com/package/daggy
 * - http://www.tomharding.me/2017/03/03/fantas-eel-and-specification/
 *
 * Consider this code:
 *
 *    const Coord = tagged('Coord', {'x': 'Number', 'y': 'Number' })
 *    Coord.translate = (coord, x, y) => Coord(coord.x + x, coord.y + y)
 *
 *    const Shape = taggedSum('Shape', {
 *      Square: { topLeft: 'Coord', bottomRight: 'Coord'},    // Square :: (Coord, Coord)  -> Shape
 *      Circle: { centre: 'Coord', radius: 'Number' }         // Circle :: (Coord, Number) -> Shape
 *    })
 *
 *    Shape.translate = (shape, x, y) =>
 *      shape.match({
 *          Square: ({ topLeft, bottomRight }) => Shape.Square(Coord.translate(topLeft, x, y), Coord.translate(bottomRight, x, y)),
 *          Circle: ({ centre, radius })       => Shape.Circle(Coord.translate(centre, x, y), radius),
 *    })
 *
 * Shape is a "Sum Type" or "Tagged Union" (@see https://en.wikipedia.org/wiki/Tagged_union)
 * Square and Circle are "Type Constructors" for Shape and define the complete range of available Shapes.
 * That is, every Shape is constructed either as a Square or as a Circle.
 *
 * Coord is also "Tagged" but there is only one Type Constructor so the syntax to create it is simpler. This code:
 *
 *  const Coord = tagged('Coord', { 'x': 'Number', 'y': 'Number' })
 *  const coord1 = Coord(1, 2)
 *  const coord2 = Coord.translate(coord1, 1, 1)
 *
 * Would produce these objects:
 *
 *  Function Coord:
 *    is             * -> Boolean
 *    from           { x: Number, y: Number } -> Coord
 *    toString       () -> 'Coord'
 *
 *  Coord.prototype {
 *      @@typeName     'Coord'
 *      constructor:   Coord
 *      toString   :   () -> `Coord(${this.x}, ${this.y})`
 *    }
 *
 *  coord1
 *    x         1
 *    y         2
 *    __proto__ -> Coord.prototype
 *
 * Meanwhile:
 *
 *  const Shape = taggedSum('Shape', {
 *    Square: { topLeft: Coord, bottomRight: Coord},    // Square :: (Coord, Coord)  -> Shape
 *    Circle: { centre: Coord, radius: Number }         // Circle :: (Coord, Number) -> Shape
 *  })
 *
 *  const square = Shape.Square(Coord(0, 0), Coord(4, 4))
 *  const circle = Shape.Circle(Coord(0, 0), 2)
 *
 * Would produce these objects:
 *
 *  Shape
 *    @@typeName  'Shape'
 *    @@tagNames  ['Square', 'Circle']
 *    is          * -> Boolean
 *    toString    () -> 'Shape'
 *
 *  Shape.prototype
 *    match       { TypeName: a -> b, c -> d, ... } -> b|d|...
 *
 *  Function Shape.Square
 *    is          * -> Boolean
 *    toString    () -> 'Shape.Square'
 *    from        { topLeft: Coord, bottomRight: Coord } -> Square
 *
 *  Function Shape.Circle
 *    is          * -> Boolean
 *    toString    () -> 'Shape.Circle'
 *    from        { centre: Coord, radius: Number } -> Circle
 *
 *  Shape.Square.prototype
 *    @@typeName  'Shape'
 *    @@tagName   'Square'
 *    toString    () -> 'Square(Coord(0, 0), Coord(4, 4))'
 *    constructor Shape.Square
 *    prototype   Shape.prototype
 *
 *  Shape.Circle.prototype
 *    @@typeName  'Shape'
 *    @@tagName   'Circle'
 *    toString    () -> 'Circle(Coord(0, 0), 4)'
 *    constructor Shape.Circle
 *    prototype   Shape.prototype
 *
 *  square
 *    topLeft     Coord(0, 0)
 *    bottomRight Coord(4, 4)
 *    __proto__   -> Shape.Square.prototype
 *
 *  circle
 *    centre      Coord(0, 0)
 *    radius      4
 *    __proto__   -> Shape.Circle.prototype
 *
 *
 * Names of prop used to store:
 *
 * '@@tagName' : name of type for a tagged type OR the name of a variant of a sum type
 * '@@typeName': type of variant constructor's returned results
 * '@@tagNames': names of all variants of a sum type
 */
import Generator from './tagged-type-function-generators.js'

// defaults for configurable, enumerable and writable are all false.
const addHiddenProperty = (obj, prop, val) => Object.defineProperty(obj, prop, { value: val })

/* ---------------------------------------------------------------------------------------------------------------------
 * Tagged
 * ------------------------------------------------------------------------------------------------------------------ */
/* eslint-disable no-eval */

/*
 * Generate a tagged constructor
 *
 * @sig tagged :: (String, [Field]) -> TypeConstructor
 *  TypeConstructor = (a, ..., n) -> TaggedObject
 *  TaggedObject = { Field: a, ..., Field: n }
 *  Field = String
 */
const tagged = (typeName, fields) => {
    const prototype = { toString: eval(Generator.generateToString(typeName, fields)), '@@typeName': typeName }

    // generate a Type Constructor function and connect the function prototype and constructor to each other
    const typeConstructor = eval(Generator.generateTypeConstructor(typeName, typeName, fields))
    typeConstructor.prototype = prototype
    prototype.constructor = typeConstructor

    /*
     * Add functions to the TypeConstructor itself:
     *
     * toString :: () -> String
     * is       :: a -> Boolean
     * from     :: {k: v} -> TaggedObject
     */
    typeConstructor.toString = () => typeName
    typeConstructor.is = v => v && v['@@typeName'] === typeName
    typeConstructor.from = eval(Generator.generateFrom('prototype', typeName, typeName, fields))(typeConstructor)

    // add toJSON so JSON.stringify can find it
    typeConstructor.prototype.toJSON = function () {
        return this
    }

    typeConstructor.prototype.renameFieldButLoudly = (oldName, newName) =>
        Object.defineProperty(typeConstructor.prototype, oldName, {
            get() {
                // eslint-disable-next-line no-debugger
                debugger
                console.error(`${typeName}.${oldName} was renamed to ${typeName}.${newName}`)
                return this[newName]
            },
            set(value) {
                // eslint-disable-next-line no-debugger
                debugger
                console.error(`${typeName}.${oldName}.set was renamed to ${typeName}.${newName}`)
                this[newName] = value
            },
        })

    return typeConstructor
}

// special handling for 0-length variant -- *every* such item is identical
const taggedUnitType = (tagConstructorPrototype, tag) => {
    // function Nil() {}
    const Func = eval(Generator.generateUnitConstructor('tagConstructorPrototype', tag))
    Func.prototype = tagConstructorPrototype

    // Nil()
    const tagConstructor = new Func()

    tagConstructor.from = () => tagConstructor

    // add toJSON so JSON.stringify can find it
    tagConstructor.toJSON = function () {
        return { '@@tagName': tag }
    }

    addHiddenProperty(tagConstructorPrototype, 'constructor', tagConstructor)
    addHiddenProperty(tagConstructorPrototype, 'is', val => tagConstructor === val)
    return tagConstructor
}

// This will be Shape.Square
const taggedVariantType = (typeName, prototype, tag, fields) => {
    // generate a Type Constructor function and connect the function prototype and constructor to each other
    try {
        const tagConstructor = eval(Generator.generateTypeConstructor(tag, `${typeName}.${tag}`, fields))
        tagConstructor.prototype = prototype
        tagConstructor.prototype.constructor = tagConstructor

        tagConstructor.is = val => val && val.constructor === tagConstructor
        tagConstructor.toString = () => `${typeName}.${tag}`
        tagConstructor.from = eval(Generator.generateFrom('prototype', tag, `${typeName}.${tag}`, fields))(
            tagConstructor,
        )

        tagConstructor.prototype.renameFieldButLoudly = (oldName, newName) =>
            Object.defineProperty(tagConstructor.prototype, oldName, {
                get() {
                    // eslint-disable-next-line no-debugger
                    debugger
                    console.error(`${typeName}.${oldName} was renamed to ${typeName}.${newName}`)
                    return this[newName]
                },
                set(value) {
                    // eslint-disable-next-line no-debugger
                    debugger
                    console.error(`${typeName}.${oldName}.set was renamed to ${typeName}.${newName}`)
                    this[newName] = value
                },
            })

        // add toJSON so JSON.stringify can find it
        tagConstructor.prototype.toJSON = function () {
            return Object.assign({ '@@tagName': this['@@tagName'] }, this)
        }

        addHiddenProperty(prototype, 'constructor', tagConstructor)
        return tagConstructor
    } catch (e) {
        console.error('Constructor failed to evaluate properly')
        console.error(Generator.generateTypeConstructor(tag, `${typeName}.${tag}`, fields))
        throw e
    }
}

const taggedSum = (typeName, constructors) => {
    const createTagConstructor = tag => {
        const fields = constructors[tag]
        const prototype = Object.create(typePrototype)
        addHiddenProperty(prototype, '@@tagName', tag)
        addHiddenProperty(prototype, '@@typeName', typeName)

        try {
            prototype.toString = eval(Generator.generateToString(`${typeName}.${tag}`, fields))
        } catch (e) {
            console.error('Constructor failed to evaluate properly')
            console.error(Generator.generateToString(`${typeName}.${tag}`, fields))
            throw e
        }

        typeConstructor[tag] =
            Object.keys(fields).length === 0
                ? taggedUnitType(prototype, tag)
                : taggedVariantType(typeName, prototype, tag, fields)
    }

    // Run one of the variants depending on the object passed in
    const match = function (variants) {
        const validateTagsAreAllPresent = tag => {
            if (!variants[tag]) throw new TypeError("Constructors given to match didn't include: " + tag)
        }

        typeConstructor['@@tagNames'].forEach(validateTagsAreAllPresent)
        const variant = variants[this['@@tagName']]
        return variant.call(variants, this)
    }

    // this will be Shape.prototype
    const typePrototype = { match }

    const tagNames = Object.keys(constructors)

    // this will be "Shape"
    const is = v => {
        if (typeof v !== 'object') return false

        const constructor = Object.getPrototypeOf(v).constructor
        for (let i = 0; i < tagNames.length; i++) if (constructor === typeConstructor[tagNames[i]]) return true
        return false
    }

    const typeConstructor = {
        toString: () => typeName,
        prototype: typePrototype,
        is,
        '@@typeName': typeName,
        '@@tagNames': tagNames,
    }

    typePrototype.constructor = typeConstructor
    tagNames.map(createTagConstructor)
    return typeConstructor
}

export { tagged, taggedSum }
