# Architecture Documentation Standards

## Purpose

Architecture documents explain **connections over code** - how components relate, why decisions were made, and what trade-offs exist. They are **evergreen** references that remain stable even as implementation details change.

## Core Principle: Connections Over Code

**Architecture docs describe patterns, not implementations.**

- ✅ Explain WHAT components do and HOW they connect
- ✅ Show WHERE implementation lives (file paths)
- ✅ Link to specifications for detailed implementation
- ❌ Don't copy/paste actual JavaScript from the codebase
- ❌ Don't include pseudocode (becomes stale, confuses readers)

## What Goes In Architecture Docs

### ✅ DO Include

**Component Descriptions**:
- What each component does (purpose, responsibilities)
- Where components live (file paths, collection names)
- How components connect (data flow, dependencies)
- Component interfaces (inputs, outputs, not implementation)

**Architecture Diagrams**:
- ASCII diagrams showing flow and connections
- Component maps with arrows showing data flow
- Sequence diagrams for key workflows

**Data Structures** (contracts, not code):
- Firestore schemas, JSON payloads
- Custom claims structure
- Collection document shapes
- Action/Event type definitions

**Configuration** (defines behavior):
- Firestore security rules
- Environment variables
- Firebase Functions config
- Command-line operations (gcloud, npm)

**Decision Context**:
- Requirements driving decisions
- Constraints limiting options
- Trade-offs accepted
- When to revisit decisions

**References to Code**:
- File paths where implementation lives
- Links to specifications with detailed implementation
- "See X for implementation" pointers

### ❌ DO NOT Include

**Actual Implementation Code**:
- Real JavaScript/TypeScript from the codebase
- Copy-pasted functions or classes
- Detailed CRUD operations
- Algorithm implementations

**Pseudocode**:
- "Fake" code showing how something might work
- Pseudocode becomes stale as implementation evolves
- Readers can't tell what's real vs. hypothetical

**Low-Level Details**:
- Exact API signatures that change frequently
- Step-by-step code walkthroughs
- Implementation-specific quirks
- Error handling minutiae

## Why No Pseudocode?

**Problem**: Pseudocode in architecture docs creates maintenance burden and confusion.

1. **Becomes Stale**: Implementation evolves, pseudocode doesn't get updated
2. **Confusing**: Readers can't tell what's real vs. hypothetical
3. **Wrong Abstraction**: Architecture describes patterns, not code flow
4. **Wrong Place**: Implementation details belong in specifications (F107, F109, etc.)

**Instead**:
- Describe the pattern conceptually
- Reference actual code locations for implementation
- Link to specifications for step-by-step guides
- Show data structures (contracts, not code)

## Code Examples: When and How

### When Code is Acceptable

**Data Structures** (defines contracts):
```javascript
// Firebase Auth token custom claims
{
  uid: "usr_abc123",
  phoneNumber: "+14155551234",
  organizations: {
    "org_sf": { role: "admin", joinedAt: "2025-01-15T10:00:00Z" }
  }
}
```
✅ Acceptable - shows structure, not implementation

**Configuration** (defines behavior):
```javascript
// Firestore security rules
match /organizations/{organizationId} {
  allow read: if
    request.auth != null &&
    request.auth.token.organizations[organizationId] != null;

  allow write: if false; // Only server functions can write
}
```
✅ Acceptable - configuration defining access control

**Command-Line Operations**:
```bash
gcloud iam service-accounts create firebase-dev --project=curbmap-prod
```
✅ Acceptable - these rarely change

### When Code is NOT Acceptable

**Implementation Logic**:
```javascript
// ❌ BAD - Don't include actual implementation
const hasPermission = (decodedToken, organizationId, requiredRole) => {
  const userRole = decodedToken.organizations?.[organizationId]?.role;
  if (!userRole) return false;
  // ... implementation details
};
```

**Better Approach** (conceptual description):
```markdown
**Permission Checking**:
- Server extracts user role from `decodedToken.organizations[orgId].role`
- Compares against required role using hierarchy (admin > member > viewer)
- Returns true if user has sufficient permissions

Implementation: `modules/curb-map/functions/src/submit-action-request.js:getActorId()`
```

## Document Template

All architecture documents follow the 7-section format:

```markdown
---
summary: "One-sentence description"
keywords: ["key", "terms", "for", "search"]
last_updated: "YYYY-MM-DD"
---

# [Topic] Architecture

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
  - [3.X Component Connections](#3x-component-connections)
- [4. Implementation Guide](#4-implementation-guide)
  - [4.1 Quick Start](#41-quick-start)
  - [4.2 Code Locations](#42-code-locations)
  - [4.3 Configuration](#43-configuration)
  - [4.4 Testing](#44-testing)
- [5. Consequences & Trade-offs](#5-consequences--trade-offs)
  - [5.1 What This Enables](#51-what-this-enables)
  - [5.2 What This Constrains](#52-what-this-constrains)
  - [5.3 Future Considerations](#53-future-considerations)
- [6. References](#6-references)
- [7. Decision History](#7-decision-history)
```

