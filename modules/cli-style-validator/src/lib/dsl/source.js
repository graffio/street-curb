// ABOUTME: Query interface for source code as lines
// ABOUTME: Enables searching for comments and patterns relative to AST positions
// API documentation: see README.md in this directory

import { AST } from './ast.js'

// Query over an array of lines with search operations
// @sig LineQuery :: [String] -> LineQueryObject
const LineQuery = lines => ({
    // Find first line matching predicate
    // @sig find :: (String -> Boolean) -> String?
    find: predicate => lines.find(predicate),

    // Find index of first matching line (relative to query, not original source)
    // @sig findIndex :: (String -> Boolean) -> Number
    findIndex: predicate => lines.findIndex(predicate),

    // Check if any line matches
    // @sig some :: (String -> Boolean) -> Boolean
    some: predicate => lines.some(predicate),

    // Check if all lines match
    // @sig every :: (String -> Boolean) -> Boolean
    every: predicate => lines.every(predicate),

    // Filter lines
    // @sig filter :: (String -> Boolean) -> LineQuery
    filter: predicate => LineQuery(lines.filter(predicate)),

    // Take lines until predicate matches (exclusive)
    // @sig takeUntil :: (String -> Boolean) -> LineQuery
    takeUntil: predicate => {
        const idx = lines.findIndex(predicate)
        return LineQuery(idx === -1 ? lines : lines.slice(0, idx))
    },

    // Take lines while predicate matches
    // @sig takeWhile :: (String -> Boolean) -> LineQuery
    takeWhile: predicate => {
        const idx = lines.findIndex(l => !predicate(l))
        return LineQuery(idx === -1 ? lines : lines.slice(0, idx))
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

// Source query object for a source code string
// @sig SourceQuery :: [String] -> SourceQueryObject
const SourceQuery = lines => ({
    // Get single line (1-indexed to match AST loc)
    // @sig at :: Number -> String
    at: lineNum => lines[lineNum - 1] ?? '',

    // Get lines before a position, in reverse order (nearest first)
    // @sig before :: Number -> LineQuery
    before: lineNum => LineQuery(lines.slice(0, lineNum - 1).reverse()),

    // Get lines after a position
    // @sig after :: Number -> LineQuery
    after: lineNum => LineQuery(lines.slice(lineNum)),

    // Get lines between two positions (exclusive of both)
    // @sig between :: (Number, Number) -> LineQuery
    between: (startLine, endLine) => LineQuery(lines.slice(startLine, endLine - 1)),

    // Get all lines as a query
    // @sig all :: () -> LineQuery
    all: () => LineQuery(lines),

    // Lines before an AST node (uses effective line for parent context)
    // @sig beforeNode :: (ASTNode, ASTNode?) -> LineQuery
    beforeNode: (node, parent) => {
        const line = AST.effectiveLine(node, parent)
        return LineQuery(lines.slice(0, line - 1).reverse())
    },

    // Total line count
    // @sig lineCount :: () -> Number
    lineCount: () => lines.length,
})

const Source = {
    // Create a source query object from source code string
    // @sig from :: String -> SourceQuery
    from: sourceCode => SourceQuery(sourceCode.split('\n')),
}

export { Source }
