# F121: Phone Authentication

## Status
**Ready for Implementation**

## Overview
SMS-based authentication using Firebase Auth client SDK. Server handles user creation, custom claims, and audit trail.

## Architecture

**Client:** Firebase SDK handles passcode generation, SMS delivery, and verification.

**Server:** Verifies Firebase ID token, creates/looks up User document, sets userId custom claim, logs AuthenticationCompleted action.

**Flow:**
1. Client: Collect email, displayName, phoneNumber from user
2. Client: `signInWithPhoneNumber()` → Firebase sends SMS
3. Client: `confirmationResult.confirm(passcode)` → Firebase verifies
4. Client: `getIdToken()` → Firebase returns token with `uid` and `phone_number`
5. Client: POST `/submitActionRequest` with `AuthenticationCompleted` action (includes email, displayName)
6. Server: Verify token, create/lookup user, set `userId` claim
7. Client: Refresh token to get `userId` claim for subsequent requests

**Note:** Client stores email/displayName in memory during SMS wait (typically <1 minute).

## Security
Firebase handles: passcode generation, SMS delivery, verification, rate limiting, attempt tracking, expiration.

We handle: user document creation, custom claims, audit trail, authorization.

## Tasks
- [Task 1: Add Action and Field Types](./task-1-types.md)
- [Task 2: Update Token Validation](./task-2-token-validation.md)
- [Task 3: Create Handler](./task-3-handler.md)

## References
- [Security Architecture](../../docs/architecture/security.md)
- [Event Sourcing](../../docs/architecture/event-sourcing.md)
