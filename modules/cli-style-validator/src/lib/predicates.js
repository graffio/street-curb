// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules
// COMPLEXITY: Shared module pattern - functions defined individually then exported via PS namespace

// Check if file is a test file that should skip validation
// Unified version: includes .tap.js, .test.js, .integration-test.js, and /test/ directory
// @sig isTestFile :: String -> Boolean
const isTestFile = filePath =>
    filePath.includes('.tap.js') ||
    filePath.includes('.test.js') ||
    filePath.includes('.integration-test.js') ||
    filePath.includes('/test/')

// Check if a line is a comment line
// Unified version: includes //, /*, *, and */ patterns
// @sig isCommentLine :: String -> Boolean
const isCommentLine = line => {
    const trimmed = line.trim()
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/')
}

// Check if a node represents a function (declaration, expression, or arrow)
// @sig isFunctionNode :: ASTNode -> Boolean
const isFunctionNode = node =>
    node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression'

// Check if a node is a function declaration statement
// @sig isFunctionDeclaration :: ASTNode -> Boolean
const isFunctionDeclaration = node => node.type === 'FunctionDeclaration'

// Check if a node is a variable declaration with a function expression
// @sig isFunctionVariableDeclaration :: ASTNode -> Boolean
const isFunctionVariableDeclaration = node =>
    node.type === 'VariableDeclaration' && node.declarations.some(d => d.init && isFunctionNode(d.init))

// Check if a node is a function statement (declaration or variable with function)
// @sig isFunctionStatement :: ASTNode -> Boolean
const isFunctionStatement = node => isFunctionDeclaration(node) || isFunctionVariableDeclaration(node)

// Check if source code is from a generated file
// @sig isGeneratedFile :: String -> Boolean
const isGeneratedFile = sourceCode => {
    const markers = ['do not edit ' + 'manually', 'Auto-' + 'generated']
    return markers.some(marker => sourceCode.includes(marker))
}

// Check if node is valid for traversal (has type property)
// @sig isValidNode :: Any -> Boolean
const isValidNode = node => node && typeof node === 'object' && node.type

// Check if node is a block statement
// @sig isBlockStatement :: ASTNode -> Boolean
const isBlockStatement = node => node.type === 'BlockStatement'

// Check if a name is PascalCase (starts with uppercase, alphanumeric)
// @sig isPascalCase :: String -> Boolean
const isPascalCase = name => /^[A-Z][a-zA-Z0-9]*$/.test(name)

// Check if a node spans multiple lines
// @sig isMultilineNode :: ASTNode -> Boolean
const isMultilineNode = node => node.loc && node.loc.end.line > node.loc.start.line

// Check if function counts toward complexity
// @sig isComplexFunction :: ASTNode -> Boolean
const isComplexFunction = node => isFunctionNode(node)

// Check if node is a function with a block body (not expression)
// @sig isFunctionWithBlockBody :: ASTNode -> Boolean
const isFunctionWithBlockBody = node => isFunctionNode(node) && node.body?.type === 'BlockStatement'

// Check if statement returns JSX element or fragment
// @sig hasJSXReturnStatement :: Statement -> Boolean
const hasJSXReturnStatement = stmt => {
    if (stmt.type !== 'ReturnStatement' || !stmt.argument) return false
    return stmt.argument.type === 'JSXElement' || stmt.argument.type === 'JSXFragment'
}

// Check if function returns JSX (arrow expression or block return)
// @sig isJSXFunction :: ASTNode -> Boolean
const isJSXFunction = node => {
    if (!node.body) return false
    if (node.expression && (node.body.type === 'JSXElement' || node.body.type === 'JSXFragment')) return true
    if (node.body.type === 'BlockStatement') return node.body.body.some(hasJSXReturnStatement)
    return false
}

// Check if source code has a COMPLEXITY comment justifying its structure
// @sig hasComplexityComment :: String -> Boolean
const hasComplexityComment = sourceCode => /\/\/\s*COMPLEXITY:/.test(sourceCode)

// Check if function is the inner part of a curried function (body of another arrow)
// @sig isInnerCurriedFunction :: (ASTNode, ASTNode?) -> Boolean
const isInnerCurriedFunction = (node, parent) =>
    parent?.type === 'ArrowFunctionExpression' && parent.body === node && isFunctionNode(node)

// Strip comment markers (//, /*, *, */) from a line to get content
// @sig toCommentContent :: String -> String
const toCommentContent = line =>
    line
        .trim()
        .replace(/^\/\*\*?/, '')
        .replace(/^\*\//, '')
        .replace(/^\/\//, '')
        .replace(/^\*/, '')

// Check if line is a prettier-ignore or eslint directive comment
// @sig isDirectiveComment :: String -> Boolean
const isDirectiveComment = line => {
    const content = toCommentContent(line).trim().toLowerCase()
    return content.startsWith('prettier-ignore') || content.startsWith('eslint-')
}

// Check if line is not a comment (actual code or empty)
// @sig isNonCommentLine :: String -> Boolean
const isNonCommentLine = line => {
    const trimmed = line.trim()
    return trimmed && !isCommentLine(trimmed)
}

const PS = {
    hasComplexityComment,
    hasJSXReturnStatement,
    isBlockStatement,
    isCommentLine,
    isNonCommentLine,
    isComplexFunction,
    isDirectiveComment,
    isFunctionDeclaration,
    isFunctionNode,
    isFunctionStatement,
    isFunctionVariableDeclaration,
    isFunctionWithBlockBody,
    isGeneratedFile,
    isInnerCurriedFunction,
    isJSXFunction,
    isMultilineNode,
    isPascalCase,
    isTestFile,
    isValidNode,
    toCommentContent,
}

export { PS }
