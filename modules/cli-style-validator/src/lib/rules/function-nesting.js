// ABOUTME: Rule to detect module-level functions that should be nested inside their sole caller
// ABOUTME: RETIRED - replaced by cohesion-structure.js (P/T/F/V/A cohesion groups)

/**
 * Check for single-use module-level functions that should be nested
 *
 * RETIRED: This rule is disabled in favor of cohesion-structure.js.
 * All functions should now go in P/T/F/V/A cohesion groups at module level,
 * rather than being nested inside their callers.
 * @sig checkFunctionNesting :: (AST?, String, String) -> [Violation]
 */
const checkFunctionNesting = () => []

export { checkFunctionNesting }
