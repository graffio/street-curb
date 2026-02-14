// ABOUTME: Rule to enforce single named export matching file name
// ABOUTME: Exported functions must be defined at module level, not inside cohesion groups

import { AST, ASTNode } from '@graffio/ast'
import { FS } from '../shared/factories.js'
import { PS } from '../shared/predicates.js'

const PRIORITY = 0 // High priority - structural issue

const P = {
    // Check if this is an index file (exempt from single export rule)
    // @sig isIndexFile :: String -> Boolean
    isIndexFile: filePath => /(?:^|[/\\])index\.js$/.test(filePath),

    // Check if an AST node is a function expression (arrow or traditional)
    // @sig isFunctionExpression :: ASTNode -> Boolean
    isFunctionExpression: node => ASTNode.ArrowFunctionExpression.is(node) || ASTNode.FunctionExpression.is(node),

    // Check if this is a JSX file (React component — PascalCase function exports are valid)
    // @sig isJsxFile :: String -> Boolean
    isJsxFile: filePath => /\.jsx$/.test(filePath),
}

const T = {
    // Convert kebab-case to PascalCase
    // @sig toPascalCase :: String -> String
    toPascalCase: kebab =>
        kebab
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(''),

    // Convert kebab-case to camelCase
    // @sig toCamelCase :: String -> String
    toCamelCase: kebab => {
        const pascal = T.toPascalCase(kebab)
        return pascal.charAt(0).toLowerCase() + pascal.slice(1)
    },

    // Extract base name from file path (without extension)
    // @sig toBaseName :: String -> String
    toBaseName: filePath => {
        const fileName = filePath.split('/').pop() || ''
        return fileName.replace(/\.(js|jsx)$/, '')
    },

    // Get expected export name from file path based on whether export is a function or object
    // @sig toExpectedExportName :: (String, Boolean) -> String
    toExpectedExportName: (filePath, isFunction) => {
        const baseName = T.toBaseName(filePath)
        return isFunction ? T.toCamelCase(baseName) : T.toPascalCase(baseName)
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
                        `const ${T.toExpectedExportName(filePath, false)} = { fn1, fn2 }; export { ${T.toExpectedExportName(filePath, false)} }`,
                ),
            )

        // Check for cohesion group rename: export { E as FileHandling }
        namedExports.forEach(exp => {
            if (exp.localName !== exp.name && PS.isCohesionGroup(exp.localName))
                violations.push(
                    F.createViolation(
                        exp.line,
                        `Cohesion group "${exp.localName}" is exported directly as "${exp.name}". ` +
                            'FIX: Define exported functions at module level, then export: ' +
                            `const ${exp.name} = { fn1, fn2 }; export { ${exp.name} }`,
                    ),
                )
        })

        // Check export name matches file name
        if (namedExports.length === 1) {
            const exportName = namedExports[0].name
            const declaration = A.findVariableDeclaration(ast, exportName)
            const isFunction = declaration && P.isFunctionExpression(declaration.firstValue)
            const expectedName = T.toExpectedExportName(filePath, isFunction)

            // JSX: React components are PascalCase functions — accept PascalCase as valid
            const isJsxComponent = P.isJsxFile(filePath) && isFunction
            const expectedJsxName = isJsxComponent ? T.toExpectedExportName(filePath, false) : null

            if (exportName !== expectedName && exportName !== expectedJsxName) {
                const casing = isFunction ? 'camelCase' : 'PascalCase'
                violations.push(
                    F.createViolation(
                        namedExports[0].line,
                        `Export "${exportName}" does not match file name. ` +
                            `FIX: Rename to "${expectedName}" (${casing} for ${isFunction ? 'function' : 'object'} exports).`,
                    ),
                )
            }

            // Check that exported object's functions are not defined in cohesion groups (objects only)
            if (declaration && !isFunction) {
                const value = declaration.firstValue
                const propertyNames = A.collectObjectPropertyNames(value)
                const cohesionFunctions = A.collectCohesionGroupFunctions(ast)

                // Object whose properties are cohesion group letters: { P, T, E }
                const leakedGroups = propertyNames.filter(PS.isCohesionGroup)
                if (leakedGroups.length > 0)
                    violations.push(
                        F.createViolation(
                            declaration.line,
                            `Exported object "${exportName}" contains cohesion group references: ${leakedGroups.join(', ')}. ` +
                                'FIX: Export module-level functions directly, not cohesion groups: ' +
                                `const ${exportName} = { fn1, fn2 }; export { ${exportName} }`,
                        ),
                    )

                // Single-property object wrapping a function — export the function directly
                if (propertyNames.length === 1) {
                    const propName = propertyNames[0]
                    const expectedFnName = T.toExpectedExportName(filePath, true)
                    violations.push(
                        F.createViolation(
                            declaration.line,
                            `Object export "${exportName}" has a single property "${propName}". ` +
                                `FIX: Export the function directly: const ${expectedFnName} = ...; export { ${expectedFnName} }`,
                        ),
                    )
                }

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

const A = {
    // Collect all named exports from AST
    // @sig collectNamedExports :: AST -> [{ name: String, localName: String, line: Number, isDefault: Boolean }]
    collectNamedExports: ast =>
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.ExportNamedDeclaration.is(node))
            .flatMap(node =>
                node.specifiers
                    .filter(spec => spec.exportedName)
                    .map(spec => ({
                        name: spec.exportedName,
                        localName: spec.localName || spec.exportedName,
                        line: node.line,
                        isDefault: false,
                    })),
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
                if (!name || !PS.isCohesionGroup(name)) return
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

// @sig checkExportStructure :: (AST?, String, String) -> [Violation]
const checkExportStructure = (ast, sourceCode, filePath) =>
    FS.withExemptions('export-structure', V.check)(ast, sourceCode, filePath)
export { checkExportStructure }
