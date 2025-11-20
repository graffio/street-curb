# Event Sourcing Architecture

## Overview

This application uses an HTTP-based event sourcing pattern where domain actions are submitted via HTTP, processed by handlers, and persisted to Firestore.

## Request Metadata vs Action Payload

**Request metadata** (enriched by server):
- `organizationId` - Derived from request context, NEVER in action payload
- `projectId` - Optional, defaults to defaultProjectId if omitted
- `actorId` - Extracted from Firebase Auth token
- `subjectId`/`subjectType` - Derived via Action.getSubject(action, organizationId)
- `idempotencyKey`/`correlationId` - Client-generated, validated server-side
- `createdAt`/`processedAt` - Server timestamps (SOC2 requirement)

**Action payloads** contain only domain data:
- `OrganizationCreated: {name, projectId}` - NO organizationId
- `MemberAdded: {userId, role, displayName}` - NO organizationId
- `UserUpdated: {userId, displayName}` - NO organizationId or organizationId

**Pattern ensures**:
- Clients cannot spoof organizationId (security)
- Server is source of truth for request context
- Action payloads describe "what happened", metadata describes "where/when/who"

Implementation: `modules/curb-map/functions/src/submit-action-request.js:315`
