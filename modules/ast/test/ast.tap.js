// ABOUTME: Tests for @graffio/ast module
// ABOUTME: Verifies AstNode wrapping, parent references, and backwards compatibility

import { test } from 'tap'
import { AstNode, Ast } from '../index.js'

// Minimal ESTree structures for testing (no parser needed)
const minimalAST = {
    type: 'Program',
    body: [
        {
            type: 'VariableDeclaration',
            declarations: [{ type: 'VariableDeclarator', id: { type: 'Identifier', name: 'x' }, init: null }],
            kind: 'const',
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 10 } },
        },
        {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: 'foo' },
            body: { type: 'BlockStatement', body: [] },
            loc: { start: { line: 2, column: 0 }, end: { line: 2, column: 20 } },
        },
    ],
}

test('Given AstNode.wrap with different ESTree types', async t => {
    t.test('When wrapping a FunctionDeclaration', async t => {
        const wrapped = AstNode.wrap({ type: 'FunctionDeclaration', id: { name: 'test' } })

        t.ok(AstNode.FunctionDeclaration.is(wrapped), 'Then it should be a FunctionDeclaration variant')
        t.notOk(AstNode.VariableDeclaration.is(wrapped), 'Then it should not match other variants')
    })

    t.test('When wrapping an unknown type', async t => {
        const wrapped = AstNode.wrap({ type: 'SomeNewESTreeType' })

        t.ok(AstNode.Other.is(wrapped), 'Then it should fall back to Other variant')
    })

    t.test('When wrapping null/undefined', async t => {
        const wrappedNull = AstNode.wrap(null)
        const wrappedUndef = AstNode.wrap(undefined)

        t.ok(AstNode.Other.is(wrappedNull), 'Then null wraps to Other')
        t.ok(AstNode.Other.is(wrappedUndef), 'Then undefined wraps to Other')
    })
})

test('Given Ast.topLevelStatements with a Program AST', async t => {
    t.test('When getting top-level statements', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)

        t.equal(topLevel.length, 2, 'Then it should return all top-level statements')
        t.ok(AstNode.VariableDeclaration.is(topLevel[0]), 'Then first should be VariableDeclaration')
        t.ok(AstNode.FunctionDeclaration.is(topLevel[1]), 'Then second should be FunctionDeclaration')
    })

    t.test('When checking parent references', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const firstNode = topLevel[0]

        t.ok(firstNode.parent, 'Then wrapped nodes should have parent')
        t.equal(firstNode.parent.esTree.type, 'Program', 'Then parent should be the Program')
    })
})

test('Given AST helper functions', async t => {
    t.test('When using effectiveLine', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const varDecl = topLevel[0]

        t.equal(Ast.associatedCommentLine(varDecl), 1, 'Then associatedCommentLine returns start line for top-level')
    })

    t.test('When using children', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const varDecl = topLevel[0]

        const children = Ast.children(varDecl)
        t.ok(Array.isArray(children), 'Then children returns array')
        t.ok(children.length > 0, 'Then VariableDeclaration has children')
        t.ok(AstNode.VariableDeclarator.is(children[0]), 'Then first child is VariableDeclarator')
    })
})

test('Given AstNode instance properties', async t => {
    t.test('When using shared location properties', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const varDecl = topLevel[0]
        const funcDecl = topLevel[1]

        t.equal(varDecl.line, 1, 'Then line returns start line')
        t.equal(varDecl.startLine, 1, 'Then startLine returns start line')
        t.equal(varDecl.endLine, 1, 'Then endLine returns end line')
        t.equal(varDecl.column, 1, 'Then column returns 1-based column')
        t.equal(varDecl.lineCount, 1, 'Then lineCount returns lines spanned')
        t.ok(varDecl.isSameAs(varDecl), 'Then isSameAs() returns true for same node')
        t.notOk(varDecl.isSameAs(funcDecl), 'Then isSameAs() returns false for different nodes')
    })

    t.test('When using VariableDeclaration properties', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const varDecl = topLevel[0]

        t.equal(varDecl.declarations.length, 1, 'Then declarations returns array of wrapped nodes')
        t.ok(AstNode.VariableDeclarator.is(varDecl.declarations[0]), 'Then declarator is VariableDeclarator')
        t.equal(varDecl.firstName, 'x', 'Then firstName returns first declarator name')
    })

    t.test('When using VariableDeclarator properties', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const varDecl = topLevel[0]
        const declarator = varDecl.declarations[0]

        t.equal(declarator.name, 'x', 'Then name returns identifier name')
        t.equal(declarator.value, undefined, 'Then value returns undefined when no init')
    })

    t.test('When using FunctionDeclaration properties', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const funcDecl = topLevel[1]

        t.equal(funcDecl.name, 'foo', 'Then name returns function name')
        t.ok(funcDecl.body, 'Then body returns wrapped node')
        t.ok(AstNode.BlockStatement.is(funcDecl.body), 'Then body is BlockStatement')
    })

    t.test('When using BlockStatement properties', async t => {
        const topLevel = Ast.topLevelStatements(minimalAST)
        const funcDecl = topLevel[1]
        const block = funcDecl.body

        t.ok(Array.isArray(block.body), 'Then body returns array')
        t.equal(block.body.length, 0, 'Then empty block has no statements')
    })
})
