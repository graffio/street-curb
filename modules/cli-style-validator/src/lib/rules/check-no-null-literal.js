// ABOUTME: Rule to ban null literals from source code
// ABOUTME: Flags any use of the null keyword to enforce undefined as the sole absent value

import { AST } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if file is a boundary utility that must handle null (e.g., isNil, type, clone, equals)
    // @sig isBoundaryFile :: String -> Boolean
    isBoundaryFile: filePath => BOUNDARY_PATTERNS.some(pattern => filePath.includes(pattern)),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create a no-null-literal violation for a given line
    // @sig createViolation :: Number -> Violation
    createViolation: line =>
        violation(
            line,
            1,
            'null literal is banned. FIX: Use undefined, omit the field, or use isNil() at system boundaries.',
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Check source code for null literals by walking the AST
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode) || P.isBoundaryFile(filePath)) return []

        return AST.from(ast)
            .filter(node => {
                const { type, raw } = node.esTree
                return type === 'Literal' && raw === 'null'
            })
            .map(node => F.createViolation(node.line))
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 7
const violation = FS.createViolation('no-null-literal', PRIORITY)

// Files that must handle null: boundary utilities, typeof guards, SQL-facing modules, and
// modules with pre-existing validator violations that block null→undefined migration
const BOUNDARY_PATTERNS = [
    'ramda-like/isNil.js',
    'ramda-like/type.js',
    'ramda-like/clone.js',
    'ramda-like/equals.js',
    'ramda-like/internal/set.js',
    'ramda-like/internal/index-of.js',
    'ramda-like/diff-objects.js',
    'ramda-like/path.js',
    'apply-sort.js',
    'apply-filter.js',
    'ast/src/',
    'cli-type-generator/src/',
    'cli-qif-to-sqlite/src/',
]

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run no-null-literal rule with COMPLEXITY exemption support
// @sig checkNoNullLiteral :: (AST?, String, String) -> [Violation]
const checkNoNullLiteral = (ast, sourceCode, filePath) =>
    FS.withExemptions('no-null-literal', V.check, ast, sourceCode, filePath)
export { checkNoNullLiteral }
