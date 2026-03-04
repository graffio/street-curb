// ABOUTME: Generated type definition for QueryResult
// ABOUTME: Auto-generated from modules/quicken-web-app/type-definitions/query-result.type.js - do not edit manually

/*  QueryResult generated from: modules/quicken-web-app/type-definitions/query-result.type.js
 *
 *  Identity
 *      tree  : "ResultTree",
 *      source: "String"
 *  Comparison
 *      left  : "ResultTree",
 *      right : "ResultTree",
 *      source: "String"
 *  Scalar
 *      value     : "Number",
 *      expression: "ExpressionNode"
 *  FilteredEntities
 *      entities: "[Account]",
 *      source  : "String"
 *
 */

import { RuntimeForGeneratedTypes as R } from '@graffio/cli-type-generator'
import { ResultTree } from './result-tree.js'
import { ExpressionNode } from './expression-node.js'
import { Account } from './account.js'

// -------------------------------------------------------------------------------------------------------------
//
// QueryResult constructor
//
// -------------------------------------------------------------------------------------------------------------
const QueryResult = {
    toString: () => 'QueryResult',
}

// Add hidden properties
Object.defineProperty(QueryResult, '@@typeName', { value: 'QueryResult', enumerable: false })
Object.defineProperty(QueryResult, '@@tagNames', {
    value: ['Identity', 'Comparison', 'Scalar', 'FilteredEntities'],
    enumerable: false,
})

// Type prototype with match method
const QueryResultPrototype = {}

