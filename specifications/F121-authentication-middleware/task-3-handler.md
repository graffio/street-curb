# Task 3: Create Handler

## Create handle-authentication-completed.js

`modules/curb-map/functions/src/handlers/handle-authentication-completed.js`:

```javascript
import admin from 'firebase-admin'
import { FieldTypes } from '../../../type-definitions/field-types.js'
import { User } from '../../../type-definitions/user.type.js'
import { generateMetadata } from '../shared.js'

/**
 * Handle AuthenticationCompleted action
 * Creates new user or looks up existing by phone, sets userId custom claim
 * @sig handleAuthenticationCompleted :: (Logger, FirestoreContext, ActionRequest, DecodedToken) -> Promise<Void>
 */
const handleAuthenticationCompleted = async (logger, fsContext, actionRequest, decodedToken) => {
    const { uid, phone_number } = decodedToken
    const { email, displayName } = actionRequest.action

    if (!phone_number) throw new Error('Firebase token missing phone_number claim')

    // Lookup existing user by phoneNumber
    const existingUsers = await fsContext.users.query({
        where: [['phoneNumber', '==', phone_number]],
        limit: 1,
    })

    let userId

    if (existingUsers.length > 0) {
        // Returning user
        userId = existingUsers[0].id
        logger.flowStep('Existing user authenticated')
    } else {
        // New user - generate userId and create document
        userId = FieldTypes.newUserId()
        const metadata = generateMetadata(fsContext, actionRequest)

        const user = User.from({
            id: userId,
            phoneNumber: phone_number,
            email,
            displayName,
            organizations: {},
            ...metadata,
        })

        await fsContext.users.write(user)

        logger.flowStep('New user created')
    }

    // Set userId custom claim
    await admin.auth().setCustomUserClaims(uid, { userId })

    logger.flowStep('Authentication completed')
}

export default handleAuthenticationCompleted
```

## Register Handler

`modules/curb-map/functions/src/submit-action-request.js`:

Import:
```javascript
import handleAuthenticationCompleted from './handlers/handle-authentication-completed.js'
```

Add to dispatcher:
```javascript
const dispatchToHandler = actionRequest =>
    actionRequest.action.match({
        // ... existing handlers
        AuthenticationCompleted: () => handleAuthenticationCompleted,
    })
```
