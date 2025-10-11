# F110.5 - Authentication & Authorization System

**Implement authentication and authorization for CurbMap**

## Overview

This specification implements authentication (Firebase Auth) and authorization (Firestore security rules) for CurbMap. The system uses phone number + SMS passcode authentication with organization-scoped custom claims, secured via Firestore rules.

    Phone → Firebase Auth → Custom Claims → Security Rules → Data Access

This specification is **deferred** until after F110 (domain model) is complete. Authorization rules cannot be properly defined without knowing what Actions exist.

## References

- [authentication] — Firebase Auth patterns, custom claims structure
- [security] — Authorization patterns, security rules
- [multi-tenant] — Organization scoping and role hierarchy
- F110 — Domain model (must be complete first)

## Simplified Implementation

### Three Tasks (18 hours total)

**task_1_authentication** (8h)
- Firebase Auth configuration (passcode authentication)
- Custom claims system (organization roles and permissions)
- Basic auth middleware (token verification)
- Integration with F110 domain model

**task_2_authorization** (6h)
- Firestore security rules (NOT middleware)
- Authorization via rules (check custom claims)
- Organization-scoped access control
- Role-based permissions (admin, member, guest)

**task_3_integration_testing** (4h)
- End-to-end testing
- Data isolation verification
- Permission enforcement testing

## Deferred to Backlog

### From Original F109
- SMS delivery complexity (Firebase handles natively)
- Impersonation system (production support feature)
- Operational monitoring (production deployment)
- Load testing (after MVP)

### CRUD APIs
- Not needed for MVP (clients write ActionRequests directly)
- Move to backlog for webhooks/external integrations later

## Rationale

**Why deferred until after F110**: Cannot define authorization rules without knowing what Actions exist in the domain model.

**Why security rules over middleware**: Simpler, client writes directly to Firestore, rules enforce at database level.

**Why no CRUD APIs**: For MVP, clients can write ActionRequests directly to Firestore. APIs only needed later for external integrations.

[authentication]: ../../docs/architecture/authentication.md
[security]: ../../docs/architecture/security.md
[multi-tenant]: ../../docs/architecture/multi-tenant.md
