// ABOUTME: Query interface for source code as lines - extends Array with position methods
// ABOUTME: Enables searching for comments and patterns relative to AST positions

import { AST } from './ast.js'

// Create a Lines array from string items with position and query methods
// @sig Lines :: [String] -> Lines
const Lines = items => {
    const array = Array.from(items)
    Object.setPrototypeOf(array, LinesPrototype)
    return array
}

// Entry point: create Lines from source code string
// @sig Lines.from :: String -> Lines
Lines.from = sourceCode => Lines(sourceCode.split('\n'))

// Check if value is a Lines array
// @sig Lines.is :: Any -> Boolean
Lines.is = o => Object.getPrototypeOf(o) === LinesPrototype

const LinesPrototype = Object.create(Array.prototype)

// Get single line by number (1-indexed to match AST loc)
// @sig at :: Number -> String
LinesPrototype.at = function (lineNumber) {
    return this[lineNumber - 1] ?? ''
}

// Get lines before a position, in reverse order (nearest first)
// @sig before :: Number -> Lines
LinesPrototype.before = function (lineNumber) {
    return Lines(this.slice(0, lineNumber - 1).reverse())
}

// Get lines after a position
// @sig after :: Number -> Lines
LinesPrototype.after = function (lineNumber) {
    return Lines(this.slice(lineNumber))
}

// Get lines between two positions (exclusive of both)
// @sig between :: (Number, Number) -> Lines
LinesPrototype.between = function (startLine, endLine) {
    return Lines(this.slice(startLine, endLine - 1))
}

// Lines before an AST node (uses effective line for parent context)
// @sig beforeNode :: (ASTNode, ASTNode?) -> Lines
LinesPrototype.beforeNode = function (node, parent) {
    const line = AST.effectiveLine(node, parent)
    return Lines(this.slice(0, line - 1).reverse())
}

// Filter lines (override to return Lines instead of Array)
// @sig filter :: (String -> Boolean) -> Lines
LinesPrototype.filter = function (predicate) {
    return Lines(Array.prototype.filter.call(this, predicate))
}

// Take lines until predicate matches (exclusive)
// @sig takeUntil :: (String -> Boolean) -> Lines
LinesPrototype.takeUntil = function (predicate) {
    const index = this.findIndex(predicate)
    return Lines(index === -1 ? this : this.slice(0, index))
}

// Take lines while predicate matches
// @sig takeWhile :: (String -> Boolean) -> Lines
LinesPrototype.takeWhile = function (predicate) {
    const index = this.findIndex(line => !predicate(line))
    return Lines(index === -1 ? this : this.slice(0, index))
}

// Get first line or null
// @sig first :: () -> String?
LinesPrototype.first = function () {
    return this[0] ?? null
}

export { Lines }
