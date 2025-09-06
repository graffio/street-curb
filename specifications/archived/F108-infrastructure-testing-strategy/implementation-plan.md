# F108: A/B Infrastructure Migration Testing Strategy

## Context: Why This Approach

### The Problem
Infrastructure migrations often fail and are **not-reversible**:
- Schema changes that can't be rolled back
- External service API deprecations
- Partial state corruption during migration
- Network failures during critical operations

### Failed Alternatives Considered
- **Fix-in-place**: Violates SOC2 compliance (manual production changes)
- **Rollback strategies**: Many operations genuinely can't be reversed
- **Drift detection as blocking**: Prevents progress when state changes
- **Simple create/delete**: No safety net when migrations fail

### A/B Version Strategy (Required)
**Scenario**: Migrating from version 47 to 48
- Without A/B: Migration 47→48 fails, stuck with broken infrastructure
- With A/B: Keep 46a running, migrate 46a→47c (clean copy), then 47c→48a

**Version Flow**: Always maintain N-1 (working) and N (current):
- Have: 46a (known good), 47a (current; known good)
- Migrate: 46a → 47b (create new 47 from known good 46)  
- If 47b→48a fails: migrate 46a → 47c, fix issues, retry 47c→48a
- Never lose working state, always have fallback path

### Why Test Adapters (Not Firebase)
- Test complex orchestration without infrastructure costs
- Simulate every failure mode safely
- Validate A/B strategy before risking real environments
- Enable CI/CD testing of infrastructure management

## Architecture: Current State

The existing code in `modules/infrastructure-management/` has a working plan/apply architecture with UI/Core/Adapters separation. The current system handles create/delete operations and needs extension for A/B migration strategy.

## Implementation: Mechanical Steps

### Phase 1: Test Adapter Foundation

**Goal**: Create minimal test adapters that can store state and execute basic operations

**Code Changes**:
- **NEW**: `test/adapters/test-firebase/` directory with state.js, planner.js, executor.js
- **MODIFY**: `src/core/planner.js` - Add `--additional-adapter-path` support to loadAdapterPlanners()
- **MODIFY**: `src/cli.js` - Add `--additional-adapter-path` flag parsing

**Implementation**:
1. Create test adapter directory structure with minimal JSON state operations
2. Modify planner to load adapters from additional paths
3. Add CLI flag for specifying test adapter locations

**Test Development**: `test/adapter-foundation.tap.js`
- Verify CLI loads additional adapters correctly
- Confirm state persists between CLI invocations (JSON files survive)
- Basic operations (create project, delete project) update local state

**Output**: Working test adapters with basic create/delete operations using local state

### Phase 2: A/B Migration Operations

**Goal**: Add version parsing and migration command support

**Code Changes**:
- **NEW**: `src/core/version-utils.js` - Parse version strings (dev-46a → base/version/variant)
- **MODIFY**: `src/core/planner.js` - Add `migrate-environment` to getRequiredAdapters()
- **MODIFY**: `test/adapters/test-firebase/planner.js` - Add migration planning logic
- **MODIFY**: `src/cli.js` - Add `migrate-environment` command parsing

**Implementation**:
1. Create version parsing utilities for A/B version management
2. Extend planner to recognize migration operations
3. Add migration logic to test adapters
4. Add CLI command for migration operations

**Test Development**: `test/migration-basic.tap.js`
- Parse version strings correctly (dev-46a → components)
- Generate migration plan from existing version
- Execute migration creates new version in test adapter state
- Audit log records migration operations

**Output**: Working A/B migration with version management in test environment

### Phase 3: Failure Scenarios (Progressive Complexity)

**Goal**: Systematically test every failure mode through increasing complexity

**Code Changes**:
- **MODIFY**: `test/adapters/test-firebase/executor.js` - Add environment variable failure injection
- **MODIFY**: `src/core/executor.js` - Add rollback logic and error recovery
- **NEW**: `test/failure-utils.js` - Utilities for failure simulation and validation

**Phase 3A Implementation**: Basic failure injection
- Environment variable parsing for failure modes (TEST_FIREBASE_FAIL_ON=create)
- Exit code and timeout handling
- Plan expiration validation

**Phase 3B Implementation**: State corruption and rollback
- Multi-step operation failure handling with rollback
- Version conflict detection and resolution
- Partial state corruption simulation

**Phase 3C Implementation**: Complex orchestration failures
- Migration chain retry logic (46a→47b fails, try 46a→47c)
- Cross-adapter coordination failures
- Concurrent operation detection

**Phase 3D Implementation**: Edge cases and malicious scenarios
- Adapter result validation and corruption detection
- State consistency verification
- Edge case version parsing (dev-47aa, dev-100z)

**Test Development**: Progressive test files (`simple-failures.tap.js` → `evil-scenarios.tap.js`)

**Output**: Comprehensive failure testing with graceful degradation

### Phase 4: Integration Testing

**Goal**: End-to-end validation using only test adapters

**Code Changes**:
- **NEW**: `test/integration/` - End-to-end workflow tests
- **MODIFY**: `src/core/audit.js` - Enhanced audit trail verification
- **NEW**: `test/ci-validation.tap.js` - CI/CD compatibility testing

**Implementation**:
- Complete A/B migration workflows (46a → 47a → 48a)
- Multi-adapter coordination testing (Firebase + GCP)
- Audit trail verification and SOC2 compliance validation
- CI/CD integration testing with deterministic results

**Output**: Production-ready infrastructure management system validated entirely through local testing

## Incremental Adapter Development

### Phase 1 Adapter Requirements
```javascript
// Minimal viable test adapter
export const getCurrentState = () => ({ projects: [], timestamp: Date.now() })
export const generateSteps = (operation, config) => [{ operation, adapter: 'test-firebase' }]
export const executeStep = (step) => ({ success: true, duration: 100 })
```

### Phase 2 Adapter Requirements
Add version parsing and migration support to existing minimal adapters

### Phase 3 Adapter Requirements
Add failure injection capabilities through environment variables

### Phase 4 Adapter Requirements
Add full state validation and corruption detection

This strategy ensures the infrastructure management system is thoroughly tested and proven reliable before any real Firebase operations are performed.
