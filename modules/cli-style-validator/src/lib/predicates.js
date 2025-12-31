// ABOUTME: Shared predicate functions for style validator rules
// ABOUTME: Unified file/AST predicates to avoid duplication across rules

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

// Check if a name is PascalCase (starts with uppercase, alphanumeric)
// @sig isPascalCase :: String -> Boolean
const isPascalCase = name => /^[A-Z][a-zA-Z0-9]*$/.test(name)

// Check if a node spans multiple lines
// @sig isMultilineNode :: ASTNode -> Boolean
const isMultilineNode = node => node.loc && node.loc.end.line > node.loc.start.line

// Check if function counts toward complexity (named or multi-line)
// Single-line anonymous callbacks (filter/map) don't add complexity
// @sig isComplexFunction :: ASTNode -> Boolean
const isComplexFunction = node => {
    if (!isFunctionNode(node)) return false
    if (node.id?.name) return true
    return isMultilineNode(node)
}

const PS = {
    isTestFile,
    isCommentLine,
    isFunctionNode,
    isFunctionDeclaration,
    isFunctionVariableDeclaration,
    isFunctionStatement,
    isGeneratedFile,
    isValidNode,
    isPascalCase,
    isMultilineNode,
    isComplexFunction,
}

export { PS }
