// ABOUTME: JavaScript/JSX parser wrapper using acorn
// ABOUTME: Provides consistent AST parsing configuration for style validation

import { Parser as AcornParser } from 'acorn'
import jsx from 'acorn-jsx'

/**
 * Parse JavaScript source code into an AST
 * @sig parseCode :: String -> AST
 */
const parseCode = sourceCode =>
    AcornParser.extend(jsx()).parse(sourceCode, {
        ecmaVersion: 2022,
        sourceType: 'module',
        locations: true,
        preserveComments: true,
    })

const Parser = { parseCode }
export { Parser }
