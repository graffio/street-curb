---
summary: "Zero-trust security architecture with passcode-only authentication, RBAC, and SOC2 compliance for multi-tenant curb data management"
keywords: [ "security", "authentication", "authorization", "rbac", "soc2", "firestore-rules", "zero-trust" ]
module: curb-map
last_updated: "2025-01-15"
---

# Security Architecture

## 1. Overview

CurbMap implements zero-trust security with passcode-only authentication, role-based access control (RBAC), and
SOC2-compliant audit logging. Every request is authenticated and authorized before processing. Multi-tenant data
isolation ensures organizations cannot access each other's data.

### 1.1 Architecture Map

```
┌─────────────────────────────────────────────────────┐
│ Client Application (Firebase SDK)                  │
│ • Collects email, displayName, phoneNumber         │
│ • signInWithPhoneNumber() → Firebase sends SMS     │
│ • confirmationResult.confirm(passcode)             │
│ • getIdToken() → receives token with uid           │
└────────────────┬────────────────────────────────────┘
                 │ POST /submitActionRequest
                 │ Authorization: Bearer <firebase-token>
                 │ Body: AuthenticationCompleted action
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Function (submit-action-request.js)            │
│ • Verifies Firebase token → extracts uid, phone    │
│ • Creates/looks up User document                   │
│ • Sets userId custom claim on Firebase Auth user   │
│ • Logs AuthenticationCompleted action              │
└────────────────┬────────────────────────────────────┘
                 │ Returns success
                 ↓
┌─────────────────────────────────────────────────────┐
│ Client Refreshes Token                              │
│ • getIdToken(true) → receives userId claim         │
│ • Attaches token to all subsequent requests        │
│ • Authorization: Bearer <token>                     │
└────────────────┬────────────────────────────────────┘
                 │ POST /submitActionRequest
                 │ Authorization: Bearer <token-with-userId>
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Function (submit-action-request.js)            │
│ • Verifies Firebase Auth token                     │
│ • Extracts userId from token.userId claim          │
│ • Injects actorId into action request              │
│ • Processes action if authorized                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Firestore Security Rules                            │
│ • Client reads: Check user doc organizations map   │
│ • Client writes: Blocked (server functions only)    │
│ • Audit trail: completedActions read-only           │
└─────────────────────────────────────────────────────┘
```

### 1.2 Why This Architecture

**Problem**: Traditional password-based authentication is vulnerable to credential theft, brute force attacks, and weak
password choices. Enterprise SOC2 compliance requires immutable audit trails with server-authoritative timestamps and
complete multi-tenant data isolation.

**Solution**: Passcode-only authentication eliminates password attacks - users receive a time-limited passcode via SMS,
no passwords to manage or steal. Firebase Auth provides token-based authentication with userId claim linking tokens to
Firestore user docs. Firestore security rules read user doc to enforce data isolation at the database level. Service
account impersonation (not key files) provides developer access with individual accountability and MFA protection.

### 1.3 Key Components

**Firebase Auth** (passcode-only):

- Phone number authentication with SMS passcodes
- userId custom claim links token to Firestore user doc
- Token-based authentication (no sessions, no cookies)
- MFA required for all accounts

**Role-Based Access Control (RBAC)**:

- Three roles: admin (full access), member (read/write), viewer (read-only)
- Roles scoped per organization (user can be admin in one org, member in another)
- Organization membership stored in user doc: `user.organizations[orgId]` field
- Security rules read user doc for authorization (always fresh, single source of truth)
- Permissions checked server-side before processing actions

**Firestore Security Rules**:

- Enforce data isolation at database level
- Client reads require membership check via user doc: `getUserDoc().data.organizations[orgId]`
- Client writes blocked for audit trail (server functions only)
- Organization data protected by membership verification
- See `firestore.rules` for complete implementation

**Service Account Impersonation**:

- Developers use `gcloud auth application-default login --impersonate-service-account`
- No long-lived credential files (key.json eliminated)
- Individual accountability (audit logs show user + service account)
- MFA protection (user account requires MFA)
- Easy revocation (remove IAM binding)

