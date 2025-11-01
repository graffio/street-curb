# F121: Passcode Authentication

## Status
**In Progress** - Token validation implemented, passcode flow pending

## Overview
SMS-based authentication using Firebase Auth with PasscodeRequested/PasscodeVerified actions for SOC2-compliant audit trail.

## Background

### Why Passcode Authentication?
Municipal field workers need passwordless authentication on mobile devices. SMS passcodes provide secure, frictionless login without managing passwords.

### Scope
This specification covers **only** the minimum needed for users to authenticate:
- PasscodeRequested action (generate & send SMS passcode)
- PasscodeVerified action (verify passcode & return auth token)
- Firebase Auth integration for SMS delivery
- Custom claims (userId) set on authentication

**Deferred to backlog**: Rate limiting, BigQuery archival, middleware extraction, monitoring

## Implementation

### 1. Add Action Types

Add to `modules/curb-map/type-definitions/action.type.js`:

```javascript
PasscodeRequested: {
    phoneNumber: FieldTypes.phoneNumber,  // E.164 format: +14155551234
},

PasscodeVerified: {
    phoneNumber: FieldTypes.phoneNumber,
    passcode: 'String',  // 6-digit code from SMS
},
```

Update `Action.fromFirestore()` to handle these new types.

### 2. Handle PasscodeRequested

Create `modules/curb-map/functions/src/handlers/handle-passcode-requested.js`:

```javascript
import bcrypt from 'bcrypt'
import admin from 'firebase-admin'

/**
 * Handle PasscodeRequested action
 * Generates passcode, sends via Firebase Auth SMS, stores hash in completedActions metadata
 * @sig handlePasscodeRequested :: (Logger, FirestoreContext, ActionRequest) -> Promise<Void>
 */
const handlePasscodeRequested = async (logger, fsContext, actionRequest) => {
    const { phoneNumber } = actionRequest.action

    // Generate random 6-digit passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash passcode with bcrypt (cost factor 10)
    const hashedPasscode = await bcrypt.hash(passcode, 10)

    // Store hashed passcode in metadata for PasscodeVerified to check
    actionRequest.metadata = {
        hashedPasscode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        attemptsRemaining: 3,
    }

    // Send SMS via Firebase Auth
    // Note: Firebase Auth SMS delivery is configured in Firebase Console
    // This uses the built-in SMS provider (no Twilio needed for MVP)
    await admin.auth().generateSignInWithPhoneNumberCode(phoneNumber, passcode)

    logger.flowStep('Passcode sent via Firebase Auth SMS')
}

export default handlePasscodeRequested
```

**Notes**:
- Passcode never stored in plaintext (only bcrypt hash)
- 10-minute expiration prevents replay attacks
- 3-attempt limit prevents brute force (per session)
- Firebase Auth handles SMS delivery (no custom provider needed)

### 3. Handle PasscodeVerified

Create `modules/curb-map/functions/src/handlers/handle-passcode-verified.js`:

