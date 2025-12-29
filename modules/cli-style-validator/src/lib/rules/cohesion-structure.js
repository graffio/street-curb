// ABOUTME: Rule to enforce P/T/F/V/A cohesion group structure
// ABOUTME: Detects uncategorized functions, wrong ordering, and external function references

import { PS } from '../predicates.js'

const PRIORITY = 0 // High priority - structural issue

// Cohesion group names and their naming patterns
const COHESION_PATTERNS = {
    P: /^(is|has|should|can|exports)[A-Z]/,
    T: /^(to|get|extract|parse|format)[A-Z]/,
    F: /^(create|make|build)[A-Z]/,
    V: /^(check|validate)[A-Z]/,
    A: /^(collect|count|gather|find|process)[A-Z]/,
}

// Required declaration order
const COHESION_ORDER = ['P', 'T', 'F', 'V', 'A']

// Thresholds for triggering CHECKPOINTs
const THRESHOLDS = { totalFunctions: 12, perGroup: 5 }

const P = {
    // @sig isTestFile :: String -> Boolean
    isTestFile: filePath =>
        filePath.includes('.tap.js') || filePath.includes('.test.js') || filePath.includes('/test/'),

    // @sig isCohesionGroup :: String -> Boolean
    isCohesionGroup: name => COHESION_ORDER.includes(name),

    // @sig isInCohesionGroup :: (ASTNode, AST) -> Boolean
    isInCohesionGroup: (node, ast) => {
        if (!ast?.body) return false
        return ast.body.some(stmt => {
            if (stmt.type !== 'VariableDeclaration') return false
            const decl = stmt.declarations[0]
            if (!decl?.id?.name || !P.isCohesionGroup(decl.id.name)) return false
            if (decl.init?.type !== 'ObjectExpression') return false
            return decl.init.properties.some(prop => prop.value === node)
        })
    },

    // @sig isFunctionDefinition :: ASTNode -> Boolean
    isFunctionDefinition: node => PS.isFunctionNode(node),

    // @sig isIdentifierReference :: ASTNode -> Boolean
    isIdentifierReference: node => node?.type === 'Identifier',

    // @sig matchesCohesionPattern :: String -> String?
    matchesCohesionPattern: name => {
        for (const [group, pattern] of Object.entries(COHESION_PATTERNS)) if (pattern.test(name)) return group
        return null
    },
}

const A = {
    // @sig collectModuleLevelFunctions :: AST -> [{ name: String, line: Number, node: ASTNode }]
    collectModuleLevelFunctions: ast => {
        const functions = []
        if (!ast?.body) return functions

        ast.body.forEach(stmt => {
            if (stmt.type === 'FunctionDeclaration' && stmt.id)
                functions.push({ name: stmt.id.name, line: stmt.loc?.start?.line || 1, node: stmt })

            if (stmt.type === 'VariableDeclaration')
                stmt.declarations.forEach(decl => {
                    if (decl.init && PS.isFunctionNode(decl.init) && decl.id?.name)
                        functions.push({ name: decl.id.name, line: stmt.loc?.start?.line || 1, node: decl.init })
                })
        })

        return functions
    },

    // @sig collectCohesionGroups :: AST -> { P: [...], T: [...], F: [...], V: [...], A: [...] }
    collectCohesionGroups: ast => {
        const groups = { P: [], T: [], F: [], V: [], A: [] }
        if (!ast?.body) return groups

        ast.body.forEach(stmt => {
            if (stmt.type !== 'VariableDeclaration') return
            const decl = stmt.declarations[0]
            if (!decl?.id?.name || !P.isCohesionGroup(decl.id.name)) return
            if (decl.init?.type !== 'ObjectExpression') return

            const groupName = decl.id.name
            decl.init.properties.forEach(prop => {
                if (prop.key?.name && prop.value && PS.isFunctionNode(prop.value))
                    groups[groupName].push({ name: prop.key.name, line: prop.loc?.start?.line || 1 })
            })
        })

        return groups
    },

    // @sig collectCohesionDeclarationOrder :: AST -> [{ name: String, line: Number }]
    collectCohesionDeclarationOrder: ast => {
        const declarations = []
        if (!ast?.body) return declarations

        ast.body.forEach(stmt => {
            if (stmt.type !== 'VariableDeclaration') return
            const decl = stmt.declarations[0]
            if (!decl?.id?.name || !P.isCohesionGroup(decl.id.name)) return
            if (decl.init?.type !== 'ObjectExpression') return
            declarations.push({ name: decl.id.name, line: stmt.loc?.start?.line || 1 })
        })

        return declarations
    },

    // @sig collectExternalReferences :: AST -> [{ group: String, propName: String, refName: String, line: Number }]
    collectExternalReferences: ast => {
        const references = []
        if (!ast?.body) return references

        ast.body.forEach(stmt => {
            if (stmt.type !== 'VariableDeclaration') return
            const decl = stmt.declarations[0]
            if (!decl?.id?.name || !P.isCohesionGroup(decl.id.name)) return
            if (decl.init?.type !== 'ObjectExpression') return

            const groupName = decl.id.name
            decl.init.properties.forEach(prop => {
                if (!prop.key?.name || !prop.value) return
                if (P.isIdentifierReference(prop.value) && !P.isFunctionDefinition(prop.value))
                    references.push({
                        group: groupName,
                        propName: prop.key.name,
                        refName: prop.value.name,
                        line: prop.loc?.start?.line || 1,
                    })
            })
        })

        return references
    },

    // @sig findComplexityComments :: String -> [{ line: Number, reason: String }]
    findComplexityComments: sourceCode => {
        const comments = []
        const lines = sourceCode.split('\n')
        lines.forEach((line, index) => {
            const match = line.match(/\/\/\s*COMPLEXITY:\s*(.+)/)
            if (match) comments.push({ line: index + 1, reason: match[1].trim() })
        })
        return comments
    },
}

