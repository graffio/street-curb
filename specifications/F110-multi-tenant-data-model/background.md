# F110 - Multi-Tenant Data Model

**Define the domain model for organizations, projects, and users**

## Overview

This specification defines the domain model (Action types and event handlers) for CurbMap's multi-tenant architecture. The domain model follows the organization + project hierarchy pattern defined in [multi-tenant], with all domain events processed through F108's event sourcing infrastructure.

    `Action Types → Event Handlers → Hierarchical Collections`

This specification focuses solely on defining the domain model. APIs, authorization, materialized views, and data isolation belong in later specs (F110.5, F110.6, and backlog).

## References

- [multi-tenant] — Organization/project patterns, data isolation rules
- [event-sourcing] — Event sourcing patterns
- F108 — Event sourcing infrastructure (completed)

## Simplified Implementation

### Single Task: Domain Model Definition

**task_1_domain_events** (12 hours)
- Test auth helpers (minimal for testing only)
- Action type definitions (OrganizationCreated, ProjectCreated, UserAdded, etc.)
- Event handlers (organization, project, user domain logic)
- F108 integration (dispatch from giant function)
- Hierarchical Firestore collections
- Basic integration tests

## Deferred to Later Specs

### F110.5 (Authentication & Authorization)
- Organization/Project CRUD APIs
- Authorization middleware
- Role-based permissions
- Data isolation middleware
- Cross-tenant protection

### Backlog (Future Enhancements)
- Materialized view optimization (F110.6 provides basic views)
- CRUD API wrappers
- Performance optimization
- Load testing

## Rationale

F110 defines the **domain model only** - what Actions exist and how they're processed. Authorization and APIs require a full auth system (F110.5), which can only be properly designed after the domain model is clear.

By completing F110 first, we enable F110.5 to implement authorization rules that match the actual domain model rather than guessing what Actions will exist.

[multi-tenant]: ../../docs/architecture/multi-tenant.md
[event-sourcing]: ../../docs/architecture/event-sourcing.md
