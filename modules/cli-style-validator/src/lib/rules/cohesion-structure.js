// ABOUTME: Rule to enforce P/T/F/V/A/E cohesion group structure
// ABOUTME: Detects uncategorized functions, wrong ordering, and external function references
// COMPLEXITY-TODO: lines — Rule implementation requires many checks (expires 2026-01-03)
// COMPLEXITY-TODO: functions — Rule implementation requires many validators (expires 2026-01-03)
// COMPLEXITY-TODO: cohesion-structure — Self-referential rule complexity (expires 2026-01-03)
// COMPLEXITY-TODO: chain-extraction — Transform functions access nested AST props (expires 2026-01-03)
// COMPLEXITY-TODO: single-level-indentation — V.check requires inline validation logic (expires 2026-01-03)
// COMPLEXITY-TODO: sig-documentation — Inline validation callbacks need extraction (expires 2026-01-03)

import { AST } from '../ast.js'
import { FS } from '../factories.js'
import { PS } from '../predicates.js'
import { Source } from '../source.js'

const PRIORITY = 0 // High priority - structural issue

// Cohesion group names and their naming patterns
const COHESION_PATTERNS = {
    P: /^(is|has|should|can|exports)[A-Z]/,
    T: /^(to|parse|format)[A-Z]/,
    F: /^(create|make|build)[A-Z]/,
    V: /^(check|validate)[A-Z]/,
    A: /^(collect|count|gather|find|process)[A-Z]/,
    E: /^(persist|handle|dispatch|emit|send)[A-Z]/,
}

// Vague prefixes that should be replaced with more specific names
const VAGUE_PREFIXES = /^(get|extract|derive|select|fetch)[A-Z]/

// Required declaration order
const COHESION_ORDER = ['P', 'T', 'F', 'V', 'A', 'E']

// Thresholds for triggering CHECKPOINTs
const THRESHOLDS = { totalFunctions: 12, perGroup: 5 }

// Names that are exempt from cohesion group requirements
const EXEMPT_NAMES = ['rootReducer']

const P = {
    // Check if name is a cohesion group identifier (P, T, F, V, A)
    // @sig isCohesionGroup :: String -> Boolean
    isCohesionGroup: name => COHESION_ORDER.includes(name),

    // Check if name is exempt from cohesion requirements
    // @sig isExemptName :: String -> Boolean
    isExemptName: name => EXEMPT_NAMES.includes(name) || PS.isPascalCase(name),

    // Check if node is defined inside a cohesion group object
    // @sig isInCohesionGroup :: (ASTNode, AST) -> Boolean
    isInCohesionGroup: (node, ast) =>
        AST.topLevel(ast)
            .ofType('VariableDeclaration')
            .some(({ node: stmt }) => {
                const decl = AST.firstDecl(stmt)
                const name = AST.idName(decl)
                if (!name || !P.isCohesionGroup(name)) return false
                if (!AST.hasType(AST.init(decl), 'ObjectExpression')) return false
                return AST.properties(AST.init(decl)).some(prop => AST.value(prop) === node)
            }),

    // Check if node is a function definition
    // @sig isFunctionDefinition :: ASTNode -> Boolean
    isFunctionDefinition: node => PS.isFunctionNode(node),

    // Check if node is an identifier reference (not function definition)
    // @sig isIdentifierReference :: ASTNode -> Boolean
    isIdentifierReference: node => node?.type === 'Identifier',

    // Match function name to suggested cohesion group based on prefix
    // @sig matchesCohesionPattern :: String -> String?
    matchesCohesionPattern: name =>
        Object.entries(COHESION_PATTERNS).find(([, pattern]) => pattern.test(name))?.[0] || null,

    // Check if name has a vague prefix
    // @sig hasVaguePrefix :: String -> Boolean
    hasVaguePrefix: name => VAGUE_PREFIXES.test(name),
}

