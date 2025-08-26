# LLM Loader for F116 – LookupTable Blockface Migration

This specification migrates Redux state from flat curb structure to LookupTable<Blockface> architecture for proper database integration and multi-blockface support.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines migration tasks and data model changes
3. `tests.yaml`: Validation test cases for migration correctness

## Context from F115
F115 completed Redux refactoring with tagged types (Segment and Blockface). Task 5 was strategically skipped because implementing tagged Segments in the flat curb structure would be throwaway work when migrating to LookupTable architecture.

## Current State
- Redux state: `state.curb = { segments: [...], blockfaceLength: 240, blockfaceId: 'id' }`
- Components expect flat structure through selectors
- All 170 tests passing with clean Redux architecture

## Target State  
- Redux state: `state.blockfaces = LookupTable({ 'id': Blockface(...) })`
- UI state: `state.ui = { currentBlockfaceId: 'id' }`
- Blockfaces contain tagged Segments within them
- Components work with current blockface through new selectors

## Task-Level Instructions
- Execute ONLY the current task identified in `execution_status.current_task`
- Complete all validation criteria for the current task
- Update execution_status section with results
- STOP and report completion to human
- Do NOT proceed to next task without human instruction

## Migration Strategy
This is a significant architectural change touching Redux state shape, selectors, action handlers, and components. Tasks are designed to be incremental and rollback-friendly with comprehensive testing at each step.