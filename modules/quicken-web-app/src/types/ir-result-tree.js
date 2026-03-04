// ABOUTME: Generated type definition for IRResultTree
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/ir-result-tree.type.js - do not edit manually

/*  IRResultTree generated from: modules/quicken-web-app/type-definitions/ir-result-tree.type.js
 *
 *  Category
 *      nodes: "[CategoryTreeNode]"
 *  Positions
 *      nodes: "[PositionTreeNode]"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { CategoryTreeNode } from './category-tree-node.js'
import { PositionTreeNode } from './position-tree-node.js'

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
Object.defineProperty(IRResultTree, '@@tagNames', { value: ['Category', 'Positions'], enumerable: false })

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
    category : function () { return `IRResultTree.Category(${R._toString(this.nodes)})` },
    positions: function () { return `IRResultTree.Positions(${R._toString(this.nodes)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    category : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    positions: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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
 * Construct a IRResultTree.Positions instance
 * @sig Positions :: ([PositionTreeNode]) -> IRResultTree.Positions
 */
const PositionsConstructor = function Positions(nodes) {
    const constructorName = 'IRResultTree.Positions(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'PositionTreeNode', 'nodes', false, nodes)

    const result = Object.create(PositionsPrototype)
    result.nodes = nodes
    return result
}

IRResultTree.Positions = PositionsConstructor

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

const PositionsPrototype = Object.create(IRResultTreePrototype, {
    '@@tagName': { value: 'Positions', enumerable: false },
    '@@typeName': { value: 'IRResultTree', enumerable: false },
    toString: { value: toString.positions, enumerable: false },
    toJSON: { value: toJSON.positions, enumerable: false },
    constructor: { value: PositionsConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.prototype = CategoryPrototype
PositionsConstructor.prototype = PositionsPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.is = val => val && val.constructor === CategoryConstructor
PositionsConstructor.is = val => val && val.constructor === PositionsConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.toString = () => 'IRResultTree.Category'
PositionsConstructor.toString = () => 'IRResultTree.Positions'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor._from = _input => IRResultTree.Category(_input.nodes)
PositionsConstructor._from = _input => IRResultTree.Positions(_input.nodes)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.from = CategoryConstructor._from
PositionsConstructor.from = PositionsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a IRResultTree instance
 * @sig is :: Any -> Boolean
 */
IRResultTree.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === IRResultTree.Category || constructor === IRResultTree.Positions
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { IRResultTree }
