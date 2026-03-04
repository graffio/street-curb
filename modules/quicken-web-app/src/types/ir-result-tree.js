// ABOUTME: Generated type definition for IRResultTree
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-result-tree.type.js - do not edit manually

/*  IRResultTree generated from: modules/quicken-web-app/type-definitions/ir-result-tree.type.js
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
// IRResultTree constructor
//
// -------------------------------------------------------------------------------------------------------------
const IRResultTree = {
    toString: () => 'IRResultTree',
}

// Add hidden properties
Object.defineProperty(IRResultTree, '@@typeName', { value: 'IRResultTree', enumerable: false })
Object.defineProperty(IRResultTree, '@@tagNames', { value: ['Category', 'Holdings'], enumerable: false })

// Type prototype with match method
const IRResultTreePrototype = {}

Object.defineProperty(IRResultTreePrototype, 'match', {
    value: R.match(IRResultTree['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(IRResultTreePrototype, 'constructor', {
    value: IRResultTree,
    enumerable: false,
    writable: true,
    configurable: true,
})

IRResultTree.prototype = IRResultTreePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    category: function () { return `IRResultTree.Category(${R._toString(this.nodes)})` },
    holdings: function () { return `IRResultTree.Holdings(${R._toString(this.nodes)})` },
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
 * Construct a IRResultTree.Category instance
 * @sig Category :: ([CategoryTreeNode]) -> IRResultTree.Category
 */
const CategoryConstructor = function Category(nodes) {
    const constructorName = 'IRResultTree.Category(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'nodes', false, nodes)

    const result = Object.create(CategoryPrototype)
    result.nodes = nodes
    return result
}

IRResultTree.Category = CategoryConstructor

/*
 * Construct a IRResultTree.Holdings instance
 * @sig Holdings :: ([HoldingsTreeNode]) -> IRResultTree.Holdings
 */
const HoldingsConstructor = function Holdings(nodes) {
    const constructorName = 'IRResultTree.Holdings(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'HoldingsTreeNode', 'nodes', false, nodes)

    const result = Object.create(HoldingsPrototype)
    result.nodes = nodes
    return result
}

IRResultTree.Holdings = HoldingsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const CategoryPrototype = Object.create(IRResultTreePrototype, {
    '@@tagName': { value: 'Category', enumerable: false },
    '@@typeName': { value: 'IRResultTree', enumerable: false },
    toString: { value: toString.category, enumerable: false },
    toJSON: { value: toJSON.category, enumerable: false },
    constructor: { value: CategoryConstructor, enumerable: false, writable: true, configurable: true },
})

const HoldingsPrototype = Object.create(IRResultTreePrototype, {
    '@@tagName': { value: 'Holdings', enumerable: false },
    '@@typeName': { value: 'IRResultTree', enumerable: false },
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
CategoryConstructor.toString = () => 'IRResultTree.Category'
HoldingsConstructor.toString = () => 'IRResultTree.Holdings'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor._from = _input => IRResultTree.Category(_input.nodes)
HoldingsConstructor._from = _input => IRResultTree.Holdings(_input.nodes)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.from = CategoryConstructor._from
HoldingsConstructor.from = HoldingsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRResultTree instance
 * @sig is :: Any -> Boolean
 */
IRResultTree.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === IRResultTree.Category || constructor === IRResultTree.Holdings
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRResultTree }
