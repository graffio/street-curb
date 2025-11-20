# F129: Refactor submitActionRequest with Action Metadata

## Goal
Simplify submit-action-request.js by moving action-specific logic into declarative metadata on Action variants, making the main flow generic and easier to reason about.

## Current Problem

The `submitActionRequest` function in `functions/src/submit-action-request.js` has become complex and difficult to reason about due to:

1. Action-specific validation and authorization scattered throughout the main flow
2. Multiple conditional paths based on action type (UserCreated gets 4+ special cases)
3. Context creation happening multiple times in different ways
4. Business rules mixed with framework concerns (e.g., "2 orgs max" in checkRole)
5. No clear layering - validation, authorization, and execution are interleaved

The file handles 14 distinct concerns, mixing universal concerns (HTTP, auth, transactions) with action-specific concerns (tenant validation, role checking) in one linear flow.

## Proposed Solution

Use **declarative Action metadata** combined with a **validation context builder** to make the main flow generic and linear.

### Core Ideas

1. Each Action variant declares its requirements (needs user doc? needs org? what does it write?)
2. Use metadata to build exactly what's needed for validation
3. Authorization strategies are selected based on metadata
4. Main flow becomes a simple, linear pipeline
5. Easy to extend for Phase 3 metadata validation

## Implementation

### 1. Add Action Metadata Declarations

Add metadata to each Action variant in `type-definitions/action.type.js`:

```javascript
// After Action definition, add metadata for each variant
Action.OrganizationCreated.metadata = {
  requiresUser: false,        // System can create
  requiresOrg: false,         // We're creating it
  requiresProject: false,
  authStrategy: 'orgLimit',   // Check 2-org limit
  writesTo: [
    { collection: 'organizations', isCreate: true },
    { collection: 'projects', isCreate: true }
  ]
}

Action.OrganizationUpdated.metadata = {
  requiresUser: true,
  requiresOrg: true,
  requiresProject: false,
  authStrategy: 'orgMember',  // Must be org member
  writesTo: [
    { collection: 'organizations', isCreate: false }
  ]
}

Action.UserUpdated.metadata = {
  requiresUser: true,
  requiresOrg: false,
  requiresProject: false,
  authStrategy: 'self',       // Only update own user
  writesTo: [
    { collection: 'users', isCreate: false }
  ]
}

Action.UserCreated.metadata = {
  requiresUser: false,        // Doesn't exist yet
  requiresOrg: false,
  requiresProject: false,
  authStrategy: 'system',     // Only system/emulator
  writesTo: [
    { collection: 'users', isCreate: true }
  ]
}

Action.MemberAdded.metadata = {
  requiresUser: true,
  requiresOrg: true,
  requiresProject: false,
  authStrategy: 'orgMember',
  writesTo: [
    { collection: 'organizations', isCreate: false }, // Update members map
    { collection: 'users', isCreate: false }          // Update organizations map
  ]
}

Action.MemberRemoved.metadata = {
  requiresUser: true,
  requiresOrg: true,
  requiresProject: false,
  authStrategy: 'orgMember',
  writesTo: [
    { collection: 'organizations', isCreate: false },
    { collection: 'users', isCreate: false }
  ]
}

Action.RoleChanged.metadata = {
  requiresUser: true,
  requiresOrg: true,
  requiresProject: false,
  authStrategy: 'orgMember',
  writesTo: [
    { collection: 'organizations', isCreate: false },
    { collection: 'users', isCreate: false }
  ]
}

Action.BlockfaceSaved.metadata = {
  requiresUser: true,
  requiresOrg: true,
  requiresProject: true,
  authStrategy: 'orgMember',
  writesTo: [
    { collection: 'blockfaces', isCreate: false }
  ]
}

// ... for all other actions
```

### 2. Create Validation Context Builder

Add new function in `submit-action-request.js`:

