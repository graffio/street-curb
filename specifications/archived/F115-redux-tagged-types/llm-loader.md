# LLM Loader for F115 – Redux Architecture Refactoring with Tagged Types

**CRITICAL**: This is a task-level specification. Execute ONLY the current task identified in `execution_status.current_task` in logic.yaml, then STOP and report completion.

## Overview
Refactor the Redux store architecture to use tagged types for domain entities and improve file organization for better maintainability and database integration preparation.

## Load Order
1. `meta.yaml`: Specification metadata and dependencies
2. `logic.yaml`: Detailed implementation tasks and data model decisions
3. `tests.yaml`: Validation criteria for each task

## Key Architectural Decisions
- **Domain Entity Types**: Use tagged types for `Segment` and `Blockface`
- **Storage Pattern**: Blockfaces in LookupTable, segments as arrays within blockfaces
- **File Organization**: Flat structure (actions.js, selectors.js) for discoverability
- **Database Target**: Firestore with segments as JSON arrays in documents
- **Validation Philosophy**: Tagged types validate structure, business logic validates semantics

## Execution Instructions
1. Read `logic.yaml` to understand current task
2. Execute ONLY the task marked as `current_task`
3. Complete all validation criteria for that task
4. Update `execution_status` section with results
5. STOP and report completion - do NOT proceed to next task

## Context
This refactoring prepares the Redux store for:
- Runtime type validation with tagged types
- Future database integration with Firestore
- Better file organization and maintainability
- Multi-format export capabilities (CDS, GeoJSON)