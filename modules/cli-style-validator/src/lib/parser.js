// ABOUTME: JavaScript/JSX parser wrapper using acorn
// ABOUTME: Provides consistent AST parsing configuration for style validation

import { Parser } from 'acorn'
import jsx from 'acorn-jsx'

/**
 * Parse JavaScript source code into an AST
 * @sig parseCode :: String -> AST
 */
const parseCode = sourceCode =>
    Parser.extend(jsx()).parse(sourceCode, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        preserveComments: true,
    })

export { parseCode }
