// ABOUTME: Rule to enforce single named export matching file name
// ABOUTME: Exported functions must be defined at module level, not inside cohesion groups

import { AST, ASTNode } from '@graffio/ast'
import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'
import { Transformers as TS } from '../shared/transformers.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Convert kebab-case to camelCase
    // @sig toCamelCase :: String -> String
    toCamelCase: kebab => {
        const pascal = TS.toPascalCase(kebab)
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
        return isFunction ? T.toCamelCase(baseName) : TS.toPascalCase(baseName)
    },

    // Transform export specifier into record with export metadata
    // @sig toExportRecord :: (ASTNode, ExportSpecifier) -> { name, localName, line, isDefault }
    toExportRecord: (node, spec) => {
        const { exportedName, localName } = spec
        return { name: exportedName, localName: localName || exportedName, line: node.line, isDefault: false }
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create an export-structure violation
    // @sig createViolation :: (Number, String) -> Violation
    createViolation: (line, message) => violation(line, 1, message),

    // Create violation for a function defined inside a cohesion group
    // @sig createCohesionFunctionViolation :: (Number, String) -> Violation
    createCohesionFunctionViolation: (line, propName) => {
        const message =
            `Exported function "${propName}" is defined inside a cohesion group. ` +
            `FIX: Define "${propName}" at module level, outside P/T/F/V/A/E groups. ` +
            'Cohesion groups are for internal helpers only.'
        return violation(line, 1, message)
    },

    // Create violation for a default export
    // @sig createDefaultExportViolation :: Number -> Violation
    createDefaultExportViolation: line =>
        violation(line, 1, 'Default export detected. FIX: Use named export instead: export { MyModule }'),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Check for default exports and push violations
    // @sig checkDefaultExports :: ([ExportInfo], [Violation]) -> Void
    checkDefaultExports: (defaultExports, violations) =>
        defaultExports.forEach(exp => violations.push(F.createDefaultExportViolation(exp.line))),

    // Check for multiple named exports
    // @sig checkMultipleExports :: ([ExportInfo], [Violation], String) -> Void
    checkMultipleExports: (namedExports, violations, filePath) => {
        if (namedExports.length <= 1) return
        const expectedName = T.toExpectedExportName(filePath, false)
        const message =
            `File has ${namedExports.length} named exports. ` +
            'FIX: Export a single object containing all public functions: ' +
            `const ${expectedName} = { fn1, fn2 }; export { ${expectedName} }`
        violations.push(F.createViolation(namedExports[0].line, message))
    },

    // Check for cohesion group rename in export specifiers
    // @sig checkCohesionGroupRename :: (ExportInfo, [Violation]) -> Void
    checkCohesionGroupRename: (exp, violations) => {
        const { localName, name, line } = exp
        if (localName === name || !PS.isCohesionGroup(localName)) return
        const message =
            `Cohesion group "${localName}" is exported directly as "${name}". ` +
            'FIX: Define exported functions at module level, then export: ' +
            `const ${name} = { fn1, fn2 }; export { ${name} }`
        violations.push(F.createViolation(line, message))
    },

    // Check that export name matches file name
    // @sig checkExportNameMatch :: (ExportInfo, String, ASTNode?, [Violation]) -> Void
    checkExportNameMatch: (exportInfo, filePath, declaration, violations) => {
        const { name: exportName, line } = exportInfo
        const isFunction = declaration && P.isFunctionExpression(declaration.firstValue)
        const expectedName = T.toExpectedExportName(filePath, isFunction)
        const isJsxComponent = P.isJsxFile(filePath) && isFunction
        const expectedJsxName = isJsxComponent ? T.toExpectedExportName(filePath, false) : undefined

        if (exportName === expectedName || exportName === expectedJsxName) return

        const casing = isFunction ? 'camelCase' : 'PascalCase'
        const kind = isFunction ? 'function' : 'object'
        const message =
            `Export "${exportName}" does not match file name. ` +
            `FIX: Rename to "${expectedName}" (${casing} for ${kind} exports).`
        violations.push(F.createViolation(line, message))
    },

    // Check that exported object does not leak cohesion groups
    // @sig checkLeakedGroups :: ([String], String, ASTNode, [Violation]) -> Void
    checkLeakedGroups: (propertyNames, exportName, declaration, violations) => {
        const leakedGroups = propertyNames.filter(PS.isCohesionGroup)
        if (leakedGroups.length === 0) return
        const message =
            `Exported object "${exportName}" contains cohesion group references: ${leakedGroups.join(', ')}. ` +
            'FIX: Export module-level functions directly, not cohesion groups: ' +
            `const ${exportName} = { fn1, fn2 }; export { ${exportName} }`
        violations.push(F.createViolation(declaration.line, message))
    },

    // Check that single-property object wrapping a function exports the function directly
    // @sig checkSinglePropertyObject :: ([String], String, ASTNode, String, [Violation]) -> Void
    checkSinglePropertyObject: (propertyNames, exportName, declaration, filePath, violations) => {
        if (propertyNames.length !== 1) return
        const propName = propertyNames[0]
        const expectedFnName = T.toExpectedExportName(filePath, true)
        const message =
            `Object export "${exportName}" has a single property "${propName}". ` +
            `FIX: Export the function directly: const ${expectedFnName} = ...; export { ${expectedFnName} }`
        violations.push(F.createViolation(declaration.line, message))
    },

    // Check that exported functions are not defined inside cohesion groups
    // @sig checkCohesionGroupFunctions :: ([String], ASTNode, AST, [Violation]) -> Void
    checkCohesionGroupFunctions: (propertyNames, declaration, ast, violations) => {
        const cohesionFunctions = A.collectCohesionGroupFunctions(ast)
        propertyNames
            .filter(propName => cohesionFunctions.has(propName))
            .forEach(propName => violations.push(F.createCohesionFunctionViolation(declaration.line, propName)))
    },

    // Validate object export (non-function single export)
    // @sig checkObjectExport :: (ASTNode, String, AST, String, [Violation]) -> Void
    checkObjectExport: (declaration, exportName, ast, filePath, violations) => {
        const value = declaration.firstValue
        const propertyNames = A.collectObjectPropertyNames(value)
        V.checkLeakedGroups(propertyNames, exportName, declaration, violations)
        V.checkSinglePropertyObject(propertyNames, exportName, declaration, filePath, violations)
        V.checkCohesionGroupFunctions(propertyNames, declaration, ast, violations)
    },

    // Validate single named export for name match and object structure
    // @sig checkSingleExport :: ([ExportInfo], AST, String, [Violation]) -> Void
    checkSingleExport: (namedExports, ast, filePath, violations) => {
        if (namedExports.length !== 1) return
        const exportName = namedExports[0].name
        const declaration = A.findVariableDeclaration(ast, exportName)
        const isFunction = declaration && P.isFunctionExpression(declaration.firstValue)
        V.checkExportNameMatch(namedExports[0], filePath, declaration, violations)
        if (declaration && !isFunction) V.checkObjectExport(declaration, exportName, ast, filePath, violations)
    },

    // Validate export structure for entire file
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode) || P.isIndexFile(filePath)) return []

        const violations = []
        const namedExports = A.collectNamedExports(ast)
        const defaultExports = A.collectDefaultExports(ast)

        V.checkDefaultExports(defaultExports, violations)

        if (namedExports.length === 0 && defaultExports.length === 0) return violations

        V.checkMultipleExports(namedExports, violations, filePath)
        namedExports.forEach(exp => V.checkCohesionGroupRename(exp, violations))
        V.checkSingleExport(namedExports, ast, filePath, violations)

        return violations
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Collect all named exports from AST
    // @sig collectNamedExports :: AST -> [{ name: String, localName: String, line: Number, isDefault: Boolean }]
    collectNamedExports: ast =>
        AST.topLevelStatements(ast)
            .filter(node => ASTNode.ExportNamedDeclaration.is(node))
            .flatMap(node => node.specifiers.filter(s => s.exportedName).map(s => T.toExportRecord(node, s))),

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
            .forEach(node => A.collectGroupProperties(node, functions))
        return functions
    },

    // Add property names from a cohesion group declaration to the accumulator set
    // @sig collectGroupProperties :: (ASTNode, Set<String>) -> Void
    collectGroupProperties: (node, functions) => {
        const { firstName, firstValue } = node
        if (!firstName || !PS.isCohesionGroup(firstName)) return
        if (!ASTNode.ObjectExpression.is(firstValue)) return
        firstValue.properties.filter(prop => prop.name).forEach(prop => functions.add(prop.name))
    },

    // Get property names from an object expression
    // @sig collectObjectPropertyNames :: ASTNode -> [String]
    collectObjectPropertyNames: node => {
        if (!ASTNode.ObjectExpression.is(node)) return []
        return node.properties.map(prop => prop.name).filter(Boolean)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 0 // High priority - structural issue

const violation = FS.createViolation('export-structure', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run export-structure rule with COMPLEXITY exemption support
// @sig checkExportStructure :: (AST?, String, String) -> [Violation]
const checkExportStructure = (ast, sourceCode, filePath) =>
    FS.withExemptions('export-structure', V.check, ast, sourceCode, filePath)
export { checkExportStructure }