**Audit Logging**:

- See [event-sourcing.md](./event-sourcing.md) for audit trail details

**Key Design Decisions** (see [decisions.md](../decisions.md) for details):

- Passcode-Only Authentication: Eliminates password attacks, simpler security model, no password reset flows
- Service Account Impersonation: Developers impersonate service accounts (not key files). No long-lived credentials,
  individual accountability, MFA protection
- Authentication Claims Simplification: Security rules read user doc instead of custom claims. Only userId claim needed
  (links token to Firestore). Simpler, more secure, always fresh, single source of truth
- Server-Only Writes: Firestore rules block client writes to audit trail. Only HTTP functions write completedActions.
  Prevents client tampering
- Zero Trust Model: Every request authenticated and authorized (not "logged in = trusted"). Defense in depth, least
  privilege

---

## 2. Architecture Details

### 2.1 Authentication Flow

See Architecture Map diagram (Section 1.1) for complete flow from passcode request through token verification.

**Implementation**:
- Token verification: `modules/curb-map/functions/src/submit-action-request.js`
- userId claim sync: `modules/curb-map/functions/src/handlers/handle-user-created.js`

### 2.2 Authorization Model

**Role Hierarchy**: admin > member > viewer

Users can have different roles in different organizations (e.g., admin in org_sf, member in org_la). Roles stored in user document:

```
// Firestore /users/{userId} document
{
    id: "usr_abc123",
    email: "user@example.com",
    displayName: "Alice Chen",
    organizations: {
        "org_sf": "admin",
        "org_la": "member"
    }
}
```

Permission checking: Firestore rules read user doc to check membership. Server operations compare role against required role using hierarchy.

**Implementation**: 

- `modules/curb-map/functions/src/submit-action-request.js:297-336`
- `modules/curb-map/type-definitions/action.type.js` (see ```mayI``` function)


### 2.3 Service Account Impersonation

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

### 2.4 Impersonation System

**Current Status**: Deferred to backlog. Not implemented.

**Planned Architecture**: Admins with `impersonate` permission will be able to assume a user's session to debug customer issues while maintaining complete audit trail with ImpersonationStarted/ImpersonationEnded events logged to completedActions.

---

## 3. Trade-offs

### 3.1 What This Enables

**Elimination of Password Attacks**: No passwords means no password-based attacks (credential stuffing, brute force,
weak passwords, phishing).

**Individual Accountability**: Service account impersonation provides audit trail showing which developer accessed
production (not shared key file).

**SOC2 Compliance**: Immutable audit trail of authentication events, MFA enforcement, secure credential storage meet
SOC2 Type II requirements.

**Defense in Depth**: Multiple security layers (Firebase Auth token verification, Firestore rules reading user doc,
HTTP function authorization checks).

**Multi-Tenant Data Isolation**: User doc organizations map + Firestore rules enforce organization boundaries at database
level. Always fresh, single source of truth.

**Simple User Experience**: No password management, no password reset flows, no "forgot password" emails.

### 3.2 What This Constrains

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

### 3.3 When to Revisit

**Triggers for architectural review**:

- OAuth/SSO requested by >25% of customers → add enterprise SSO
- SMS delivery failures >5% → add alternative passcode delivery
- Firebase Auth pricing becomes issue → evaluate alternatives
- MFA bypass requests → add recovery codes
- SOC2 audit failure (authentication security inadequate)
- Firebase Auth security incident
- Custom claims size limit exceeded (token too large)
- SMS delivery reliability <95%

---

## 4. Decision History

This architecture was established through 5 key decisions made between 2024-11 and 2025-10-23:

- Passcode-Only Authentication (no passwords, simpler security model)
- Service Account Impersonation (no key files, individual accountability)
- Authentication Claims Simplification (userId claim only, rules read user doc - replaced organization-role claims)
- Zero Trust Model (every request authenticated and authorized)
- Server-Only Writes (Firestore rules block client writes to audit trail)

For complete decision rationale, alternatives considered, and trade-off analysis, see [decisions.md](../decisions.md).
