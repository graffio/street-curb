// ABOUTME: Rule to enforce P/T/F/V/A/E cohesion group structure
// ABOUTME: Detects uncategorized functions, wrong ordering, and external function references

import { AST, ASTNode, Lines } from '@graffio/ast'
import { NamedLocation } from '../../types/index.js'
import { Aggregators as AS } from '../shared/aggregators.js'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const PRIORITY = 0 // High priority - structural issue

// Cohesion group names and their naming patterns
const COHESION_PATTERNS = {
    P: /^(is|has|should|can)[A-Z]/,
    T: /^(to|parse|format)[A-Z]/,
    F: /^(create|make|build)[A-Z]/,
    V: /^(check|validate)[A-Z]/,
    A: /^(collect|count|gather|find|process)[A-Z]/,
    E: /^(persist|handle|dispatch|emit|send|query|register|hydrate)[A-Z]/,
}

// Vague prefixes that should be replaced with more specific names
const VAGUE_PREFIXES = /^(get|extract|derive|select|fetch)[A-Z]/

// Required declaration order
const COHESION_ORDER = ['P', 'T', 'F', 'V', 'A', 'E']

// Names that are exempt from cohesion group requirements
const EXEMPT_NAMES = ['rootReducer']

const P = {
    // Check if name is exempt from cohesion requirements
    // @sig isExemptName :: String -> Boolean
    isExemptName: name => EXEMPT_NAMES.includes(name) || PS.isPascalCase(name),

    // Check if statement is a cohesion group containing the node
    // @sig isStatementContainingNode :: (ASTNode, ASTNode) -> Boolean
    isStatementContainingNode: (stmt, node) => {
        const name = stmt.firstName
        if (!name || !PS.isCohesionGroup(name)) return false
        const value = stmt.firstValue
        if (!ASTNode.ObjectExpression.is(value)) return false
        return value.properties.some(prop => prop.value?.isSameAs(node))
    },

    // Check if node is defined inside a cohesion group object
    // @sig isInCohesionGroup :: (ASTNode, AST) -> Boolean
    isInCohesionGroup: (node, ast) =>
        AST.topLevelStatements(ast)
            .filter(stmt => ASTNode.VariableDeclaration.is(stmt))
            .some(stmt => P.isStatementContainingNode(stmt, node)),

    // Match function name to suggested cohesion group based on prefix
    // @sig matchesCohesionPattern :: String -> String?
    matchesCohesionPattern: name =>
        Object.entries(COHESION_PATTERNS).find(([, pattern]) => pattern.test(name))?.[0] || null,

    // Check if name has a vague prefix
    // @sig hasVaguePrefix :: String -> Boolean
    hasVaguePrefix: name => VAGUE_PREFIXES.test(name),
}

const T = {
    // Transform statement to cohesion group declaration if it is one
    // @sig toCohesionDecl :: Statement -> { name, line, value }?
    toCohesionDecl: stmt => {
        if (!ASTNode.VariableDeclaration.is(stmt)) return null
        const { firstName, firstValue, line } = stmt
        if (!firstName || !PS.isCohesionGroup(firstName)) return null
        if (!ASTNode.ObjectExpression.is(firstValue)) return null
        return { name: firstName, line, value: firstValue }
    },

    // Transform object property to function member info
    // @sig toFunctionMember :: Property -> { name, line }?
    toFunctionMember: prop => {
        const { name, value } = prop
        return name && value && PS.isFunctionNode(value) ? F.createNameInfo(name, prop) : null
    },

    // Transform object property to external reference info
    // @sig toExternalRef :: (String, Property) -> { group, propName, refName, line }?
    toExternalRef: (groupName, prop) => {
        const { name, value, line } = prop
        if (!name || !value) return null
        if (!ASTNode.Identifier.is(value) || PS.isFunctionNode(value)) return null
        return { group: groupName, propName: name, refName: value.name, line }
    },
}

const violation = FS.createViolation('cohesion-structure', PRIORITY)

