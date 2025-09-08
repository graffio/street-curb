# Next Step: Complete Migration to Vanilla Command Pattern

## Developer Implementation Task

Implement the vanilla command executor functions to make `test/command-foundation.tap.js` tests pass, completing the migration from Tagged adapter pattern to simple JavaScript command objects.

## Context

The `test/command-foundation.tap.js` file defines the target API using vanilla JavaScript command objects with direct `execute()` and `rollback()` functions. The current executor still uses the old Tagged InfrastructureStep + adapter registry pattern.

## File Changes Required

### 1. package.json
Update module name:
```json
{
  "name": "@graffio/infrastructure-orchestration",
  "description": "Infrastructure orchestration with command pattern and audit logging"
}
```

### 2. src/core/executor.js
Replace the existing Tagged/adapter implementation with vanilla command functions:

```javascript
// New functions to implement:
export const executeCommands = async (commands) => {
  // Sequential execution with fail-fast behavior
  // Return array of { command, result, success, error?, executionTime }
}

export const rollbackCommands = async (executedCommands) => {
  // Reverse-order rollback with error capture
  // Return array of { command, result, success, error?, executionTime }
}

export const executePlan = async (commands, dependencies = {}) => {
  // Orchestration with audit logging (if auditLogger provided)
  // Execute commands, rollback on failure, return comprehensive result
  // Return { success, executedCommands, rollbackCommands }
}
```

### 3. Remove old adapter files
Delete or rename files that implement the old Tagged pattern:
- Any files containing `InfrastructureStep`, `InfrastructureAdapter`, or adapter registry lookups
- Keep migration files that will use the new pattern

## Implementation Requirements

1. **Sequential execution**: Commands execute in array order with fail-fast behavior
2. **Reverse rollback**: Rollback occurs in reverse execution order
3. **Error preservation**: Capture all error details including error codes and messages
4. **Timing capture**: Record execution time for each command
5. **Audit integration**: Log to `dependencies.auditLogger` if provided
6. **Graceful failure**: Handle commands without rollback functions appropriately

## Validation Commands

After implementation, run:
```bash
cd /Users/Shared/projects/graffio-monorepo/modules/commands
yarn test test/command-foundation.tap.js
```

## Success Criteria

- [ ] All 42 tests in `command-foundation.tap.js` pass
- [ ] Package renamed to `@graffio/infrastructure-orchestration`  
- [ ] Old adapter abstraction layer removed
- [ ] New executor functions handle all test scenarios correctly
- [ ] Error handling preserves all failure details
- [ ] Audit logging integration works when dependencies provided

## Expected Outcome

Working vanilla command executor with ~20 lines of core logic plus error handling, audit integration, and comprehensive test coverage. The module handles infrastructure orchestration with proper audit trails while using the simple Command pattern internally.
