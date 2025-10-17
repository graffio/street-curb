# CurbMap Decisions & Questions

## Table of Contents

- [✅ DECIDED](#-decided)
    - [Core Architecture](#core-architecture)
    - [Technical Stack](#technical-stack)
    - [Terminology & Data Model](#terminology--data-model)
- [Architecture References](#architecture-references)
- [📐 ARCHITECTURE DECISION RECORDS (ADRs)](#-architecture-decision-records-adrs)
    - [Data Model Architecture Decisions](#data-model-architecture-decisions)
        - [Hybrid Collection Strategy](#hybrid-collections)
        - [Flat Event Source](#flat-event-source)
        - [Default Project Pattern](#default-project-pattern)
        - [Metadata on Every Document](#metadata-fields)
        - [Organization-Scoped RBAC](#organization-scoped-rbac)
    - [Implementation Decisions](#implementation-decisions)
        - [HTTP Functions vs Firestore Triggers](#http-functions-vs-triggers)
        - [Transaction-Based Idempotency](#transaction-based-idempotency)
        - [Materialized Views Architecture](#materialized-views)
        - [Authentication & Authorization](#authentication-authorization)
    - [Decision Log Summary](#decision-log-summary)
- [🔄 IMPLEMENTATION QUESTIONS](#-implementation-questions)
- [📋 FUTURE CONSIDERATIONS](#-future-considerations)
- [Decision Framework](#decision-framework)

---

## ✅ DECIDED

### Core Architecture

- **App Name**: CurbMap
- **Architecture**: Event sourcing with Firestore queue + giant function
- **Data Model**: Organizations + Projects hierarchy with event scoping
- **Authentication**: Passcode-only, no anonymous users
- **Environments**: `curb-map-development`, `curb-map-staging`, `curb-map-production`

### Technical Stack

- **Error Monitoring**: Sentry.io (better developer experience, superior error grouping)
- **CI/CD Platform**: GitLab (user familiarity, built-in CI/CD, container registry)
- **Billing Strategy**: Single account with project labels for cost tracking
- **Database**: Firestore for events, materialized views for performance
- **Infrastructure**: Firebase + GCP services

### Terminology & Data Model

- **Organizations**: Use "organizations" instead of "cities" (more scalable)
- **Members**: Use "members" instead of "users" (clearer role distinction)
- **Field Naming**: camelCase, never abbreviate, always include "Id" suffix for IDs
- **Event Sourcing**: All changes stored as immutable events, current state calculated
- **Multi-Project**: Design for multiple projects per org, start with default project

## Architecture References

- **Security & Compliance**: See `docs/architecture/security.md` for SOC2, audit logging, and compliance decisions
- **Data Model**: See `docs/architecture/data-model.md` for event sourcing and data isolation patterns
- **Deployment**: See `docs/architecture/deployment.md` for environment strategy and infrastructure decisions

---

## 📐 ARCHITECTURE DECISION RECORDS (ADRs)

### Data Model Architecture Decisions

<a id="hybrid-collections"></a>

#### Hybrid Collection Strategy

**Decision**: Use flat collections for event source and top-level entities (organizations, users), hierarchical
collections for projects and domain data.

**Date**: 2024-11 to 2025-01
**Status**: Implemented

**Problem**: Need to support both cross-organization queries (for admin/support staff) AND complete data isolation (for
multi-tenant security).

**Solution**:

- **Flat collections**: `/completedActions/{id}`, `/organizations/{id}`, `/users/{id}` with `organizationId` field
- **Hierarchical collections**: `/organizations/{orgId}/projects/{projId}`,
  `/organizations/{orgId}/projects/{projId}/surveys/{id}`

**Benefits**:

- Cross-org queries enabled (SOC2 audit reports, admin queries)
- Data isolation enforced via Firestore rules (hierarchical paths)
- Best of both patterns

**Trade-offs**:

- Two patterns to learn (cognitive load)
- More complex than pure flat or pure hierarchical

**Alternatives Considered**:

- Pure flat structure - Rejected (harder to enforce data isolation)
- Pure hierarchical structure - Rejected (cross-org queries impossible)

---

<a id="flat-event-source"></a>

#### Flat Event Source

**Decision**: Store `completedActions` as flat collection with `organizationId` field (not hierarchical under
organizations).

**Date**: 2024-11
**Status**: Implemented

**Problem**: SOC2 compliance requires cross-organization audit queries ("show all actions by user X across all
organizations").

**Solution**: Flat collection with organizational scoping via fields:

```
/completedActions/{id}
{
  id: "acr_123",
  organizationId: "org_abc",  // Field, not path hierarchy
  action: {...},
  actorId: "usr_xyz"
}
```

**Benefits**:

- Cross-org audit queries: `where('actorId', '==', userId)`
- SOC2 compliance reports
- Support staff can debug across organizations

**Trade-offs**:

- Firestore rules must check `organizationId` field (not path-based)

**Alternatives Considered**:

- Hierarchical under organizations - Rejected (can't query across orgs)
- Separate audit collection per org - Rejected (compliance nightmare)

---

<a id="default-project-pattern"></a>

#### Default Project Pattern

**Decision**: Auto-create default project with real CUID2 ID when organization is created.

**Date**: 2024-11
**Status**: Implemented

**Problem**: Need to support single project now, multiple projects later, without data migration.

**Solution**: Every organization gets `defaultProjectId` field pointing to auto-created project with real CUID2:

```
organizations/{org_xyz}:
  defaultProjectId: "prj_abc123"  // Real CUID2, not "default" magic string

organizations/{org_xyz}/projects/{prj_abc123}:
  name: "Default Project"
```

**Benefits**:

- No migration needed when ProjectCreated actions added
- No query rewrites required
- Consistent ID format (all projects use CUID2)

**Trade-offs**:

- Slight storage overhead (1 project doc per org)
- Small complexity now vs massive migration later

**Cost Analysis**:

- Migration cost avoided: 20-40+ hours
- Implementation cost: Already done (OrganizationCreated handler)

**Alternatives Considered**:

- Magic string "default" - Rejected (inconsistent with CUID2 pattern)
- No default project - Rejected (UX complexity)
- Flat structure with migration later - Rejected (too risky/expensive)

---

<a id="metadata-fields"></a>

#### Metadata on Every Document

**Decision**: Add `createdAt`, `createdBy`, `updatedAt`, `updatedBy` to all domain documents, populated by server (not
client).

**Date**: 2024-11
**Status**: Implemented

**Problem**: Need audit trail for who changed what when, prevent client timestamp spoofing.

**Solution**: Event handlers add metadata fields from `actionRequest.actorId` and `serverTimestamp()`:

```
{
  // Domain fields
  name: "City of SF",

  // Metadata (added by handler, NOT in Action payload)
  createdAt: serverTimestamp(),
  createdBy: "usr_abc",  // from actionRequest.actorId
  updatedAt: serverTimestamp(),
  updatedBy: "usr_abc"
}
```

**Benefits**:

- Server-authoritative timestamps (can't be spoofed)
- Fast queries without joining events
- Actor attribution for compliance

**Trade-offs**:

- Data duplication (metadata in both completedActions and domain docs)
- Clients can't provide these fields (would be rejected)

**Implementation**: Action payloads never include metadata fields. Handlers add them programmatically.

**Alternatives Considered**:

- Client-provided timestamps - Rejected (security risk)
- No metadata on domain docs - Rejected (slow queries)
- Metadata only in completedActions - Rejected (requires event replay)

---

<a id="organization-scoped-rbac"></a>

#### Organization-Scoped RBAC

**Decision**: User roles are scoped per organization, stored in `users.organizations` map and Firebase Auth custom
claims.

**Date**: 2024-11 to 2025-01
**Status**: Implemented

**Problem**: Users need different roles in different organizations (consultant admin in SF, member in LA).

**Solution**: Store roles as map in user document + Firebase Auth custom claims:

```
// Firestore /users/{userId}
{
  organizations: {
    "org_sf": "admin",
    "org_la": "member"
  }
}

// Firebase Auth custom claims
{
  organizations: {
    "org_sf": { role: "admin", joinedAt: "2025-01-15" }
  }
}
```

**Benefits**:

- User can have different roles in different orgs
- Fast authorization via token claims (no DB lookup)
- Supports consultants, support staff, multi-org users

**Trade-offs**:

- Custom claims size limit (~1KB, supports ~10 orgs per user)
- Claims don't update until token refresh

**Roles** (MVP): `admin` > `member` > `viewer` (simple role hierarchy)

**Future**: Granular permissions (e.g., `projects:write`, `users:manage`) will replace role enums.

**Alternatives Considered**:

- Global roles - Rejected (no multi-tenant support)
- Separate user per org - Rejected (UX nightmare)
- Database-only (no custom claims) - Rejected (slower authorization)

---

### Implementation Decisions

<a id="http-functions-vs-triggers"></a>

#### HTTP Functions vs Firestore Triggers

**Decision**: Use HTTP Cloud Functions as entry point for all client actions, not Firestore triggers.

**Date**: January 2025
**Specification**: F110.7 - HTTP Action Submission

**Problem**: Original F108/F110 design used Firestore document triggers where client writes ActionRequest to Firestore,
then onDocumentWritten trigger fires. Issues:

- Malformed data can be written to database
- Validation happens AFTER write (audit trail pollution)
- Client gets no immediate feedback on validation errors
- Firestore security rules can't express complex validation logic

**Solution**: HTTP Cloud Functions with validation before database write:

```
Client calls HTTP function with Action payload
  ↓
HTTP function validates request
  ↓ (if invalid)
Returns HTTP 400 with error message (no DB write)
  ↓ (if valid)
Processes action → writes to completedActions
  ↓
Returns HTTP 200 with success response
```

**Benefits**:

1. Validation before database write - Cleaner audit trail
2. Synchronous error responses - Better client UX
3. Better security - Server is gatekeeper
4. Simpler architecture - One less collection (`actionRequests` removed)

**Trade-offs**:

- Requires offline queue for mobile apps (deferred to backlog)
- Web app is online-only (acceptable for desk workers)
- Breaking change - clients must call HTTP function instead of writing to Firestore

**Alternatives Considered**:

- Keep Firestore triggers - Rejected due to validation issues
- Hybrid approach - Rejected for complexity
- Client-side validation only - Rejected for security reasons

---

<a id="transaction-based-idempotency"></a>

#### Transaction-Based Idempotency

**Decision**: Use Firestore transactions for atomic duplicate detection and single write as "completed".

**Date**: January 2025
**Specification**: F110.8 - Transaction-Based Idempotency

**Problem**: Current implementation violated SOC2 audit log immutability by writing "pending" → updating to "completed".
Issues:

- Mutates audit trail (SOC2 violation)
- Race conditions in duplicate detection
- Complex error handling for partial states

**Solution**: Transaction-based single write:

```javascript
await db.runTransaction(async tx => {
    // Atomic duplicate check
    const existing = await txContext.completedActions.readOrNull(actionRequest.id)
    if (existing) return { duplicate: true, processedAt: existing.processedAt }
    
    // Process action
    await handler(logger, txContext, actionRequest)
    
    // Single write as "completed"
    await txContext.completedActions.create(actionRequest)
    
    return { duplicate: false }
})
```

**Benefits**:

- Atomic duplicate detection and write (no race conditions)
- Immutable audit trail (SOC2 compliant)
- Crash-safe (all or nothing)
- Simpler code (one path, not two)

**Trade-offs**:

- Requires Firestore transactions (more complex than simple check-then-write)
- Breaking change - HTTP 409 for duplicates instead of HTTP 200 + duplicate flag
- Server timestamps required (more complex than client timestamps)

**Alternatives Considered**:

- Keep write-first pattern - Rejected for SOC2 compliance
- Separate idempotency collection - Rejected for complexity
- Client-side duplicate prevention - Rejected for reliability

---

<a id="materialized-views"></a>

#### Materialized Views Architecture

**Decision**: Handlers write directly to domain collections, eliminating need for separate materialized views.

**Date**: January 2025
**Specification**: F110.6 - Materialized Views (OBSOLETE)

**Original Plan**: Create separate materialized views by listening to `completedActions`:

```
completedActions → Trigger → Build views → Queryable collections
```

**Actual Implementation**: F110 handlers write final state directly to domain collections:

```
HTTP Function → Validates → Processes → Writes to domain collections + completedActions
```

**Collections Written by Handlers**:

- `/organizations/{id}` - Written by OrganizationCreated/Updated/Suspended handlers
- `/users/{id}` - Written by UserCreated/Updated/Deleted/Forgotten/RoleAssigned handlers
- `/organizations/{orgId}/projects/{id}` - Written by OrganizationCreated handler (default project)

**Benefits**:

- No lag between action completion and view availability
- Simpler architecture with fewer moving parts
- Immediately queryable - UI queries these collections directly
- Source of truth - No separate "view building" step needed

**Result**: F110.6 (Materialized Views) became obsolete - the functionality is already built into F110 handlers.

**Future Considerations**: Separate materialized views might be needed for:

1. Complex aggregations across organizations
2. Cross-organization analytics
3. Performance optimization for specific query patterns

---

<a id="authentication-authorization"></a>

#### Authentication & Authorization

**Decision**: Use Firestore security rules for authorization, not middleware.

**Date**: January 2025
**Specification**: F110.5 - Authentication & Authorization

**Problem**: Need to implement authentication and authorization for multi-tenant system.

**Solution**:

- **Authentication**: Firebase Auth with passcode authentication
- **Authorization**: Firestore security rules (not middleware)

**Benefits**:

- Simpler architecture - Security rules handle authorization
- Better performance - No middleware overhead
- Firebase native - Leverages Firebase's security model
- Organization-scoped - Rules can check custom claims

**Trade-offs**:

- Less flexible than middleware approach
- Firebase-specific - Tied to Firestore security rules
- Complex rules - Security rules can be hard to debug

**Alternatives Considered**:

- Authorization middleware - Rejected for complexity
- API Gateway - Rejected for over-engineering
- Custom auth system - Rejected for maintenance burden

---

<a id="organization-members-map"></a>

#### Organization Members Map

**Decision**: Store organization members as map in organization document (not subcollection).

**Date**: October 2025

**Problem**: Org admins need member list visibility, and UI needs to display "Sam Chen edited this curb" even after Sam
removed (querying completedActions for every actor name would be expensive).

**Solution**: Bidirectional membership with soft delete - `organization.members` map (with `removedAt`/`removedBy`
fields) + `user.organizations` map. Single O(1) read for member list, preserves names for UI history.

**Key Points**:

- MemberRemoved: Single org, sets `removedAt`
- UserForgotten: All orgs, GDPR compliant
- Fits municipal scale (50-500 members, under 1MB limit)
- Dual writes on member operations

**Details**: See [data-model.md](architecture/data-model.md#domain-collections) for schema
and [security.md](architecture/security.md#firestore-security-rules) for access control.

**Alternatives Rejected**: Subcollection (over-engineered), query `/users` (security), user data only (no visibility)

---

## Decision Log Summary

| Decision                                   | Date     | Status   | Rationale                                                          |
|--------------------------------------------|----------|----------|--------------------------------------------------------------------|
| Hybrid collection strategy                 | 2024-11  | Accepted | Enables both cross-org queries AND data isolation                  |
| Flat event source                          | 2024-11  | Accepted | Cross-org audit queries for SOC2 compliance                        |
| Default project pattern                    | 2024-11  | Accepted | Avoids expensive post-customer migration                           |
| Metadata on every document                 | 2024-11  | Accepted | Server-authoritative timestamps, fast queries                      |
| Organization-scoped RBAC                   | 2024-11  | Accepted | Multi-org users with different roles per org                       |
| HTTP functions over Firestore triggers     | Jan 2025 | Accepted | Validation before write, synchronous errors, cleaner audit trail   |
| Transaction-based idempotency              | Jan 2025 | Accepted | Atomic duplicate detection, immutable audit trail, SOC2 compliance |
| Handlers write to domain collections       | Jan 2025 | Accepted | Fast reads, no view-building lag, simpler architecture             |
| Firestore security rules for authorization | Jan 2025 | Accepted | Simpler than middleware, Firebase native                           |
| Organization members map                   | Oct 2025 | Accepted | Org admins can see members, audit trail preserves names            |

---

## 🔄 IMPLEMENTATION QUESTIONS

### Stripe Integration

- **Webhook Events**: Which Stripe events to handle? (`invoice.payment_succeeded`, `invoice.payment_failed`,
  `customer.subscription.updated`, `customer.subscription.deleted`)
- **Failure Handling**: How to handle webhook failures and retries?
- **Action Request Integration**: How to integrate Stripe webhooks with action request pattern?

### Email Service

- **Provider**: SendGrid vs alternatives? (SendGrid has SOC2 compliance)
- **Firebase Integration**: Use Firebase "Trigger Email" extension + SendGrid?
- **Implementation**: SMTP provider integration approach?

### Free Tier Strategy

- **Development**: Use emulators for local development?
- **Staging**: Single shared staging environment on paid tier?
- **Limits**: Firestore 50K reads/20K writes per day, Cloud Functions 2M invocations per month

### Audit Log Storage

- **Storage Strategy**: Firestore (expensive, queryable) vs Cloud Logging (cheaper, less queryable)?
- **Cost Modeling**: Long-term costs for 7-year retention?
- **Query Requirements**: What queries needed on audit data?

### Infrastructure Automation

- **Deployment Triggers**: Git-triggered deployment with manual production approval?
- **Service Accounts**: ✅ DECIDED - Service account impersonation for developers, Workload Identity Federation for CI/CD
- **Permission Strategy**: Predefined roles (simpler to maintain than custom roles)

## 📋 FUTURE CONSIDERATIONS

### Scaling & Performance

- **Multi-Region Deployment**: When customers outside North America?
- **Database Migration**: Firestore to PostgreSQL when costs exceed $1000/month?
- **Microservices**: Split giant function when team grows beyond 8 developers?

### Advanced Compliance

- **Additional Frameworks**: HIPAA, FedRAMP, ISO 27001 when enterprise customers request?
- **Zero-Trust Security**: Implement when handling sensitive government data?
- **Enhanced Data Governance**: Advanced policies when we have EU customers?

### Business Model Evolution

- **Multi-Product Platform**: Multi-project architecture implemented, UI when 20% of customers request?
- **Marketplace/Partners**: Third-party integrations when 100+ customers with integration requests?
- **Advanced Billing**: Usage-based billing when current model limits growth?

### Technical Infrastructure

- **GraphQL API**: Expose GraphQL when mobile apps or complex client requirements?
- **Real-Time Collaboration**: Support when customers request collaborative workflows?
- **Advanced Analytics**: Customer-facing analytics when customers request reporting beyond basic exports?

### Operational Excellence

- **Chaos Engineering**: Implement when uptime SLA becomes critical business requirement?
- **Distributed Tracing**: Implement when performance debugging becomes difficult?
- **Disaster Recovery**: Automate when RTO/RPO requirements become stringent?

### Development & Team Scaling

- **Micro-Frontend**: Split frontend when team grows beyond 6 developers?
- **Advanced Testing**: Contract testing, property-based testing when regression testing becomes burdensome?
- **Developer Platform**: Internal platform when developer velocity limited by operational overhead?

### Cost Optimization

- **Reserved Capacity**: Optimize for reserved GCP capacity when monthly costs exceed $5000?
- **Multi-Cloud**: Support AWS, Azure when enterprise customers require specific cloud providers?

## Decision Framework

### Criteria for Revisiting

1. **Customer Demand**: >25% of customers request feature
2. **Scale Threshold**: Technical limits of current approach
3. **Competitive Pressure**: Market forces require capability
4. **Team Growth**: Current architecture limits team productivity
5. **Cost Pressure**: Current approach becomes unsustainable

### Evaluation Process

1. Document current pain points and limitations
2. Research industry best practices and alternatives
3. Prototype solution in non-production environment
4. Calculate implementation cost vs business benefit
5. Plan migration strategy with rollback options
6. Document decision rationale for future reference

### Success Criteria

Future architecture decisions are data-driven and support sustainable business growth.
