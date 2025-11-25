import { FieldTypes } from '../../../src/types/index.js'
import { User } from '../../../type-definitions/user.type.js'

/**
 * Handle AuthenticationCompleted action
 * Creates new user or looks up existing by phone
 * @sig handleAuthenticationCompleted :: (FirestoreContext, ActionRequest, ExistingDocs) -> Promise<WrittenDocs>
 */
const handleAuthenticationCompleted = async (fsContext, actionRequest, decodedToken) => {
    const handleReturningUser = async () => existingUsers[0].id

    // New user - generate userId and create document
    const handleNewUser = async () => {
        const userId = FieldTypes.newUserId()
        const date = new Date()

        const metadata = { createdAt: date, createdBy: actorId, updatedAt: date, updatedBy: actorId }
        const user = User.from({ id: userId, phoneNumber, email, displayName, organizations: {}, ...metadata })
        await fsContext.users.write(user)
        return userId
    }

    const { phone_number: phoneNumber } = decodedToken
    const { email, displayName, actorId } = actionRequest.action

    if (!phoneNumber) throw new Error('Firebase token missing phone_number claim')

    // Lookup existing user by phoneNumber
    const existingUsers = await fsContext.users.query({ where: [['phoneNumber', '==', phoneNumber]], limit: 1 })

    existingUsers.length > 0 ? await handleReturningUser() : await handleNewUser()
}

export default handleAuthenticationCompleted
