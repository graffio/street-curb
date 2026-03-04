// ABOUTME: Generated type definition for CategoryTreeNode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/category-tree-node.type.js - do not edit manually

/*  CategoryTreeNode generated from: modules/quicken-web-app/type-definitions/category-tree-node.type.js
 *
 *  Group
 *      id       : "String",
 *      children : "[CategoryTreeNode]",
 *      aggregate: "CategoryAggregate"
 *  Transaction
 *      id         : "String",
 *      children   : "[CategoryTreeNode]",
 *      transaction: "Object"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { CategoryAggregate } from './category-aggregate.js'

// -------------------------------------------------------------------------------------------------------------
//
// CategoryTreeNode constructor
//
// -------------------------------------------------------------------------------------------------------------
const CategoryTreeNode = {
    toString: () => 'CategoryTreeNode',
}

// Add hidden properties
Object.defineProperty(CategoryTreeNode, '@@typeName', { value: 'CategoryTreeNode', enumerable: false })
Object.defineProperty(CategoryTreeNode, '@@tagNames', { value: ['Group', 'Transaction'], enumerable: false })

// Type prototype with match method
const CategoryTreeNodePrototype = {}

Object.defineProperty(CategoryTreeNodePrototype, 'match', {
    value: R.match(CategoryTreeNode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(CategoryTreeNodePrototype, 'constructor', {
    value: CategoryTreeNode,
    enumerable: false,
    writable: true,
    configurable: true,
})

CategoryTreeNode.prototype = CategoryTreeNodePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    group      : function () { return `CategoryTreeNode.Group(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.aggregate)})` },
    transaction: function () { return `CategoryTreeNode.Transaction(${R._toString(this.id)}, ${R._toString(this.children)}, ${R._toString(this.transaction)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    group      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    transaction: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a CategoryTreeNode.Group instance
 * @sig Group :: (String, [CategoryTreeNode], CategoryAggregate) -> CategoryTreeNode.Group
 */
const GroupConstructor = function Group(id, children, aggregate) {
    const constructorName = 'CategoryTreeNode.Group(id, children, aggregate)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'CategoryAggregate', 'aggregate', false, aggregate)

    const result = Object.create(GroupPrototype)
    result.id = id
    result.children = children
    result.aggregate = aggregate
    return result
}

CategoryTreeNode.Group = GroupConstructor

/*
 * Construct a CategoryTreeNode.Transaction instance
 * @sig Transaction :: (String, [CategoryTreeNode], Object) -> CategoryTreeNode.Transaction
 */
const TransactionConstructor = function Transaction(id, children, transaction) {
    const constructorName = 'CategoryTreeNode.Transaction(id, children, transaction)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'id', false, id)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'children', false, children)
    R.validateObject(constructorName, 'transaction', false, transaction)

    const result = Object.create(TransactionPrototype)
    result.id = id
    result.children = children
    result.transaction = transaction
    return result
}

CategoryTreeNode.Transaction = TransactionConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const GroupPrototype = Object.create(CategoryTreeNodePrototype, {
    '@@tagName': { value: 'Group', enumerable: false },
    '@@typeName': { value: 'CategoryTreeNode', enumerable: false },
    toString: { value: toString.group, enumerable: false },
    toJSON: { value: toJSON.group, enumerable: false },
    constructor: { value: GroupConstructor, enumerable: false, writable: true, configurable: true },
})

const TransactionPrototype = Object.create(CategoryTreeNodePrototype, {
    '@@tagName': { value: 'Transaction', enumerable: false },
    '@@typeName': { value: 'CategoryTreeNode', enumerable: false },
    toString: { value: toString.transaction, enumerable: false },
    toJSON: { value: toJSON.transaction, enumerable: false },
    constructor: { value: TransactionConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.prototype = GroupPrototype
TransactionConstructor.prototype = TransactionPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.is = val => val && val.constructor === GroupConstructor
TransactionConstructor.is = val => val && val.constructor === TransactionConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.toString = () => 'CategoryTreeNode.Group'
TransactionConstructor.toString = () => 'CategoryTreeNode.Transaction'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor._from = _input => {
    const { id, children, aggregate } = _input
    return CategoryTreeNode.Group(id, children, aggregate)
}
TransactionConstructor._from = _input => {
    const { id, children, transaction } = _input
    return CategoryTreeNode.Transaction(id, children, transaction)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.from = GroupConstructor._from
TransactionConstructor.from = TransactionConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a CategoryTreeNode instance
 * @sig is :: Any -> Boolean
 */
CategoryTreeNode.is = v => {
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return constructor === CategoryTreeNode.Group || constructor === CategoryTreeNode.Transaction
}

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { CategoryTreeNode }
