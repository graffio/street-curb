// ABOUTME: Tests for @graffio/ast module
// ABOUTME: Verifies ASTNode wrapping, parent references, and backwards compatibility

import { test } from 'tap'
import { ASTNode, AST } from '../index.js'

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

test('Given ASTNode.wrap with different ESTree types', async t => {
    t.test('When wrapping a FunctionDeclaration', async t => {
        const wrapped = ASTNode.wrap({ type: 'FunctionDeclaration', id: { name: 'test' } })

        t.ok(ASTNode.FunctionDeclaration.is(wrapped), 'Then it should be a FunctionDeclaration variant')
        t.notOk(ASTNode.VariableDeclaration.is(wrapped), 'Then it should not match other variants')
    })

    t.test('When wrapping an unknown type', async t => {
        const wrapped = ASTNode.wrap({ type: 'SomeNewESTreeType' })

        t.ok(ASTNode.Other.is(wrapped), 'Then it should fall back to Other variant')
    })

    t.test('When wrapping null/undefined', async t => {
        const wrappedNull = ASTNode.wrap(null)
        const wrappedUndef = ASTNode.wrap(undefined)

        t.ok(ASTNode.Other.is(wrappedNull), 'Then null wraps to Other')
        t.ok(ASTNode.Other.is(wrappedUndef), 'Then undefined wraps to Other')
    })
})

test('Given AST.topLevel with a Program AST', async t => {
    t.test('When getting top-level statements', async t => {
        const topLevel = AST.topLevel(minimalAST)

        t.equal(topLevel.length, 2, 'Then it should return all top-level statements')
        t.ok(ASTNode.VariableDeclaration.is(topLevel[0]), 'Then first should be VariableDeclaration')
        t.ok(ASTNode.FunctionDeclaration.is(topLevel[1]), 'Then second should be FunctionDeclaration')
    })

    t.test('When checking parent references', async t => {
        const topLevel = AST.topLevel(minimalAST)
        const firstNode = topLevel[0]

        t.ok(firstNode.parent, 'Then wrapped nodes should have parent')
        t.equal(firstNode.parent.esTree.type, 'Program', 'Then parent should be the Program')
    })
})

test('Given AST accessors with wrapped nodes', async t => {
    t.test('When using location accessors', async t => {
        const topLevel = AST.topLevel(minimalAST)
        const varDecl = topLevel[0]

        t.equal(AST.line(varDecl), 1, 'Then line() returns correct line')
        t.equal(AST.startLine(varDecl), 1, 'Then startLine() returns correct line')
    })

    t.test('When using property accessors', async t => {
        const topLevel = AST.topLevel(minimalAST)
        const varDecl = topLevel[0]

        const declarations = AST.declarations(varDecl)
        t.equal(declarations.length, 1, 'Then declarations() returns array')
        t.equal(AST.variableName(varDecl), 'x', 'Then variableName() extracts name')
    })
})
