// ABOUTME: Generated type definition for PositionTreeNode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/derived/position-tree-node.type.js - do not edit manually

/*  PositionTreeNode generated from: modules/quicken-web-app/type-definitions/derived/position-tree-node.type.js
 *
 *  Group
 *      id       : "String",
 *      children : "[PositionTreeNode]",
 *      aggregate: "PositionAggregate"
 *  Position
 *      id      : "String",
 *      children: "[PositionTreeNode]",
 *      position: "Position",
 *      metrics : "Object?"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { PositionAggregate } from './position-aggregate.js'
import { Position } from './position.js'

// -------------------------------------------------------------------------------------------------------------
//
// PositionTreeNode constructor
//
// -------------------------------------------------------------------------------------------------------------
const PositionTreeNode = {
    toString: () => 'PositionTreeNode',
}

// Add hidden properties
Object.defineProperty(PositionTreeNode, '@@typeName', { value: 'PositionTreeNode', enumerable: false })
Object.defineProperty(PositionTreeNode, '@@tagNames', { value: ['Group', 'Position'], enumerable: false })

// Type prototype with match method
const PositionTreeNodePrototype = {}

Object.defineProperty(PositionTreeNodePrototype, 'match', {
    value: R.match(PositionTreeNode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(PositionTreeNodePrototype, 'constructor', {
    value: PositionTreeNode,
    enumerable: false,
    writable: true,
    configurable: true,
})

PositionTreeNode.prototype = PositionTreeNodePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    group   : function () { return `PositionTreeNode.Group(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.aggregate)})` },
    position: function () { return `PositionTreeNode.Position(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.position)}, ${R._toString(this.metrics)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    group   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    position: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a PositionTreeNode.Group instance
 * @sig Group :: (String, [PositionTreeNode], PositionAggregate) -> PositionTreeNode.Group
 */
const GroupConstructor = function Group(id, children, aggregate) {
    const constructorName = 'PositionTreeNode.Group(id, children, aggregate)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'PositionTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'PositionAggregate', 'aggregate', false, aggregate)

    const result = Object.create(GroupPrototype)
    result.id = id
    result.children = children
    result.aggregate = aggregate
    return result
}

PositionTreeNode.Group = GroupConstructor

/*
 * Construct a PositionTreeNode.Position instance
 * @sig Position :: (String, [PositionTreeNode], Position, Object?) -> PositionTreeNode.Position
 */
const PositionConstructor = function Position(id, children, position, metrics) {
    const constructorName = 'PositionTreeNode.Position(id, children, position, metrics)'

    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'PositionTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'Position', 'position', false, position)
    R.validateObject(constructorName, 'metrics', true, metrics)

    const result = Object.create(PositionPrototype)
    result.id = id
    result.children = children
    result.position = position
    if (metrics !== undefined) result.metrics = metrics
    return result
}

PositionTreeNode.Position = PositionConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const GroupPrototype = Object.create(PositionTreeNodePrototype, {
    '@@tagName': { value: 'Group', enumerable: false },
    '@@typeName': { value: 'PositionTreeNode', enumerable: false },
    toString: { value: toString.group, enumerable: false },
    toJSON: { value: toJSON.group, enumerable: false },
    constructor: { value: GroupConstructor, enumerable: false, writable: true, configurable: true },
})

const PositionPrototype = Object.create(PositionTreeNodePrototype, {
    '@@tagName': { value: 'Position', enumerable: false },
    '@@typeName': { value: 'PositionTreeNode', enumerable: false },
    toString: { value: toString.position, enumerable: false },
    toJSON: { value: toJSON.position, enumerable: false },
    constructor: { value: PositionConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.prototype = GroupPrototype
PositionConstructor.prototype = PositionPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.is = val => val && val.constructor === GroupConstructor
PositionConstructor.is = val => val && val.constructor === PositionConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.toString = () => 'PositionTreeNode.Group'
PositionConstructor.toString = () => 'PositionTreeNode.Position'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor._from = _input => {
    const { id, children, aggregate } = _input
    return PositionTreeNode.Group(id, children, aggregate)
}
PositionConstructor._from = _input => {
    const { id, children, position, metrics } = _input
    return PositionTreeNode.Position(id, children, position, metrics)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.from = GroupConstructor._from
PositionConstructor.from = PositionConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a PositionTreeNode instance
 * @sig is :: Any -> Boolean
 */
PositionTreeNode.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === PositionTreeNode.Group || constructor === PositionTreeNode.Position
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { PositionTreeNode }