```javascript
/**
 * Build validation context based on action metadata
 * Only fetches what this specific action needs
 * @sig buildValidationContext :: (ActionRequest, ActionMetadata) -> Promise<ValidationContext>
 */
const buildValidationContext = async (actionRequest, metadata) => {
  const { actorId, organizationId, projectId } = actionRequest
  const fsContext = createFirestoreContext('', organizationId, projectId)

  // Fetch only what this action needs (based on metadata)
  const user = metadata.requiresUser
    ? await fsContext.users.read(actorId)
    : null

  // Snapshot existing docs for metadata validation (updates only)
  const existingDocs = {}
  for (const write of metadata.writesTo) {
    if (!write.isCreate) {
      const docId = getDocumentId(actionRequest, write.collection)
      existingDocs[write.collection] = await fsContext[write.collection].read(docId)
    }
  }

  return { user, organizationId, projectId, existingDocs, fsContext }
}

/**
 * Get document ID for a collection based on actionRequest
 * @sig getDocumentId :: (ActionRequest, String) -> String
 */
const getDocumentId = (actionRequest, collection) => {
  switch (collection) {
    case 'organizations': return actionRequest.organizationId
    case 'projects': return actionRequest.projectId
    case 'users': return actionRequest.action.userId || actionRequest.actorId
    case 'blockfaces': return actionRequest.action.blockface.id
    default: throw new Error(`Unknown collection: ${collection}`)
  }
}
```

### 3. Create Auth Strategy Functions

Extract authorization strategies into clear, testable functions:

```javascript
/**
 * Authorization strategies for different action types
 * Each strategy validates that the actor can perform this action
 */
const authStrategies = {
  /**
   * User can only modify their own user document
   */
  self: (action, ctx) => {
    if (action.userId !== ctx.user.id) {
      throw new UnauthorizedError('Can only modify own user')
    }
  },

  /**
   * User must be a member of the organization with appropriate role
   */
  orgMember: (action, ctx) => {
    if (!ctx.user.organizations?.[ctx.organizationId]) {
      throw new UnauthorizedError(`Access denied to organization ${ctx.organizationId}`)
    }
    const role = ctx.user.organizations[ctx.organizationId].role
    if (!Action.mayI(action, role, ctx.user.id)) {
      throw new UnauthorizedError('Insufficient permissions for this action')
    }
  },

  /**
   * User can create organization only if under the limit (2 orgs max)
   */
  orgLimit: (action, ctx) => {
    const orgCount = Object.keys(ctx.user?.organizations || {}).length
    if (orgCount >= 2) {
      throw new UnauthorizedError('Cannot create more than 2 organizations')
    }
  },

  /**
   * UserCreated only allowed from system or emulator
   */
  system: (action, ctx) => {
    const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true'
    if (!isEmulator) {
      throw new UnauthorizedError('UserCreated only allowed in emulator')
    }
  }
}
```

### 4. Create Metadata Validator (F128 Phase 3)

Add function to validate metadata after handler runs:

```javascript
/**
 * Validate metadata integrity after handler writes documents
 * Ensures:
 * - createdBy/updatedBy match actorId
 * - createdAt/createdBy are immutable on updates
 * @sig validateMetadataIntegrity :: (ActionRequest, ActionMetadata, FirestoreContext) -> Promise<void>
 */
const validateMetadataIntegrity = async (actionRequest, metadata, fsContext) => {
  for (const write of metadata.writesTo) {
    const docId = getDocumentId(actionRequest, write.collection)
    const written = await fsContext[write.collection].read(docId)

    if (write.isCreate) {
      // For creates: validate createdBy and updatedBy match actorId
      if (written.createdBy !== actionRequest.actorId) {
        throw new Error(`Invalid createdBy: expected ${actionRequest.actorId}, got ${written.createdBy}`)
      }
      if (written.updatedBy !== actionRequest.actorId) {
        throw new Error(`Invalid updatedBy: expected ${actionRequest.actorId}, got ${written.updatedBy}`)
      }
      // Validate timestamps are recent (within 5 seconds of now)
      const now = new Date()
      const createdAge = now - written.createdAt
      if (createdAge > 5000 || createdAge < 0) {
        throw new Error(`Invalid createdAt: timestamp not from server`)
      }
    } else {
      // For updates: validate createdBy/createdAt unchanged, updatedBy matches actorId
      const existing = actionRequest.validationContext.existingDocs[write.collection]

      if (written.createdBy !== existing.createdBy) {
        throw new Error(`Cannot modify createdBy (was: ${existing.createdBy}, now: ${written.createdBy})`)
      }
      if (written.createdAt?.getTime() !== existing.createdAt?.getTime()) {
        throw new Error(`Cannot modify createdAt`)
      }
      if (written.updatedBy !== actionRequest.actorId) {
        throw new Error(`Invalid updatedBy: expected ${actionRequest.actorId}, got ${written.updatedBy}`)
      }
    }
  }
}
```

### 5. Simplified Main Handler Flow