const F = {
    // Create a named info object with line from a node
    // @sig createNameInfo :: (String, ASTNode) -> NamedLocation
    createNameInfo: (name, node) => NamedLocation(name, node.line),

    // Create a cohesion-structure violation at given line
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),

    // Create violation for function not in any cohesion group
    // @sig createUncategorizedViolation :: (Number, String, String?) -> Violation
    createUncategorizedViolation: (line, name, suggestedGroup) => {
        const suggestion = suggestedGroup
            ? `Naming suggests ${suggestedGroup} group.`
            : 'Rename to match a cohesion pattern (is*, to*, create*, check*, collect*).'
        return F.createViolation(
            line,
            `CHECKPOINT: "${name}" is not in a P/T/F/V/A/E cohesion group. ${suggestion} ` +
                `If justified, propose a COMPLEXITY comment for user approval.`,
        )
    },

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
    // Check if declaration is out of order relative to previous
    // @sig checkDeclOrdering :: (Declaration, Declaration, [Violation]) -> Void
    checkDeclOrdering: (decl, prevDecl, violations) => {
        const { name, line } = decl
        const expectedIndex = COHESION_ORDER.indexOf(name)
        const prevIndex = COHESION_ORDER.indexOf(prevDecl.name)
        if (expectedIndex < prevIndex) violations.push(F.createOrderingViolation(line, name, prevDecl.name))
    },

    // Validate that cohesion groups are declared in correct order
    // @sig checkOrdering :: ([{ name: String, line: Number }], [Violation]) -> Void
    checkOrdering: (declarations, violations) => {
        if (declarations.length < 2) return
        declarations.forEach((decl, i) => i > 0 && V.checkDeclOrdering(decl, declarations[i - 1], violations))
    },

    // Validate that cohesion group properties define functions inline
    // @sig checkExternalReferences :: ([{ group, propName, refName, line }], [Violation]) -> Void
    checkExternalReferences: (references, violations) =>
        references.forEach(({ group, propName, refName, line }) =>
            violations.push(F.createExternalReferenceViolation(line, group, propName, refName)),
        ),

    // Check single function for uncategorized violation
    // @sig checkUncategorizedFunction :: (FunctionInfo, Set, [ComplexityComment], [Violation]) -> Void
    checkUncategorizedFunction: ({ name, line }, exportedNames, complexityComments, violations) => {
        if (PS.isCohesionGroup(name) || P.isExemptName(name) || exportedNames.has(name)) return
        const hasJustification = complexityComments.some(c => c.line < line && c.line > line - 5)
        if (hasJustification) return
        violations.push(F.createUncategorizedViolation(line, name, P.matchesCohesionPattern(name)))
    },

    // Check single function for vague prefix violation
    // @sig checkVaguePrefix :: (FunctionInfo, [ComplexityComment], [Violation]) -> Void
    checkVaguePrefix: ({ name, line }, complexityComments, violations) => {
        if (!P.hasVaguePrefix(name)) return
        const hasJustification = complexityComments.some(c => c.reason.includes(`"${name}"`))
        if (!hasJustification) violations.push(F.createVaguePrefixViolation(line, name))
    },

    // Validate cohesion structure for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        const violations = []
        const complexityComments = A.findComplexityComments(sourceCode)
        const moduleFunctions = AS.collectModuleLevelFunctions(ast)
        const cohesionGroups = A.collectCohesionGroups(ast)
        const declarations = A.collectCohesionDeclarationOrder(ast)
        const externalRefs = A.collectExternalReferences(ast)
        const exportedNames = new Set(AS.toExportedNames(ast))
        A.collectExportedFunctionRefs(ast, exportedNames).forEach(name => exportedNames.add(name))

        V.checkOrdering(declarations, violations)
        V.checkExternalReferences(externalRefs, violations)
        moduleFunctions.forEach(fn => V.checkUncategorizedFunction(fn, exportedNames, complexityComments, violations))

        const allFunctions = [...moduleFunctions, ...Object.values(cohesionGroups).flat()]
        allFunctions.forEach(fn => V.checkVaguePrefix(fn, complexityComments, violations))

        if (complexityComments.length > 0 && violations.length > 0) {
            const reasons = complexityComments.map(c => `"${c.reason}" (line ${c.line})`).join(', ')
            violations.push(F.createViolation(1, `Note: This file has COMPLEXITY comments: ${reasons}. Still valid?`))
        }

        return violations
    },
}

const A = {
    // Collect all cohesion group declarations from AST
    // @sig collectCohesionDecls :: AST -> [{ name, line, value }]
    collectCohesionDecls: ast => AST.topLevelStatements(ast).map(T.toCohesionDecl).filter(Boolean),

    // Collect all functions defined inside each cohesion group object
    // @sig collectCohesionGroups :: AST -> { P: [...], T: [...], F: [...], V: [...], A: [...], E: [...] }
    collectCohesionGroups: ast => {
        const empty = { P: [], T: [], F: [], V: [], A: [], E: [] }
        return A.collectCohesionDecls(ast).reduce((groups, { name, value }) => {
            groups[name] = value.properties.map(T.toFunctionMember).filter(Boolean)
            return groups
        }, empty)
    },

    // Collect the order in which cohesion groups are declared
    // @sig collectCohesionDeclarationOrder :: AST -> [{ name: String, line: Number }]
    collectCohesionDeclarationOrder: ast => A.collectCohesionDecls(ast).map(({ name, line }) => ({ name, line })),

    // Find properties that reference external functions instead of defining inline
    // @sig collectExternalReferences :: AST -> [{ group: String, propName: String, refName: String, line: Number }]
    collectExternalReferences: ast =>
        A.collectCohesionDecls(ast).flatMap(({ name, value }) =>
            value.properties.map(prop => T.toExternalRef(name, prop)).filter(Boolean),
        ),

    // Find COMPLEXITY: comments that justify structural decisions
    // @sig findComplexityComments :: String -> [{ line: Number, reason: String }]
    findComplexityComments: sourceCode =>
        Lines.from(sourceCode)
            .map((line, index) => {
                const match = line.match(/\/\/\s*COMPLEXITY:\s*(.+)/)
                return match ? { line: index + 1, reason: match[1].trim() } : null
            })
            .filter(Boolean),

    // Collect function names referenced in exported objects (e.g., `const Api = { checkFile }`)
    // @sig collectExportedFunctionRefs :: (AST, Set<String>) -> [String]
    collectExportedFunctionRefs: (ast, exportedNames) =>
        AST.topLevelStatements(ast)
            .filter(stmt => ASTNode.VariableDeclaration.is(stmt))
            .filter(stmt => exportedNames.has(stmt.firstName))
            .filter(stmt => ASTNode.ObjectExpression.is(stmt.firstValue))
            .flatMap(stmt => stmt.firstValue.properties)
            .filter(prop => prop.value && ASTNode.Identifier.is(prop.value))
            .map(prop => prop.value.name),
}

// Run cohesion-structure rule with COMPLEXITY exemption support
// @sig checkCohesionStructure :: (AST?, String, String) -> [Violation]
const checkCohesionStructure = (ast, sourceCode, filePath) =>
    FS.withExemptions('cohesion-structure', V.check, ast, sourceCode, filePath)
export { checkCohesionStructure }
