---
summary: "Zero-trust security architecture with passcode-only authentication, RBAC, and SOC2 compliance for multi-tenant curb data management"
keywords: ["security", "authentication", "authorization", "rbac", "soc2", "firestore-rules", "zero-trust"]
last_updated: "2025-01-15"
---

# Security Architecture

## Table of Contents
- [1. Overview](#1-overview)
  - [1.1 Architecture Map](#11-architecture-map)
  - [1.2 Why This Architecture](#12-why-this-architecture)
  - [1.3 Key Components](#13-key-components)
  - [1.4 Trade-offs Summary](#14-trade-offs-summary)
  - [1.5 Current Implementation Status](#15-current-implementation-status)
  - [1.6 Key Design Decisions](#16-key-design-decisions)
- [2. Problem & Context](#2-problem--context)
  - [2.1 Requirements](#21-requirements)
  - [2.2 Constraints](#22-constraints)
- [3. Architecture Details](#3-architecture-details)
  - [3.1 Authentication Flow](#31-authentication-flow)
  - [3.2 Authorization Model](#32-authorization-model)
  - [3.3 Firestore Security Rules](#33-firestore-security-rules)
  - [3.4 Service Account Impersonation](#34-service-account-impersonation)
  - [3.5 Impersonation System](#35-impersonation-system)
- [4. Implementation Guide](#4-implementation-guide)
  - [4.1 Quick Start: Implementing Authentication](#41-quick-start-implementing-authentication)
  - [4.2 Code Locations](#42-code-locations)
  - [4.3 Firebase Auth Implementation (Detailed)](#43-firebase-auth-implementation-detailed)
  - [4.4 Rate Limiting](#44-rate-limiting)
  - [4.5 Testing](#45-testing)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
  - [5.1 What This Enables](#51-what-this-enables)
  - [5.2 What This Constrains](#52-what-this-constrains)
  - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)

---

## 1. Overview

CurbMap implements zero-trust security with passcode-only authentication, role-based access control (RBAC), and SOC2-compliant audit logging. Every request is authenticated and authorized before processing. Multi-tenant data isolation ensures organizations cannot access each other's data.

### 1.1 Architecture Map

```
┌─────────────────────────────────────────────────────┐
│ Client Application                                  │
│ • Requests passcode via phone number               │
│ • Submits passcode for verification                │
│ • Receives Firebase Auth token with custom claims  │
└────────────────┬────────────────────────────────────┘
                 │ POST /verifyPasscode
                 │ {phoneNumber, passcode}
                 ↓
┌─────────────────────────────────────────────────────┐
│ Firebase Auth                                       │
│ • Verifies passcode                                 │
│ • Creates/updates user                             │
│ • Sets custom claims (organizations, roles)         │
└────────────────┬────────────────────────────────────┘
                 │ Returns ID token with custom claims
                 ↓
┌─────────────────────────────────────────────────────┐
│ Client Stores Token                                 │
│ • Attaches token to all subsequent requests        │
│ • Authorization: Bearer <token>                     │
└────────────────┬────────────────────────────────────┘
                 │ POST /submitActionRequest
                 │ Authorization: Bearer <token>
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Function (submit-action-request.js)            │
│ • Verifies Firebase Auth token                     │
│ • Extracts actorId from token                      │
│ • Checks authorization via custom claims            │
│ • Processes action if authorized                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Firestore Security Rules                            │
│ • Client reads: Check token.organizations[orgId]    │
│ • Client writes: Blocked (server functions only)    │
│ • Audit trail: completedActions read-only           │
└─────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture

**Problem**: Traditional password-based authentication is vulnerable to credential theft, brute force attacks, and weak password choices. Enterprise SOC2 compliance requires immutable audit trails with server-authoritative timestamps and complete multi-tenant data isolation. See [Requirements](#21-requirements) for complete details.

**Solution**: Passcode-only authentication eliminates password attacks - users receive a time-limited passcode via SMS, no passwords to manage or steal. Firebase Auth provides token-based authentication with custom claims for organization roles. Firestore security rules enforce data isolation at the database level. Service account impersonation (not key files) provides developer access with individual accountability and MFA protection.

### 1.3 Key Components

**Firebase Auth** (passcode-only):
- Phone number authentication with SMS passcodes
- Custom claims store organization roles (admin, member, viewer)
- Token-based authentication (no sessions, no cookies)
- MFA required for all accounts
- See Firebase Auth documentation for configuration

**Role-Based Access Control (RBAC)**:
- Three roles: admin (full access), member (read/write), viewer (read-only)
- Roles scoped per organization (user can be admin in one org, member in another)
- Custom claims in Firebase Auth tokens: `token.organizations[orgId] = role`
- Permissions checked server-side before processing actions

**Firestore Security Rules**:
- Enforce data isolation at database level
- Client reads require `token.organizations[orgId]` present
- Client writes blocked for audit trail (server functions only)
- Organization data protected by custom claims
- See `firestore.rules` for complete implementation

**Service Account Impersonation**:
- Developers use `gcloud auth application-default login --impersonate-service-account`
- No long-lived credential files (key.json eliminated)
- Individual accountability (audit logs show user + service account)
- MFA protection (user account requires MFA)
- Easy revocation (remove IAM binding)

**Audit Logging**:
- All authentication events logged via event sourcing
- PasscodeRequested, PasscodeVerified, UserAuthenticated events
- ImpersonationStarted/Ended events for support access
- RoleAssigned events for permission changes
- See `docs/architecture/event-sourcing.md` for audit trail details

### 1.4 Trade-offs Summary

- **No password recovery flows** - passcode-only means no "forgot password" complexity
- **SMS dependency** - requires phone number, SMS delivery (acceptable for municipal government users)
- **Firebase Auth lock-in** - tightly coupled to Firebase (mitigated by custom claims abstraction)
- **Online-only authentication** - requires connection to verify passcode (acceptable for web app)

See [Consequences & Trade-offs](#5-consequences--trade-offs) for detailed analysis and business impact.

### 1.5 Current Implementation Status

- ✅ **Implemented** (production since 2025-09-15):
  - Firebase Auth token validation in HTTP functions
  - Custom claims for organization roles
  - Firestore security rules for data isolation
  - Service account impersonation for developers
  - Event sourcing for authentication audit trail

- 📋 **Deferred to Backlog**:
  - Passcode SMS delivery (currently emulator bypass)
  - MFA enforcement UI
  - Rate limiting for passcode requests
  - Impersonation UI for support staff
  - OAuth/SSO for enterprise customers

**Current Pattern**: Authentication infrastructure ready, passcode delivery deferred until user authentication becomes priority.

### 1.6 Key Design Decisions

**Passcode-Only Authentication**: Eliminates password attacks, simpler security model, no password reset flows. [Details in decisions.md](../decisions.md#passcode-only-authentication)

**Service Account Impersonation**: Developers impersonate service accounts (not key files). No long-lived credentials, individual accountability, MFA protection. [Details in decisions.md](../decisions.md#service-account-impersonation)

**Firebase Auth Custom Claims**: Organization roles stored in token custom claims (not separate database lookups). Faster authorization checks, works with Firestore rules. [Details in decisions.md](../decisions.md#firebase-custom-claims)

**Server-Only Writes**: Firestore rules block client writes to audit trail. Only HTTP functions write completedActions. Prevents client tampering. [Details in decisions.md](../decisions.md#server-only-writes)

**Zero Trust Model**: Every request authenticated and authorized (not "logged in = trusted"). Defense in depth, least privilege. [Details in decisions.md](../decisions.md#zero-trust-model)

---

## 2. Problem & Context

### 2.1 Requirements

**SOC2 Type II Compliance**:
- Immutable audit trail (authentication events recorded)
- Individual accountability (no shared accounts)
- MFA required for all users
- Session management (automatic expiration)
- Secure credential storage (no passwords in database)

**Multi-Tenant Data Isolation**:
- Organizations cannot access each other's data
- Authorization enforced at database level (Firestore rules)
- Custom claims scope permissions per organization
- Complete audit trail per organization

**Authentication Security**:
- No password-based attacks (no passwords to steal)
- Rate limiting (prevent brute force)
- Time-limited passcodes (5-10 minute expiration)
- Secure token transmission (HTTPS only)

**Developer Access**:
- Individual accountability (not shared service account keys)
- MFA protection for developer accounts
- Easy credential revocation
- Audit trail for developer actions

### 2.2 Constraints

- **Firebase Auth Dependency**: No alternative identity providers in MVP (OAuth/SSO deferred)
- **SMS Delivery Required**: Passcode delivery requires reliable SMS service
- **No Offline Authentication**: Requires connection to Firebase Auth (acceptable for web app)
- **Small Team**: 2-3 developers - prioritize simple authentication over complex SSO
- **Cost Conscious**: Firebase Auth free tier covers MVP usage (10K verifications/month)

---

## 3. Architecture Details

### 3.1 Authentication Flow

**1. Request Passcode**:
- Client POSTs phone number to `/requestPasscode`
- Server generates 6-digit passcode (or uses Firebase Auth SMS)
- Server sends SMS with passcode
- Server logs PasscodeRequested event
- Rate limit: 3 requests per phone number per hour

**2. Verify Passcode**:
- Client POSTs phone number + passcode to `/verifyPasscode`
- Server verifies passcode via Firebase Auth
- Server creates/updates user in Firestore users collection
- Server sets custom claims with organization roles
- Server returns Firebase Auth ID token
- Server logs PasscodeVerified, UserAuthenticated events

**3. Subsequent Requests**:
- Client attaches token to all HTTP requests: `Authorization: Bearer <token>`
- Server verifies token via `admin.auth().verifyIdToken(token)`
- Server extracts actorId and custom claims from decoded token
- Server checks authorization before processing action

### 3.2 Authorization Model

**Role Hierarchy**: admin > member > viewer

Three roles scoped per organization:
- **admin**: Full access (manage users, settings, data, impersonate)
- **member**: Read/write data in organization
- **viewer**: Read-only access to data

Users can have different roles in different organizations (e.g., admin in org_sf, member in org_la).

**Custom Claims Structure**:
```javascript
// Firebase Auth token custom claims (contract)
{
  uid: "usr_abc123",
  phoneNumber: "+14155551234",
  organizations: {
    "org_sf": { role: "admin", joinedAt: "2025-01-15T10:00:00Z" },
    "org_la": { role: "member", joinedAt: "2025-01-10T14:30:00Z" }
  }
}
```

**Permission Checking Flow**:
1. Server extracts user role from Firebase Auth token: `decodedToken.organizations[orgId].role`
2. Compares role against required role using hierarchy (admin > member > viewer)
3. Returns true if user has sufficient permissions (e.g., admin can perform member actions)

**Implementation**: See [F124: Permission Checking](../../specifications/F124-permission-checking/background.md) for `hasPermission` and `hasRole` functions.

### 3.3 Firestore Security Rules

**completedActions** (audit trail - immutable):
```
match /completedActions/{id} {
  allow read: if
    request.auth != null &&
    request.auth.token.organizations[resource.data.organizationId] != null;

  allow write: if false; // Only server functions can write
}
```

**organizations** (domain collection):
```
match /organizations/{organizationId} {
  allow read: if
    request.auth != null &&
    request.auth.token.organizations[organizationId] != null;

  allow write: if false; // Only server functions can write
}
```

**users** (domain collection):
```
match /users/{userId} {
  allow read: if
    request.auth != null &&
    request.auth.uid == userId;

  allow write: if false; // Only server functions can write
}
```

**projects** (hierarchical under organizations):
```
match /organizations/{organizationId}/projects/{projectId}/{document=**} {
  allow read: if
    request.auth != null &&
    request.auth.token.organizations[organizationId] != null;

  allow write: if false; // Only server functions can write
}
```

**Rationale**: Firestore security rules provide defense-in-depth. Even if HTTP function has a bug, database-level rules prevent unauthorized access.

### 3.4 Service Account Impersonation

**Setup Process**:
1. **Create Service Account** per project:
   ```bash
   gcloud iam service-accounts create firebase-dev --project=curbmap-prod
   ```

2. **Grant Developer Impersonation**:
   ```bash
   gcloud iam service-accounts add-iam-policy-binding \
     firebase-dev@curbmap-prod.iam.gserviceaccount.com \
     --member="user:alice@example.com" \
     --role="roles/iam.serviceAccountTokenCreator"
   ```

3. **Developer Login**:
   ```bash
   gcloud auth application-default login \
     --impersonate-service-account=firebase-dev@curbmap-prod.iam.gserviceaccount.com
   ```

4. **Tokens Auto-Refresh**: gcloud handles token refresh automatically

**Benefits**:
- **No Key Files**: Eliminates `firebase-key.json` security risk
- **Individual Accountability**: Audit logs show `alice@example.com → firebase-dev@...`
- **Easy Revocation**: Remove IAM binding to revoke access immediately
- **MFA Protection**: User account `alice@example.com` requires MFA

### 3.5 Impersonation System

**Support Staff Access**: Admins with `impersonate` permission can assume a user's session to debug customer issues in production while maintaining complete audit trail.

**Impersonation Flow**:
1. Admin verifies they have `impersonate` permission (typically admin role)
2. Admin enters reason for impersonation (required for SOC2)
3. System creates impersonation session with 1-hour expiration
4. System logs ImpersonationStarted event to completedActions (immutable audit trail)
5. Admin views application as target user with banner: "Impersonating [User]"
6. Session expires after 1 hour or admin manually ends impersonation
7. System logs ImpersonationEnded event

**Session Structure**:
```javascript
// Firestore /impersonation_sessions/{sessionId} document
{
  sessionId: "ses_<uuid>",
  impersonatorId: "usr_admin",
  targetUserId: "usr_customer",
  targetClaims: { organizations: { "org_sf": { role: "member" } } },
  reason: "Debug survey submission issue in ticket #1234",
  startedAt: "2025-01-15T10:00:00Z",
  expiresAt: "2025-01-15T11:00:00Z",
  status: "active" | "expired" | "terminated"
}
```

**SOC2 Compliance**: All impersonation sessions logged in completedActions audit trail with impersonator identity, target user, reason, and timestamps. Can query: "Who impersonated whom, when, and why?"

**Implementation**: See [F120: User Impersonation System](../../specifications/F120-user-impersonation/background.md) for complete `startImpersonation`, `endImpersonation`, and session validation logic.

---

## 4. Implementation Guide

### 4.1 Quick Start: Implementing Authentication

**Need to add authentication quickly?** Follow these 4 steps (detailed instructions in section 4.3):

1. **Configure** Firebase Auth for phone number authentication
2. **Implement** passcode request/verify endpoints
3. **Add** authentication middleware to HTTP functions
4. **Set** custom claims for organization roles

See section 4.3 for complete step-by-step instructions with code examples.

### 4.2 Code Locations

**Authentication Functions** (to be implemented):
- `modules/curb-map/functions/src/auth/request-passcode.js` - SMS passcode delivery
- `modules/curb-map/functions/src/auth/verify-passcode.js` - Passcode verification, token generation

**Authorization Middleware** (implemented):
- `modules/curb-map/functions/src/submit-action-request.js` - Token validation, actorId extraction

**Firestore Rules**:
- `firestore.rules` - Database-level security rules

**Types**:
- `modules/curb-map/src/types/action.js` - Action types (PasscodeRequested, UserAuthenticated, etc.)
- `modules/curb-map/type-definitions/action.type.js` - Type definitions

**Tests** (to be created):
- `modules/curb-map/test/auth.firebase.js` - Authentication flow tests
- `modules/curb-map/test/authorization.firebase.js` - Permission checking tests

### 4.3 Authentication Implementation

**Firebase Auth Configuration**: Enable phone number authentication, disable email/password/anonymous sign-in. Configure passcode delivery (6-digit code, 5-10 minute expiration).

**Passcode Verification Flow**:
1. Client requests passcode → server sends SMS with 6-digit code
2. Client submits passcode + phone number → server verifies via Firebase Auth
3. Server creates/updates user in Firestore users collection
4. Server sets custom claims with organization roles
5. Server returns Firebase Auth ID token
6. Client stores token, attaches to all subsequent requests

**Custom Claims Management**: When user roles change (RoleAssigned event), server updates Firebase Auth custom claims to include new organization roles. Token contains all user organizations + roles for fast authorization checks.

**Authentication Middleware**: HTTP functions verify Firebase Auth token on every request using `admin.auth().verifyIdToken(token)`. Extracts actorId and custom claims from decoded token. Returns HTTP 401 for missing/invalid/expired tokens.

**Authorization Middleware**: After authentication, checks if user has required role in organization using custom claims. Returns HTTP 403 if insufficient permissions.

**Implementation**: See [F121: Authentication Middleware](../../specifications/F121-authentication-middleware/background.md) for complete middleware patterns including `authenticateUser`, `authorizeOrganization`, `verifyPasscode`, and `setUserClaims` functions.

### 4.4 Rate Limiting

**Protection Against Brute Force**: Rate limiting prevents abuse of passcode authentication by limiting requests per phone number and per IP address.

**Rate Limits**:
- **Phone Number**: 3 passcode requests per phone number per hour
- **IP Address**: 5 passcode requests per IP address per hour
- **Progressive Delays**: 30s, 2min, 5min delays after repeated failed authentication attempts

**Distributed State**: Uses Redis (Cloud Memorystore) for shared rate limit state across multiple Firebase Functions instances. Ensures consistent enforcement even when requests hit different servers.

**Monitoring**: Alert on rate limit violations (>100/hour indicates potential attack). Log metrics to Firestore for analysis.

**Response Codes**:
- HTTP 429 Too Many Requests: Rate limit exceeded
- HTTP 401 Unauthorized: Invalid passcode

**Implementation**: See [F122: Rate Limiting](../../specifications/F122-rate-limiting/background.md) for complete Redis-based rate limiting implementation including `rateLimitPasscodeRequests`, `rateLimitByIp`, and progressive delay logic.

### 4.5 Testing

**Authentication Flow Tests**:
- Request passcode → verify SMS sent
- Verify valid passcode → receive token
- Verify expired passcode → return error
- Verify invalid passcode → return error
- Rate limit exceeded → return 429

**Authorization Tests**:
- Valid token with org access → allow
- Valid token without org access → deny (403)
- Expired token → deny (401)
- Invalid token → deny (401)
- No token → deny (401)

**Firestore Rules Tests**: Verify security rules enforce data isolation using Firebase Test SDK. Test scenarios: user can read own organization, user cannot read other organizations, unauthenticated requests denied.

**Test Pattern**:
- Create authenticated test context with custom claims
- Attempt Firestore operations
- Verify allowed operations succeed, denied operations return permission errors

**Example**: See [F121: Authentication Middleware](../../specifications/F121-authentication-middleware/background.md#testing-strategy) for complete test patterns.

---

## 5. Consequences & Trade-offs

### 5.1 What This Enables

**Elimination of Password Attacks**: No passwords means no password-based attacks (credential stuffing, brute force, weak passwords, phishing).

**Individual Accountability**: Service account impersonation provides audit trail showing which developer accessed production (not shared key file).

**SOC2 Compliance**: Immutable audit trail of authentication events, MFA enforcement, secure credential storage meet SOC2 Type II requirements.

**Defense in Depth**: Multiple security layers (Firebase Auth, custom claims, Firestore rules, HTTP function authorization checks).

**Multi-Tenant Data Isolation**: Custom claims + Firestore rules enforce organization boundaries at database level.

**Simple User Experience**: No password management, no password reset flows, no "forgot password" emails.

### 5.2 What This Constrains

**No Offline Authentication**:
- Requires connection to Firebase Auth for passcode verification
- **When this matters**: Offline mobile apps need authentication
- **Why acceptable**: Web app requires connection anyway
- **Mitigation**: Cache tokens with refresh logic (future mobile apps)

**SMS Dependency**:
- Requires reliable SMS delivery for passcode
- **When this matters**: SMS failures block authentication
- **Why acceptable**: Municipal government users have reliable phone numbers
- **Mitigation**: Alternative delivery methods (email, authenticator apps) deferred to backlog

**Firebase Auth Lock-In**:
- Tightly coupled to Firebase Auth custom claims
- **When this matters**: Switching identity providers requires migration
- **Why acceptable**: Firebase Auth meets current needs, abstraction layer too costly
- **Mitigation**: Custom claims abstraction in code (easier to migrate later)

**No Anonymous Users**:
- All actions require authenticated user
- **When this matters**: Public data browsing, guest access
- **Why acceptable**: CurbMap is admin tool, not public website
- **Mitigation**: Public API endpoints can bypass auth (if needed)

**Rate Limiting Complexity**:
- Requires Redis or similar for distributed rate limiting
- **When this matters**: Single-server rate limiting insufficient
- **Why acceptable**: Firebase Functions scale horizontally, shared state needed
- **Mitigation**: Use Cloud Memorystore (Redis) for production rate limiting

### 5.3 Future Considerations

**When to Revisit**:
- OAuth/SSO requested by >25% of customers → add enterprise SSO
- SMS delivery failures >5% → add alternative passcode delivery
- Firebase Auth pricing becomes issue → evaluate alternatives
- MFA bypass requests → add recovery codes

**What Would Trigger Redesign**:
- SOC2 audit failure (authentication security inadequate)
- Firebase Auth security incident
- Custom claims size limit exceeded (token too large)
- SMS delivery reliability <95%

---

## 6. References

**Related Architecture**:
- [Data Model](./data-model.md) - User roles, organization membership
- [Event Sourcing](./event-sourcing.md) - Authentication event audit trail
- [Multi-Tenant Architecture](./data-model.md#multi-tenant-data-model) - Organization data isolation

**Implementation Specifications**:
- [F107 Phase 3: Authentication](../../specifications/F107-firebase-soc2-vanilla-app/phase3-auth.md)
- [F109: Authentication System](../../specifications/F109-authentication-system/implementation.md)
- [F120: User Impersonation System](../../specifications/F120-user-impersonation/background.md)
- [F121: Authentication Middleware](../../specifications/F121-authentication-middleware/background.md)
- [F122: Rate Limiting](../../specifications/F122-rate-limiting/background.md)
- [F124: Permission Checking](../../specifications/F124-permission-checking/background.md)

**Decisions**:
- [decisions.md](../decisions.md) - Decision history and alternatives

**Runbooks**:
- [Firebase Manual Setup](../runbooks/firebase-manual-setup.md)
- [Running Firebase Integration Tests](../runbooks/running-firebase-integration-tests.md)

---

## 7. Decision History

This architecture was established through 5 key decisions made between 2024-11 and 2025-01-15:

- Passcode-Only Authentication (no passwords, simpler security model)
- Service Account Impersonation (no key files, individual accountability)
- Firebase Auth Custom Claims (organization roles in token)
- Zero Trust Model (every request authenticated and authorized)
- Server-Only Writes (Firestore rules block client writes to audit trail)

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
