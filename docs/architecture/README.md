# Architecture Documentation Standards

## Purpose

Architecture documents explain **connections over code** - how components relate, why decisions were made, and what
trade-offs exist. They remain stable as implementation details change.

## For LLM Assistants

- Read only what you need (don't read files "just in case")
- Keep docs short - target 200-300 lines max
- Every doc MUST have at least one diagram
- Reference code files by path (easy to Read tool)
- When updating code, check if architecture docs need updates

## Core Principle: Connections Over Code

Architecture docs describe **patterns**, not **implementations**.

- ✅ Explain WHAT components do and HOW they connect
- ✅ Show WHERE implementation lives (file paths)
- ✅ Show data structures (contracts, not code)
- ✅ Show configuration (Firestore rules, environment variables)
- ❌ Don't copy/paste implementation code
- ❌ Don't include pseudocode (becomes stale, confuses readers)
- ❌ Don't reference specification folders (they're ephemeral)

## Document Structure

**Required**:

1. **Overview**
    - ASCII diagram (vertical or horizontal flow)
    - Why this architecture (1 paragraph: problem → solution)
    - Key components (what they do, where they live)

2. **Trade-offs**
    - What this enables
    - What this constrains (with business context: "when this matters", "why acceptable")
    - When to revisit

**Optional** (include only if Overview doesn't cover it):

- **Architecture Details** - Data structures, configuration, or complex connection patterns not clear from diagram
- **Problem & Context** - Requirements/constraints if not obvious from Overview
- **Decision History** - 1 paragraph linking to decisions.md

**Never include**:

- "Implementation Guide" sections (belong in runbooks)
- "References" sections (use inline links)
- Pseudocode or implementation functions

## What Code Can Appear

**✅ Data Structures** (defines contracts):

```
// Firestore user document
{
  organizations: {
    "org_sf": "admin",
    "org_la": "member"
  }
}
```

**✅ Configuration** (defines behavior):

```
// firestore.rules
match /organizations/{orgId} {
  allow read: if isMemberOfOrganization(orgId);
  allow write: if false;  // Server functions only
}
```

**❌ Implementation Logic**:
Don't copy functions. Describe the pattern + reference file location.

**Wrong**:

```javascript
const checkPermission = (token, orgId, role) => {
    // 20 lines of implementation
};
```

**Right**:

```markdown
Permission checking extracts role from token.organizations[orgId], compares
against hierarchy (admin > member > viewer). Returns true if sufficient.

Implementation: modules/curb-map/functions/src/submit-action-request.js:297
```

## Reference Stable Resources

**✅ Always safe to reference**:

- Code files: `modules/curb-map/functions/src/submit-action-request.js`
- Type definitions: `type-definitions/action.type.js`
- decisions.md: Permanent decision archive
- Firestore collections: `/organizations/{id}`, `/users/{id}`

**❌ Don't reference specifications folders**:

- Specification folders are ephemeral (they move to completed-specifications.md when done)
- Reference **code files** instead of **specification folders**
- If you must explain implementation, describe the pattern inline

**Why**: Specifications are temporary work documents. Architecture docs are permanent reference.

## When Repetition Is OK

Don't consolidate just to reduce duplication. Ask: "Does this context help understanding HERE?"

**Multi-tenant isolation** might appear in:

- event-sourcing.md (audit trail scoping)
- data-model.md (collection structure)
- security.md (Firestore rules)

This is **good** - each doc needs that context for its narrative. Consolidating would force readers to jump between
documents.

## ASCII Diagrams Are Essential

Architecture diagrams show connections at a glance. They're the most valuable part of architecture docs.

**Good diagram shows**:

- Component flow (Client → Server → Database)
- Data transformations (ActionRequest → completedActions)
- Decision points (if duplicate, return 409)
- Multiple layers (HTTP → Transaction → Firestore)

**Horizontal flow** (sequence over time):

```
Client                    Server                     Firestore
  │                         │                            │
  ├─ POST /submitAction ───→│                            │
  │                         ├─ verify token              │
  │                         ├─ start transaction ───────→│
  │                         ├─ check duplicate ←─────────┤
  │                         ├─ process action ──────────→│
  │                         ├─ write completedActions ──→│
  │                         ├─ commit ←──────────────────┤
  │←─ 200 {processedAt} ────┤                            │
```

**Vertical flow** (layers or steps):

```
┌─────────────────────────────────────┐
│ Client Application                  │
│ • Generates idempotencyKey          │
│ • Attaches Firebase Auth token      │
└────────────┬────────────────────────┘
             ↓ POST /submitActionRequest
┌─────────────────────────────────────┐
│ HTTP Function                       │
│ • Validates payload                 │
│ • Extracts actorId from token       │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ Firestore Transaction               │
│ 1. Check duplicate                  │
│ 2. Process action                   │
│ 3. Write audit record               │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ HTTP Response                       │
│ • 200: success                      │
│ • 409: duplicate                    │
└─────────────────────────────────────┘
```

Use horizontal for sequences, vertical for layered architecture. Diagrams > prose.

## Tables for Structured Information

Use tables when comparing options, showing field definitions, or listing configurations.

**Example - Role Capabilities**:

| Role   | View Data | Edit Data | Manage Users |
|--------|-----------|-----------|--------------|
| admin  | ✓         | ✓         | ✓            |
| member | ✓         | ✓         | ✗            |
| viewer | ✓         | ✗         | ✗            |

Tables make structure scannable.

## Example: Real Architecture Diagram

**Vertical flow with decision points** (from event-sourcing.md):

```
┌─────────────────────────────────────────────────────┐
│ Client Application                                  │
│ • Generates idempotencyKey, correlationId           │
│ • Attaches Firebase Auth token                      │
└────────────────┬────────────────────────────────────┘
                 │ POST /submitActionRequest
                 │ {action, idempotencyKey, correlationId}
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Function                                       │
│ submit-action-request.js                            │
│ • Validates payload structure                       │
│ • Extracts actorId from auth token                  │
│ • Creates transaction-scoped context                │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────┐
│ Firestore Transaction (atomic)                      │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 1. Check Duplicate                         │    │
│  │    completedActions.readOrNull(id)         │    │
│  │    ├─ Found → return processedAt (409)     │    │
│  │    └─ Not found → continue                 │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 2. Process Action                          │    │
│  │    handler(logger, txContext, request)     │    │
│  │    └─ Writes to domain collections:        │    │
│  │       /organizations/{id}                  │    │
│  │       /users/{id}                          │    │
│  │       /projects/{id}                       │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 3. Write Audit Record                      │    │
│  │    completedActions.create({               │    │
│  │      status: 'completed',                  │    │
│  │      createdAt: new Date(),         │    │
│  │      processedAt: new Date()        │    │
│  │    })                                      │    │
│  └────────────────────────────────────────────┘    │
│                                                     │
│  ⚠️ Why Transaction?                                │
│  Without: Race condition if 2 requests check       │
│           before either writes (both succeed)      │
│  With: Only ONE transaction can write same ID      │
│        Firestore guarantees atomicity              │
└────────────────┬────────────────────────────────────┘
                 │ All writes atomic (all or nothing)
                 ↓
┌─────────────────────────────────────────────────────┐
│ HTTP Response                                       │
│ • 200: {status: 'completed', processedAt}           │
│ • 409: {status: 'duplicate', processedAt}           │
│ • 400: {status: 'validation-failed', error}         │
│ • 500: {status: 'error', error, handler}            │
└─────────────────────────────────────────────────────┘
```

**What makes this exemplary**:

- Shows full flow with layers
- Includes decision points (duplicate check logic)
- Explains "why" inline (⚠️ Why Transaction?)
- Shows both success and failure paths
- References actual files (submit-action-request.js)

## Pre-Commit Checklist

Before committing architecture doc:

- ✓ Has at least one ASCII diagram
- ✓ No implementation code (only data structures/config)
- ✓ No references to specification folders
- ✓ File paths reference actual code
- ✓ Trade-offs include "when this matters" context

## When to Update This Standard

Revisit when:

- Architecture docs feel inconsistent or confusing
- New team members struggle to understand architecture
- More than 3 discussions about what belongs in architecture docs
- Major architectural patterns change
