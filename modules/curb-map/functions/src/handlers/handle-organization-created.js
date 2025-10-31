import { Member } from '../../../src/types/index.js'
import { generateMetadata } from '../shared.js'

/**
 * Handle OrganizationCreated action
 * Creates organization document and default project
 * @sig handleOrganizationCreated :: (Logger, FirestoreContext, ActionRequest) -> Promise<void>
 */
const handleOrganizationCreated = async (logger, fsContext, actionRequest) => {
    const { action, actorId } = actionRequest
    const { organizationId, projectId, name } = action
    const metadata = generateMetadata(fsContext, actionRequest)

    // Add creator as admin member
    const actor = await fsContext.users.read(actorId)

    // Write to Firestore collections
    const status = 'active'
    const organization = { id: organizationId, name, status, defaultProjectId: projectId, members: [], ...metadata }
    await fsContext.organizations.write(organization)
    logger.flowStep('Organization created')

    const project = { id: projectId, organizationId, name: 'Default Project', ...metadata }
    await fsContext.projects.write(project)
    logger.flowStep('Project created')

    const memberData = fsContext.encodeTimestamps(Member, {
        userId: actorId,
        displayName: actor.displayName,
        role: 'admin',
        addedAt: new Date(),
        addedBy: actorId,
    })

    await fsContext.organizations.update(organizationId, { [`members.${actorId}`]: memberData })
    await fsContext.users.update(actorId, { [`organizations.${organizationId}`]: 'admin' })
    logger.flowStep('Creator added as admin')
}

export default handleOrganizationCreated