const T = {
    // Transform statement to function info if it's a function declaration
    // @sig toFunctionDeclaration :: Statement -> [{ name, line, node }]
    toFunctionDeclaration: stmt =>
        AST.hasType(stmt, 'FunctionDeclaration') && AST.idName(stmt)
            ? [{ name: AST.idName(stmt), line: AST.startLine(stmt) || 1, node: stmt }]
            : [],

    // Transform statement to function infos if it's a variable with function init
    // @sig toFunctionVariables :: Statement -> [{ name, line, node }]
    toFunctionVariables: stmt =>
        AST.hasType(stmt, 'VariableDeclaration')
            ? AST.declarations(stmt)
                  .filter(decl => AST.init(decl) && PS.isFunctionNode(AST.init(decl)) && AST.idName(decl))
                  .map(decl => ({ name: AST.idName(decl), line: AST.startLine(stmt) || 1, node: AST.init(decl) }))
            : [],

    // Transform statement to module-level function info (declaration or variable)
    // @sig toModuleLevelFunction :: Statement -> [{ name, line, node }]
    toModuleLevelFunction: stmt => [...T.toFunctionDeclaration(stmt), ...T.toFunctionVariables(stmt)],

    // Transform statement to cohesion group declaration if it is one
    // @sig toCohesionDecl :: Statement -> { name, line, init }?
    toCohesionDecl: stmt => {
        if (!AST.hasType(stmt, 'VariableDeclaration')) return null
        const decl = AST.firstDecl(stmt)
        const name = AST.idName(decl)
        if (!name || !P.isCohesionGroup(name)) return null
        const init = AST.init(decl)
        if (!AST.hasType(init, 'ObjectExpression')) return null
        return { name, line: AST.startLine(stmt) || 1, init }
    },

    // Transform object property to function member info
    // @sig toFunctionMember :: Property -> { name, line }?
    toFunctionMember: prop => {
        const name = AST.keyName(prop)
        const value = AST.value(prop)
        return name && value && PS.isFunctionNode(value) ? { name, line: AST.startLine(prop) || 1 } : null
    },

    // Transform object property to external reference info
    // @sig toExternalRef :: (String, Property) -> { group, propName, refName, line }?
    toExternalRef: (groupName, prop) => {
        const propName = AST.keyName(prop)
        const value = AST.value(prop)
        if (!propName || !value) return null
        if (!P.isIdentifierReference(value) || P.isFunctionDefinition(value)) return null
        return { group: groupName, propName, refName: value.name, line: AST.startLine(prop) || 1 }
    },
}

const A = {
    // Collect all cohesion group declarations from AST
    // @sig collectCohesionDecls :: AST -> [{ name, line, init }]
    collectCohesionDecls: ast =>
        AST.topLevel(ast)
            .map(({ node }) => T.toCohesionDecl(node))
            .filter(Boolean),

    // Collect all function declarations at module level (outside cohesion groups)
    // @sig collectModuleLevelFunctions :: AST -> [{ name: String, line: Number, node: ASTNode }]
    collectModuleLevelFunctions: ast => AST.topLevel(ast).flatMap(({ node }) => T.toModuleLevelFunction(node)),

    // Collect all functions defined inside each cohesion group object
    // @sig collectCohesionGroups :: AST -> { P: [...], T: [...], F: [...], V: [...], A: [...], E: [...] }
    collectCohesionGroups: ast => {
        const empty = { P: [], T: [], F: [], V: [], A: [], E: [] }
        return A.collectCohesionDecls(ast).reduce((groups, { name, init }) => {
            groups[name] = AST.properties(init).map(T.toFunctionMember).filter(Boolean)
            return groups
        }, empty)
    },

    // Collect the order in which cohesion groups are declared
    // @sig collectCohesionDeclarationOrder :: AST -> [{ name: String, line: Number }]
    collectCohesionDeclarationOrder: ast => A.collectCohesionDecls(ast).map(({ name, line }) => ({ name, line })),

    // Find properties that reference external functions instead of defining inline
    // @sig collectExternalReferences :: AST -> [{ group: String, propName: String, refName: String, line: Number }]
    collectExternalReferences: ast =>
        A.collectCohesionDecls(ast).flatMap(({ name, init }) =>
            AST.properties(init)
                .map(prop => T.toExternalRef(name, prop))
                .filter(Boolean),
        ),

    // Find COMPLEXITY: comments that justify structural decisions
    // @sig findComplexityComments :: String -> [{ line: Number, reason: String }]
    findComplexityComments: sourceCode =>
        Source.from(sourceCode)
            .all()
            .toArray()
            .map((line, index) => {
                const match = line.match(/\/\/\s*COMPLEXITY:\s*(.+)/)
                return match ? { line: index + 1, reason: match[1].trim() } : null
            })
            .filter(Boolean),

    // Collect exported names from export statements
    // @sig collectExports :: AST -> [{ name: String, line: Number }]
    collectExports: ast =>
        AST.topLevel(ast)
            .ofType('ExportNamedDeclaration')
            .flatMap(({ node }) =>
                AST.specifiers(node)
                    .filter(spec => AST.exportedName(spec))
                    .map(spec => ({ name: AST.exportedName(spec), line: AST.startLine(node) || 1 })),
            ),
}

