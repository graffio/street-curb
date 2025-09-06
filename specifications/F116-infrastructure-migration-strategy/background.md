# F116: Infrastructure Migration Strategy - Background

## Strategic Context

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

### Why Test Adapters Are Essential
- Test complex orchestration without infrastructure costs
- Simulate every failure mode safely
- Validate migration strategy before risking real environments
- Enable CI/CD testing of infrastructure management

## Course Change from F108
We pivoted from A/B parallel environments to restore-based rollback after researching Firebase's native capabilities. See archived F108 for the original strategy and reasoning.

## Current Strategy: Restore-Based Migration

### Migration Approach
- **Attempt migration**: Run operations in-place on current environment
- **If migration fails**: Human decides strategy:
  1. **Roll forward**: Fix issues and continue to target state
  2. **Roll back**: Try adapter rollback functions → If rollback fails → Restore from backup/PITR
- **Retry**: Address issues and attempt migration again

### SOC2 Compliance
- Firebase's SOC2 certification supports our compliance but doesn't replace it
- Our system provides comprehensive audit logging with operator attribution
- Immutable audit trails for all infrastructure changes
- Change management processes with confirmation workflows

## Phase 1: Complete
- Alice/Bob test adapters working in test files
- Function registry system (InfrastructureStep.commands)  
- Plan/execute/rollback workflows validated
- All create/delete operations tested (152/152 tests passing)
- No premature Firebase adapters (removed until properly tested)

## Current Focus: Phase 3 Failure Testing

### Goal
Systematically test every failure mode through increasing complexity using Alice/Bob test adapters.

### Implementation Approach
Extend existing `test/adapter-foundation.tap.js` with increasingly sophisticated failure scenarios rather than building separate failure injection systems.

**Current test coverage** (already working):
- Basic operation failures and missing commands
- Rollback function failures  
- Multi-adapter coordination (Alice succeeds → Bob fails → Alice rolls back)
- Complete round-trip rollback scenarios

**Additional scenarios to add**:
- More complex multi-step failure chains
- Timeout and network failure simulation
- Invalid configuration handling
- Edge cases in adapter coordination

## Remaining Work
1. **Remove drift detection**: Current code has state management/drift detection that we're not implementing yet
2. **Extend failure scenarios**: Add more sophisticated tests to adapter-foundation.tap.js  
3. **Future specs**: CLI redesign and real Firebase adapter implementation

## Future F117+: Advanced Features

### Key Findings
- Firestore: Excellent restore support (PITR + scheduled backups)
- Data Connect: Full Cloud SQL backup/restore capabilities
- Storage: Limited (manual gsutil backup, tokens break on restore)
- External services: Varying levels of backup/restore support

### Drift Detection
**Concept**: Compare expected vs actual state of live systems
- Query Firebase/Stripe/Sentry APIs to see what actually exists
- Compare against what our system thinks should exist
- Detect when someone manually changed production via consoles
- Provide drift resolution strategies

**Examples of drift**:
- Security rules modified via Firebase console
- Webhook endpoints disabled via Stripe dashboard  
- Indexes deleted via Firestore console

### Firebase Restore Capabilities Research

**Firestore**:
- Point-in-time recovery (7 days granularity: 1 minute)
- Scheduled backups (up to 14 weeks retention)
- In-place restore capability

**PostgreSQL (Data Connect)**:
- Cloud SQL backup and restore
- Point-in-time recovery
- Can create new instances from backups

**Forward-only services** (no restore capability):
- Stripe: Custom scripts needed for data replication
- Sentry: Limited backup/restore (mainly for self-hosted)
- Other external services: Accept forward-only risk

*Note: This research will inform real Firebase adapter implementation when we get there.*
