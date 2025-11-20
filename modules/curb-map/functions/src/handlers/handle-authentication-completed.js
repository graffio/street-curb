import { FieldTypes } from '../../../src/types/index.js'
import { User } from '../../../type-definitions/user.type.js'
import { generateMetadata } from '../shared.js'

/**
 * Handle AuthenticationCompleted action
 * Creates new user or looks up existing by phone
 * @sig handleAuthenticationCompleted :: (Logger, FirestoreContext, ActionRequest, DecodedToken) -> Promise<Void>
 */
const handleAuthenticationCompleted = async (logger, fsContext, actionRequest, decodedToken) => {
    const handleReturningUser = async () => {
        logger.flowStep('Existing user authenticated')
        return existingUsers[0].id
    }

    // New user - generate userId and create document
    const handleNewUser = async () => {
        const userId = FieldTypes.newUserId()
        const metadata = generateMetadata(fsContext, actionRequest)
        const user = User.from({ id: userId, phoneNumber, email, displayName, organizations: {}, ...metadata })

        await fsContext.users.write(user)

        logger.flowStep('New user created')
        return userId
    }

    const { phone_number: phoneNumber } = decodedToken
    const { email, displayName } = actionRequest.action

    if (!phoneNumber) throw new Error('Firebase token missing phone_number claim')

    // Lookup existing user by phoneNumber
    const existingUsers = await fsContext.users.query({ where: [['phoneNumber', '==', phoneNumber]], limit: 1 })

    existingUsers.length > 0 ? await handleReturningUser() : await handleNewUser()

    logger.flowStep('Authentication completed')
}

export default handleAuthenticationCompleted
