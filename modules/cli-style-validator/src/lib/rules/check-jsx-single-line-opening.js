// ABOUTME: Rule to enforce JSX opening tags on a single line
// ABOUTME: Flags JSXOpeningElement nodes that span multiple lines

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

const PRIORITY = 3 // Same tier as line-length — fix after extractions

const P = {
    // Check if file is a JSX file
    // @sig isJsxFile :: String -> Boolean
    isJsxFile: filePath => filePath.endsWith('.jsx'),

    // Check if a raw AST node is a JSXOpeningElement
    // @sig isJsxOpeningElement :: Object -> Boolean
    isJsxOpeningElement: node => node && node.type === 'JSXOpeningElement',

    // Check if a JSXOpeningElement spans multiple lines
    // @sig isMultiline :: Object -> Boolean
    isMultiline: node => node.loc.start.line !== node.loc.end.line,
}

const violation = FS.createViolation('jsx-single-line-opening', PRIORITY)

const F = {
    // Create a violation for multiline JSX opening tag
    // @sig createViolation :: Object -> Violation
    createViolation: node => {
        const name = node.name.type === 'JSXMemberExpression' ? node.name.property.name : node.name.name
        return violation(
            node.loc.start.line,
            node.loc.start.column + 1,
            `JSX opening tag <${name}> must fit on a single line. ` +
                `FIX: Extract prop values as consts to shorten the line, or refactor the component.`,
        )
    },
}

const V = {
    // Main validation entry point
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || !P.isJsxFile(filePath) || PS.isTestFile(filePath) || PS.isGeneratedFile(sourceCode)) return []

        return A.collectJsxOpeningElements(ast).filter(P.isMultiline).map(F.createViolation)
    },
}

const A = {
    // Accumulate JSXOpeningElement nodes from a single child value
    // @sig collectFromChild :: ([Object], Object) -> [Object]
    collectFromChild: (acc, child) => {
        if (Array.isArray(child)) return [...acc, ...child.flatMap(A.collectJsxOpeningElements)]
        if (child && typeof child === 'object' && child.type) return [...acc, ...A.collectJsxOpeningElements(child)]
        return acc
    },

    // Walk raw ESTree AST and collect all JSXOpeningElement nodes
    // @sig collectJsxOpeningElements :: Object -> [Object]
    collectJsxOpeningElements: node => {
        if (!node || typeof node !== 'object') return []
        if (P.isJsxOpeningElement(node)) return [node]
        return Object.values(node).reduce(A.collectFromChild, [])
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run jsx-single-line-opening rule with COMPLEXITY exemption support
// @sig checkJsxSingleLineOpening :: (AST?, String, String) -> [Violation]
const checkJsxSingleLineOpening = (ast, sourceCode, filePath) =>
    FS.withExemptions('jsx-single-line-opening', V.check, ast, sourceCode, filePath)
export { checkJsxSingleLineOpening }
