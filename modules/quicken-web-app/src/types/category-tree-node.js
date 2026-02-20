// ABOUTME: Generated type definition for CategoryTreeNode
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/category-tree-node.type.js - do not edit manually

/*  CategoryTreeNode generated from: modules/quicken-web-app/type-definitions/category-tree-node.type.js
 *
 *  Group
 *      key      : "String",
 *      children : "[CategoryTreeNode]",
 *      aggregate: "CategoryAggregate"
 *  Transaction
 *      key        : "String",
 *      children   : "[CategoryTreeNode]",
 *      transaction: "Object"
 *
 */

import * as R from '@graffio/cli-type-generator'
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
    group      : function () { return `CategoryTreeNode.Group(${R._toString(this.key)}, ${R._toString(this.children)}, ${R._toString(this.aggregate)})` },
    transaction: function () { return `CategoryTreeNode.Transaction(${R._toString(this.key)}, ${R._toString(this.children)}, ${R._toString(this.transaction)})` },
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
const GroupConstructor = function Group(key, children, aggregate) {
    const constructorName = 'CategoryTreeNode.Group(key, children, aggregate)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'key', false, key)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'children', false, children)
    R.validateTag(constructorName, 'CategoryAggregate', 'aggregate', false, aggregate)

    const result = Object.create(GroupPrototype)
    result.key = key
    result.children = children
    result.aggregate = aggregate
    return result
}

CategoryTreeNode.Group = GroupConstructor

/*
 * Construct a CategoryTreeNode.Transaction instance
 * @sig Transaction :: (String, [CategoryTreeNode], Object) -> CategoryTreeNode.Transaction
 */
const TransactionConstructor = function Transaction(key, children, transaction) {
    const constructorName = 'CategoryTreeNode.Transaction(key, children, transaction)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateString(constructorName, 'key', false, key)
    R.validateArray(constructorName, 1, 'Tagged', 'CategoryTreeNode', 'children', false, children)
    R.validateObject(constructorName, 'transaction', false, transaction)

    const result = Object.create(TransactionPrototype)
    result.key = key
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
    const { key, children, aggregate } = _input
    return CategoryTreeNode.Group(key, children, aggregate)
}
TransactionConstructor._from = _input => {
    const { key, children, transaction } = _input
    return CategoryTreeNode.Transaction(key, children, transaction)
}
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
GroupConstructor.from = GroupConstructor._from
TransactionConstructor.from = TransactionConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Group, Function) -> Object
 */
GroupConstructor._toFirestore = (o, encodeTimestamps) => {
    const { key, children, aggregate } = o
    return {
        key: key,
        children: children.map(item1 => CategoryTreeNode.toFirestore(item1, encodeTimestamps)),
        aggregate: CategoryAggregate.toFirestore(aggregate, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Group
 */
GroupConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { key, children, aggregate } = doc
    return GroupConstructor._from({
        key: key,
        children: children.map(item1 =>
            CategoryTreeNode.fromFirestore
                ? CategoryTreeNode.fromFirestore(item1, decodeTimestamps)
                : CategoryTreeNode.from(item1),
        ),
        aggregate: CategoryAggregate.fromFirestore
            ? CategoryAggregate.fromFirestore(aggregate, decodeTimestamps)
            : CategoryAggregate.from(aggregate),
    })
}

// Public aliases (can be overridden)
GroupConstructor.toFirestore = GroupConstructor._toFirestore
GroupConstructor.fromFirestore = GroupConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Transaction, Function) -> Object
 */
TransactionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { key, children, transaction } = o
    return {
        key: key,
        children: children.map(item1 => CategoryTreeNode.toFirestore(item1, encodeTimestamps)),
        transaction: transaction,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Transaction
 */
TransactionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { key, children, transaction } = doc
    return TransactionConstructor._from({
        key: key,
        children: children.map(item1 =>
            CategoryTreeNode.fromFirestore
                ? CategoryTreeNode.fromFirestore(item1, decodeTimestamps)
                : CategoryTreeNode.from(item1),
        ),
        transaction: transaction,
    })
}

// Public aliases (can be overridden)
TransactionConstructor.toFirestore = TransactionConstructor._toFirestore
TransactionConstructor.fromFirestore = TransactionConstructor._fromFirestore

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

/**
 * Serialize CategoryTreeNode to Firestore format
 * @sig _toFirestore :: (CategoryTreeNode, Function) -> Object
 */
CategoryTreeNode._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = CategoryTreeNode[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize CategoryTreeNode from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> CategoryTreeNode
 */
CategoryTreeNode._fromFirestore = (doc, decodeTimestamps) => {
    const tagName = doc['@@tagName']
    if (tagName === 'Group') return CategoryTreeNode.Group.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Transaction') return CategoryTreeNode.Transaction.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized CategoryTreeNode variant: ${tagName}`)
}

// Public aliases (can be overridden)
CategoryTreeNode.toFirestore = CategoryTreeNode._toFirestore
CategoryTreeNode.fromFirestore = CategoryTreeNode._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { CategoryTreeNode }
