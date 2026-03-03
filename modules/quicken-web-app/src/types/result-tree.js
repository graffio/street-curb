// ABOUTME: Generated type definition for ResultTree
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/result-tree.type.js - do not edit manually

/*  ResultTree generated from: modules/quicken-web-app/type-definitions/result-tree.type.js
 *
 *  Category
 *      nodes: "[CategoryTreeNode]"
 *  Holdings
 *      nodes: "[HoldingsTreeNode]"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { CategoryTreeNode } from './category-tree-node.js'
import { HoldingsTreeNode } from './holdings-tree-node.js'

// -------------------------------------------------------------------------------------------------------------
//
// ResultTree constructor
//
// -------------------------------------------------------------------------------------------------------------
const ResultTree = {
    toString: () => 'ResultTree',
}

// Add hidden properties
Object.defineProperty(ResultTree, '@@typeName', { value: 'ResultTree', enumerable: false })
Object.defineProperty(ResultTree, '@@tagNames', { value: ['Category', 'Holdings'], enumerable: false })

// Type prototype with match method
const ResultTreePrototype = {}

Object.defineProperty(ResultTreePrototype, 'match', {
    value: R.match(ResultTree['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ResultTreePrototype, 'constructor', {
    value: ResultTree,
    enumerable: false,
    writable: true,
    configurable: true,
})

ResultTree.prototype = ResultTreePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    category: function () { return `ResultTree.Category(${R._toString(this.nodes)})` },
    holdings: function () { return `ResultTree.Holdings(${R._toString(this.nodes)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    category: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    holdings: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ResultTree.Category instance
 * @sig Category :: ([CategoryTreeNode]) -> ResultTree.Category
 */
const CategoryConstructor = function Category(nodes) {
    const constructorName = 'ResultTree.Category(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'nodes', false, nodes)

    const result = Object.create(CategoryPrototype)
    result.nodes = nodes
    return result
}

ResultTree.Category = CategoryConstructor

/*
 * Construct a ResultTree.Holdings instance
 * @sig Holdings :: ([HoldingsTreeNode]) -> ResultTree.Holdings
 */
const HoldingsConstructor = function Holdings(nodes) {
    const constructorName = 'ResultTree.Holdings(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'HoldingsTreeNode', 'nodes', false, nodes)

    const result = Object.create(HoldingsPrototype)
    result.nodes = nodes
    return result
}

ResultTree.Holdings = HoldingsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const CategoryPrototype = Object.create(ResultTreePrototype, {
    '@@tagName': { value: 'Category', enumerable: false },
    '@@typeName': { value: 'ResultTree', enumerable: false },
    toString: { value: toString.category, enumerable: false },
    toJSON: { value: toJSON.category, enumerable: false },
    constructor: { value: CategoryConstructor, enumerable: false, writable: true, configurable: true },
})

const HoldingsPrototype = Object.create(ResultTreePrototype, {
    '@@tagName': { value: 'Holdings', enumerable: false },
    '@@typeName': { value: 'ResultTree', enumerable: false },
    toString: { value: toString.holdings, enumerable: false },
    toJSON: { value: toJSON.holdings, enumerable: false },
    constructor: { value: HoldingsConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.prototype = CategoryPrototype
HoldingsConstructor.prototype = HoldingsPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.is = val => val && val.constructor === CategoryConstructor
HoldingsConstructor.is = val => val && val.constructor === HoldingsConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.toString = () => 'ResultTree.Category'
HoldingsConstructor.toString = () => 'ResultTree.Holdings'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor._from = _input => ResultTree.Category(_input.nodes)
HoldingsConstructor._from = _input => ResultTree.Holdings(_input.nodes)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.from = CategoryConstructor._from
HoldingsConstructor.from = HoldingsConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

CategoryConstructor._toFirestore = (o, encodeTimestamps) => ({
    nodes: o.nodes.map(item1 => CategoryTreeNode.toFirestore(item1, encodeTimestamps)),
})

CategoryConstructor._fromFirestore = (doc, decodeTimestamps) =>
    CategoryConstructor._from({
        nodes: doc.nodes.map(item1 =>
            CategoryTreeNode.fromFirestore
                ? CategoryTreeNode.fromFirestore(item1, decodeTimestamps)
                : CategoryTreeNode.from(item1),
        ),
    })

// Public aliases (can be overridden)
CategoryConstructor.toFirestore = CategoryConstructor._toFirestore
CategoryConstructor.fromFirestore = CategoryConstructor._fromFirestore

HoldingsConstructor._toFirestore = (o, encodeTimestamps) => ({
    nodes: o.nodes.map(item1 => HoldingsTreeNode.toFirestore(item1, encodeTimestamps)),
})

HoldingsConstructor._fromFirestore = (doc, decodeTimestamps) =>
    HoldingsConstructor._from({
        nodes: doc.nodes.map(item1 =>
            HoldingsTreeNode.fromFirestore
                ? HoldingsTreeNode.fromFirestore(item1, decodeTimestamps)
                : HoldingsTreeNode.from(item1),
        ),
    })

// Public aliases (can be overridden)
HoldingsConstructor.toFirestore = HoldingsConstructor._toFirestore
HoldingsConstructor.fromFirestore = HoldingsConstructor._fromFirestore

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ResultTree instance
 * @sig is :: Any -> Boolean
 */
ResultTree.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === ResultTree.Category || constructor === ResultTree.Holdings
}

/**
 * Serialize ResultTree to Firestore format
 * @sig _toFirestore :: (ResultTree, Function) -> Object
 */
ResultTree._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = ResultTree[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize ResultTree from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ResultTree
 */
ResultTree._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Category') return ResultTree.Category.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Holdings') return ResultTree.Holdings.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized ResultTree variant: ${tagName}`)
}

// Public aliases (can be overridden)
ResultTree.toFirestore = ResultTree._toFirestore
ResultTree.fromFirestore = ResultTree._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { ResultTree }
