// ABOUTME: Generated type definition for ASTNode
// ABOUTME: Auto-generated from modules/ast/type-definitions/ast-node.type.js - do not edit manually

/*  ASTNode generated from: modules/ast/type-definitions/ast-node.type.js
 *
 *  FunctionDeclaration
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ArrowFunctionExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  FunctionExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  VariableDeclaration
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  VariableDeclarator
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ObjectExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ArrayExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  MemberExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  CallExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  AssignmentExpression
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  Identifier
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  Property
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ExportNamedDeclaration
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ExportDefaultDeclaration
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ExportSpecifier
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ImportDeclaration
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ImportNamespaceSpecifier
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  BlockStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ReturnStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  IfStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  TryStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ThrowStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  BreakStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ContinueStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ForStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  WhileStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  DoWhileStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ForInStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  ForOfStatement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  JSXElement
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  JSXFragment
 *      esTree: "Object",
 *      parent: "ASTNode?"
 *  Other
 *      esTree: "Object",
 *      parent: "ASTNode?"
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
        'ArrayExpression',
        'MemberExpression',
        'CallExpression',
        'AssignmentExpression',
        'Identifier',
        'Property',
        'ExportNamedDeclaration',
        'ExportDefaultDeclaration',
        'ExportSpecifier',
        'ImportDeclaration',
        'ImportNamespaceSpecifier',
        'BlockStatement',
        'ReturnStatement',
        'IfStatement',
        'TryStatement',
        'ThrowStatement',
        'BreakStatement',
        'ContinueStatement',
        'ForStatement',
        'WhileStatement',
        'DoWhileStatement',
        'ForInStatement',
        'ForOfStatement',
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
    functionDeclaration     : function () { return `ASTNode.FunctionDeclaration(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    arrowFunctionExpression : function () { return `ASTNode.ArrowFunctionExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    functionExpression      : function () { return `ASTNode.FunctionExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    variableDeclaration     : function () { return `ASTNode.VariableDeclaration(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    variableDeclarator      : function () { return `ASTNode.VariableDeclarator(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    objectExpression        : function () { return `ASTNode.ObjectExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    arrayExpression         : function () { return `ASTNode.ArrayExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    memberExpression        : function () { return `ASTNode.MemberExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    callExpression          : function () { return `ASTNode.CallExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    assignmentExpression    : function () { return `ASTNode.AssignmentExpression(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    identifier              : function () { return `ASTNode.Identifier(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    property                : function () { return `ASTNode.Property(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    exportNamedDeclaration  : function () { return `ASTNode.ExportNamedDeclaration(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    exportDefaultDeclaration: function () { return `ASTNode.ExportDefaultDeclaration(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    exportSpecifier         : function () { return `ASTNode.ExportSpecifier(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    importDeclaration       : function () { return `ASTNode.ImportDeclaration(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    importNamespaceSpecifier: function () { return `ASTNode.ImportNamespaceSpecifier(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    blockStatement          : function () { return `ASTNode.BlockStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    returnStatement         : function () { return `ASTNode.ReturnStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    ifStatement             : function () { return `ASTNode.IfStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    tryStatement            : function () { return `ASTNode.TryStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    throwStatement          : function () { return `ASTNode.ThrowStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    breakStatement          : function () { return `ASTNode.BreakStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    continueStatement       : function () { return `ASTNode.ContinueStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    forStatement            : function () { return `ASTNode.ForStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    whileStatement          : function () { return `ASTNode.WhileStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    doWhileStatement        : function () { return `ASTNode.DoWhileStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    forInStatement          : function () { return `ASTNode.ForInStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    forOfStatement          : function () { return `ASTNode.ForOfStatement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    jSXElement              : function () { return `ASTNode.JSXElement(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    jSXFragment             : function () { return `ASTNode.JSXFragment(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
    other                   : function () { return `ASTNode.Other(${R._toString(this.esTree)}, ${R._toString(this.parent)})` },
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
    arrayExpression         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    memberExpression        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    callExpression          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    assignmentExpression    : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    identifier              : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    property                : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    exportNamedDeclaration  : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    exportDefaultDeclaration: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    exportSpecifier         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    importDeclaration       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    importNamespaceSpecifier: function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    blockStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    returnStatement         : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    ifStatement             : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    tryStatement            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    throwStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    breakStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    continueStatement       : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    forStatement            : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    whileStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    doWhileStatement        : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    forInStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
    forOfStatement          : function () { return Object.assign({ '@@tagName': this['@@tagName'] }, this) },
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
 * @sig FunctionDeclaration :: (Object, ASTNode?) -> ASTNode.FunctionDeclaration
 */
