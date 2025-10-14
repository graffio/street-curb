# F110.6 - Materialized Views [OBSOLETE]

## Status: Superseded by F110 Implementation

This specification has been superseded by the F110 implementation approach.

**Date obsoleted**: January 2025
**Reason**: F110 handlers write directly to domain collections, which serve as both domain model and queryable views. Separate view-building infrastructure is not needed.

## What Happened

The original F110.6 plan was to create separate materialized views by listening to `completedActions` and building cached collections:

```
Original plan:
completedActions → Trigger → Build views → Queryable collections
```

However, F110 handlers already write final state directly to domain collections:

```
Actual implementation:
HTTP Function → Validates → Processes → Writes to domain collections + completedActions
```

### Collections Written by F110 Handlers

- `/organizations/{id}` - Written by OrganizationCreated/Updated/Suspended handlers
- `/users/{id}` - Written by UserCreated/Updated/Deleted/Forgotten/RoleAssigned handlers
- `/organizations/{orgId}/projects/{id}` - Written by OrganizationCreated handler (default project)

### Why These Collections Serve as Views

**They include all necessary metadata**:
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy` - Added by handlers from actionRequest
- Indexed by `organizationId`, `projectId` - Enables multi-tenant queries
- Immediately queryable - No lag between action completion and view availability

**They are the source of truth**:
- No separate "view building" step needed
- UI queries these collections directly
- Simpler architecture with fewer moving parts

## When Might Separate Views Be Needed?

Future scenarios that could require additional materialized views:

1. **Complex aggregations**: Summary statistics across organizations
   - Example: "Show total users across all organizations"
   - Current: Would need to query all organizations

2. **Denormalized data**: Embedding related entities for faster queries
   - Example: Embed project details in every curb document
   - Current: Join via projectId lookup

3. **Search indexes**: Full-text search across multiple fields
   - Example: "Search organizations by name or address"
   - Current: Firestore text search is limited

4. **Analytics dashboards**: Time-series data, usage metrics
   - Example: "Daily active users over last 30 days"
   - Current: Would query completedActions directly

5. **Cross-organization reports**: Data spanning multiple tenants
   - Example: "System-wide metrics for admin dashboards"
   - Current: Multi-tenant isolation makes this difficult

### If Views Are Needed Later

Follow the original F110.6 pattern:
- Listen to `completedActions` collection
- Build denormalized/aggregated views in separate collections
- Track `lastProcessedActionId` for idempotency
- Update views incrementally as new actions complete

## See Also

- **F110**: Domain model implementation (handlers write to collections)
- **F110.7**: HTTP action submission (replaces Firestore triggers)
- **F110.5**: Authentication (validates access to collections)
- **F108**: Event sourcing (completedActions audit trail)

## Original Specification (Archived)

The original F110.6 specification called for:
- Single task: Basic Materialized Views (8 hours)
- Listen to completedActions onCreate
- Write to flat collections: `/organizations/{id}`, `/users/{id}`
- Write to nested: `/organizations/{orgId}/projects/{projId}`
- Idempotent updates (lastProcessedActionId tracking)

This functionality is now provided by F110 handlers directly.

[event-sourcing]: ../../docs/architecture/event-sourcing.md
[multi-tenant]: ../../docs/architecture/multi-tenant.md
