import { ActionRequest } from '../../../src/types/index.js'

/**
 * Handle OrganizationCreated action
 * Creates organization document and default project
 * @sig handleOrganizationCreated :: (Logger, ActionRequest, FirestoreContext) -> Promise<Result>
 */
const handleOrganizationCreated = async (logger, actionRequest, fsContext) => {
    const { action } = actionRequest
    const { organizationId, projectId, name } = action

    // Create organization document
    const organizationDoc = {
        id: organizationId,
        name,
        status: 'active',
        defaultProjectId: projectId,
        createdAt: fsContext.serverTimestamp(),
        createdBy: actionRequest.actorId,
        updatedAt: fsContext.serverTimestamp(),
        updatedBy: actionRequest.actorId,
    }

    // Create default project document
    const projectDoc = {
        id: projectId,
        organizationId,
        name: 'Default Project',
        createdAt: fsContext.serverTimestamp(),
        createdBy: actionRequest.actorId,
        updatedAt: fsContext.serverTimestamp(),
        updatedBy: actionRequest.actorId,
    }

    // Write to Firestore collections
    await fsContext.organizations.write(organizationDoc)
    logger.flowStep('Organization created', { organizationId })
    await fsContext.projects.write(projectDoc)
    logger.flowStep('Project created', { projectId })

    return { success: true, actionRequest: ActionRequest.from({ ...actionRequest, projectId }) }
}

const notImplemented = s => {
    throw new Error(`${s} not implemented yet`)
}

const handleOrganizationUpdated = async (logger, actionRequest, fsContext) => notImplemented('Organization Updated')
const handleOrganizationDeleted = async (logger, actionRequest, fsContext) => notImplemented('Organization Deleted')
const handleOrganizationSuspended = async (logger, actionRequest, fsContext) => notImplemented('organization Suspended')

export { handleOrganizationCreated, handleOrganizationUpdated, handleOrganizationDeleted, handleOrganizationSuspended }
