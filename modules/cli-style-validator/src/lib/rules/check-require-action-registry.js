// ABOUTME: Rule to enforce ActionRegistry usage for keyboard accessibility
// ABOUTME: Flags onClick/onKeyDown without ActionRegistry and hardcoded key names in JSX files

import { Factories as FS } from '../shared/factories.js'
import { Predicates as PS } from '../shared/predicates.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Check if file is a JSX file
    // @sig isJsxFile :: String -> Boolean
    isJsxFile: filePath => filePath.endsWith('.jsx'),

    // Check if node is a JSX onClick attribute
    // @sig isOnClickAttribute :: Object -> Boolean
    isOnClickAttribute: node => node.type === 'JSXAttribute' && node.name && node.name.name === 'onClick',

    // Check if node is a JSX onKeyDown attribute
    // @sig isOnKeyDownAttribute :: Object -> Boolean
    isOnKeyDownAttribute: node => node.type === 'JSXAttribute' && node.name && node.name.name === 'onKeyDown',

    // Check if node is an ActionRegistry.register() call expression
    // @sig isActionRegistryRegisterCall :: Object -> Boolean
    isActionRegistryRegisterCall: node => {
        const { callee, type } = node
        if (type !== 'CallExpression' || !callee) return false
        const { object, property, type: calleeType } = callee
        return (
            calleeType === 'MemberExpression' &&
            object &&
            object.name === 'ActionRegistry' &&
            property &&
            property.name === 'register'
        )
    },

    // Check if node is a DEFAULT_BINDINGS variable declaration
    // @sig isDefaultBindingsDeclaration :: Object -> Boolean
    isDefaultBindingsDeclaration: node => {
        const { declarations, type } = node
        return (
            type === 'VariableDeclaration' &&
            declarations &&
            declarations.some(d => d.id && d.id.name === 'DEFAULT_BINDINGS')
        )
    },

    // Check if node is a string literal matching a known key name
    // @sig isHardcodedKeyLiteral :: Object -> Boolean
    isHardcodedKeyLiteral: node => {
        const { type, value } = node
        return type === 'Literal' && typeof value === 'string' && KEY_NAMES.has(value)
    },

    // Check if parent node is a comparison (=== or switch/case)
    // @sig isInComparisonContext :: Object? -> Boolean
    isInComparisonContext: parent => {
        if (!parent) return false
        const { operator, type } = parent
        return (type === 'BinaryExpression' && (operator === '===' || operator === '==')) || type === 'SwitchCase'
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Create violation for onClick without ActionRegistry
    // @sig createOnClickViolation :: Object -> Violation
    createOnClickViolation: node => {
        const { column, line } = node.loc.start
        const message =
            `onClick at line ${line} without ActionRegistry. ` +
            'FIX: Register keyboard equivalent via ActionRegistry.register().'
        return violation(line, column + 1, message)
    },

    // Create violation for onKeyDown without ActionRegistry
    // @sig createOnKeyDownViolation :: Object -> Violation
    createOnKeyDownViolation: node => {
        const { column, line } = node.loc.start
        const message =
            `onKeyDown at line ${line} without ActionRegistry. ` +
            'FIX: Register keyboard equivalent via ActionRegistry.register().'
        return violation(line, column + 1, message)
    },

    // Create violation for hardcoded key name bypassing keymap system
    // @sig createHardcodedKeyViolation :: Object -> Violation
    createHardcodedKeyViolation: node => {
        const { column, line } = node.loc.start
        const keyName = node.value === ' ' ? "' '" : `'${node.value}'`
        const message =
            `Hardcoded key name ${keyName} bypasses keymap system. ` +
            'FIX: Move to DEFAULT_BINDINGS and use ActionRegistry.register().'
        return violation(line, column + 1, message)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Validators
//
// ---------------------------------------------------------------------------------------------------------------------

const V = {
    // Run all three ActionRegistry checks on a JSX file
    // Checks 1-2 use file-level registry detection: if ActionRegistry.register exists anywhere in the file,
    // all onClick/onKeyDown handlers are assumed covered. This matches the brainstorm's design — ActionRegistry
    // is a file-level registration pattern, not per-handler. Check 3 (hardcoded keys) still flags per-occurrence.
    // @sig check :: (AST?, String, String) -> [Violation]
    check: (ast, sourceCode, filePath) => {
        if (!ast || !P.isJsxFile(filePath) || PS.isTestFile(filePath)) return []

        const hasRegistry = A.hasActionRegistry(ast)

        return [
            ...(!hasRegistry ? A.collectAttributeNodes(ast, P.isOnClickAttribute).map(F.createOnClickViolation) : []),
            ...(!hasRegistry
                ? A.collectAttributeNodes(ast, P.isOnKeyDownAttribute).map(F.createOnKeyDownViolation)
                : []),
            ...A.collectHardcodedKeyViolations(ast, ast, false),
        ]
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Aggregators
//
// ---------------------------------------------------------------------------------------------------------------------

const A = {
    // Check if a single child value contains ActionRegistry.register
    // @sig hasRegistryInChild :: Any -> Boolean
    hasRegistryInChild: child => {
        if (Array.isArray(child)) return child.some(A.hasActionRegistry)
        return child && typeof child === 'object' ? A.hasActionRegistry(child) : false
    },

    // Check if any descendant is an ActionRegistry.register call
    // @sig hasActionRegistry :: Object -> Boolean
    hasActionRegistry: node => {
        if (!node || typeof node !== 'object') return false
        if (node.type && P.isActionRegistryRegisterCall(node)) return true
        return Object.keys(node).some(key => !META_KEYS.has(key) && A.hasRegistryInChild(node[key]))
    },

    // Collect matching attribute nodes from a child value
    // @sig collectAttributeChild :: ((Object -> Boolean), Any) -> [Object]
    collectAttributeChild: (predicate, child) => {
        if (Array.isArray(child)) return child.flatMap(c => A.collectAttributeNodes(c, predicate))
        return child && typeof child === 'object' ? A.collectAttributeNodes(child, predicate) : []
    },

    // Walk raw AST collecting JSX attribute nodes matching a predicate
    // @sig collectAttributeNodes :: (Object, (Object -> Boolean)) -> [Object]
    collectAttributeNodes: (node, predicate) => {
        if (!node || typeof node !== 'object') return []
        if (node.type && predicate(node)) return [node]
        return Object.keys(node).reduce(
            (acc, key) => (META_KEYS.has(key) ? acc : [...acc, ...A.collectAttributeChild(predicate, node[key])]),
            [],
        )
    },

    // Collect hardcoded key violations from a child value within an exempt context
    // @sig collectKeyChild :: (Boolean, Any, Object) -> [Violation]
    collectKeyChild: (exempt, child, parentNode) => {
        if (Array.isArray(child)) return child.flatMap(c => A.collectHardcodedKeyViolations(c, parentNode, exempt))
        return child && typeof child === 'object' ? A.collectHardcodedKeyViolations(child, parentNode, exempt) : []
    },

    // Walk AST collecting hardcoded key name violations with exempt context tracking
    // @sig collectHardcodedKeyViolations :: (Object, Object, Boolean) -> [Violation]
    collectHardcodedKeyViolations: (node, parent, insideExempt) => {
        if (!node || typeof node !== 'object') return []
        if (Array.isArray(node))
            return node.flatMap(child => A.collectHardcodedKeyViolations(child, parent, insideExempt))
        if (!node.type)
            return Object.values(node).flatMap(child => A.collectHardcodedKeyViolations(child, parent, insideExempt))

        const exempt = insideExempt || P.isActionRegistryRegisterCall(node) || P.isDefaultBindingsDeclaration(node)

        const selfViolations =
            !exempt && P.isHardcodedKeyLiteral(node) && (node.value !== ' ' || P.isInComparisonContext(parent))
                ? [F.createHardcodedKeyViolation(node)]
                : []

        const childViolations = Object.keys(node).reduce(
            (acc, key) => (META_KEYS.has(key) ? acc : [...acc, ...A.collectKeyChild(exempt, node[key], node)]),
            [],
        )

        return [...selfViolations, ...childViolations]
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const PRIORITY = 7
const KEY_NAMES = new Set([
    'ArrowDown',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
    'Enter',
    'Escape',
    'Tab',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    ' ',
])
const META_KEYS = new Set(['type', 'loc', 'range', 'start', 'end', 'raw'])

const violation = FS.createViolation('require-action-registry', PRIORITY)

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run require-action-registry rule with COMPLEXITY exemption support
// @sig checkRequireActionRegistry :: (AST?, String, String) -> [Violation]
const checkRequireActionRegistry = (ast, sourceCode, filePath) =>
    FS.withExemptions('require-action-registry', V.check, ast, sourceCode, filePath)

export { checkRequireActionRegistry }
