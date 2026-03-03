// ABOUTME: Query pipeline entry point — wires parser, validator, and execution engine in sequence
// ABOUTME: Returns structured results with phase-tagged errors on failure

import { queryExecutionEngine } from './query-execution-engine.js'
import { queryParser } from './query-parser.js'
import { queryValidator } from './query-validator.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const MAX_QUERY_SIZE = 102400

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run a query string through parse → validate → execute, returning structured results
// @sig queryPipeline :: (String, DataSummary, Object) -> PipelineResult
const queryPipeline = (queryString, dataSummary, state) => {
    if (queryString.length > MAX_QUERY_SIZE) {
        const message = `Query exceeds maximum size of ${MAX_QUERY_SIZE} bytes`
        return { success: false, phase: 'parse', errors: [{ message }] }
    }

    const { success, ir, errors } = queryParser(queryString)
    if (!success) return { success: false, phase: 'parse', errors }

    const validated = queryValidator(ir, dataSummary)
    return validated.valid
        ? { success: true, result: queryExecutionEngine(ir, state) }
        : { success: false, phase: 'validate', errors: validated.errors }
}
export { queryPipeline }