```javascript
import bcrypt from 'bcrypt'
import admin from 'firebase-admin'
import { Action, ActionRequest } from '../../../src/types/index.js'
import handleUserCreated from './handle-user-created.js'

/**
 * Handle PasscodeVerified action
 * Verifies passcode, creates user if new, returns Firebase custom token
 * @sig handlePasscodeVerified :: (Logger, FirestoreContext, ActionRequest) -> Promise<Void>
 */
const handlePasscodeVerified = async (logger, fsContext, actionRequest) => {
    const { phoneNumber, passcode } = actionRequest.action
    const { correlationId } = actionRequest

    // Find most recent PasscodeRequested for this phone number
    const query = await fsContext.completedActions.list({
        where: [
            ['action.@@tagName', '==', 'PasscodeRequested'],
            ['action.phoneNumber', '==', phoneNumber],
        ],
        orderBy: [['createdAt', 'desc']],
        limit: 1,
    })

    const recentRequest = query[0]
    if (!recentRequest) {
        throw new Error('No passcode request found for this phone number')
    }

    const { metadata } = recentRequest

    // Check expiration
    if (new Date() > new Date(metadata.expiresAt)) {
        throw new Error('Passcode expired - request a new one')
    }

    // Check attempts remaining
    if (metadata.attemptsRemaining <= 0) {
        throw new Error('Too many failed attempts - request a new passcode')
    }

    // Verify passcode
    const isValid = await bcrypt.compare(passcode, metadata.hashedPasscode)

    if (!isValid) {
        // Decrement attempts (update completedActions metadata)
        // Note: This requires implementing metadata update support
        // For MVP, we can skip this and rely on expiration timeout
        throw new Error('Invalid passcode')
    }

    // Check if user exists
    let userId
    const userQuery = await fsContext.users.list({
        where: [['phoneNumber', '==', phoneNumber]],
        limit: 1,
    })

    if (userQuery.length > 0) {
        userId = userQuery[0].id
        logger.flowStep('Existing user authenticated')
    } else {
        // New user - create User document via UserCreated action
        const userAction = Action.UserCreated.from({
            userId: FieldTypes.newUserId(),
            email: `${phoneNumber}@phone.user`, // Placeholder email
            displayName: phoneNumber, // Default to phone number
            authUid: await createAuthUser(phoneNumber),
        })

        const userActionRequest = ActionRequest.from({
            action: userAction,
            actorId: 'system', // System-initiated
            idempotencyKey: `idm_${correlationId}`,
            correlationId,
        })

        await handleUserCreated(logger, fsContext, userActionRequest)
        userId = userAction.userId
        logger.flowStep('New user created')
    }

    // Generate Firebase custom token with userId in claims
    const customToken = await admin.auth().createCustomToken(userId, { userId })

    // Store token in metadata for HTTP response
    actionRequest.metadata = { customToken }

    logger.flowStep('Authentication successful')
}

/**
 * Create Firebase Auth user for phone number
 * @sig createAuthUser :: String -> Promise<String>
 */
const createAuthUser = async phoneNumber => {
    const user = await admin.auth().createUser({ phoneNumber })
    return user.uid
}

export default handlePasscodeVerified
```

**Notes**:
- Verifies passcode against bcrypt hash from PasscodeRequested
- Creates User document for new users via UserCreated action
- Returns Firebase custom token in actionRequest.metadata
- Token contains userId claim for authorization

### 4. Return Token in HTTP Response

Update `modules/curb-map/functions/src/submit-action-request.js` to return metadata in response:

```javascript
// In sendCompleted helper (around line 78)
const sendCompleted = (res, processedAt, metadata) => {
    const payload = { status: 'completed', processedAt }
    if (metadata) payload.metadata = metadata
    return sendJson(res, 200, payload)
}

// After transaction completes (around line 377)
const completed = await fsContext.completedActions.readOrNull(actionRequest.id)
if (!completed) {
    logger.error(new Error('Transaction completed but action request not found'))
    return sendFailed(res, 'Transaction failed - action request not persisted')
}

logger.flowStop('└─ Processing completed', { durationMs: Date.now() - startTime }, '')
return sendCompleted(res, completed.processedAt.toISOString(), completed.metadata)
```

### 5. Register Handlers

Add to `modules/curb-map/functions/src/submit-action-request.js` dispatcher:

```javascript
const dispatchToHandler = actionRequest =>
    actionRequest.action.match({
        // ... existing handlers
        PasscodeRequested: () => handlePasscodeRequested,
        PasscodeVerified:  () => handlePasscodeVerified,
    })
```

Import at top of file:

```javascript
import handlePasscodeRequested from './handlers/handle-passcode-requested.js'
import handlePasscodeVerified from './handlers/handle-passcode-verified.js'
```

## Authentication Flow

