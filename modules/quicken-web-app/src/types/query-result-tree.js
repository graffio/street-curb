// ABOUTME: Generated type definition for QueryResultTree
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/query-result-tree.type.js - do not edit manually

/*  QueryResultTree generated from: modules/quicken-web-app/type-definitions/derived/query-result-tree.type.js
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
// QueryResultTree constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueryResultTree = { toString: () => 'QueryResultTree' }

// Add hidden properties
Object.defineProperty(QueryResultTree, '@@typeName', { value: 'QueryResultTree', enumerable: false })
Object.defineProperty(QueryResultTree, '@@tagNames', { value: ['Category', 'Positions'], enumerable: false })

// Type prototype with match method
const QueryResultTreePrototype = {}

Object.defineProperty(QueryResultTreePrototype, 'match', {
    value: R.match(QueryResultTree['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(QueryResultTreePrototype, 'constructor', {
    value: QueryResultTree,
    enumerable: false,
    writable: true,
    configurable: true,
})

QueryResultTree.prototype = QueryResultTreePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    category : function () { return `QueryResultTree.Category(${R._toString(this.nodes)})` },
    positions: function () { return `QueryResultTree.Positions(${R._toString(this.nodes)})` },
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
 * Construct a QueryResultTree.Category instance
 * @sig Category :: ([CategoryTreeNode]) -> QueryResultTree.Category
 */
const CategoryConstructor = function Category(nodes) {
    const constructorName = 'QueryResultTree.Category(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'nodes', false, nodes)

    const result = Object.create(CategoryPrototype)
    result.nodes = nodes
    return result
}

QueryResultTree.Category = CategoryConstructor

/*
 * Construct a QueryResultTree.Positions instance
 * @sig Positions :: ([PositionTreeNode]) -> QueryResultTree.Positions
 */
const PositionsConstructor = function Positions(nodes) {
    const constructorName = 'QueryResultTree.Positions(nodes)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'PositionTreeNode', 'nodes', false, nodes)

    const result = Object.create(PositionsPrototype)
    result.nodes = nodes
    return result
}

QueryResultTree.Positions = PositionsConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const CategoryPrototype = Object.create(QueryResultTreePrototype, {
    '@@tagName': { value: 'Category', enumerable: false },
    '@@typeName': { value: 'QueryResultTree', enumerable: false },
    toString: { value: toString.category, enumerable: false },
    toJSON: { value: toJSON.category, enumerable: false },
    constructor: { value: CategoryConstructor, enumerable: false, writable: true, configurable: true },
})

const PositionsPrototype = Object.create(QueryResultTreePrototype, {
    '@@tagName': { value: 'Positions', enumerable: false },
    '@@typeName': { value: 'QueryResultTree', enumerable: false },
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
CategoryConstructor.toString = () => 'QueryResultTree.Category'
PositionsConstructor.toString = () => 'QueryResultTree.Positions'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor._from = _input => QueryResultTree.Category(_input.nodes)
PositionsConstructor._from = _input => QueryResultTree.Positions(_input.nodes)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
CategoryConstructor.from = CategoryConstructor._from
PositionsConstructor.from = PositionsConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a QueryResultTree instance
 * @sig is :: Any -> Boolean
 */
QueryResultTree.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === QueryResultTree.Category || constructor === QueryResultTree.Positions
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryResultTree }
