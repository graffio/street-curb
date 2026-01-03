// ABOUTME: Generated type definition for ASTNode
// ABOUTME: Auto-generated from modules/cli-style-validator/type-definitions/ast-node.type.js - do not edit manually

/*  ASTNode generated from: modules/cli-style-validator/type-definitions/ast-node.type.js
 *
 *  FunctionDeclaration
 *      raw: "Object"
 *  ArrowFunctionExpression
 *      raw: "Object"
 *  FunctionExpression
 *      raw: "Object"
 *  VariableDeclaration
 *      raw: "Object"
 *  VariableDeclarator
 *      raw: "Object"
 *  ObjectExpression
 *      raw: "Object"
 *  MemberExpression
 *      raw: "Object"
 *  CallExpression
 *      raw: "Object"
 *  AssignmentExpression
 *      raw: "Object"
 *  Identifier
 *      raw: "Object"
 *  Property
 *      raw: "Object"
 *  ExportNamedDeclaration
 *      raw: "Object"
 *  ExportDefaultDeclaration
 *      raw: "Object"
 *  ImportDeclaration
 *      raw: "Object"
 *  BlockStatement
 *      raw: "Object"
 *  JSXElement
 *      raw: "Object"
 *  JSXFragment
 *      raw: "Object"
 *  Other
 *      nodeType: "String",
 *      raw     : "Object"
 *
 */

import * as R from '@graffio/cli-type-generator'

// -------------------------------------------------------------------------------------------------------------
//
// ASTNode constructor
//
// -------------------------------------------------------------------------------------------------------------
const ASTNode = {
    toString: () => 'ASTNode',
}

// Add hidden properties
Object.defineProperty(ASTNode, '@@typeName', { value: 'ASTNode', enumerable: false })
Object.defineProperty(ASTNode, '@@tagNames', {
    value: [
        'FunctionDeclaration',
        'ArrowFunctionExpression',
        'FunctionExpression',
        'VariableDeclaration',
        'VariableDeclarator',
        'ObjectExpression',
        'MemberExpression',
        'CallExpression',
        'AssignmentExpression',
        'Identifier',
        'Property',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
        'ImportDeclaration',
        'BlockStatement',
        'JSXElement',
        'JSXFragment',
        'Other',
    ],
    enumerable: false,
})

// Type prototype with match method
const ASTNodePrototype = {}

Object.defineProperty(ASTNodePrototype, 'match', {
    value: R.match(ASTNode['@@tagNames']),
    enumerable: false,
})

Object.defineProperty(ASTNodePrototype, 'constructor', {
    value: ASTNode,
    enumerable: false,
    writable: true,
    configurable: true,
})

ASTNode.prototype = ASTNodePrototype

// -------------------------------------------------------------------------------------------------------------
//
// Variant toString methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toString = {
    functionDeclaration     : function () { return `ASTNode.FunctionDeclaration(${R._toString(this.raw)})` },
    arrowFunctionExpression : function () { return `ASTNode.ArrowFunctionExpression(${R._toString(this.raw)})` },
    functionExpression      : function () { return `ASTNode.FunctionExpression(${R._toString(this.raw)})` },
    variableDeclaration     : function () { return `ASTNode.VariableDeclaration(${R._toString(this.raw)})` },
    variableDeclarator      : function () { return `ASTNode.VariableDeclarator(${R._toString(this.raw)})` },
    objectExpression        : function () { return `ASTNode.ObjectExpression(${R._toString(this.raw)})` },
    memberExpression        : function () { return `ASTNode.MemberExpression(${R._toString(this.raw)})` },
    callExpression          : function () { return `ASTNode.CallExpression(${R._toString(this.raw)})` },
    assignmentExpression    : function () { return `ASTNode.AssignmentExpression(${R._toString(this.raw)})` },
    identifier              : function () { return `ASTNode.Identifier(${R._toString(this.raw)})` },
    property                : function () { return `ASTNode.Property(${R._toString(this.raw)})` },
    exportNamedDeclaration  : function () { return `ASTNode.ExportNamedDeclaration(${R._toString(this.raw)})` },
    exportDefaultDeclaration: function () { return `ASTNode.ExportDefaultDeclaration(${R._toString(this.raw)})` },
    importDeclaration       : function () { return `ASTNode.ImportDeclaration(${R._toString(this.raw)})` },
    blockStatement          : function () { return `ASTNode.BlockStatement(${R._toString(this.raw)})` },
    jSXElement              : function () { return `ASTNode.JSXElement(${R._toString(this.raw)})` },
    jSXFragment             : function () { return `ASTNode.JSXFragment(${R._toString(this.raw)})` },
    other                   : function () { return `ASTNode.Other(${R._toString(this.nodeType)}, ${R._toString(this.raw)})` },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant toJSON methods
//
// -------------------------------------------------------------------------------------------------------------
// prettier-ignore
const toJSON = {
    functionDeclaration     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    arrowFunctionExpression : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    functionExpression      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    variableDeclaration     : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    variableDeclarator      : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    objectExpression        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    memberExpression        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    callExpression          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    assignmentExpression    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    identifier              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    property                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    exportNamedDeclaration  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    exportDefaultDeclaration: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    importDeclaration       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    jSXElement              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    jSXFragment             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    other                   : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
}

// -------------------------------------------------------------------------------------------------------------
//
// Variant constructors
//
// -------------------------------------------------------------------------------------------------------------

/*
 * Construct a ASTNode.FunctionDeclaration instance
 * @sig FunctionDeclaration :: (Object) -> ASTNode.FunctionDeclaration
 */
const FunctionDeclarationConstructor = function FunctionDeclaration(raw) {
    const constructorName = 'ASTNode.FunctionDeclaration(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(FunctionDeclarationPrototype)
    result.raw = raw
    return result
}

ASTNode.FunctionDeclaration = FunctionDeclarationConstructor

/*
 * Construct a ASTNode.ArrowFunctionExpression instance
 * @sig ArrowFunctionExpression :: (Object) -> ASTNode.ArrowFunctionExpression
 */
const ArrowFunctionExpressionConstructor = function ArrowFunctionExpression(raw) {
    const constructorName = 'ASTNode.ArrowFunctionExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(ArrowFunctionExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.ArrowFunctionExpression = ArrowFunctionExpressionConstructor

/*
 * Construct a ASTNode.FunctionExpression instance
 * @sig FunctionExpression :: (Object) -> ASTNode.FunctionExpression
 */
const FunctionExpressionConstructor = function FunctionExpression(raw) {
    const constructorName = 'ASTNode.FunctionExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(FunctionExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.FunctionExpression = FunctionExpressionConstructor

/*
 * Construct a ASTNode.VariableDeclaration instance
 * @sig VariableDeclaration :: (Object) -> ASTNode.VariableDeclaration
 */
const VariableDeclarationConstructor = function VariableDeclaration(raw) {
    const constructorName = 'ASTNode.VariableDeclaration(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(VariableDeclarationPrototype)
    result.raw = raw
    return result
}

ASTNode.VariableDeclaration = VariableDeclarationConstructor

/*
 * Construct a ASTNode.VariableDeclarator instance
 * @sig VariableDeclarator :: (Object) -> ASTNode.VariableDeclarator
 */
const VariableDeclaratorConstructor = function VariableDeclarator(raw) {
    const constructorName = 'ASTNode.VariableDeclarator(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(VariableDeclaratorPrototype)
    result.raw = raw
    return result
}

ASTNode.VariableDeclarator = VariableDeclaratorConstructor

/*
 * Construct a ASTNode.ObjectExpression instance
 * @sig ObjectExpression :: (Object) -> ASTNode.ObjectExpression
 */
const ObjectExpressionConstructor = function ObjectExpression(raw) {
    const constructorName = 'ASTNode.ObjectExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(ObjectExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.ObjectExpression = ObjectExpressionConstructor

/*
 * Construct a ASTNode.MemberExpression instance
 * @sig MemberExpression :: (Object) -> ASTNode.MemberExpression
 */
const MemberExpressionConstructor = function MemberExpression(raw) {
    const constructorName = 'ASTNode.MemberExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(MemberExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.MemberExpression = MemberExpressionConstructor

/*
 * Construct a ASTNode.CallExpression instance
 * @sig CallExpression :: (Object) -> ASTNode.CallExpression
 */
const CallExpressionConstructor = function CallExpression(raw) {
    const constructorName = 'ASTNode.CallExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(CallExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.CallExpression = CallExpressionConstructor

/*
 * Construct a ASTNode.AssignmentExpression instance
 * @sig AssignmentExpression :: (Object) -> ASTNode.AssignmentExpression
 */
const AssignmentExpressionConstructor = function AssignmentExpression(raw) {
    const constructorName = 'ASTNode.AssignmentExpression(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(AssignmentExpressionPrototype)
    result.raw = raw
    return result
}

ASTNode.AssignmentExpression = AssignmentExpressionConstructor

/*
 * Construct a ASTNode.Identifier instance
 * @sig Identifier :: (Object) -> ASTNode.Identifier
 */
const IdentifierConstructor = function Identifier(raw) {
    const constructorName = 'ASTNode.Identifier(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(IdentifierPrototype)
    result.raw = raw
    return result
}

ASTNode.Identifier = IdentifierConstructor

/*
 * Construct a ASTNode.Property instance
 * @sig Property :: (Object) -> ASTNode.Property
 */
const PropertyConstructor = function Property(raw) {
    const constructorName = 'ASTNode.Property(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(PropertyPrototype)
    result.raw = raw
    return result
}

ASTNode.Property = PropertyConstructor

/*
 * Construct a ASTNode.ExportNamedDeclaration instance
 * @sig ExportNamedDeclaration :: (Object) -> ASTNode.ExportNamedDeclaration
 */
const ExportNamedDeclarationConstructor = function ExportNamedDeclaration(raw) {
    const constructorName = 'ASTNode.ExportNamedDeclaration(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(ExportNamedDeclarationPrototype)
    result.raw = raw
    return result
}

ASTNode.ExportNamedDeclaration = ExportNamedDeclarationConstructor

/*
 * Construct a ASTNode.ExportDefaultDeclaration instance
 * @sig ExportDefaultDeclaration :: (Object) -> ASTNode.ExportDefaultDeclaration
 */
const ExportDefaultDeclarationConstructor = function ExportDefaultDeclaration(raw) {
    const constructorName = 'ASTNode.ExportDefaultDeclaration(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(ExportDefaultDeclarationPrototype)
    result.raw = raw
    return result
}

ASTNode.ExportDefaultDeclaration = ExportDefaultDeclarationConstructor

/*
 * Construct a ASTNode.ImportDeclaration instance
 * @sig ImportDeclaration :: (Object) -> ASTNode.ImportDeclaration
 */
const ImportDeclarationConstructor = function ImportDeclaration(raw) {
    const constructorName = 'ASTNode.ImportDeclaration(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(ImportDeclarationPrototype)
    result.raw = raw
    return result
}

ASTNode.ImportDeclaration = ImportDeclarationConstructor

/*
 * Construct a ASTNode.BlockStatement instance
 * @sig BlockStatement :: (Object) -> ASTNode.BlockStatement
 */
const BlockStatementConstructor = function BlockStatement(raw) {
    const constructorName = 'ASTNode.BlockStatement(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(BlockStatementPrototype)
    result.raw = raw
    return result
}

ASTNode.BlockStatement = BlockStatementConstructor

/*
 * Construct a ASTNode.JSXElement instance
 * @sig JSXElement :: (Object) -> ASTNode.JSXElement
 */
const JSXElementConstructor = function JSXElement(raw) {
    const constructorName = 'ASTNode.JSXElement(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(JSXElementPrototype)
    result.raw = raw
    return result
}

ASTNode.JSXElement = JSXElementConstructor

/*
 * Construct a ASTNode.JSXFragment instance
 * @sig JSXFragment :: (Object) -> ASTNode.JSXFragment
 */
const JSXFragmentConstructor = function JSXFragment(raw) {
    const constructorName = 'ASTNode.JSXFragment(raw)'
    R.validateArgumentLength(constructorName, 1, arguments)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(JSXFragmentPrototype)
    result.raw = raw
    return result
}

ASTNode.JSXFragment = JSXFragmentConstructor

/*
 * Construct a ASTNode.Other instance
 * @sig Other :: (String, Object) -> ASTNode.Other
 */
const OtherConstructor = function Other(nodeType, raw) {
    const constructorName = 'ASTNode.Other(nodeType, raw)'
    R.validateArgumentLength(constructorName, 2, arguments)
    R.validateString(constructorName, 'nodeType', false, nodeType)
    R.validateObject(constructorName, 'raw', false, raw)

    const result = Object.create(OtherPrototype)
    result.nodeType = nodeType
    result.raw = raw
    return result
}

ASTNode.Other = OtherConstructor

// -------------------------------------------------------------------------------------------------------------
//
// Variant prototypes
//
// -------------------------------------------------------------------------------------------------------------
const FunctionDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'FunctionDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.functionDeclaration, enumerable: false },
    toJSON: { value: toJSON.functionDeclaration, enumerable: false },
    constructor: { value: FunctionDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const ArrowFunctionExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ArrowFunctionExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.arrowFunctionExpression, enumerable: false },
    toJSON: { value: toJSON.arrowFunctionExpression, enumerable: false },
    constructor: { value: ArrowFunctionExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const FunctionExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'FunctionExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.functionExpression, enumerable: false },
    toJSON: { value: toJSON.functionExpression, enumerable: false },
    constructor: { value: FunctionExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const VariableDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'VariableDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.variableDeclaration, enumerable: false },
    toJSON: { value: toJSON.variableDeclaration, enumerable: false },
    constructor: { value: VariableDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const VariableDeclaratorPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'VariableDeclarator', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.variableDeclarator, enumerable: false },
    toJSON: { value: toJSON.variableDeclarator, enumerable: false },
    constructor: { value: VariableDeclaratorConstructor, enumerable: false, writable: true, configurable: true },
})

const ObjectExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ObjectExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.objectExpression, enumerable: false },
    toJSON: { value: toJSON.objectExpression, enumerable: false },
    constructor: { value: ObjectExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const MemberExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'MemberExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.memberExpression, enumerable: false },
    toJSON: { value: toJSON.memberExpression, enumerable: false },
    constructor: { value: MemberExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const CallExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'CallExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.callExpression, enumerable: false },
    toJSON: { value: toJSON.callExpression, enumerable: false },
    constructor: { value: CallExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const AssignmentExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'AssignmentExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.assignmentExpression, enumerable: false },
    toJSON: { value: toJSON.assignmentExpression, enumerable: false },
    constructor: { value: AssignmentExpressionConstructor, enumerable: false, writable: true, configurable: true },
})

const IdentifierPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'Identifier', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.identifier, enumerable: false },
    toJSON: { value: toJSON.identifier, enumerable: false },
    constructor: { value: IdentifierConstructor, enumerable: false, writable: true, configurable: true },
})

const PropertyPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'Property', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.property, enumerable: false },
    toJSON: { value: toJSON.property, enumerable: false },
    constructor: { value: PropertyConstructor, enumerable: false, writable: true, configurable: true },
})

const ExportNamedDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ExportNamedDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.exportNamedDeclaration, enumerable: false },
    toJSON: { value: toJSON.exportNamedDeclaration, enumerable: false },
    constructor: { value: ExportNamedDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const ExportDefaultDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ExportDefaultDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.exportDefaultDeclaration, enumerable: false },
    toJSON: { value: toJSON.exportDefaultDeclaration, enumerable: false },
    constructor: { value: ExportDefaultDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const ImportDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ImportDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.importDeclaration, enumerable: false },
    toJSON: { value: toJSON.importDeclaration, enumerable: false },
    constructor: { value: ImportDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'BlockStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.blockStatement, enumerable: false },
    toJSON: { value: toJSON.blockStatement, enumerable: false },
    constructor: { value: BlockStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const JSXElementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'JSXElement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.jSXElement, enumerable: false },
    toJSON: { value: toJSON.jSXElement, enumerable: false },
    constructor: { value: JSXElementConstructor, enumerable: false, writable: true, configurable: true },
})

const JSXFragmentPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'JSXFragment', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.jSXFragment, enumerable: false },
    toJSON: { value: toJSON.jSXFragment, enumerable: false },
    constructor: { value: JSXFragmentConstructor, enumerable: false, writable: true, configurable: true },
})

const OtherPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'Other', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.other, enumerable: false },
    toJSON: { value: toJSON.other, enumerable: false },
    constructor: { value: OtherConstructor, enumerable: false, writable: true, configurable: true },
})

// -------------------------------------------------------------------------------------------------------------
// Variant static prototype
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor.prototype = FunctionDeclarationPrototype
ArrowFunctionExpressionConstructor.prototype = ArrowFunctionExpressionPrototype
FunctionExpressionConstructor.prototype = FunctionExpressionPrototype
VariableDeclarationConstructor.prototype = VariableDeclarationPrototype
VariableDeclaratorConstructor.prototype = VariableDeclaratorPrototype
ObjectExpressionConstructor.prototype = ObjectExpressionPrototype
MemberExpressionConstructor.prototype = MemberExpressionPrototype
CallExpressionConstructor.prototype = CallExpressionPrototype
AssignmentExpressionConstructor.prototype = AssignmentExpressionPrototype
IdentifierConstructor.prototype = IdentifierPrototype
PropertyConstructor.prototype = PropertyPrototype
ExportNamedDeclarationConstructor.prototype = ExportNamedDeclarationPrototype
ExportDefaultDeclarationConstructor.prototype = ExportDefaultDeclarationPrototype
ImportDeclarationConstructor.prototype = ImportDeclarationPrototype
BlockStatementConstructor.prototype = BlockStatementPrototype
JSXElementConstructor.prototype = JSXElementPrototype
JSXFragmentConstructor.prototype = JSXFragmentPrototype
OtherConstructor.prototype = OtherPrototype
// -------------------------------------------------------------------------------------------------------------
// Variant static is
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor.is = val => val && val.constructor === FunctionDeclarationConstructor
ArrowFunctionExpressionConstructor.is = val => val && val.constructor === ArrowFunctionExpressionConstructor
FunctionExpressionConstructor.is = val => val && val.constructor === FunctionExpressionConstructor
VariableDeclarationConstructor.is = val => val && val.constructor === VariableDeclarationConstructor
VariableDeclaratorConstructor.is = val => val && val.constructor === VariableDeclaratorConstructor
ObjectExpressionConstructor.is = val => val && val.constructor === ObjectExpressionConstructor
MemberExpressionConstructor.is = val => val && val.constructor === MemberExpressionConstructor
CallExpressionConstructor.is = val => val && val.constructor === CallExpressionConstructor
AssignmentExpressionConstructor.is = val => val && val.constructor === AssignmentExpressionConstructor
IdentifierConstructor.is = val => val && val.constructor === IdentifierConstructor
PropertyConstructor.is = val => val && val.constructor === PropertyConstructor
ExportNamedDeclarationConstructor.is = val => val && val.constructor === ExportNamedDeclarationConstructor
ExportDefaultDeclarationConstructor.is = val => val && val.constructor === ExportDefaultDeclarationConstructor
ImportDeclarationConstructor.is = val => val && val.constructor === ImportDeclarationConstructor
BlockStatementConstructor.is = val => val && val.constructor === BlockStatementConstructor
JSXElementConstructor.is = val => val && val.constructor === JSXElementConstructor
JSXFragmentConstructor.is = val => val && val.constructor === JSXFragmentConstructor
OtherConstructor.is = val => val && val.constructor === OtherConstructor
// -------------------------------------------------------------------------------------------------------------
// Variant static toString
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor.toString = () => 'ASTNode.FunctionDeclaration'
ArrowFunctionExpressionConstructor.toString = () => 'ASTNode.ArrowFunctionExpression'
FunctionExpressionConstructor.toString = () => 'ASTNode.FunctionExpression'
VariableDeclarationConstructor.toString = () => 'ASTNode.VariableDeclaration'
VariableDeclaratorConstructor.toString = () => 'ASTNode.VariableDeclarator'
ObjectExpressionConstructor.toString = () => 'ASTNode.ObjectExpression'
MemberExpressionConstructor.toString = () => 'ASTNode.MemberExpression'
CallExpressionConstructor.toString = () => 'ASTNode.CallExpression'
AssignmentExpressionConstructor.toString = () => 'ASTNode.AssignmentExpression'
IdentifierConstructor.toString = () => 'ASTNode.Identifier'
PropertyConstructor.toString = () => 'ASTNode.Property'
ExportNamedDeclarationConstructor.toString = () => 'ASTNode.ExportNamedDeclaration'
ExportDefaultDeclarationConstructor.toString = () => 'ASTNode.ExportDefaultDeclaration'
ImportDeclarationConstructor.toString = () => 'ASTNode.ImportDeclaration'
BlockStatementConstructor.toString = () => 'ASTNode.BlockStatement'
JSXElementConstructor.toString = () => 'ASTNode.JSXElement'
JSXFragmentConstructor.toString = () => 'ASTNode.JSXFragment'
OtherConstructor.toString = () => 'ASTNode.Other'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor._from = _input => ASTNode.FunctionDeclaration(_input.raw)
ArrowFunctionExpressionConstructor._from = _input => ASTNode.ArrowFunctionExpression(_input.raw)
FunctionExpressionConstructor._from = _input => ASTNode.FunctionExpression(_input.raw)
VariableDeclarationConstructor._from = _input => ASTNode.VariableDeclaration(_input.raw)
VariableDeclaratorConstructor._from = _input => ASTNode.VariableDeclarator(_input.raw)
ObjectExpressionConstructor._from = _input => ASTNode.ObjectExpression(_input.raw)
MemberExpressionConstructor._from = _input => ASTNode.MemberExpression(_input.raw)
CallExpressionConstructor._from = _input => ASTNode.CallExpression(_input.raw)
AssignmentExpressionConstructor._from = _input => ASTNode.AssignmentExpression(_input.raw)
IdentifierConstructor._from = _input => ASTNode.Identifier(_input.raw)
PropertyConstructor._from = _input => ASTNode.Property(_input.raw)
ExportNamedDeclarationConstructor._from = _input => ASTNode.ExportNamedDeclaration(_input.raw)
ExportDefaultDeclarationConstructor._from = _input => ASTNode.ExportDefaultDeclaration(_input.raw)
ImportDeclarationConstructor._from = _input => ASTNode.ImportDeclaration(_input.raw)
BlockStatementConstructor._from = _input => ASTNode.BlockStatement(_input.raw)
JSXElementConstructor._from = _input => ASTNode.JSXElement(_input.raw)
JSXFragmentConstructor._from = _input => ASTNode.JSXFragment(_input.raw)
OtherConstructor._from = _input => ASTNode.Other(_input.nodeType, _input.raw)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor.from = FunctionDeclarationConstructor._from
ArrowFunctionExpressionConstructor.from = ArrowFunctionExpressionConstructor._from
FunctionExpressionConstructor.from = FunctionExpressionConstructor._from
VariableDeclarationConstructor.from = VariableDeclarationConstructor._from
VariableDeclaratorConstructor.from = VariableDeclaratorConstructor._from
ObjectExpressionConstructor.from = ObjectExpressionConstructor._from
MemberExpressionConstructor.from = MemberExpressionConstructor._from
CallExpressionConstructor.from = CallExpressionConstructor._from
AssignmentExpressionConstructor.from = AssignmentExpressionConstructor._from
IdentifierConstructor.from = IdentifierConstructor._from
PropertyConstructor.from = PropertyConstructor._from
ExportNamedDeclarationConstructor.from = ExportNamedDeclarationConstructor._from
ExportDefaultDeclarationConstructor.from = ExportDefaultDeclarationConstructor._from
ImportDeclarationConstructor.from = ImportDeclarationConstructor._from
BlockStatementConstructor.from = BlockStatementConstructor._from
JSXElementConstructor.from = JSXElementConstructor._from
JSXFragmentConstructor.from = JSXFragmentConstructor._from
OtherConstructor.from = OtherConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

FunctionDeclarationConstructor.toFirestore = o => ({ ...o })
FunctionDeclarationConstructor.fromFirestore = FunctionDeclarationConstructor._from

ArrowFunctionExpressionConstructor.toFirestore = o => ({ ...o })
ArrowFunctionExpressionConstructor.fromFirestore = ArrowFunctionExpressionConstructor._from

FunctionExpressionConstructor.toFirestore = o => ({ ...o })
FunctionExpressionConstructor.fromFirestore = FunctionExpressionConstructor._from

VariableDeclarationConstructor.toFirestore = o => ({ ...o })
VariableDeclarationConstructor.fromFirestore = VariableDeclarationConstructor._from

VariableDeclaratorConstructor.toFirestore = o => ({ ...o })
VariableDeclaratorConstructor.fromFirestore = VariableDeclaratorConstructor._from

ObjectExpressionConstructor.toFirestore = o => ({ ...o })
ObjectExpressionConstructor.fromFirestore = ObjectExpressionConstructor._from

MemberExpressionConstructor.toFirestore = o => ({ ...o })
MemberExpressionConstructor.fromFirestore = MemberExpressionConstructor._from

CallExpressionConstructor.toFirestore = o => ({ ...o })
CallExpressionConstructor.fromFirestore = CallExpressionConstructor._from

AssignmentExpressionConstructor.toFirestore = o => ({ ...o })
AssignmentExpressionConstructor.fromFirestore = AssignmentExpressionConstructor._from

IdentifierConstructor.toFirestore = o => ({ ...o })
IdentifierConstructor.fromFirestore = IdentifierConstructor._from

PropertyConstructor.toFirestore = o => ({ ...o })
PropertyConstructor.fromFirestore = PropertyConstructor._from

ExportNamedDeclarationConstructor.toFirestore = o => ({ ...o })
ExportNamedDeclarationConstructor.fromFirestore = ExportNamedDeclarationConstructor._from

ExportDefaultDeclarationConstructor.toFirestore = o => ({ ...o })
ExportDefaultDeclarationConstructor.fromFirestore = ExportDefaultDeclarationConstructor._from

ImportDeclarationConstructor.toFirestore = o => ({ ...o })
ImportDeclarationConstructor.fromFirestore = ImportDeclarationConstructor._from

BlockStatementConstructor.toFirestore = o => ({ ...o })
BlockStatementConstructor.fromFirestore = BlockStatementConstructor._from

JSXElementConstructor.toFirestore = o => ({ ...o })
JSXElementConstructor.fromFirestore = JSXElementConstructor._from

JSXFragmentConstructor.toFirestore = o => ({ ...o })
JSXFragmentConstructor.fromFirestore = JSXFragmentConstructor._from

OtherConstructor.toFirestore = o => ({ ...o })
OtherConstructor.fromFirestore = OtherConstructor._from

// Define is method after variants are attached (allows destructuring)

/*
 * Check if value is a ASTNode instance
 * @sig is :: Any -> Boolean
 */
ASTNode.is = v => {
    const {
        FunctionDeclaration,
        ArrowFunctionExpression,
        FunctionExpression,
        VariableDeclaration,
        VariableDeclarator,
        ObjectExpression,
        MemberExpression,
        CallExpression,
        AssignmentExpression,
        Identifier,
        Property,
        ExportNamedDeclaration,
        ExportDefaultDeclaration,
        ImportDeclaration,
        BlockStatement,
        JSXElement,
        JSXFragment,
        Other,
    } = ASTNode
    if (typeof v !== 'object') return false
    const constructor = Object.getPrototypeOf(v).constructor
    return (
        constructor === FunctionDeclaration ||
        constructor === ArrowFunctionExpression ||
        constructor === FunctionExpression ||
        constructor === VariableDeclaration ||
        constructor === VariableDeclarator ||
        constructor === ObjectExpression ||
        constructor === MemberExpression ||
        constructor === CallExpression ||
        constructor === AssignmentExpression ||
        constructor === Identifier ||
        constructor === Property ||
        constructor === ExportNamedDeclaration ||
        constructor === ExportDefaultDeclaration ||
        constructor === ImportDeclaration ||
        constructor === BlockStatement ||
        constructor === JSXElement ||
        constructor === JSXFragment ||
        constructor === Other
    )
}

/**
 * Serialize ASTNode to Firestore format
 * @sig _toFirestore :: (ASTNode, Function) -> Object
 */
ASTNode._toFirestore = (o, encodeTimestamps) => {
    const tagName = o['@@tagName']
    const variant = ASTNode[tagName]
    return { ...variant.toFirestore(o, encodeTimestamps), '@@tagName': tagName }
}

/**
 * Deserialize ASTNode from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ASTNode
 */
ASTNode._fromFirestore = (doc, decodeTimestamps) => {
    const {
        FunctionDeclaration,
        ArrowFunctionExpression,
        FunctionExpression,
        VariableDeclaration,
        VariableDeclarator,
        ObjectExpression,
        MemberExpression,
        CallExpression,
        AssignmentExpression,
        Identifier,
        Property,
        ExportNamedDeclaration,
        ExportDefaultDeclaration,
        ImportDeclaration,
        BlockStatement,
        JSXElement,
        JSXFragment,
        Other,
    } = ASTNode
    const tagName = doc['@@tagName']
    if (tagName === 'FunctionDeclaration') return FunctionDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ArrowFunctionExpression') return ArrowFunctionExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'FunctionExpression') return FunctionExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'VariableDeclaration') return VariableDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'VariableDeclarator') return VariableDeclarator.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ObjectExpression') return ObjectExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberExpression') return MemberExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CallExpression') return CallExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AssignmentExpression') return AssignmentExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Identifier') return Identifier.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Property') return Property.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ExportNamedDeclaration') return ExportNamedDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ExportDefaultDeclaration') return ExportDefaultDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ImportDeclaration') return ImportDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockStatement') return BlockStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'JSXElement') return JSXElement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'JSXFragment') return JSXFragment.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Other') return Other.fromFirestore(doc, decodeTimestamps)
    throw new Error(`Unrecognized ASTNode variant: ${tagName}`)
}

// Public aliases (can be overridden)
ASTNode.toFirestore = ASTNode._toFirestore
ASTNode.fromFirestore = ASTNode._fromFirestore

// -------------------------------------------------------------------------------------------------------------
//
// Additional functions copied from type definition file
//
// -------------------------------------------------------------------------------------------------------------

// Map ESTree type strings to variant constructors
const VARIANT_MAP = {
    FunctionDeclaration: 'FunctionDeclaration',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    FunctionExpression: 'FunctionExpression',
    VariableDeclaration: 'VariableDeclaration',
    VariableDeclarator: 'VariableDeclarator',
    ObjectExpression: 'ObjectExpression',
    MemberExpression: 'MemberExpression',
    CallExpression: 'CallExpression',
    AssignmentExpression: 'AssignmentExpression',
    Identifier: 'Identifier',
    Property: 'Property',
    ExportNamedDeclaration: 'ExportNamedDeclaration',
    ExportDefaultDeclaration: 'ExportDefaultDeclaration',
    ImportDeclaration: 'ImportDeclaration',
    BlockStatement: 'BlockStatement',
    JSXElement: 'JSXElement',
    JSXFragment: 'JSXFragment',
}

// Wrap a raw ESTree node in the appropriate ASTNode variant
// @sig wrap :: Object -> ASTNode
ASTNode.wrap = rawNode => {
    const type = rawNode?.type
    if (!type) return ASTNode.Other('unknown', rawNode || {})
    const variantName = VARIANT_MAP[type]
    if (variantName) return ASTNode[variantName](rawNode)
    return ASTNode.Other(type, rawNode)
}

// Check if a value is an ASTNode instance
// @sig isASTNode :: Any -> Boolean
ASTNode.isASTNode = value => value && value['@@typeName'] === 'ASTNode'

export { ASTNode }