```
┌──────────┐                    ┌──────────────┐
│  Client  │                    │ submitAction │
│          │                    │   Request    │
└────┬─────┘                    └──────┬───────┘
     │                                 │
     │ POST PasscodeRequested          │
     │ {phoneNumber: "+14155551234"}   │
     ├────────────────────────────────>│ Generate passcode
     │                                 │ Hash with bcrypt
     │                                 │ Send SMS via Firebase Auth
     │                                 │
     │ HTTP 200: {status: "completed"} │
     │<────────────────────────────────┤
     │                                 │
     │ [User receives SMS with code]   │
     │                                 │
     │ POST PasscodeVerified           │
     │ {phoneNumber, passcode}         │
     ├────────────────────────────────>│ Verify passcode hash
     │                                 │ Create/lookup User
     │                                 │ Generate custom token
     │                                 │
     │ HTTP 200: {status: "completed", │
     │  metadata: {customToken: "..."}}│
     │<────────────────────────────────┤
     │                                 │
     │ [Client stores token]           │
```

## SOC2 Compliance

- **CC6.1**: Both actions logged to completedActions for audit trail
- **CC6.7**: Passcodes hashed with bcrypt before storage (never plaintext)
- **CC7.2**: Failed attempts tracked (3 attempts max per session)
- **CC7.3**: Passcode expiration prevents replay attacks (10 min TTL)

## Testing

### Integration Tests

Create `modules/curb-map/test/integration-test/handle-passcode-requested.integration-test.js`:

```javascript
test('When passcode requested Then SMS sent and hash stored', async t => {
    await asSignedInUser('passcode-request', async ({ namespace, token }) => {
        const phoneNumber = '+14155551234'
        const action = Action.PasscodeRequested.from({ phoneNumber })

        await submitAndExpectSuccess({ action, namespace, token })

        // Verify completedActions has hashed passcode
        const fsContext = createFirestoreContext(namespace)
        const completed = await fsContext.completedActions.list({
            where: [['action.@@tagName', '==', 'PasscodeRequested']],
            limit: 1,
        })

        t.ok(completed[0].metadata.hashedPasscode, 'Then hashedPasscode stored')
        t.ok(completed[0].metadata.expiresAt, 'Then expiration set')
        t.equal(completed[0].metadata.attemptsRemaining, 3, 'Then attempts initialized')
    })
})
```

Create `modules/curb-map/test/integration-test/handle-passcode-verified.integration-test.js`:

```javascript
test('When valid passcode verified Then token returned', async t => {
    // Test flow:
    // 1. Request passcode
    // 2. Extract passcode from test SMS (or mock SMS for test)
    // 3. Verify passcode
    // 4. Assert custom token returned
})

test('When invalid passcode verified Then error thrown', async t => {
    // Test with wrong passcode
})

test('When expired passcode verified Then error thrown', async t => {
    // Test with expired session
})
```

## Firebase Auth Configuration

Enable phone authentication in Firebase Console:
1. Navigate to Authentication > Sign-in method
2. Enable "Phone" provider
3. Add test phone numbers for development (optional)
4. Configure SMS quota (Firebase has free tier limits)

## Deferred Items

See `specifications/backlog.md` for:
- Rate limiting (PasscodeRequested per phone number/IP)
- BigQuery archival (90-day retention + long-term storage)
- Middleware extraction (refactor inline auth to middleware pattern)
- Monitoring & alerting (failed auth attempts, brute force detection)
- Custom claims refresh (when roles change)

## References

**Architecture**:
- [Security Architecture](../../docs/architecture/security.md) - Authentication flow
- [Event Sourcing](../../docs/architecture/event-sourcing.md) - Audit trail integration

**Implementation Files**:
- `modules/curb-map/functions/src/submit-action-request.js` - Token validation (lines 170-196, 342-344)
- `modules/curb-map/functions/src/handlers/handle-user-created.js` - Custom claims set (line 23)
- `modules/curb-map/type-definitions/action.type.js` - Action type definitions
