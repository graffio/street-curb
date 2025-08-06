# LLM Loader for A006 – Specification Format Standard

This specification defines the format, file structure, roles, and behavioral expectations for all specifications used in this system.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines the structure and meaning of all supported spec files
3. `tests.yaml`: Optional validation cases to test conformance of other specs

## Granularity Levels
- **Phase-Level**: Abstract phases - good for planning, bad for LLM execution
- **Task-Level**: Specific tasks - good for LLM execution, requires execution_status

## Task-Level Instructions
- Execute ONLY the current task identified in execution_status.current_task
- Complete all validation criteria for the current task
- Update execution_status section with results
- STOP and report completion to human
- Do NOT proceed to next task without human instruction