### Section Guidelines

**1. Overview** (connections at a glance):
- Architecture Map: ASCII diagram showing component flow
- Why This Architecture: Problem → Solution (1 paragraph, not requirements dump)
- Key Components: What they do, where they live (NOT how they're implemented)
- Trade-offs Summary: 3-5 bullets highlighting major trade-offs
- Current Implementation Status: What's done, what's deferred
- Key Design Decisions: Inline links to decisions.md

**2. Problem & Context** (why this exists):
- Requirements: Business/technical needs driving design
- Constraints: What limits our options

**3. Architecture Details** (how components connect):
- Data Flow: Describe the journey through the system
- Component Connections: How pieces relate (conceptual, not code)
- Patterns Used: Event sourcing, CQRS, etc.
- Data Structures: Schemas, contracts

**4. Implementation Guide** (where code lives):
- Quick Start: 4-step guide to implementing key feature
- Code Locations: File paths with brief descriptions
- Configuration: Environment variables, Firestore rules
- Testing: How to verify implementation

**5. Consequences & Trade-offs** (business impact):
- What This Enables: Benefits gained
- What This Constrains: Limitations accepted, with:
  - When this matters (business context)
  - Why acceptable (rationale)
  - Mitigation strategy
- Future Considerations: When to revisit decisions

**6. References**:
- Related Architecture: Links to other architecture docs
- Implementation Specifications: Links to F107, F109, etc.
- Decisions: Link to decisions.md
- Runbooks: Links to operational guides

**7. Decision History** (condensed):
- One paragraph summarizing 3-5 key decisions
- Link to decisions.md for complete rationale

## Example: Good vs Bad

### ❌ BAD (implementation code)

```markdown
### Permission Checking

const hasPermission = (decodedToken, organizationId, requiredRole) => {
  const userRole = decodedToken.organizations?.[organizationId]?.role;
  if (!userRole) return false;

  if (requiredRole === 'viewer') return ['viewer', 'member', 'admin'].includes(userRole);
  if (requiredRole === 'member') return ['member', 'admin'].includes(userRole);
  if (requiredRole === 'admin') return userRole === 'admin';

  return false;
};
```

### ✅ GOOD (conceptual description + file reference)

```markdown
### Authorization Model

**Role Hierarchy**: admin > member > viewer (three roles, scoped per organization)

**Permission Checking Flow**:
1. Extract user role from Firebase Auth token custom claims (`token.organizations[orgId].role`)
2. Compare against required role using hierarchy
3. Return true if user has sufficient permissions (e.g., admin can do member actions)

**Custom Claims Structure** (contract):
```
{
  organizations: {
    "org_sf": { role: "admin", joinedAt: "2025-01-15T10:00:00Z" }
  }
}
```

**Implementation**: `modules/curb-map/functions/src/submit-action-request.js`
```

## Revising Existing Docs

When updating architecture documents to meet these standards:

1. **Remove implementation code** → replace with conceptual descriptions
2. **Remove pseudocode** → describe pattern + reference actual code location
3. **Keep data structures** (Firestore schemas, JSON payloads, custom claims)
4. **Keep configuration** (Firestore rules, environment variables, gcloud commands)
5. **Add file path references** for where implementation lives
6. **Link to specifications** for detailed step-by-step guides

## File Organization

**Current Architecture Docs**:
- `event-sourcing.md` - HTTP action submission, transaction-based idempotency, audit trail
- `security.md` - Authentication, authorization, RBAC, Firestore rules
- `data-model.md` - Collections, multi-tenancy, event scoping

## Related Documents

**Specifications** (`specifications/`):
- Detailed implementation guides with step-by-step code examples
- F107, F109, F110, etc. - feature specifications with actual code

**Runbooks** (`docs/runbooks/`):
- Step-by-step operational procedures
- Deployment, testing, troubleshooting

**Decisions** (`docs/decisions.md`):
- Complete decision rationale, alternatives considered, trade-off analysis
- Architecture docs link to decisions.md for full context

**Project Standards** (`CLAUDE.md`):
- Project-wide standards and workflows
- References this architecture standards document

## When to Update This Standard

Revisit this document when:
- Architecture docs feel inconsistent or confusing
- New team members struggle to understand architecture
- Implementation specs duplicate architecture content
- Major architectural patterns change (event sourcing → CQRS, etc.)
- More than 3 PRs in 6 months debate what belongs in architecture docs
