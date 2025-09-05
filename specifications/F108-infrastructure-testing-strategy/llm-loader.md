# LLM Loader for F108 – Infrastructure Testing Strategy Phase 1

This specification defines Phase 1 of the A/B infrastructure migration testing strategy: creating test adapter foundation for validating complex infrastructure orchestration without real Firebase operations.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines the structure and meaning of all supported spec files
3. `tests.yaml`: Validation cases to test conformance

## Phase 1 Context: Test Adapter Foundation

### Problem Statement
Infrastructure migrations often fail and are **not-reversible**. The existing system has:
- Working plan/apply architecture with UI/Core/Adapters separation
- Function registry execution system (InfrastructureStep.commands)
- Alice/Bob test adapters in `test/adapter-foundation.tap.js`
- Premature Firebase adapters that should be removed

### Phase 1 Goal
Create minimal test adapters that can store state and execute basic operations to validate the A/B migration strategy before any real Firebase operations.

## Task-Level Instructions
- Execute ONLY the current task identified in execution_status.current_task
- Complete all validation criteria for the current task
- Update execution_status section with results
- STOP and report completion to human
- Do NOT proceed to next task without human instruction

## Current Architecture
The existing code has Alice/Bob adapters embedded in test files. Phase 1 extracts these into proper test adapter modules that:
- Store state in local JSON files
- Persist between CLI invocations
- Simulate Firebase operations without Firebase CLI dependency
- Enable testing of complex orchestration patterns

## Success Criteria
Working test adapters with basic create/delete operations using local state persistence, enabling systematic testing of A/B migration workflows.