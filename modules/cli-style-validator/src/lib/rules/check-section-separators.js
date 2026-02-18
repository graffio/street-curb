// ABOUTME: Rule to enforce section separator format, presence, and ordering
// ABOUTME: Validates block-format separators, requires Exports section, checks canonical order

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const PRIORITY = 0 // Structural — fix first

// Canonical section order (skip any that are absent)
// prettier-ignore
const CANONICAL_ORDER = [
    'P', 'T', 'F', 'V', 'A', 'E',
    'Components',
    'Constants',
    'Actions',
    'Module-level state',
    'Exports',
]

const STANDARD_NAMES = new Set(CANONICAL_ORDER)

const SEPARATOR_PATTERN = /^\/\/ -{20,}/

const FORMAT_MSG = 'Section separator must use block format (5 lines: separator / blank / name / blank / separator).'
const ORDER_LABEL = 'P → T → F → V → A → E → Components → Constants → Actions → Module-level state → Exports'
const STANDARD_LABEL = 'P, T, F, V, A, E, Components, Constants, Actions, Module-level state, Exports'

const P = {
    // Check if a line is a separator line (20+ dashes)
    // @sig isSeparatorLine :: String -> Boolean
    isSeparatorLine: line => SEPARATOR_PATTERN.test(line.trim()),

    // Check if a line is a blank comment line (just "//")
    // @sig isBlankCommentLine :: String -> Boolean
    isBlankCommentLine: line => line.trim() === '//',

    // Check if a line is a section name comment (// SomeName)
    // @sig isSectionNameLine :: String -> Boolean
    isSectionNameLine: line => {
        const trimmed = line.trim()
        return trimmed.startsWith('//') && !P.isSeparatorLine(line) && !P.isBlankCommentLine(line)
    },

    // Check if a separator line also contains a section name (inline format)
    // @sig isInlineFormat :: String -> Boolean
    isInlineFormat: line => {
        const trimmed = line.trim()
        if (!SEPARATOR_PATTERN.test(trimmed)) return false
        const afterSlashes = trimmed.slice(2).trim()
        const withoutDashes = afterSlashes.replace(/-/g, '').trim()
        return withoutDashes.length > 0
    },

    // Check if a section name is standard
    // @sig isStandardName :: String -> Boolean
    isStandardName: name => STANDARD_NAMES.has(name),
}

const T = {
    // Extract section name from a comment line
    // @sig toSectionName :: String -> String
    toSectionName: line =>
        line
            .trim()
            .replace(/^\/\/\s*/, '')
            .trim(),

    // Convert a separator block to its canonical index (-1 if non-standard)
    // @sig toCanonicalIndex :: { name } -> Number
    toCanonicalIndex: block => CANONICAL_ORDER.indexOf(block.name),
}

const violation = FS.createViolation('section-separators', PRIORITY)

const F = {
    // Create a section-separators violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),

    // Create format violation for an invalid separator block
    // @sig createFormatViolation :: { line } -> Violation
    createFormatViolation: ({ line }) => F.createViolation(line, `${FORMAT_MSG} FIX: Convert to block format.`),

    // Create order violation for an out-of-order section
    // @sig createOrderViolation :: { line, name } -> Violation
    createOrderViolation: ({ line, name }) =>
        F.createViolation(
            line,
            `Section "${name}" is out of order. Expected: ${ORDER_LABEL}. FIX: Move to correct position.`,
        ),

    // Create non-standard name violation
    // @sig createNonStandardViolation :: { line, name } -> Violation
    createNonStandardViolation: ({ line, name }) => {
        const msg = `"${name}" is a non-standard section name. Standard: ${STANDARD_LABEL}.`
        return F.createViolation(
            line,
            `${msg} FIX: Use a standard name or add COMPLEXITY: section-separators exemption.`,
        )
    },
}

const V = {
    // Check format: every separator must be block format (5-line)
    // @sig checkFormat :: ([Block], [Violation]) -> Void
    checkFormat: (blocks, violations) =>
        blocks.filter(b => !b.valid).forEach(b => violations.push(F.createFormatViolation(b))),

    // Check presence: every non-test file must have an Exports section
    // @sig checkPresence :: ([Block], [Violation]) -> Void
    checkPresence: (blocks, violations) => {
        if (!blocks.some(b => b.name === 'Exports'))
            violations.push(
                F.createViolation(1, 'Missing required "Exports" section separator. FIX: Add an Exports section.'),
            )
    },

    // Check that a single block is not out of order relative to the previous one
    // @sig checkBlockOrder :: ([Number], [Block], Number, [Violation]) -> Void
    checkBlockOrder: (indices, standardBlocks, i, violations) => {
        if (i > 0 && indices[i] < indices[i - 1]) violations.push(F.createOrderViolation(standardBlocks[i]))
    },

    // Check order: standard section names must appear in canonical order
    // @sig checkOrder :: ([Block], [Violation]) -> Void
    checkOrder: (blocks, violations) => {
        const standardBlocks = blocks.filter(b => b.valid && P.isStandardName(b.name))
        const indices = standardBlocks.map(T.toCanonicalIndex)
        indices.forEach((_, i) => V.checkBlockOrder(indices, standardBlocks, i, violations))
    },

    // Check for non-standard section names
    // @sig checkStandardNames :: ([Block], [Violation]) -> Void
    checkStandardNames: (blocks, violations) =>
        blocks
            .filter(b => b.valid && !P.isStandardName(b.name))
            .forEach(b => violations.push(F.createNonStandardViolation(b))),

    // Main validation entry point
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        const blocks = A.collectSeparatorBlocks(sourceCode.split('\n'))
        const violations = []

        V.checkFormat(blocks, violations)
        V.checkPresence(blocks, violations)
        V.checkOrder(blocks, violations)
        V.checkStandardNames(blocks, violations)

        return violations
    },
}

const A = {
    // Process a single line for separator block detection
    // @sig processLine :: ([Block], [String], String, Number) -> [Block]
    processLine: (blocks, lines, line, i) => {
        if (!P.isSeparatorLine(line)) return blocks

        if (P.isInlineFormat(line)) {
            blocks.push({ line: i + 1, name: T.toSectionName(line), valid: false })
            return blocks
        }

        const { length } = lines
        const hasBlock =
            i + 4 < length &&
            P.isBlankCommentLine(lines[i + 1]) &&
            P.isSectionNameLine(lines[i + 2]) &&
            P.isBlankCommentLine(lines[i + 3]) &&
            P.isSeparatorLine(lines[i + 4])
        if (hasBlock) blocks.push({ line: i + 1, name: T.toSectionName(lines[i + 2]), valid: true })

        return blocks
    },

    // Find all separator blocks in source code
    // @sig collectSeparatorBlocks :: [String] -> [Block]
    collectSeparatorBlocks: lines => lines.reduce((blocks, line, i) => A.processLine(blocks, lines, line, i), []),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run section-separators rule with COMPLEXITY exemption support
// @sig checkSectionSeparators :: (AST?, String, String) -> [Violation]
const checkSectionSeparators = (ast, sourceCode, filePath) =>
    FS.withExemptions('section-separators', V.check, ast, sourceCode, filePath)
export { checkSectionSeparators }