const FunctionDeclarationConstructor = function FunctionDeclaration(esTree, parent) {
    const constructorName = 'ASTNode.FunctionDeclaration(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(FunctionDeclarationPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.FunctionDeclaration = FunctionDeclarationConstructor

/*
 * Construct a ASTNode.ArrowFunctionExpression instance
 * @sig ArrowFunctionExpression :: (Object, ASTNode?) -> ASTNode.ArrowFunctionExpression
 */
const ArrowFunctionExpressionConstructor = function ArrowFunctionExpression(esTree, parent) {
    const constructorName = 'ASTNode.ArrowFunctionExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ArrowFunctionExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ArrowFunctionExpression = ArrowFunctionExpressionConstructor

/*
 * Construct a ASTNode.FunctionExpression instance
 * @sig FunctionExpression :: (Object, ASTNode?) -> ASTNode.FunctionExpression
 */
const FunctionExpressionConstructor = function FunctionExpression(esTree, parent) {
    const constructorName = 'ASTNode.FunctionExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(FunctionExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.FunctionExpression = FunctionExpressionConstructor

/*
 * Construct a ASTNode.VariableDeclaration instance
 * @sig VariableDeclaration :: (Object, ASTNode?) -> ASTNode.VariableDeclaration
 */
const VariableDeclarationConstructor = function VariableDeclaration(esTree, parent) {
    const constructorName = 'ASTNode.VariableDeclaration(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(VariableDeclarationPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.VariableDeclaration = VariableDeclarationConstructor

/*
 * Construct a ASTNode.VariableDeclarator instance
 * @sig VariableDeclarator :: (Object, ASTNode?) -> ASTNode.VariableDeclarator
 */
const VariableDeclaratorConstructor = function VariableDeclarator(esTree, parent) {
    const constructorName = 'ASTNode.VariableDeclarator(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(VariableDeclaratorPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.VariableDeclarator = VariableDeclaratorConstructor

/*
 * Construct a ASTNode.ObjectExpression instance
 * @sig ObjectExpression :: (Object, ASTNode?) -> ASTNode.ObjectExpression
 */
const ObjectExpressionConstructor = function ObjectExpression(esTree, parent) {
    const constructorName = 'ASTNode.ObjectExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ObjectExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ObjectExpression = ObjectExpressionConstructor

/*
 * Construct a ASTNode.ArrayExpression instance
 * @sig ArrayExpression :: (Object, ASTNode?) -> ASTNode.ArrayExpression
 */
const ArrayExpressionConstructor = function ArrayExpression(esTree, parent) {
    const constructorName = 'ASTNode.ArrayExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ArrayExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ArrayExpression = ArrayExpressionConstructor

/*
 * Construct a ASTNode.MemberExpression instance
 * @sig MemberExpression :: (Object, ASTNode?) -> ASTNode.MemberExpression
 */
const MemberExpressionConstructor = function MemberExpression(esTree, parent) {
    const constructorName = 'ASTNode.MemberExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(MemberExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.MemberExpression = MemberExpressionConstructor

/*
 * Construct a ASTNode.CallExpression instance
 * @sig CallExpression :: (Object, ASTNode?) -> ASTNode.CallExpression
 */
const CallExpressionConstructor = function CallExpression(esTree, parent) {
    const constructorName = 'ASTNode.CallExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(CallExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.CallExpression = CallExpressionConstructor

/*
 * Construct a ASTNode.AssignmentExpression instance
 * @sig AssignmentExpression :: (Object, ASTNode?) -> ASTNode.AssignmentExpression
 */
const AssignmentExpressionConstructor = function AssignmentExpression(esTree, parent) {
    const constructorName = 'ASTNode.AssignmentExpression(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(AssignmentExpressionPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.AssignmentExpression = AssignmentExpressionConstructor

/*
 * Construct a ASTNode.Identifier instance
 * @sig Identifier :: (Object, ASTNode?) -> ASTNode.Identifier
 */
const IdentifierConstructor = function Identifier(esTree, parent) {
    const constructorName = 'ASTNode.Identifier(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(IdentifierPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.Identifier = IdentifierConstructor

/*
 * Construct a ASTNode.Property instance
 * @sig Property :: (Object, ASTNode?) -> ASTNode.Property
 */
const PropertyConstructor = function Property(esTree, parent) {
    const constructorName = 'ASTNode.Property(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(PropertyPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.Property = PropertyConstructor

/*
 * Construct a ASTNode.ExportNamedDeclaration instance
 * @sig ExportNamedDeclaration :: (Object, ASTNode?) -> ASTNode.ExportNamedDeclaration
 */
const ExportNamedDeclarationConstructor = function ExportNamedDeclaration(esTree, parent) {
    const constructorName = 'ASTNode.ExportNamedDeclaration(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ExportNamedDeclarationPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ExportNamedDeclaration = ExportNamedDeclarationConstructor

/*
 * Construct a ASTNode.ExportDefaultDeclaration instance
 * @sig ExportDefaultDeclaration :: (Object, ASTNode?) -> ASTNode.ExportDefaultDeclaration
 */
const ExportDefaultDeclarationConstructor = function ExportDefaultDeclaration(esTree, parent) {
    const constructorName = 'ASTNode.ExportDefaultDeclaration(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ExportDefaultDeclarationPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ExportDefaultDeclaration = ExportDefaultDeclarationConstructor

/*
 * Construct a ASTNode.ExportSpecifier instance
 * @sig ExportSpecifier :: (Object, ASTNode?) -> ASTNode.ExportSpecifier
 */
const ExportSpecifierConstructor = function ExportSpecifier(esTree, parent) {
    const constructorName = 'ASTNode.ExportSpecifier(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ExportSpecifierPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ExportSpecifier = ExportSpecifierConstructor

/*
 * Construct a ASTNode.ImportDeclaration instance
 * @sig ImportDeclaration :: (Object, ASTNode?) -> ASTNode.ImportDeclaration
 */
const ImportDeclarationConstructor = function ImportDeclaration(esTree, parent) {
    const constructorName = 'ASTNode.ImportDeclaration(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ImportDeclarationPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ImportDeclaration = ImportDeclarationConstructor

/*
 * Construct a ASTNode.ImportNamespaceSpecifier instance
 * @sig ImportNamespaceSpecifier :: (Object, ASTNode?) -> ASTNode.ImportNamespaceSpecifier
 */
const ImportNamespaceSpecifierConstructor = function ImportNamespaceSpecifier(esTree, parent) {
    const constructorName = 'ASTNode.ImportNamespaceSpecifier(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ImportNamespaceSpecifierPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ImportNamespaceSpecifier = ImportNamespaceSpecifierConstructor

/*
 * Construct a ASTNode.BlockStatement instance
 * @sig BlockStatement :: (Object, ASTNode?) -> ASTNode.BlockStatement
 */
const BlockStatementConstructor = function BlockStatement(esTree, parent) {
    const constructorName = 'ASTNode.BlockStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(BlockStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.BlockStatement = BlockStatementConstructor

/*
 * Construct a ASTNode.ReturnStatement instance
 * @sig ReturnStatement :: (Object, ASTNode?) -> ASTNode.ReturnStatement
 */
const ReturnStatementConstructor = function ReturnStatement(esTree, parent) {
    const constructorName = 'ASTNode.ReturnStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ReturnStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ReturnStatement = ReturnStatementConstructor

/*
 * Construct a ASTNode.IfStatement instance
 * @sig IfStatement :: (Object, ASTNode?) -> ASTNode.IfStatement
 */
const IfStatementConstructor = function IfStatement(esTree, parent) {
    const constructorName = 'ASTNode.IfStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(IfStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.IfStatement = IfStatementConstructor

/*
 * Construct a ASTNode.TryStatement instance
 * @sig TryStatement :: (Object, ASTNode?) -> ASTNode.TryStatement
 */
const TryStatementConstructor = function TryStatement(esTree, parent) {
    const constructorName = 'ASTNode.TryStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(TryStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.TryStatement = TryStatementConstructor

/*
 * Construct a ASTNode.ThrowStatement instance
 * @sig ThrowStatement :: (Object, ASTNode?) -> ASTNode.ThrowStatement
 */
const ThrowStatementConstructor = function ThrowStatement(esTree, parent) {
    const constructorName = 'ASTNode.ThrowStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ThrowStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ThrowStatement = ThrowStatementConstructor

/*
 * Construct a ASTNode.BreakStatement instance
 * @sig BreakStatement :: (Object, ASTNode?) -> ASTNode.BreakStatement
 */
const BreakStatementConstructor = function BreakStatement(esTree, parent) {
    const constructorName = 'ASTNode.BreakStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(BreakStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.BreakStatement = BreakStatementConstructor

/*
 * Construct a ASTNode.ContinueStatement instance
 * @sig ContinueStatement :: (Object, ASTNode?) -> ASTNode.ContinueStatement
 */
const ContinueStatementConstructor = function ContinueStatement(esTree, parent) {
    const constructorName = 'ASTNode.ContinueStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ContinueStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ContinueStatement = ContinueStatementConstructor

/*
 * Construct a ASTNode.ForStatement instance
 * @sig ForStatement :: (Object, ASTNode?) -> ASTNode.ForStatement
 */
const ForStatementConstructor = function ForStatement(esTree, parent) {
    const constructorName = 'ASTNode.ForStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ForStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ForStatement = ForStatementConstructor

/*
 * Construct a ASTNode.WhileStatement instance
 * @sig WhileStatement :: (Object, ASTNode?) -> ASTNode.WhileStatement
 */
const WhileStatementConstructor = function WhileStatement(esTree, parent) {
    const constructorName = 'ASTNode.WhileStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(WhileStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.WhileStatement = WhileStatementConstructor

/*
 * Construct a ASTNode.DoWhileStatement instance
 * @sig DoWhileStatement :: (Object, ASTNode?) -> ASTNode.DoWhileStatement
 */
const DoWhileStatementConstructor = function DoWhileStatement(esTree, parent) {
    const constructorName = 'ASTNode.DoWhileStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(DoWhileStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.DoWhileStatement = DoWhileStatementConstructor

/*
 * Construct a ASTNode.ForInStatement instance
 * @sig ForInStatement :: (Object, ASTNode?) -> ASTNode.ForInStatement
 */
const ForInStatementConstructor = function ForInStatement(esTree, parent) {
    const constructorName = 'ASTNode.ForInStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ForInStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ForInStatement = ForInStatementConstructor

/*
 * Construct a ASTNode.ForOfStatement instance
 * @sig ForOfStatement :: (Object, ASTNode?) -> ASTNode.ForOfStatement
 */
const ForOfStatementConstructor = function ForOfStatement(esTree, parent) {
    const constructorName = 'ASTNode.ForOfStatement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(ForOfStatementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.ForOfStatement = ForOfStatementConstructor

/*
 * Construct a ASTNode.JSXElement instance
 * @sig JSXElement :: (Object, ASTNode?) -> ASTNode.JSXElement
 */
const JSXElementConstructor = function JSXElement(esTree, parent) {
    const constructorName = 'ASTNode.JSXElement(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(JSXElementPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.JSXElement = JSXElementConstructor

/*
 * Construct a ASTNode.JSXFragment instance
 * @sig JSXFragment :: (Object, ASTNode?) -> ASTNode.JSXFragment
 */
const JSXFragmentConstructor = function JSXFragment(esTree, parent) {
    const constructorName = 'ASTNode.JSXFragment(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(JSXFragmentPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
    return result
}

ASTNode.JSXFragment = JSXFragmentConstructor

/*
 * Construct a ASTNode.Other instance
 * @sig Other :: (Object, ASTNode?) -> ASTNode.Other
 */
const OtherConstructor = function Other(esTree, parent) {
    const constructorName = 'ASTNode.Other(esTree, parent)'

    R.validateObject(constructorName, 'esTree', false, esTree)
    R.validateTag(constructorName, 'ASTNode', 'parent', true, parent)

    const result = Object.create(OtherPrototype)
    result.esTree = esTree
    if (parent != null) result.parent = parent
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

const ArrayExpressionPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ArrayExpression', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.arrayExpression, enumerable: false },
    toJSON: { value: toJSON.arrayExpression, enumerable: false },
    constructor: { value: ArrayExpressionConstructor, enumerable: false, writable: true, configurable: true },
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

const ExportSpecifierPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ExportSpecifier', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.exportSpecifier, enumerable: false },
    toJSON: { value: toJSON.exportSpecifier, enumerable: false },
    constructor: { value: ExportSpecifierConstructor, enumerable: false, writable: true, configurable: true },
})

const ImportDeclarationPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ImportDeclaration', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.importDeclaration, enumerable: false },
    toJSON: { value: toJSON.importDeclaration, enumerable: false },
    constructor: { value: ImportDeclarationConstructor, enumerable: false, writable: true, configurable: true },
})

const ImportNamespaceSpecifierPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ImportNamespaceSpecifier', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.importNamespaceSpecifier, enumerable: false },
    toJSON: { value: toJSON.importNamespaceSpecifier, enumerable: false },
    constructor: { value: ImportNamespaceSpecifierConstructor, enumerable: false, writable: true, configurable: true },
})

const BlockStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'BlockStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.blockStatement, enumerable: false },
    toJSON: { value: toJSON.blockStatement, enumerable: false },
    constructor: { value: BlockStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ReturnStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ReturnStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.returnStatement, enumerable: false },
    toJSON: { value: toJSON.returnStatement, enumerable: false },
    constructor: { value: ReturnStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const IfStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'IfStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.ifStatement, enumerable: false },
    toJSON: { value: toJSON.ifStatement, enumerable: false },
    constructor: { value: IfStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const TryStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'TryStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.tryStatement, enumerable: false },
    toJSON: { value: toJSON.tryStatement, enumerable: false },
    constructor: { value: TryStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ThrowStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ThrowStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.throwStatement, enumerable: false },
    toJSON: { value: toJSON.throwStatement, enumerable: false },
    constructor: { value: ThrowStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const BreakStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'BreakStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.breakStatement, enumerable: false },
    toJSON: { value: toJSON.breakStatement, enumerable: false },
    constructor: { value: BreakStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ContinueStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ContinueStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.continueStatement, enumerable: false },
    toJSON: { value: toJSON.continueStatement, enumerable: false },
    constructor: { value: ContinueStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ForStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ForStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.forStatement, enumerable: false },
    toJSON: { value: toJSON.forStatement, enumerable: false },
    constructor: { value: ForStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const WhileStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'WhileStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.whileStatement, enumerable: false },
    toJSON: { value: toJSON.whileStatement, enumerable: false },
    constructor: { value: WhileStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const DoWhileStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'DoWhileStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.doWhileStatement, enumerable: false },
    toJSON: { value: toJSON.doWhileStatement, enumerable: false },
    constructor: { value: DoWhileStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ForInStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ForInStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.forInStatement, enumerable: false },
    toJSON: { value: toJSON.forInStatement, enumerable: false },
    constructor: { value: ForInStatementConstructor, enumerable: false, writable: true, configurable: true },
})

const ForOfStatementPrototype = Object.create(ASTNodePrototype, {
    '@@tagName': { value: 'ForOfStatement', enumerable: false },
    '@@typeName': { value: 'ASTNode', enumerable: false },
    toString: { value: toString.forOfStatement, enumerable: false },
    toJSON: { value: toJSON.forOfStatement, enumerable: false },
    constructor: { value: ForOfStatementConstructor, enumerable: false, writable: true, configurable: true },
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
ArrayExpressionConstructor.prototype = ArrayExpressionPrototype
MemberExpressionConstructor.prototype = MemberExpressionPrototype
CallExpressionConstructor.prototype = CallExpressionPrototype
AssignmentExpressionConstructor.prototype = AssignmentExpressionPrototype
IdentifierConstructor.prototype = IdentifierPrototype
PropertyConstructor.prototype = PropertyPrototype
ExportNamedDeclarationConstructor.prototype = ExportNamedDeclarationPrototype
ExportDefaultDeclarationConstructor.prototype = ExportDefaultDeclarationPrototype
ExportSpecifierConstructor.prototype = ExportSpecifierPrototype
ImportDeclarationConstructor.prototype = ImportDeclarationPrototype
ImportNamespaceSpecifierConstructor.prototype = ImportNamespaceSpecifierPrototype
BlockStatementConstructor.prototype = BlockStatementPrototype
ReturnStatementConstructor.prototype = ReturnStatementPrototype
IfStatementConstructor.prototype = IfStatementPrototype
TryStatementConstructor.prototype = TryStatementPrototype
ThrowStatementConstructor.prototype = ThrowStatementPrototype
BreakStatementConstructor.prototype = BreakStatementPrototype
ContinueStatementConstructor.prototype = ContinueStatementPrototype
ForStatementConstructor.prototype = ForStatementPrototype
WhileStatementConstructor.prototype = WhileStatementPrototype
DoWhileStatementConstructor.prototype = DoWhileStatementPrototype
ForInStatementConstructor.prototype = ForInStatementPrototype
ForOfStatementConstructor.prototype = ForOfStatementPrototype
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
ArrayExpressionConstructor.is = val => val && val.constructor === ArrayExpressionConstructor
MemberExpressionConstructor.is = val => val && val.constructor === MemberExpressionConstructor
CallExpressionConstructor.is = val => val && val.constructor === CallExpressionConstructor
AssignmentExpressionConstructor.is = val => val && val.constructor === AssignmentExpressionConstructor
IdentifierConstructor.is = val => val && val.constructor === IdentifierConstructor
PropertyConstructor.is = val => val && val.constructor === PropertyConstructor
ExportNamedDeclarationConstructor.is = val => val && val.constructor === ExportNamedDeclarationConstructor
ExportDefaultDeclarationConstructor.is = val => val && val.constructor === ExportDefaultDeclarationConstructor
ExportSpecifierConstructor.is = val => val && val.constructor === ExportSpecifierConstructor
ImportDeclarationConstructor.is = val => val && val.constructor === ImportDeclarationConstructor
ImportNamespaceSpecifierConstructor.is = val => val && val.constructor === ImportNamespaceSpecifierConstructor
BlockStatementConstructor.is = val => val && val.constructor === BlockStatementConstructor
ReturnStatementConstructor.is = val => val && val.constructor === ReturnStatementConstructor
IfStatementConstructor.is = val => val && val.constructor === IfStatementConstructor
TryStatementConstructor.is = val => val && val.constructor === TryStatementConstructor
ThrowStatementConstructor.is = val => val && val.constructor === ThrowStatementConstructor
BreakStatementConstructor.is = val => val && val.constructor === BreakStatementConstructor
ContinueStatementConstructor.is = val => val && val.constructor === ContinueStatementConstructor
ForStatementConstructor.is = val => val && val.constructor === ForStatementConstructor
WhileStatementConstructor.is = val => val && val.constructor === WhileStatementConstructor
DoWhileStatementConstructor.is = val => val && val.constructor === DoWhileStatementConstructor
ForInStatementConstructor.is = val => val && val.constructor === ForInStatementConstructor
ForOfStatementConstructor.is = val => val && val.constructor === ForOfStatementConstructor
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
ArrayExpressionConstructor.toString = () => 'ASTNode.ArrayExpression'
MemberExpressionConstructor.toString = () => 'ASTNode.MemberExpression'
CallExpressionConstructor.toString = () => 'ASTNode.CallExpression'
AssignmentExpressionConstructor.toString = () => 'ASTNode.AssignmentExpression'
IdentifierConstructor.toString = () => 'ASTNode.Identifier'
PropertyConstructor.toString = () => 'ASTNode.Property'
ExportNamedDeclarationConstructor.toString = () => 'ASTNode.ExportNamedDeclaration'
ExportDefaultDeclarationConstructor.toString = () => 'ASTNode.ExportDefaultDeclaration'
ExportSpecifierConstructor.toString = () => 'ASTNode.ExportSpecifier'
ImportDeclarationConstructor.toString = () => 'ASTNode.ImportDeclaration'
ImportNamespaceSpecifierConstructor.toString = () => 'ASTNode.ImportNamespaceSpecifier'
BlockStatementConstructor.toString = () => 'ASTNode.BlockStatement'
ReturnStatementConstructor.toString = () => 'ASTNode.ReturnStatement'
IfStatementConstructor.toString = () => 'ASTNode.IfStatement'
TryStatementConstructor.toString = () => 'ASTNode.TryStatement'
ThrowStatementConstructor.toString = () => 'ASTNode.ThrowStatement'
BreakStatementConstructor.toString = () => 'ASTNode.BreakStatement'
ContinueStatementConstructor.toString = () => 'ASTNode.ContinueStatement'
ForStatementConstructor.toString = () => 'ASTNode.ForStatement'
WhileStatementConstructor.toString = () => 'ASTNode.WhileStatement'
DoWhileStatementConstructor.toString = () => 'ASTNode.DoWhileStatement'
ForInStatementConstructor.toString = () => 'ASTNode.ForInStatement'
ForOfStatementConstructor.toString = () => 'ASTNode.ForOfStatement'
JSXElementConstructor.toString = () => 'ASTNode.JSXElement'
JSXFragmentConstructor.toString = () => 'ASTNode.JSXFragment'
OtherConstructor.toString = () => 'ASTNode.Other'
// -------------------------------------------------------------------------------------------------------------
// Variant static _from
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor._from = _input => ASTNode.FunctionDeclaration(_input.esTree, _input.parent)
ArrowFunctionExpressionConstructor._from = _input => ASTNode.ArrowFunctionExpression(_input.esTree, _input.parent)
FunctionExpressionConstructor._from = _input => ASTNode.FunctionExpression(_input.esTree, _input.parent)
VariableDeclarationConstructor._from = _input => ASTNode.VariableDeclaration(_input.esTree, _input.parent)
VariableDeclaratorConstructor._from = _input => ASTNode.VariableDeclarator(_input.esTree, _input.parent)
ObjectExpressionConstructor._from = _input => ASTNode.ObjectExpression(_input.esTree, _input.parent)
ArrayExpressionConstructor._from = _input => ASTNode.ArrayExpression(_input.esTree, _input.parent)
MemberExpressionConstructor._from = _input => ASTNode.MemberExpression(_input.esTree, _input.parent)
CallExpressionConstructor._from = _input => ASTNode.CallExpression(_input.esTree, _input.parent)
AssignmentExpressionConstructor._from = _input => ASTNode.AssignmentExpression(_input.esTree, _input.parent)
IdentifierConstructor._from = _input => ASTNode.Identifier(_input.esTree, _input.parent)
PropertyConstructor._from = _input => ASTNode.Property(_input.esTree, _input.parent)
ExportNamedDeclarationConstructor._from = _input => ASTNode.ExportNamedDeclaration(_input.esTree, _input.parent)
ExportDefaultDeclarationConstructor._from = _input => ASTNode.ExportDefaultDeclaration(_input.esTree, _input.parent)
ExportSpecifierConstructor._from = _input => ASTNode.ExportSpecifier(_input.esTree, _input.parent)
ImportDeclarationConstructor._from = _input => ASTNode.ImportDeclaration(_input.esTree, _input.parent)
ImportNamespaceSpecifierConstructor._from = _input => ASTNode.ImportNamespaceSpecifier(_input.esTree, _input.parent)
BlockStatementConstructor._from = _input => ASTNode.BlockStatement(_input.esTree, _input.parent)
ReturnStatementConstructor._from = _input => ASTNode.ReturnStatement(_input.esTree, _input.parent)
IfStatementConstructor._from = _input => ASTNode.IfStatement(_input.esTree, _input.parent)
TryStatementConstructor._from = _input => ASTNode.TryStatement(_input.esTree, _input.parent)
ThrowStatementConstructor._from = _input => ASTNode.ThrowStatement(_input.esTree, _input.parent)
BreakStatementConstructor._from = _input => ASTNode.BreakStatement(_input.esTree, _input.parent)
ContinueStatementConstructor._from = _input => ASTNode.ContinueStatement(_input.esTree, _input.parent)
ForStatementConstructor._from = _input => ASTNode.ForStatement(_input.esTree, _input.parent)
WhileStatementConstructor._from = _input => ASTNode.WhileStatement(_input.esTree, _input.parent)
DoWhileStatementConstructor._from = _input => ASTNode.DoWhileStatement(_input.esTree, _input.parent)
ForInStatementConstructor._from = _input => ASTNode.ForInStatement(_input.esTree, _input.parent)
ForOfStatementConstructor._from = _input => ASTNode.ForOfStatement(_input.esTree, _input.parent)
JSXElementConstructor._from = _input => ASTNode.JSXElement(_input.esTree, _input.parent)
JSXFragmentConstructor._from = _input => ASTNode.JSXFragment(_input.esTree, _input.parent)
OtherConstructor._from = _input => ASTNode.Other(_input.esTree, _input.parent)
// -------------------------------------------------------------------------------------------------------------
// Variant static from
// -------------------------------------------------------------------------------------------------------------
FunctionDeclarationConstructor.from = FunctionDeclarationConstructor._from
ArrowFunctionExpressionConstructor.from = ArrowFunctionExpressionConstructor._from
FunctionExpressionConstructor.from = FunctionExpressionConstructor._from
VariableDeclarationConstructor.from = VariableDeclarationConstructor._from
VariableDeclaratorConstructor.from = VariableDeclaratorConstructor._from
ObjectExpressionConstructor.from = ObjectExpressionConstructor._from
ArrayExpressionConstructor.from = ArrayExpressionConstructor._from
MemberExpressionConstructor.from = MemberExpressionConstructor._from
CallExpressionConstructor.from = CallExpressionConstructor._from
AssignmentExpressionConstructor.from = AssignmentExpressionConstructor._from
IdentifierConstructor.from = IdentifierConstructor._from
PropertyConstructor.from = PropertyConstructor._from
ExportNamedDeclarationConstructor.from = ExportNamedDeclarationConstructor._from
ExportDefaultDeclarationConstructor.from = ExportDefaultDeclarationConstructor._from
ExportSpecifierConstructor.from = ExportSpecifierConstructor._from
ImportDeclarationConstructor.from = ImportDeclarationConstructor._from
ImportNamespaceSpecifierConstructor.from = ImportNamespaceSpecifierConstructor._from
BlockStatementConstructor.from = BlockStatementConstructor._from
ReturnStatementConstructor.from = ReturnStatementConstructor._from
IfStatementConstructor.from = IfStatementConstructor._from
TryStatementConstructor.from = TryStatementConstructor._from
ThrowStatementConstructor.from = ThrowStatementConstructor._from
BreakStatementConstructor.from = BreakStatementConstructor._from
ContinueStatementConstructor.from = ContinueStatementConstructor._from
ForStatementConstructor.from = ForStatementConstructor._from
WhileStatementConstructor.from = WhileStatementConstructor._from
DoWhileStatementConstructor.from = DoWhileStatementConstructor._from
ForInStatementConstructor.from = ForInStatementConstructor._from
ForOfStatementConstructor.from = ForOfStatementConstructor._from
JSXElementConstructor.from = JSXElementConstructor._from
JSXFragmentConstructor.from = JSXFragmentConstructor._from
OtherConstructor.from = OtherConstructor._from

// -------------------------------------------------------------------------------------------------------------
//
// Variant Firestore serialization
//
// -------------------------------------------------------------------------------------------------------------

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (FunctionDeclaration, Function) -> Object
 */
FunctionDeclarationConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> FunctionDeclaration
 */
FunctionDeclarationConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return FunctionDeclarationConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
FunctionDeclarationConstructor.toFirestore = FunctionDeclarationConstructor._toFirestore
FunctionDeclarationConstructor.fromFirestore = FunctionDeclarationConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ArrowFunctionExpression, Function) -> Object
 */
ArrowFunctionExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ArrowFunctionExpression
 */
ArrowFunctionExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ArrowFunctionExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ArrowFunctionExpressionConstructor.toFirestore = ArrowFunctionExpressionConstructor._toFirestore
ArrowFunctionExpressionConstructor.fromFirestore = ArrowFunctionExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (FunctionExpression, Function) -> Object
 */
FunctionExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> FunctionExpression
 */
FunctionExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return FunctionExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
FunctionExpressionConstructor.toFirestore = FunctionExpressionConstructor._toFirestore
FunctionExpressionConstructor.fromFirestore = FunctionExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (VariableDeclaration, Function) -> Object
 */
VariableDeclarationConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> VariableDeclaration
 */
VariableDeclarationConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return VariableDeclarationConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
VariableDeclarationConstructor.toFirestore = VariableDeclarationConstructor._toFirestore
VariableDeclarationConstructor.fromFirestore = VariableDeclarationConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (VariableDeclarator, Function) -> Object
 */
VariableDeclaratorConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> VariableDeclarator
 */
VariableDeclaratorConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return VariableDeclaratorConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
VariableDeclaratorConstructor.toFirestore = VariableDeclaratorConstructor._toFirestore
VariableDeclaratorConstructor.fromFirestore = VariableDeclaratorConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ObjectExpression, Function) -> Object
 */
ObjectExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ObjectExpression
 */
ObjectExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ObjectExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ObjectExpressionConstructor.toFirestore = ObjectExpressionConstructor._toFirestore
ObjectExpressionConstructor.fromFirestore = ObjectExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ArrayExpression, Function) -> Object
 */
ArrayExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ArrayExpression
 */
ArrayExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ArrayExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ArrayExpressionConstructor.toFirestore = ArrayExpressionConstructor._toFirestore
ArrayExpressionConstructor.fromFirestore = ArrayExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (MemberExpression, Function) -> Object
 */
MemberExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> MemberExpression
 */
MemberExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return MemberExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
MemberExpressionConstructor.toFirestore = MemberExpressionConstructor._toFirestore
MemberExpressionConstructor.fromFirestore = MemberExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (CallExpression, Function) -> Object
 */
CallExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> CallExpression
 */
CallExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return CallExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
CallExpressionConstructor.toFirestore = CallExpressionConstructor._toFirestore
CallExpressionConstructor.fromFirestore = CallExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (AssignmentExpression, Function) -> Object
 */
AssignmentExpressionConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> AssignmentExpression
 */
AssignmentExpressionConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return AssignmentExpressionConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
AssignmentExpressionConstructor.toFirestore = AssignmentExpressionConstructor._toFirestore
AssignmentExpressionConstructor.fromFirestore = AssignmentExpressionConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Identifier, Function) -> Object
 */
IdentifierConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Identifier
 */
IdentifierConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return IdentifierConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
IdentifierConstructor.toFirestore = IdentifierConstructor._toFirestore
IdentifierConstructor.fromFirestore = IdentifierConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Property, Function) -> Object
 */
PropertyConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Property
 */
PropertyConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return PropertyConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
PropertyConstructor.toFirestore = PropertyConstructor._toFirestore
PropertyConstructor.fromFirestore = PropertyConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ExportNamedDeclaration, Function) -> Object
 */
ExportNamedDeclarationConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ExportNamedDeclaration
 */
ExportNamedDeclarationConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ExportNamedDeclarationConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ExportNamedDeclarationConstructor.toFirestore = ExportNamedDeclarationConstructor._toFirestore
ExportNamedDeclarationConstructor.fromFirestore = ExportNamedDeclarationConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ExportDefaultDeclaration, Function) -> Object
 */
ExportDefaultDeclarationConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ExportDefaultDeclaration
 */
ExportDefaultDeclarationConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ExportDefaultDeclarationConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ExportDefaultDeclarationConstructor.toFirestore = ExportDefaultDeclarationConstructor._toFirestore
ExportDefaultDeclarationConstructor.fromFirestore = ExportDefaultDeclarationConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ExportSpecifier, Function) -> Object
 */
ExportSpecifierConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ExportSpecifier
 */
ExportSpecifierConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ExportSpecifierConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ExportSpecifierConstructor.toFirestore = ExportSpecifierConstructor._toFirestore
ExportSpecifierConstructor.fromFirestore = ExportSpecifierConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ImportDeclaration, Function) -> Object
 */
ImportDeclarationConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ImportDeclaration
 */
ImportDeclarationConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ImportDeclarationConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ImportDeclarationConstructor.toFirestore = ImportDeclarationConstructor._toFirestore
ImportDeclarationConstructor.fromFirestore = ImportDeclarationConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ImportNamespaceSpecifier, Function) -> Object
 */
ImportNamespaceSpecifierConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ImportNamespaceSpecifier
 */
ImportNamespaceSpecifierConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ImportNamespaceSpecifierConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ImportNamespaceSpecifierConstructor.toFirestore = ImportNamespaceSpecifierConstructor._toFirestore
ImportNamespaceSpecifierConstructor.fromFirestore = ImportNamespaceSpecifierConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (BlockStatement, Function) -> Object
 */
BlockStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> BlockStatement
 */
BlockStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return BlockStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
BlockStatementConstructor.toFirestore = BlockStatementConstructor._toFirestore
BlockStatementConstructor.fromFirestore = BlockStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ReturnStatement, Function) -> Object
 */
ReturnStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ReturnStatement
 */
ReturnStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ReturnStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ReturnStatementConstructor.toFirestore = ReturnStatementConstructor._toFirestore
ReturnStatementConstructor.fromFirestore = ReturnStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (IfStatement, Function) -> Object
 */
IfStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> IfStatement
 */
IfStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return IfStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
IfStatementConstructor.toFirestore = IfStatementConstructor._toFirestore
IfStatementConstructor.fromFirestore = IfStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (TryStatement, Function) -> Object
 */
TryStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> TryStatement
 */
TryStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return TryStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
TryStatementConstructor.toFirestore = TryStatementConstructor._toFirestore
TryStatementConstructor.fromFirestore = TryStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ThrowStatement, Function) -> Object
 */
ThrowStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ThrowStatement
 */
ThrowStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ThrowStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ThrowStatementConstructor.toFirestore = ThrowStatementConstructor._toFirestore
ThrowStatementConstructor.fromFirestore = ThrowStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (BreakStatement, Function) -> Object
 */
BreakStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> BreakStatement
 */
BreakStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return BreakStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
BreakStatementConstructor.toFirestore = BreakStatementConstructor._toFirestore
BreakStatementConstructor.fromFirestore = BreakStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ContinueStatement, Function) -> Object
 */
ContinueStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ContinueStatement
 */
ContinueStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ContinueStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ContinueStatementConstructor.toFirestore = ContinueStatementConstructor._toFirestore
ContinueStatementConstructor.fromFirestore = ContinueStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ForStatement, Function) -> Object
 */
ForStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ForStatement
 */
ForStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ForStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ForStatementConstructor.toFirestore = ForStatementConstructor._toFirestore
ForStatementConstructor.fromFirestore = ForStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (WhileStatement, Function) -> Object
 */
WhileStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> WhileStatement
 */
WhileStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return WhileStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
WhileStatementConstructor.toFirestore = WhileStatementConstructor._toFirestore
WhileStatementConstructor.fromFirestore = WhileStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (DoWhileStatement, Function) -> Object
 */
DoWhileStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> DoWhileStatement
 */
DoWhileStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return DoWhileStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
DoWhileStatementConstructor.toFirestore = DoWhileStatementConstructor._toFirestore
DoWhileStatementConstructor.fromFirestore = DoWhileStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ForInStatement, Function) -> Object
 */
ForInStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ForInStatement
 */
ForInStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ForInStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ForInStatementConstructor.toFirestore = ForInStatementConstructor._toFirestore
ForInStatementConstructor.fromFirestore = ForInStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (ForOfStatement, Function) -> Object
 */
ForOfStatementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> ForOfStatement
 */
ForOfStatementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return ForOfStatementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
ForOfStatementConstructor.toFirestore = ForOfStatementConstructor._toFirestore
ForOfStatementConstructor.fromFirestore = ForOfStatementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (JSXElement, Function) -> Object
 */
JSXElementConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> JSXElement
 */
JSXElementConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return JSXElementConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
JSXElementConstructor.toFirestore = JSXElementConstructor._toFirestore
JSXElementConstructor.fromFirestore = JSXElementConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (JSXFragment, Function) -> Object
 */
JSXFragmentConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> JSXFragment
 */
JSXFragmentConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return JSXFragmentConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
JSXFragmentConstructor.toFirestore = JSXFragmentConstructor._toFirestore
JSXFragmentConstructor.fromFirestore = JSXFragmentConstructor._fromFirestore

/**
 * Serialize to Firestore format
 * @sig _toFirestore :: (Other, Function) -> Object
 */
OtherConstructor._toFirestore = (o, encodeTimestamps) => {
    const { esTree, parent } = o
    return {
        esTree: esTree,
        parent: ASTNode.toFirestore(parent, encodeTimestamps),
    }
}

/**
 * Deserialize from Firestore format
 * @sig _fromFirestore :: (Object, Function) -> Other
 */
OtherConstructor._fromFirestore = (doc, decodeTimestamps) => {
    const { esTree, parent } = doc
    return OtherConstructor._from({
        esTree: esTree,
        parent: ASTNode.fromFirestore ? ASTNode.fromFirestore(parent, decodeTimestamps) : ASTNode.from(parent),
    })
}

// Public aliases (can be overridden)
OtherConstructor.toFirestore = OtherConstructor._toFirestore
OtherConstructor.fromFirestore = OtherConstructor._fromFirestore

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
        ArrayExpression,
        MemberExpression,
        CallExpression,
        AssignmentExpression,
        Identifier,
        Property,
        ExportNamedDeclaration,
        ExportDefaultDeclaration,
        ExportSpecifier,
        ImportDeclaration,
        ImportNamespaceSpecifier,
        BlockStatement,
        ReturnStatement,
        IfStatement,
        TryStatement,
        ThrowStatement,
        BreakStatement,
        ContinueStatement,
        ForStatement,
        WhileStatement,
        DoWhileStatement,
        ForInStatement,
        ForOfStatement,
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
        constructor === ArrayExpression ||
        constructor === MemberExpression ||
        constructor === CallExpression ||
        constructor === AssignmentExpression ||
        constructor === Identifier ||
        constructor === Property ||
        constructor === ExportNamedDeclaration ||
        constructor === ExportDefaultDeclaration ||
        constructor === ExportSpecifier ||
        constructor === ImportDeclaration ||
        constructor === ImportNamespaceSpecifier ||
        constructor === BlockStatement ||
        constructor === ReturnStatement ||
        constructor === IfStatement ||
        constructor === TryStatement ||
        constructor === ThrowStatement ||
        constructor === BreakStatement ||
        constructor === ContinueStatement ||
        constructor === ForStatement ||
        constructor === WhileStatement ||
        constructor === DoWhileStatement ||
        constructor === ForInStatement ||
        constructor === ForOfStatement ||
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
        ArrayExpression,
        MemberExpression,
        CallExpression,
        AssignmentExpression,
        Identifier,
        Property,
        ExportNamedDeclaration,
        ExportDefaultDeclaration,
        ExportSpecifier,
        ImportDeclaration,
        ImportNamespaceSpecifier,
        BlockStatement,
        ReturnStatement,
        IfStatement,
        TryStatement,
        ThrowStatement,
        BreakStatement,
        ContinueStatement,
        ForStatement,
        WhileStatement,
        DoWhileStatement,
        ForInStatement,
        ForOfStatement,
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
    if (tagName === 'ArrayExpression') return ArrayExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'MemberExpression') return MemberExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'CallExpression') return CallExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'AssignmentExpression') return AssignmentExpression.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Identifier') return Identifier.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'Property') return Property.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ExportNamedDeclaration') return ExportNamedDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ExportDefaultDeclaration') return ExportDefaultDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ExportSpecifier') return ExportSpecifier.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ImportDeclaration') return ImportDeclaration.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ImportNamespaceSpecifier') return ImportNamespaceSpecifier.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BlockStatement') return BlockStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ReturnStatement') return ReturnStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'IfStatement') return IfStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'TryStatement') return TryStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ThrowStatement') return ThrowStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'BreakStatement') return BreakStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ContinueStatement') return ContinueStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ForStatement') return ForStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'WhileStatement') return WhileStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'DoWhileStatement') return DoWhileStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ForInStatement') return ForInStatement.fromFirestore(doc, decodeTimestamps)
    if (tagName === 'ForOfStatement') return ForOfStatement.fromFirestore(doc, decodeTimestamps)
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

ASTNode.wrap = (esTreeNode, parent = null) => {
    const type = esTreeNode?.type
    if (!type) return ASTNode.Other(esTreeNode || {}, parent)
    if (ASTNode['@@tagNames'].includes(type)) return ASTNode[type](esTreeNode, parent)
    return ASTNode.Other(esTreeNode, parent)
}

ASTNode.isASTNode = value => value && value['@@typeName'] === 'ASTNode'

export { ASTNode }
