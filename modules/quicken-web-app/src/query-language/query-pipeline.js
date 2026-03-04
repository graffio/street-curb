// ABOUTME: Query pipeline entry point — wires validator and execution engine in sequence
// ABOUTME: Accepts IR directly (Claude constructs IR from natural language), returns structured results

import { queryExecutionEngine } from './query-execution-engine.js'
import { queryValidator } from './query-validator.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Run an IR through validate → execute, returning structured results
// @sig queryPipeline :: (QueryIR, DataSummary, Object) -> PipelineResult
const queryPipeline = (ir, dataSummary, state) => {
    const validated = queryValidator(ir, dataSummary)
    return validated.valid
        ? { success: true, result: queryExecutionEngine(ir, state) }
        : { success: false, phase: 'validate', errors: validated.errors }
}
export { queryPipeline }