const F = {
    createViolation: (line, message) => ({
        type: 'cohesion-structure',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'cohesion-structure',
    }),

    createUncategorizedViolation: (line, name, suggestedGroup) => {
        const suggestion = suggestedGroup
            ? `Naming suggests ${suggestedGroup} group.`
            : 'Rename to match a cohesion pattern (is*, get*, create*, check*, collect*).'
        return F.createViolation(
            line,
            `CHECKPOINT: "${name}" is not in a P/T/F/V/A cohesion group. ${suggestion} ` +
                `Or justify with // COMPLEXITY: comment.`,
        )
    },

    createHighCountViolation: (line, count, threshold, context) =>
        F.createViolation(
            line,
            `CHECKPOINT: ${context} (${count}) exceeds threshold (${threshold}). ` +
                `This may indicate a design issue. Consider whether the mental model is right.`,
        ),

    createLargeGroupViolation: (line, groupName, count) =>
        F.createViolation(
            line,
            `CHECKPOINT: ${groupName} group has ${count} functions (threshold: ${THRESHOLDS.perGroup}). ` +
                `Consider whether these share a pattern that could be unified.`,
        ),
}

const V = {
    checkCohesionStructure: (ast, sourceCode, filePath) => {
        if (!ast || P.isTestFile(filePath)) return []

        const violations = []
        const complexityComments = A.findComplexityComments(sourceCode)
        const moduleFunctions = A.collectModuleLevelFunctions(ast)
        const cohesionGroups = A.collectCohesionGroups(ast)

        // Check for uncategorized module-level functions
        moduleFunctions.forEach(({ name, line }) => {
            // Skip cohesion group definitions themselves (P, T, F, V, A)
            if (P.isCohesionGroup(name)) return

            // Skip if there's a COMPLEXITY comment for this
            const hasJustification = complexityComments.some(
                c => c.line < line && c.line > line - 5, // Comment within 5 lines above
            )
            if (hasJustification) return

            const suggestedGroup = P.matchesCohesionPattern(name)
            violations.push(F.createUncategorizedViolation(line, name, suggestedGroup))
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

        // Add reminder about existing COMPLEXITY comments
        if (complexityComments.length > 0 && violations.length > 0) {
            const reasons = complexityComments.map(c => `"${c.reason}" (line ${c.line})`).join(', ')
            violations.push(F.createViolation(1, `Note: This file has COMPLEXITY comments: ${reasons}. Still valid?`))
        }

        return violations
    },
}

const checkCohesionStructure = V.checkCohesionStructure
export { checkCohesionStructure }