const F = {
    // Create a cohesion-structure violation at given line
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'cohesion-structure',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'cohesion-structure',
    }),

    // Create violation for function not in any cohesion group
    // @sig createUncategorizedViolation :: (Number, String, String?) -> Violation
    createUncategorizedViolation: (line, name, suggestedGroup) => {
        const suggestion = suggestedGroup
            ? `Naming suggests ${suggestedGroup} group.`
            : 'Rename to match a cohesion pattern (is*, get*, create*, check*, collect*).'
        return F.createViolation(
            line,
            `CHECKPOINT: "${name}" is not in a P/T/F/V/A/E cohesion group. ${suggestion} ` +
                `If justified, propose a COMPLEXITY comment for user approval.`,
        )
    },

    // Create violation for exceeding function count threshold
    // @sig createHighCountViolation :: (Number, Number, Number, String) -> Violation
    createHighCountViolation: (line, count, threshold, context) =>
        F.createViolation(
            line,
            `CHECKPOINT: ${context} (${count}) exceeds threshold (${threshold}). ` +
                `This may indicate a design issue. Consider whether the mental model is right.`,
        ),

    // Create violation for cohesion group with too many functions
    // @sig createLargeGroupViolation :: (Number, String, Number) -> Violation
    createLargeGroupViolation: (line, groupName, count) =>
        F.createViolation(
            line,
            `CHECKPOINT: ${groupName} group has ${count} functions (threshold: ${THRESHOLDS.perGroup}). ` +
                `Consider whether these share a pattern that could be unified.`,
        ),

    // Create violation for cohesion groups declared out of order
    // @sig createOrderingViolation :: (Number, String, String) -> Violation
    createOrderingViolation: (line, actual, expected) =>
        F.createViolation(
            line,
            `Cohesion group "${actual}" declared out of order. Expected order: P → T → F → V → A → E. ` +
                `FIX: Move "${actual}" ${expected ? `after "${expected}"` : 'to correct position'}.`,
        ),

    // Create violation for property referencing external function
    // @sig createExternalReferenceViolation :: (Number, String, String, String) -> Violation
    createExternalReferenceViolation: (line, group, propName, refName) =>
        F.createViolation(
            line,
            `${group}.${propName} references external function "${refName}". ` +
                `FIX: Define the function inside the ${group} object, not outside with a later reference.`,
        ),

    // Create violation for multiple exports
    // @sig createMultipleExportsViolation :: (Number, Number) -> Violation
    createMultipleExportsViolation: (line, count) =>
        F.createViolation(
            line,
            `CHECKPOINT: File has ${count} exports. Multiple exports may indicate the file should be split. ` +
                `If justified, add a COMPLEXITY comment explaining why these belong together.`,
        ),

    // Create violation for export defined inside cohesion group
    // @sig createExportInsideCohesionViolation :: (Number, String, String) -> Violation
    createExportInsideCohesionViolation: (line, name, group) =>
        F.createViolation(
            line,
            `Exported function "${name}" is defined inside ${group} group. ` +
                `FIX: Define exported functions at module level (outside cohesion groups). ` +
                `Cohesion groups are for internal helpers.`,
        ),

    // Create violation for vague function prefix
    // @sig createVaguePrefixViolation :: (Number, String) -> Violation
    createVaguePrefixViolation: (line, name) =>
        F.createViolation(
            line,
            `"${name}" uses a vague prefix (get/extract/derive/select/fetch). ` +
                `FIX: Use a more specific name that describes what the function actually does.`,
        ),
}

