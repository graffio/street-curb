const notImplemented = s => {
    throw new Error(`${s} not implemented yet`)
}

const handleUserCreated = async (logger, actionRequest, fsContext) => notImplemented('handleUserCreated')
const handleUserUpdated = async (logger, actionRequest, fsContext) => notImplemented('handleUserUpdated')
const handleUserDeleted = async (logger, actionRequest, fsContext) => notImplemented('handleUserDeleted')
const handleUserForgotten = async (logger, actionRequest, fsContext) => notImplemented('handleUserForgotten')
const handleRoleAssigned = async (logger, actionRequest, fsContext) => notImplemented('handleRoleAssigned')

export { handleUserForgotten, handleRoleAssigned, handleUserUpdated, handleUserCreated, handleUserDeleted }
