// ABOUTME: Adds instance methods to AstNode variants
// ABOUTME: Extends generated TaggedSum with semantic accessors that hide ESTree structure

import { ASTNode } from './types/ast-node.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

// Shared prototype properties (available on all variants)
Object.defineProperties(ASTNode.prototype, {
    line: {
        get() {
            return this.esTree.loc?.start?.line ?? 0
        },
        enumerable: false,
    },
    startLine: {
        get() {
            return this.line
        },
        enumerable: false,
    },
    endLine: {
        get() {
            return this.esTree.loc?.end?.line ?? 0
        },
        enumerable: false,
    },
    column: {
        get() {
            return (this.esTree.loc?.start?.column ?? 0) + 1
        },
        enumerable: false,
    },
    lineCount: {
        get() {
            const loc = this.esTree.loc
            if (!loc) return 0
            return loc.end.line - loc.start.line + 1
        },
        enumerable: false,
    },

    // Stable identity for Set/Map keys (wrapped nodes are different instances)
    identity: {
        get() {
            return this.esTree
        },
        enumerable: false,
    },
})

// Identity comparison as method (takes parameter)
ASTNode.prototype.isSameAs = function (other) {
    return this.esTree === other?.esTree
}

// Variant-specific prototype properties

// --- Identifier ---
Object.defineProperties(ASTNode.Identifier.prototype, {
    name: {
        get() {
            return this.esTree.name
        },
        enumerable: false,
    },
})

// --- FunctionDeclaration ---
Object.defineProperties(ASTNode.FunctionDeclaration.prototype, {
    name: {
        get() {
            return this.esTree.id?.name
        },
        enumerable: false,
    },
    body: {
        get() {
            const body = this.esTree.body
            return body ? ASTNode.wrap(body, this) : undefined
        },
        enumerable: false,
    },
})

// --- FunctionExpression ---
Object.defineProperties(ASTNode.FunctionExpression.prototype, {
    name: {
        get() {
            return this.esTree.id?.name
        },
        enumerable: false,
    },
    body: {
        get() {
            const body = this.esTree.body
            return body ? ASTNode.wrap(body, this) : undefined
        },
        enumerable: false,
    },
})

// --- ArrowFunctionExpression ---
Object.defineProperties(ASTNode.ArrowFunctionExpression.prototype, {
    name: {
        get() {
            return undefined
        },
        enumerable: false,
    },
    body: {
        get() {
            const body = this.esTree.body
            return body ? ASTNode.wrap(body, this) : undefined
        },
        enumerable: false,
    },
    isExpression: {
        get() {
            return this.esTree.expression === true
        },
        enumerable: false,
    },
})

// --- VariableDeclaration ---
Object.defineProperties(ASTNode.VariableDeclaration.prototype, {
    declarations: {
        get() {
            return (this.esTree.declarations || []).map(d => ASTNode.wrap(d, this))
        },
        enumerable: false,
    },
    firstName: {
        get() {
            return this.esTree.declarations?.[0]?.id?.name
        },
        enumerable: false,
    },
    firstValue: {
        get() {
            const init = this.esTree.declarations?.[0]?.init
            return init ? ASTNode.wrap(init, this) : undefined
        },
        enumerable: false,
    },
})

// --- VariableDeclarator ---
Object.defineProperties(ASTNode.VariableDeclarator.prototype, {
    name: {
        get() {
            return this.esTree.id?.name
        },
        enumerable: false,
    },
    value: {
        get() {
            const init = this.esTree.init
            return init ? ASTNode.wrap(init, this) : undefined
        },
        enumerable: false,
    },
})

// --- MemberExpression ---
Object.defineProperties(ASTNode.MemberExpression.prototype, {
    base: {
        get() {
            const obj = this.esTree.object
            return obj ? ASTNode.wrap(obj, this) : undefined
        },
        enumerable: false,
    },
    member: {
        get() {
            const prop = this.esTree.property
            return prop ? ASTNode.wrap(prop, this) : undefined
        },
        enumerable: false,
    },
    isComputed: {
        get() {
            return this.esTree.computed === true
        },
        enumerable: false,
    },
})

// --- CallExpression ---
Object.defineProperties(ASTNode.CallExpression.prototype, {
    target: {
        get() {
            const callee = this.esTree.callee
            return callee ? ASTNode.wrap(callee, this) : undefined
        },
        enumerable: false,
    },
})

// --- AssignmentExpression ---
Object.defineProperties(ASTNode.AssignmentExpression.prototype, {
    target: {
        get() {
            const left = this.esTree.left
            return left ? ASTNode.wrap(left, this) : undefined
        },
        enumerable: false,
    },
})

// --- BlockStatement ---
Object.defineProperties(ASTNode.BlockStatement.prototype, {
    body: {
        get() {
            return (this.esTree.body || []).map(stmt => ASTNode.wrap(stmt, this))
        },
        enumerable: false,
    },
})

// --- ReturnStatement ---
Object.defineProperties(ASTNode.ReturnStatement.prototype, {
    value: {
        get() {
            const arg = this.esTree.argument
            return arg ? ASTNode.wrap(arg, this) : undefined
        },
        enumerable: false,
    },
})

// --- ObjectExpression ---
Object.defineProperties(ASTNode.ObjectExpression.prototype, {
    properties: {
        get() {
            return (this.esTree.properties || []).map(p => ASTNode.wrap(p, this))
        },
        enumerable: false,
    },
})

// --- Property ---
Object.defineProperties(ASTNode.Property.prototype, {
    name: {
        get() {
            return this.esTree.key?.name || this.esTree.key?.value
        },
        enumerable: false,
    },
    value: {
        get() {
            const val = this.esTree.value
            return val ? ASTNode.wrap(val, this) : undefined
        },
        enumerable: false,
    },
})

// --- ExportNamedDeclaration ---
Object.defineProperties(ASTNode.ExportNamedDeclaration.prototype, {
    specifiers: {
        get() {
            return (this.esTree.specifiers || []).map(s => ASTNode.wrap(s, this))
        },
        enumerable: false,
    },
})

// --- ExportDefaultDeclaration ---
Object.defineProperties(ASTNode.ExportDefaultDeclaration.prototype, {
    declarationName: {
        get() {
            return this.esTree.declaration?.name
        },
        enumerable: false,
    },
})

// --- ExportSpecifier ---
Object.defineProperties(ASTNode.ExportSpecifier.prototype, {
    exportedName: {
        get() {
            return this.esTree.exported?.name
        },
        enumerable: false,
    },
    localName: {
        get() {
            return this.esTree.local?.name
        },
        enumerable: false,
    },
})

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { ASTNode as AstNode }
