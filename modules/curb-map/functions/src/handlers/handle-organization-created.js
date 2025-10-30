import { generateMetadata } from '../shared.js'

/**
 * Handle OrganizationCreated action
 * Creates organization document and default project
 * @sig handleOrganizationCreated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationCreated = async (logger, fsContext, actionRequest) => {
    const { action } = actionRequest
    const { organizationId, projectId, name } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    // Write to Firestore collections
    const status = 'active'
    const organization = { id: organizationId, name, status, defaultProjectId: projectId, members: [], ...metadata }
    await fsContext.organizations.write(organization)
    logger.flowStep('Organization created')

    const project = { id: projectId, organizationId, name: 'Default Project', ...metadata }
    await fsContext.projects.write(project)
    logger.flowStep('Project created')
}

export default handleOrganizationCreated