const V = {
    // Validate that cohesion groups are declared in correct order
    // @sig checkOrdering :: ([{ name: String, line: Number }], [Violation]) -> Void
    checkOrdering: (declarations, violations) => {
        if (declarations.length < 2) return

        declarations.forEach((decl, index) => {
            if (index === 0) return
            const prevDecl = declarations[index - 1]
            const expectedIndex = COHESION_ORDER.indexOf(decl.name)
            const prevIndex = COHESION_ORDER.indexOf(prevDecl.name)

            if (expectedIndex < prevIndex)
                violations.push(F.createOrderingViolation(decl.line, decl.name, prevDecl.name))
        })
    },

    // Validate that cohesion group properties define functions inline
    // @sig checkExternalReferences :: ([{ group, propName, refName, line }], [Violation]) -> Void
    checkExternalReferences: (references, violations) =>
        references.forEach(({ group, propName, refName, line }) =>
            violations.push(F.createExternalReferenceViolation(line, group, propName, refName)),
        ),

    // Validate cohesion structure for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath)) return []

        const violations = []
        const complexityComments = A.findComplexityComments(sourceCode)
        const moduleFunctions = A.collectModuleLevelFunctions(ast)
        const cohesionGroups = A.collectCohesionGroups(ast)
        const declarations = A.collectCohesionDeclarationOrder(ast)
        const externalRefs = A.collectExternalReferences(ast)
        const exports = A.collectExports(ast)
        const exportedNames = new Set(exports.map(e => e.name))

        // Check cohesion group ordering (P → T → F → V → A)
        V.checkOrdering(declarations, violations)

        // Check for external function references in cohesion groups
        V.checkExternalReferences(externalRefs, violations)

        // Check for uncategorized module-level functions (exported functions are exempt)
        moduleFunctions.forEach(({ name, line }) => {
            if (P.isCohesionGroup(name)) return
            if (P.isExemptName(name)) return
            if (exportedNames.has(name)) return

            const hasJustification = complexityComments.some(c => c.line < line && c.line > line - 5)
            if (hasJustification) return

            const suggestedGroup = P.matchesCohesionPattern(name)
            violations.push(F.createUncategorizedViolation(line, name, suggestedGroup))
        })

        // Check for vague prefixes in all functions (skip if COMPLEXITY comment mentions function name)
        const allFunctions = [...moduleFunctions, ...Object.values(cohesionGroups).flat()]
        allFunctions.forEach(({ name, line }) => {
            if (!P.hasVaguePrefix(name)) return
            const hasJustification = complexityComments.some(c => c.reason.includes(`"${name}"`))
            if (!hasJustification) violations.push(F.createVaguePrefixViolation(line, name))
        })

        // Count total functions in cohesion groups
        const totalInGroups = Object.values(cohesionGroups).reduce((sum, g) => sum + g.length, 0)
        const totalFunctions = moduleFunctions.length + totalInGroups

        // Check total function count
        if (totalFunctions > THRESHOLDS.totalFunctions)
            violations.push(F.createHighCountViolation(1, totalFunctions, THRESHOLDS.totalFunctions, 'Total functions'))

        // Check per-group counts
        Object.entries(cohesionGroups).forEach(([groupName, members]) => {
            if (members.length > THRESHOLDS.perGroup) {
                const firstLine = members[0]?.line || 1
                violations.push(F.createLargeGroupViolation(firstLine, groupName, members.length))
            }
        })

        // Check for multiple exports (CHECKPOINT)
        if (exports.length > 1) {
            const hasJustification = complexityComments.some(c => c.reason.toLowerCase().includes('export'))
            if (!hasJustification) violations.push(F.createMultipleExportsViolation(exports[0].line, exports.length))
        }

        // Check that exported functions are defined outside cohesion groups
        exports.forEach(({ name, line }) =>
            Object.entries(cohesionGroups).forEach(([groupName, members]) => {
                const inGroup = members.find(m => m.name === name)
                if (inGroup) violations.push(F.createExportInsideCohesionViolation(inGroup.line, name, groupName))
            }),
        )

        // Add reminder about existing COMPLEXITY comments
        if (complexityComments.length > 0 && violations.length > 0) {
            const reasons = complexityComments.map(c => `"${c.reason}" (line ${c.line})`).join(', ')
            violations.push(F.createViolation(1, `Note: This file has COMPLEXITY comments: ${reasons}. Still valid?`))
        }

        return violations
    },
}

const checkCohesionStructure = FS.withExemptions('cohesion-structure', V.check)
export { checkCohesionStructure }
