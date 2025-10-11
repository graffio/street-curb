const generateMetadata = (fsContext, actionRequest) => ({
    createdAt: fsContext.serverTimestamp(),
    createdBy: actionRequest.actorId,
    updatedAt: fsContext.serverTimestamp(),
    updatedBy: actionRequest.actorId,
})

const updatedMetadata = (fsContext, actionRequest) => ({
    updatedAt: fsContext.serverTimestamp(),
    updatedBy: actionRequest.actorId,
})

/**
 * Handle OrganizationCreated action
 * Creates organization document and default project
 * @sig handleOrganizationCreated :: (Logger, ActionRequest, FirestoreContext) -> Promise<void>
 */
const handleOrganizationCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { organizationId, projectId, name } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    // Write to Firestore collections
    const organization = { id: organizationId, name, status: 'active', defaultProjectId: projectId, ...metadata }
    await fsContext.organizations.write(organization)
    logger.flowStep('Organization created')

    const project = { id: projectId, organizationId, name: 'Default Project', ...metadata }
    await fsContext.projects.write(project)
    logger.flowStep('Project created')
}

/**
 * Handle OrganizationUpdated action
 * Updates organization name and/or status
 * @sig handleOrganizationUpdated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationUpdated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const metadata = updatedMetadata(fsContext, actionRequest)

    // Read existing organization
    const organization = await fsContext.organizations.read(action.organizationId)
    const { name = organization.name, status = organization.status } = action

    // Update fields
    await fsContext.organizations.update(organization.id, { ...{ name, status }, ...metadata })
    logger.flowStep('Organization updated')
}

/**
 * Handle OrganizationSuspended action
 * Sets organization status to 'suspended'
 * @sig handleOrganizationSuspended :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationSuspended = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { organizationId } = action
    const metadata = updatedMetadata(fsContext, actionRequest)

    await fsContext.organizations.update(organizationId, { status: 'suspended', ...metadata })
    logger.flowStep('Organization suspended')
}

/**
 * Handle OrganizationDeleted action
 * Deletes organization document
 * @sig handleOrganizationDeleted :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationDeleted = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { organizationId } = action

    await fsContext.organizations.delete(organizationId)
    logger.flowStep('Organization deleted')
}

export { handleOrganizationCreated, handleOrganizationUpdated, handleOrganizationDeleted, handleOrganizationSuspended }
