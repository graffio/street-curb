# F128: Improved Metadata Handling

## Problem Statement

Server-controlled metadata fields (createdAt/createdBy/updatedAt/updatedBy and organizationId/projectId) currently rely on handler discipline rather than systematic enforcement. This creates two security risks:

1. **Audit trail spoofing**: Client could send false createdBy/updatedBy values, creating legal liability
2. **Tenant isolation bypass**: Client could send organizationId/projectId for resources they don't own

## Solution Approach

**Validate, don't fix.** The server validates that client-sent data is correct and authorized, rejecting requests that don't meet security requirements.

## Implementation Phases

### Phase 1: Tenant Security (Do Now)

**Add auth claims infrastructure**
- Create `auth-context.js` with `syncUserAuthClaims(userId)`
- Claims structure: `{ organizations: { 'org_id': { role: 'admin', projects: ['prj_1'] } } }`
- Update handlers to sync claims: MemberAdded, MemberRemoved, RoleChanged, UserForgotten

**Validate tenant access in submit-action-request.js**
- Extract organizations from decoded auth token
- Validate request `organizationId`/`projectId` are in user's claims
- Return 403 if user doesn't have access to requested org/project
- Special case: Allow users with no claims only for `AuthenticationCompleted`

**Integration tests for security boundary**
- Test: User cannot access organization they're not a member of
- Test: User cannot access project not in their organization
- Test: Auth claims sync correctly on membership changes

### Phase 2: Remove Redundant Tenant Fields from Actions (Do Later)

- Remove `organizationId` from: OrganizationUpdated, OrganizationDeleted, OrganizationSuspended, MemberAdded, RoleChanged, MemberRemoved
- Keep `organizationId` only in: OrganizationCreated (it's the domain data being created)
- Server derives organizationId from validated `actionRequest.organizationId` instead
- Update all handlers to use actionRequest context instead of action payload

### Phase 3: Enforce Metadata Updates (Deferred)

**Problem**: Handlers might forget to call `updatedMetadata()` or set `createdAt/createdBy` correctly

**Legal risk**: Client could spoof `createdBy` to falsely attribute actions

**Potential solutions to explore later**:
- Validation in facade (needs access to actionRequest context)
- Type-level enforcement
- Better helper design that's harder to misuse

## Not Changing

- Keep `organizationId/projectId` in Blockface type (needed for client-side use)
- Keep current handler pattern of spreading `updatedMetadata()` (works, just not enforced)
- Keep metadata fields required in Tagged types (needed for type safety)
