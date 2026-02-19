// ABOUTME: Rule to enforce section separator format, presence, and ordering
// ABOUTME: Validates block-format separators, requires sections for detected declaration kinds, checks canonical order

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// P
//
// ---------------------------------------------------------------------------------------------------------------------

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

    // Check if a section name is standard (accepts both short and full cohesion group names)
    // @sig isStandardName :: String -> Boolean
    isStandardName: name => STANDARD_NAMES.has(name),

    // Check if a line declares a cohesion group object (const P = {, const F = {, etc.)
    // @sig isCohesionGroupDeclaration :: String -> Boolean
    isCohesionGroupDeclaration: line => COHESION_GROUP_PATTERN.test(line.trim()),

    // Check if a line declares an UPPER_CASE constant (const FOO_BAR = ...)
    // @sig isUpperCaseConstant :: String -> Boolean
    isUpperCaseConstant: line => UPPER_CASE_CONST_PATTERN.test(line.trim()),

    // Check if a line declares a PascalCase arrow function component (const MyComp = (...) =>)
    // @sig isComponentDeclaration :: String -> Boolean
    isComponentDeclaration: line => COMPONENT_PATTERN.test(line.trim()),

    // Check if 2+ PascalCase component declarations exist before the Exports section
    // @sig hasPreExportComponents :: [String] -> Boolean
    hasPreExportComponents: lines => {
        const exportsStart = T.toExportsLineIndex(lines)
        const preExportLines = exportsStart === -1 ? lines : lines.slice(0, exportsStart)
        return preExportLines.filter(P.isComponentDeclaration).length >= 2
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// T
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Resolve short cohesion group name to full name (P→Predicates, E→Effects, etc.)
    // @sig toFullName :: String -> String
    toFullName: name => ALIASES[name] ?? name,

    // Extract section name from a comment line
    // @sig toSectionName :: String -> String
    toSectionName: line =>
        line
            .trim()
            .replace(/^\/\/\s*/, '')
            .trim(),

    // Convert a separator block to its canonical index — normalizes short names first
    // @sig toCanonicalIndex :: { name } -> Number
    toCanonicalIndex: block => CANONICAL_ORDER.indexOf(T.toFullName(block.name)),

    // Extract the cohesion group letter from a declaration line (const X = { → X)
    // @sig toCohesionLetter :: String -> String
    toCohesionLetter: line => line.trim().charAt(6),

    // Find the line index of the Exports section separator (first separator followed by "Exports" name)
    // @sig toExportsLineIndex :: [String] -> Number
    toExportsLineIndex: lines =>
        lines.findIndex(
            (line, i) => P.isSeparatorLine(line) && i + 2 < lines.length && T.toSectionName(lines[i + 2]) === 'Exports',
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// F
//
// ---------------------------------------------------------------------------------------------------------------------

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

    // Create missing section violation for a required section that was not found
    // @sig createMissingSectionViolation :: String -> Violation
    createMissingSectionViolation: name =>
        F.createViolation(1, `Missing required "${name}" section separator. FIX: Add a ${name} section.`),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// V
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Check format: every separator must be block format (5-line)
    // @sig checkFormat :: ([Block], [Violation]) -> Void
    checkFormat: (blocks, violations) =>
        blocks.filter(b => !b.valid).forEach(b => violations.push(F.createFormatViolation(b))),

    // Check that all required sections exist — Exports always, plus sections for detected declaration kinds
    // @sig checkRequiredSections :: ([Block], [Violation], Set<String>) -> Void
    checkRequiredSections: (blocks, violations, requiredSections) => {
        const presentNames = new Set(blocks.filter(b => b.valid).map(b => T.toFullName(b.name)))
        const missing = [...requiredSections].filter(name => !presentNames.has(name))
        missing.forEach(name => violations.push(F.createMissingSectionViolation(name)))
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

        const lines = sourceCode.split('\n')
        const blocks = A.collectSeparatorBlocks(lines)
        const requiredSections = A.collectRequiredSections(lines, filePath)
        const violations = []

        V.checkFormat(blocks, violations)
        V.checkRequiredSections(blocks, violations, requiredSections)
        V.checkOrder(blocks, violations)
        V.checkStandardNames(blocks, violations)

        return violations
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// A
//
// ---------------------------------------------------------------------------------------------------------------------

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

    // Scan source lines to determine which sections are required based on declaration kinds
    // Exports always required. Cohesion groups → full name.
    // UPPER_CASE → Constants. 2+ PascalCase before Exports in .jsx → Components.
    // @sig collectRequiredSections :: ([String], String) -> Set<String>
    collectRequiredSections: (lines, filePath) => {
        const { isCohesionGroupDeclaration, isUpperCaseConstant } = P
        const required = new Set(['Exports'])
        const isJsx = filePath.endsWith('.jsx')

        lines.filter(isCohesionGroupDeclaration).forEach(line => required.add(ALIASES[T.toCohesionLetter(line)]))
        if (lines.some(isUpperCaseConstant)) required.add('Constants')
        if (isJsx && P.hasPreExportComponents(lines)) required.add('Components')

        return required
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 0 // Structural — fix first

// Canonical section order (skip any that are absent) — accepts both short and full cohesion group names
// prettier-ignore
const CANONICAL_ORDER = [
    'Predicates', 'Transformers', 'Functions', 'Validators', 'Aggregators', 'Effects',
    'Components',
    'Constants',
    'Actions',
    'Module-level state',
    'Exports',
]

// Aliases — short cohesion group names and alternate full names, all map to canonical names
// prettier-ignore
const ALIASES = { P: 'Predicates', T: 'Transformers', F: 'Functions', V: 'Validators', A: 'Aggregators', E: 'Effects', Factories: 'Functions' }

const STANDARD_NAMES = new Set([...CANONICAL_ORDER, ...Object.keys(ALIASES)])

const SEPARATOR_PATTERN = /^\/\/ -{20,}/

// Detection patterns for section presence enforcement (pre-compiled)
const COHESION_GROUP_PATTERN = /^const [PTFVAE] = \{/
const UPPER_CASE_CONST_PATTERN = /^const [A-Z][A-Z_0-9]+ /
const COMPONENT_PATTERN = /^const [A-Z][a-z][a-zA-Z]* = \(/

const FORMAT_MSG = 'Section separator must use block format (5 lines: separator / blank / name / blank / separator).'

// prettier-ignore
const ORDER_LABEL = 'Predicates → Transformers → Functions → Validators → Aggregators → Effects → Components → Constants → Actions → Module-level state → Exports'

// prettier-ignore
const STANDARD_LABEL = 'P/Predicates, T/Transformers, F/Functions/Factories, V/Validators, A/Aggregators, E/Effects, Components, Constants, Actions, Module-level state, Exports'

const violation = FS.createViolation('section-separators', PRIORITY)

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
