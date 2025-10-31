import admin from 'firebase-admin'
import { generateMetadata } from '../shared.js'

/**
 * Handle UserCreated action
 * Creates user document with empty organizations map
 * Sets userId custom claim on Firebase Auth user
 *
 * NOTE: In production, PasscodeVerified action (F121) should set this claim BEFORE
 * UserCreated is submitted (to avoid 401 deadlock). This claim-setting is a safety
 * net for robustness, but the claim should already exist when this handler runs.
 *
 * @sig handleUserCreated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleUserCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { userId, email, displayName, authUid } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    await fsContext.users.write({ id: userId, email, displayName, organizations: {}, ...metadata })

    // Set userId custom claim to link Firebase Auth token to Firestore user doc
    await admin.auth().setCustomUserClaims(authUid, { userId })

    logger.flowStep('User created')
}

export default handleUserCreated