Rewrite the main flow in `submitActionRequest`:

```javascript
/**
 * Submit an action request via HTTP
 * Main entry point for all domain actions
 *
 * Flow:
 * 1. Validate HTTP request
 * 2. Authenticate actor
 * 3. Build ActionRequest
 * 4. Build validation context (fetch user, existing docs)
 * 5. Authorize action
 * 6. Check for duplicate
 * 7. Execute handler in transaction
 * 8. Validate metadata integrity
 * 9. Write completedAction record
 * 10. Verify transaction committed
 */
export const submitActionRequest = async (req, res) => {
  try {
    // 1. Validate HTTP request structure
    validateHttpRequest(req)

    // 2. Authenticate and get actorId from token
    const actorId = await verifyAuthToken(req)

    // 3. Build and validate ActionRequest
    const actionRequest = buildActionRequest(req, actorId)
    const metadata = getActionMetadata(actionRequest.action)

    // 4. Build validation context (fetch user, existing docs based on metadata)
    const validationContext = await buildValidationContext(actionRequest, metadata)
    actionRequest.validationContext = validationContext

    // 5. Run authorization strategy for this action
    await authStrategies[metadata.authStrategy](actionRequest.action, validationContext)

    // 6. Check for duplicate submission
    const duplicate = await checkDuplicate(actionRequest)
    if (duplicate) return respondDuplicate(res, duplicate)

    // 7. Execute handler in Firestore transaction
    const result = await db.runTransaction(async (transaction) => {
      const fsContext = createFirestoreContext('', actionRequest.organizationId, actionRequest.projectId, transaction)
      const handler = getHandler(actionRequest.action)
      const logger = createLogger(actionRequest)

      logger.flowStart(`Processing ${actionRequest.action['@@tagName']}`)

      // Execute the action handler
      await handler(logger, fsContext, actionRequest)

      // 8. Validate metadata integrity (F128 Phase 3)
      await validateMetadataIntegrity(actionRequest, metadata, fsContext)

      // 9. Write completedAction record
      await writeCompletedAction(fsContext, actionRequest)

      logger.flowStop('Action completed')

      return { status: 'completed', processedAt: new Date() }
    })

    // 10. Verify transaction actually committed
    await verifyCommit(actionRequest)

    return respondSuccess(res, result)

  } catch (error) {
    return handleError(res, error)
  }
}
```

## Files to Modify

1. **`type-definitions/action.type.js`** - Add metadata to all Action variants (after type definition)
2. **`functions/src/submit-action-request.js`** - Simplify main flow, add helper functions:
   - `buildValidationContext()`
   - `getDocumentId()`
   - `authStrategies` object
   - `validateMetadataIntegrity()`
   - Simplified `submitActionRequest()` main function
3. **`src/types/action.js`** - Regenerated automatically by type generator (no manual changes)

## Testing Strategy

- All existing integration tests should pass without modification
- The external API hasn't changed, only internal organization
- Metadata validation will catch handler bugs that existing tests might miss
- Consider adding tests specifically for metadata validation

## Benefits

1. **Main flow is linear and obvious** - No nested conditionals based on action type
2. **Action requirements are explicit** - See at a glance what each action needs
3. **Easy to add Phase 3 validation** - Metadata already declares what to validate
4. **Testable components** - Auth strategies, validators are pure functions
5. **Self-documenting** - Metadata serves as documentation of action behavior
6. **Performance optimization** - Only fetch what's needed (no extra user lookups)
7. **Easier to extend** - Adding new actions just requires metadata declaration

## Risks & Mitigations

- **Risk**: Large refactor of critical code path
  - **Mitigation**: Comprehensive integration test coverage, no behavior changes

- **Risk**: Type generator may need updates if metadata affects generated types
  - **Mitigation**: Test type generation, ensure metadata is purely runtime

- **Risk**: Performance impact from read-back validation
  - **Mitigation**: Only validate collections declared in metadata `writesTo`

## Relation to F128

This refactor completes **F128 Phase 3** (Improved Metadata Handling) by:
- Providing framework for metadata validation
- Implementing `validateMetadataIntegrity()` function
- Ensuring all handlers properly set metadata fields
- Guaranteeing SOC2 audit trail requirements are met

## Future Enhancements

After this refactor, consider:
- Moving more business rules into metadata (like "2 orgs max")
- Adding metadata for read operations (what docs the action queries)
- Using metadata for automatic permission documentation
- Generating API docs from action metadata
