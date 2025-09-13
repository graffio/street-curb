# Phase 1a: Firebase Project & SOC2 Audit Infrastructure

**Goal**: Bridge phase 1 orchestration with phase 2 event sourcing by creating Firebase project and basic SOC2 compliance.

## What We're Building

### Firebase Project Setup
- GCP project with Firebase enabled
- Firestore database with basic collections
- Security rules for infrastructure audit logging

### SOC2 Audit Infrastructure
- `audit_trail` collection for infrastructure command tracking
- Simple audit logging Firebase Function
- Retroactive audit entries for existing 000/001 migrations

### Orchestration Integration
- Update orchestration executor to write audit records
- Correlation IDs linking commands to audit entries

## Deliverables

### Orchestration Infrastructure (Prerequisites)
- [ ] Config-as-output system: Migrations write generated IDs to timestamped config files
- [ ] Automatic test execution: Run migration tests after each migration success
- [ ] Retrofit 000/001 migrations to capture folder IDs and include tests
- [ ] Sequential execution with test validation: Migration N+1 only runs if Migration N + tests pass

### Firebase & SOC2 Infrastructure  
- [ ] Single complete Firebase migration (`002-create-complete-firebase.js`)
- [ ] Infrastructure audit logging function (`functions/src/audit/logInfrastructureCommand.js`)
- [ ] Orchestration executor audit integration
- [ ] Retroactive audit entries for 000/001 commands

### Migration Strategy
- **Single migration per environment**: `002-create-complete-firebase.js` handles project creation, Firestore setup, and audit collections
- **Config-driven**: Same migration code works across dev/test/staging/prod using environment-specific config files
- **Development first**: Build and test in dev environment before creating other environments

## Audit Schema

```javascript
// audit_trail collection
{
  auditId: "cuid2",
  commandId: "create-development-folder",
  operation: "execute|rollback", 
  userId: "admin@curbmap.app",
  timestamp: "serverTimestamp",
  environment: "dev|staging|prod",
  correlationId: "uuid",
  result: { status: "success|failed", output: "...", duration: 1234 },
  backfilled: true // for retroactive entries
}
```

## What We're NOT Doing Yet

**Deferred to Later Phases:**
- [ ] User authentication audit (`user_sessions` collection - empty for now)
- [ ] User data access audit (`access_logs` collection - empty for now)  
- [ ] Firebase Console access tracking (wait until user data exists)
- [ ] Google Cloud audit logs integration
- [ ] Complete event sourcing system (phase 2)
- [ ] User management features (phase 3)

**Decisions Still Needed:**
- [ ] What constitutes "user data access" for `access_logs`
- [ ] Whether to require all prod changes through orchestration
- [ ] How to handle Firebase Console access in production
- [ ] Audit log retention policies
- [ ] Who gets access to audit trail data
- [ ] When to create test/staging/prod environments (after phase 2? 3? 9?)

## Environment Strategy

### Multi-Environment Approach
- **Development**: Create first for iteration and testing
- **Test/Staging/Production**: Create when needed, not automatically
- **Migration testing**: Use timestamped throwaway projects (`test-2025-09-10-1705`) to verify migration sequences before prod deployment

### Firebase Project Name Limitations
- **30-day lockout**: Deleted Firebase project names unusable for 30 days
- **Testing strategy**: Use disposable timestamped test projects for migration verification
- **No rollback assumption**: Many migrations (project creation, IAM, DNS) are irreversible
- **Risk mitigation**: Thorough testing in throwaway environments before prod deployment

## Success Criteria

- [ ] Firebase project exists and accessible
- [ ] Firestore collections created with proper security
- [ ] Infrastructure commands generate audit trail entries
- [ ] Retroactive audit entries created for 000/001
- [ ] Orchestration system writes audit data automatically
- [ ] Basic SOC2 compliance for infrastructure changes established

**Next**: Proceed to Phase 2 event sourcing with Firebase project in place.