Object.defineProperty(QueryResultPrototype, 'match', {
    value: R.match(QueryResult['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(QueryResultPrototype, 'constructor', {
    value: QueryResult,
    enumerable: false,
    writable: true,
    configurable: true,
})

QueryResult.prototype = QueryResultPrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    identity        : function () { return `QueryResult.Identity(${R._toString(this.tree)}, ${R._toString(this.source)})` },
    comparison      : function () { return `QueryResult.Comparison(${R._toString(this.left)}, ${R._toString(this.right)}, ${R._toString(this.source)})` },
    scalar          : function () { return `QueryResult.Scalar(${R._toString(this.value)}, ${R._toString(this.expression)})` },
    filteredEntities: function () { return `QueryResult.FilteredEntities(${R._toString(this.entities)}, ${R._toString(this.source)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    identity        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    comparison      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    scalar          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    filteredEntities: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a QueryResult.Identity instance
 * @sig Identity :: (ResultTree, String) -> QueryResult.Identity
 */
const IdentityConstructor = function Identity(tree, source) {
    const constructorName = 'QueryResult.Identity(tree, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateTag(constructorName, 'ResultTree', 'tree', false, tree)
    R.validateString(constructorName, 'source', false, source)

    const result = Object.create(IdentityPrototype)
    result.tree = tree
    result.source = source
    return result
}

QueryResult.Identity = IdentityConstructor

/*
 * Construct a QueryResult.Comparison instance
 * @sig Comparison :: (ResultTree, ResultTree, String) -> QueryResult.Comparison
 */
const ComparisonConstructor = function Comparison(left, right, source) {
    const constructorName = 'QueryResult.Comparison(left, right, source)'
    R.validateArgumentLength(constructorName, 3, arguments)
    R.validateTag(constructorName, 'ResultTree', 'left', false, left)
    R.validateTag(constructorName, 'ResultTree', 'right', false, right)
    R.validateString(constructorName, 'source', false, source)

    const result = Object.create(ComparisonPrototype)
    result.left = left
    result.right = right
    result.source = source
    return result
}

QueryResult.Comparison = ComparisonConstructor

/*
 * Construct a QueryResult.Scalar instance
 * @sig Scalar :: (Number, ExpressionNode) -> QueryResult.Scalar
 */
const ScalarConstructor = function Scalar(value, expression) {
    const constructorName = 'QueryResult.Scalar(value, expression)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateNumber(constructorName, 'value', false, value)
    R.validateTag(constructorName, 'ExpressionNode', 'expression', false, expression)

    const result = Object.create(ScalarPrototype)
    result.value = value
    result.expression = expression
    return result
}

QueryResult.Scalar = ScalarConstructor

/*
 * Construct a QueryResult.FilteredEntities instance
 * @sig FilteredEntities :: ([Account], String) -> QueryResult.FilteredEntities
 */
const FilteredEntitiesConstructor = function FilteredEntities(entities, source) {
    const constructorName = 'QueryResult.FilteredEntities(entities, source)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateArray(constructorName, 1, 'Tagged', 'Account', 'entities', false, entities)
    R.validateString(constructorName, 'source', false, source)

    const result = Object.create(FilteredEntitiesPrototype)
    result.entities = entities
    result.source = source
    return result
}

QueryResult.FilteredEntities = FilteredEntitiesConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const IdentityPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Identity', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.identity, enumerable: false },
    toJSON: { value: toJSON.identity, enumerable: false },
    constructor: { value: IdentityConstructor, enumerable: false, writable: true, configurable: true },
})

const ComparisonPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Comparison', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.comparison, enumerable: false },
    toJSON: { value: toJSON.comparison, enumerable: false },
    constructor: { value: ComparisonConstructor, enumerable: false, writable: true, configurable: true },
})

const ScalarPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'Scalar', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.scalar, enumerable: false },
    toJSON: { value: toJSON.scalar, enumerable: false },
    constructor: { value: ScalarConstructor, enumerable: false, writable: true, configurable: true },
})

const FilteredEntitiesPrototype = Object.create(QueryResultPrototype, {
    '@@tagName': { value: 'FilteredEntities', enumerable: false },
    '@@typeName': { value: 'QueryResult', enumerable: false },
    toString: { value: toString.filteredEntities, enumerable: false },
    toJSON: { value: toJSON.filteredEntities, enumerable: false },
    constructor: { value: FilteredEntitiesConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.prototype = IdentityPrototype
ComparisonConstructor.prototype = ComparisonPrototype
ScalarConstructor.prototype = ScalarPrototype
FilteredEntitiesConstructor.prototype = FilteredEntitiesPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.is = val => val && val.constructor === IdentityConstructor
ComparisonConstructor.is = val => val && val.constructor === ComparisonConstructor
ScalarConstructor.is = val => val && val.constructor === ScalarConstructor
FilteredEntitiesConstructor.is = val => val && val.constructor === FilteredEntitiesConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.toString = () => 'QueryResult.Identity'
ComparisonConstructor.toString = () => 'QueryResult.Comparison'
ScalarConstructor.toString = () => 'QueryResult.Scalar'
FilteredEntitiesConstructor.toString = () => 'QueryResult.FilteredEntities'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor._from = _input => QueryResult.Identity(_input.tree, _input.source)
ComparisonConstructor._from = _input => {
    const { left, right, source } = _input
    return QueryResult.Comparison(left, right, source)
}
ScalarConstructor._from = _input => QueryResult.Scalar(_input.value, _input.expression)
FilteredEntitiesConstructor._from = _input => QueryResult.FilteredEntities(_input.entities, _input.source)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
IdentityConstructor.from = IdentityConstructor._from
ComparisonConstructor.from = ComparisonConstructor._from
ScalarConstructor.from = ScalarConstructor._from
FilteredEntitiesConstructor.from = FilteredEntitiesConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Identity, Function) -> Object
 */
IdentityConstructor._toFirestore = (o, encodeTimestamps) => {
    const { tree, source } = o
    return {
        tree: ResultTree.toFirestore(tree, encodeTimestamps),
        source: source,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Identity
 */
IdentityConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { tree, source } = doc
    return IdentityConstructor._from({
        tree: ResultTree.fromFirestore ? ResultTree.fromFirestore(tree, decodeTimestamps) : ResultTree.from(tree),
        source: source,
    })
}

// Public aliases (can be overridden)
IdentityConstructor.toFirestore = IdentityConstructor._toFirestore
IdentityConstructor.fromFirestore = IdentityConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Comparison, Function) -> Object
 */
ComparisonConstructor._toFirestore = (o, encodeTimestamps) => {
    const { left, right, source } = o
    return {
        left: ResultTree.toFirestore(left, encodeTimestamps),
        right: ResultTree.toFirestore(right, encodeTimestamps),
        source: source,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Comparison
 */
ComparisonConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { left, right, source } = doc
    return ComparisonConstructor._from({
        left: ResultTree.fromFirestore ? ResultTree.fromFirestore(left, decodeTimestamps) : ResultTree.from(left),
        right: ResultTree.fromFirestore ? ResultTree.fromFirestore(right, decodeTimestamps) : ResultTree.from(right),
        source: source,
    })
}

// Public aliases (can be overridden)
ComparisonConstructor.toFirestore = ComparisonConstructor._toFirestore
ComparisonConstructor.fromFirestore = ComparisonConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Scalar, Function) -> Object
 */
ScalarConstructor._toFirestore = (o, encodeTimestamps) => {
    const { value, expression } = o
    return {
        value: value,
        expression: ExpressionNode.toFirestore(expression, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Scalar
 */
ScalarConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { value, expression } = doc
    return ScalarConstructor._from({
        value: value,
        expression: ExpressionNode.fromFirestore
            ? ExpressionNode.fromFirestore(expression, decodeTimestamps)
            : ExpressionNode.from(expression),
    })
}

// Public aliases (can be overridden)
ScalarConstructor.toFirestore = ScalarConstructor._toFirestore
ScalarConstructor.fromFirestore = ScalarConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (FilteredEntities, Function) -> Object
 */
FilteredEntitiesConstructor._toFirestore = (o, encodeTimestamps) => {
    const { entities, source } = o
    return {
        entities: entities.map(item1 => Account.toFirestore(item1, encodeTimestamps)),
        source: source,
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> FilteredEntities
 */
FilteredEntitiesConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { entities, source } = doc
    return FilteredEntitiesConstructor._from({
        entities: entities.map(item1 =>
            Account.fromFirestore ? Account.fromFirestore(item1, decodeTimestamps) : Account.from(item1),
        ),
        source: source,
    })
}

// Public aliases (can be overridden)
FilteredEntitiesConstructor.toFirestore = FilteredEntitiesConstructor._toFirestore
FilteredEntitiesConstructor.fromFirestore = FilteredEntitiesConstructor._fromFirestore

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a QueryResult instance
 * @sig is :: Any -> Boolean
 */
QueryResult.is = v => {
    const { Identity, Comparison, Scalar, FilteredEntities } = QueryResult
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === Identity ||
        constructor === Comparison ||
        constructor === Scalar ||
        constructor === FilteredEntities
    )
}

/**
 * Serialize QueryResult to Firestore format
 * @sig _toFirestore :: (QueryResult, Function) -> Object
 */
QueryResult._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = QueryResult[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize QueryResult from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> QueryResult
 */
QueryResult._fromFirestore = (doc, decodeTimestamps) => {
    const { Identity, Comparison, Scalar, FilteredEntities } = QueryResult
    const tagName = doc['@@tagName']
    if (tagName === 'Identity') return Identity.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Comparison') return Comparison.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Scalar') return Scalar.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'FilteredEntities') return FilteredEntities.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized QueryResult variant: ${tagName}`)
}

// Public aliases (can be overridden)
QueryResult.toFirestore = QueryResult._toFirestore
QueryResult.fromFirestore = QueryResult._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

export { QueryResult }
