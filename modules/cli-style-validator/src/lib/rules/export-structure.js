// ABOUTME: Rule to enforce single named export matching file name
// ABOUTME: Exported functions must be defined at module level, not inside cohesion groups

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 0 // High priority - structural issue

const COHESION_GROUPS = ['P', 'T', 'F', 'V', 'A', 'E']

const P = {
    // Check if name is a cohesion group identifier
    // @sig isCohesionGroup :: String -> Boolean
    isCohesionGroup: name => COHESION_GROUPS.includes(name),

    // Check if this is an index file (exempt from single export rule)
    // @sig isIndexFile :: String -> Boolean
    isIndexFile: filePath => /(?:^|[/\\])index\.js$/.test(filePath),
}

const T = {
    // Convert kebab-case to PascalCase
    // @sig toPascalCase :: String -> String
    toPascalCase: kebab =>
        kebab
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(''),

    // Extract base name from file path (without extension)
    // @sig toBaseName :: String -> String
    toBaseName: filePath => {
        const fileName = filePath.split('/').pop() || ''
        return fileName.replace(/\.(js|jsx)$/, '')
    },

    // Get expected export name from file path
    // @sig toExpectedExportName :: String -> String
    toExpectedExportName: filePath => T.toPascalCase(T.toBaseName(filePath)),
}

const A = {
    // Collect all named exports from AST
    // @sig collectNamedExports :: AST -> [{ name: String, line: Number, isDefault: Boolean }]
    collectNamedExports: ast =>
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.ExportNamedDeclaration.is(node))
            .flatMap(node =>
                node.specifiers
                    .filter(spec => spec.exportedName)
                    .map(spec => ({ name: spec.exportedName, line: node.line, isDefault: false })),
            ),

    // Collect default exports from AST
    // @sig collectDefaultExports :: AST -> [{ line: Number, isDefault: Boolean }]
    collectDefaultExports: ast =>
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.ExportDefaultDeclaration.is(node))
            .map(node => ({ name: 'default', line: node.line, isDefault: true })),

    // Find the variable declaration for a given name
    // @sig findVariableDeclaration :: (AST, String) -> ASTNode?
    findVariableDeclaration: (ast, name) =>
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.VariableDeclaration.is(node))
            .find(node => node.firstName === name),

    // Collect function names defined inside cohesion groups
    // @sig collectCohesionGroupFunctions :: AST -> Set<String>
    collectCohesionGroupFunctions: ast => {
        const functions = new Set()
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.VariableDeclaration.is(node))
            .forEach(node => {
                const name = node.firstName
                if (!name || !P.isCohesionGroup(name)) return
                const value = node.firstValue
                if (!ASTNode.ObjectExpression.is(value)) return
                value.properties.forEach(prop => {
                    if (prop.name) functions.add(prop.name)
                })
            })
        return functions
    },

    // Get property names from an object expression
    // @sig collectObjectPropertyNames :: ASTNode -> [String]
    collectObjectPropertyNames: node => {
        if (!ASTNode.ObjectExpression.is(node)) return []
        return node.properties.map(prop => prop.name).filter(Boolean)
    },
}

const F = {
    // Create an export-structure violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => ({
        type: 'export-structure',
        line,
        column: 1,
        priority: PRIORITY,
        message,
        rule: 'export-structure',
    }),
}

const V = {
    // Validate export structure for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode) || P.isIndexFile(filePath)) return []

        const violations = []
        const namedExports = A.collectNamedExports(ast)
        const defaultExports = A.collectDefaultExports(ast)

        // Check for default exports
        defaultExports.forEach(exp =>
            violations.push(
                F.createViolation(
                    exp.line,
                    'Default export detected. FIX: Use named export instead: export { MyModule }',
                ),
            ),
        )

        // Check for exactly one named export
        if (namedExports.length === 0 && defaultExports.length === 0)
            // No exports at all - might be a utility file, skip
            return violations

        if (namedExports.length > 1)
            violations.push(
                F.createViolation(
                    namedExports[0].line,
                    `File has ${namedExports.length} named exports. ` +
                        'FIX: Export a single object containing all public functions: ' +
                        `const ${T.toExpectedExportName(filePath)} = { fn1, fn2 }; export { ${T.toExpectedExportName(filePath)} }`,
                ),
            )

        // Check export name matches file name
        if (namedExports.length === 1) {
            const exportName = namedExports[0].name
            const expectedName = T.toExpectedExportName(filePath)

            if (exportName !== expectedName)
                violations.push(
                    F.createViolation(
                        namedExports[0].line,
                        `Export "${exportName}" does not match file name. ` +
                            `FIX: Rename export to "${expectedName}" to match file "${T.toBaseName(filePath)}".`,
                    ),
                )

            // Check that exported object's functions are not defined in cohesion groups
            const declaration = A.findVariableDeclaration(ast, exportName)
            if (declaration) {
                const value = declaration.firstValue
                const propertyNames = A.collectObjectPropertyNames(value)
                const cohesionFunctions = A.collectCohesionGroupFunctions(ast)

                propertyNames.forEach(propName => {
                    if (cohesionFunctions.has(propName))
                        violations.push(
                            F.createViolation(
                                declaration.line,
                                `Exported function "${propName}" is defined inside a cohesion group. ` +
                                    `FIX: Define "${propName}" at module level, outside P/T/F/V/A/E groups. ` +
                                    'Cohesion groups are for internal helpers only.',
                            ),
                        )
                })
            }
        }

        return violations
    },
}

const checkExportStructure = FS.withExemptions('export-structure', V.check)
const ExportStructure = { checkExportStructure }
export { ExportStructure }
