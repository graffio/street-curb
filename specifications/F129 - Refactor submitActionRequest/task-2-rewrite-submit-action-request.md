# Task 2: Rewrite submitActionRequest with Simplified Flow

## Goal
Complete rewrite of `submit-action-request.js` to implement the new validation flow with immediate rejection of spoofed data.

## New Structure

### Helper Functions to Create

1. **`authenticate(req)`** - Extract actorId from token
2. **`buildActionRequest(req, actorId)`** - Parse request into ActionRequest
3. **`validateTenantMembership(actorId, organizationId, namespace)`** - Check actor is non-removed org member
4. **`validateAuthorization(action, metadata, validationContext)`** - Role-based permission check
5. **`readExistingDocuments(metadata, actionRequest, namespace)`** - Read docs declared in metadata.writesTo
6. **`validateMetadata(action, metadata, existingDocs, actorId)`** - Detect metadata spoofing
7. **`validateTenantBoundaries(actionRequest)`** - Check org/project IDs match
8. **`executeInTransaction(actionRequest, metadata)`** - Idempotency + handler + completedAction

### Main Flow

```javascript
const submitActionRequestHandler = async (req, res) => {
    try {
        // 1. Authenticate
        const actorId = await authenticate(req)

        // 2. Build ActionRequest
        const actionRequest = await buildActionRequest(req, actorId)
        const metadata = Action.metadata(actionRequest.action)

        // 3. Validate tenant membership
        await validateTenantMembership(actorId, actionRequest.organizationId, actionRequest.namespace)

        // 4. Validate authorization
        const validationContext = await buildValidationContext(...)
        await validateAuthorization(actionRequest.action, metadata, validationContext)

        // 5. Read existing documents
        const existingDocs = await readExistingDocuments(metadata, actionRequest, namespace)

        // 6. Validate metadata (REJECT if spoofed)
        await validateMetadata(actionRequest.action, metadata, existingDocs, actorId)

        // 7. Validate tenant boundaries
        await validateTenantBoundaries(actionRequest)

        // 8-10. Execute in transaction
        const result = await executeInTransaction(actionRequest, metadata)

        // 11. Send response
        return sendCompleted(res, result)

    } catch (error) {
        return handleError(res, error)
    }
}
```

### Code to Remove

- `verifyHandlerOutput()` function (lines 347-396)
- Three-layer security model comments (lines 310-335)
- Any defensive metadata overwrites in handlers

### Code to Keep

- HTTP response helpers (lines 66-98)
- `decodeTimestamp()` (lines 106-110)
- `validateRequest()` (lines 112-141)
- `toActionRequest()` (lines 148-179)
- `verifyAuthToken()` (lines 185-209)
- `getDocumentIds()` (lines 216-231)
- `buildValidationContext()` (lines 238-246)
- `authStrategies` (lines 252-308)
- `handlerForActionRequest()` (lines 418-445)

## Implementation Notes

- Each helper function should throw on validation failure
- Single catch block handles all errors and sends appropriate HTTP response
- No try/catch within individual validation functions
- Clear, descriptive error messages for each failure type

## Validation

Run integration tests:
```bash
yarn tap:integration
```

All existing tests (except security tests updated in task 1) should pass.
