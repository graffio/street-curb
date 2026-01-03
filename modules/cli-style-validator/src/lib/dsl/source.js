// ABOUTME: Query interface for source code as lines
// ABOUTME: Enables searching for comments and patterns relative to AST positions
// API documentation: see README.md in this directory

import { AST } from './ast.js'

// Collection of source lines with position and query methods
// @sig Lines :: ([String], Boolean?) -> Lines
const Lines = (lines, hasPositions = false) => ({
    // === Position Methods (available when created from source) ===

    // Get single line by number (1-indexed to match AST loc)
    // @sig at :: Number -> String
    at: lineNumber => lines[lineNumber - 1] ?? '',

    // Get lines before a position, in reverse order (nearest first)
    // @sig before :: Number -> Lines
    before: lineNumber => Lines(lines.slice(0, lineNumber - 1).reverse()),

    // Get lines after a position
    // @sig after :: Number -> Lines
    after: lineNumber => Lines(lines.slice(lineNumber)),

    // Get lines between two positions (exclusive of both)
    // @sig between :: (Number, Number) -> Lines
    between: (startLine, endLine) => Lines(lines.slice(startLine, endLine - 1)),

    // Lines before an AST node (uses effective line for parent context)
    // @sig beforeNode :: (ASTNode, ASTNode?) -> Lines
    beforeNode: (node, parent) => {
        const line = AST.effectiveLine(node, parent)
        return Lines(lines.slice(0, line - 1).reverse())
    },

    // Get all lines (returns self, useful for chaining from entry point)
    // @sig all :: () -> Lines
    all: () => Lines(lines),

    // Total line count
    // @sig lineCount :: () -> Number
    lineCount: () => lines.length,

    // === Collection Methods (always available) ===

    // Find first line matching predicate
    // @sig find :: (String -> Boolean) -> String?
    find: predicate => lines.find(predicate),

    // Find index of first matching line
    // @sig findIndex :: (String -> Boolean) -> Number
    findIndex: predicate => lines.findIndex(predicate),

    // Check if any line matches
    // @sig some :: (String -> Boolean) -> Boolean
    some: predicate => lines.some(predicate),

    // Check if all lines match
    // @sig every :: (String -> Boolean) -> Boolean
    every: predicate => lines.every(predicate),

    // Filter lines
    // @sig filter :: (String -> Boolean) -> Lines
    filter: predicate => Lines(lines.filter(predicate)),

    // Take lines until predicate matches (exclusive)
    // @sig takeUntil :: (String -> Boolean) -> Lines
    takeUntil: predicate => {
        const index = lines.findIndex(predicate)
        return Lines(index === -1 ? lines : lines.slice(0, index))
    },

    // Take lines while predicate matches
    // @sig takeWhile :: (String -> Boolean) -> Lines
    takeWhile: predicate => {
        const index = lines.findIndex(line => !predicate(line))
        return Lines(index === -1 ? lines : lines.slice(0, index))
    },

    // Get underlying array
    // @sig toArray :: () -> [String]
    toArray: () => lines,

    // Count lines, optionally filtered
    // @sig count :: (String -> Boolean)? -> Number
    count: predicate => (predicate ? lines.filter(predicate).length : lines.length),

    // Get first line or null
    // @sig first :: () -> String?
    first: () => lines[0] ?? null,

    // Map over lines
    // @sig map :: (String -> T) -> [T]
    map: fn => lines.map(fn),
})

// Entry point: create Lines from source code string
// @sig from :: String -> Lines
Lines.from = sourceCode => Lines(sourceCode.split('\n'), true)

export { Lines }
