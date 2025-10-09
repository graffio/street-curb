# F110.6 - Materialized Views

**Create queryable views from completedActions for UI consumption**

## Overview

This specification implements materialized views that the UI (React/Redux) needs to display and query data. Views consume events from F108's completedActions collection and maintain cached, queryable representations of organizations, projects, and users.

    `completedActions (events) → Triggers → Materialized Views (cached data)`

Without these views, the UI has no way to list organizations, display project details, or show user rosters.

## References

- [event-sourcing] — Materialized view patterns
- [multi-tenant] — Organization/project data structures
- F108 — Event sourcing infrastructure (completedActions collection)
- F110 — Domain model (Action types that create the events)

## Why Now?

**F113 (React/Redux UI) depends on these views!**

The React/Redux UI needs to:
1. **Display current state** → reads from materialized views
2. **Create/edit data** → writes ActionRequests to Firestore
3. **Show lists and details** → queries materialized views

You can't build F113's UI without materialized views to read from.

**Note**: Offline infrastructure (F111) is deferred until mobile apps are needed.

## Implementation

### Single Task: Basic Materialized Views

**task_1_views** (8 hours)
- Listen to completedActions onCreate
- Write to flat collections: `/organizations/{id}`, `/users/{id}`
- Write to nested: `/organizations/{orgId}/projects/{projId}`
- Idempotent updates (lastProcessedActionId tracking)
- Basic queries work (list orgs, get project, find users)
- Integration tests

## Out of Scope (Deferred)

- Complex aggregations (defer to backlog - after MVP)
- View optimization (defer to backlog - until performance issues)
- Real-time subscriptions (defer to backlog - not needed for MVP)
- Advanced querying/filtering (defer to backlog - basic queries sufficient)

## Rationale

F113's React UI requires materialized views to display organizations, projects, and users. This spec provides the minimum views needed for a functional UI, deferring optimization and advanced features until after the MVP works.

Building the web UI (F113) first is more pressing than offline infrastructure (F111), and will inform what offline capabilities are actually needed for mobile apps later.

[event-sourcing]: ../../docs/architecture/event-sourcing.md
[multi-tenant]: ../../docs/architecture/multi-tenant.md
