// ABOUTME: Generated type definition for HoldingsTreeNode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/holdings-tree-node.type.js - do not edit manually

/*  HoldingsTreeNode generated from: modules/quicken-web-app/type-definitions/holdings-tree-node.type.js
 *
 *  Group
 *      id       : "String",
 *      children : "[HoldingsTreeNode]",
 *      aggregate: "HoldingsAggregate"
 *  Holding
 *      id      : "String",
 *      children: "[HoldingsTreeNode]",
 *      holding : "Holding"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { HoldingsAggregate } from './holdings-aggregate.js'
import { Holding } from './holding.js'

// -------------------------------------------------------------------------------------------------------------
//
// HoldingsTreeNode constructor
//
// -------------------------------------------------------------------------------------------------------------
const HoldingsTreeNode = {
    toString: () => 'HoldingsTreeNode',
}

// Add hidden properties
Object.defineProperty(HoldingsTreeNode, '@@typeName', { value: 'HoldingsTreeNode', enumerable: false })
Object.defineProperty(HoldingsTreeNode, '@@tagNames', { value: ['Group', 'Holding'], enumerable: false })

// Type prototype with match method
const HoldingsTreeNodePrototype = {}

Object.defineProperty(HoldingsTreeNodePrototype, 'match', {
    value: R.match(HoldingsTreeNode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(HoldingsTreeNodePrototype, 'constructor', {
    value: HoldingsTreeNode,
    enumerable: false,
    writable: true,
    configurable: true,
})

HoldingsTreeNode.prototype = HoldingsTreeNodePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    group  : function () { return `HoldingsTreeNode.Group(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.aggregate)})` },
    holding: function () { return `HoldingsTreeNode.Holding(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.holding)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    group  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    holding: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a HoldingsTreeNode.Group instance
 * @sig Group :: (String, [HoldingsTreeNode], HoldingsAggregate) -> HoldingsTreeNode.Group
 */
const GroupConstructor = function Group(id, children, aggregate) {
    const constructorName = 'HoldingsTreeNode.Group(id, children, aggregate)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'HoldingsTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'HoldingsAggregate', 'aggregate', false, aggregate)

    const result = Object.create(GroupPrototype)
    result.id = id
    result.children = children
    result.aggregate = aggregate
    return result
}

HoldingsTreeNode.Group = GroupConstructor

/*
 * Construct a HoldingsTreeNode.Holding instance
 * @sig Holding :: (String, [HoldingsTreeNode], Holding) -> HoldingsTreeNode.Holding
 */
const HoldingConstructor = function Holding(id, children, holding) {
    const constructorName = 'HoldingsTreeNode.Holding(id, children, holding)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'HoldingsTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'Holding', 'holding', false, holding)

    const result = Object.create(HoldingPrototype)
    result.id = id
    result.children = children
    result.holding = holding
    return result
}

HoldingsTreeNode.Holding = HoldingConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const GroupPrototype = Object.create(HoldingsTreeNodePrototype, {
    '@@tagName': { value: 'Group', enumerable: false },
    '@@typeName': { value: 'HoldingsTreeNode', enumerable: false },
    toString: { value: toString.group, enumerable: false },
    toJSON: { value: toJSON.group, enumerable: false },
    constructor: { value: GroupConstructor, enumerable: false, writable: true, configurable: true },
})

const HoldingPrototype = Object.create(HoldingsTreeNodePrototype, {
    '@@tagName': { value: 'Holding', enumerable: false },
    '@@typeName': { value: 'HoldingsTreeNode', enumerable: false },
    toString: { value: toString.holding, enumerable: false },
    toJSON: { value: toJSON.holding, enumerable: false },
    constructor: { value: HoldingConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.prototype = GroupPrototype
HoldingConstructor.prototype = HoldingPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.is = val => val && val.constructor === GroupConstructor
HoldingConstructor.is = val => val && val.constructor === HoldingConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.toString = () => 'HoldingsTreeNode.Group'
HoldingConstructor.toString = () => 'HoldingsTreeNode.Holding'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor._from = _input => {
    const { id, children, aggregate } = _input
    return HoldingsTreeNode.Group(id, children, aggregate)
}
HoldingConstructor._from = _input => {
    const { id, children, holding } = _input
    return HoldingsTreeNode.Holding(id, children, holding)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.from = GroupConstructor._from
HoldingConstructor.from = HoldingConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a HoldingsTreeNode instance
 * @sig is :: Any -> Boolean
 */
HoldingsTreeNode.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === HoldingsTreeNode.Group || constructor === HoldingsTreeNode.Holding
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { HoldingsTreeNode }
