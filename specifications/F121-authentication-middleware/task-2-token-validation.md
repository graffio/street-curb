# Task 2: Update Token Validation

## Modify readUserIdFromAuthCustomClaims()

`modules/curb-map/functions/src/submit-action-request.js`:

```javascript
const readUserIdFromAuthCustomClaims = async (req, logger, actionRequest) => {
    // ... existing error handling and token extraction ...

    try {
        const decoded = await admin.auth().verifyIdToken(token)

        // AuthenticationCompleted works without userId claim (first-time auth)
        if (Action.AuthenticationCompleted.is(actionRequest.action)) {
            if (!decoded.uid) return { error: 'Authorization token missing uid' }
            return { decodedToken: decoded }
        }

        // All other actions require userId claim
        const { userId } = decoded
        if (!userId || !FieldTypes.userId.test(userId)) {
            return { error: 'Authorization token missing userId claim' }
        }
        return { userId }
    } catch (error) {
        // ... existing error handling ...
    }
}
```

## Update Handler Invocation

Same file, update where handler is invoked:

```javascript
const authResult = await readUserIdFromAuthCustomClaims(req, logger, actionRequest)
if (authResult.error) return sendFailed(res, authResult.error)

const handler = dispatchToHandler(actionRequest)

if (Action.AuthenticationCompleted.is(actionRequest.action)) {
    await handler(logger, fsContext, actionRequest, authResult.decodedToken)
} else {
    actionRequest.actorId = authResult.userId
    await handler(logger, fsContext, actionRequest)
}
```
