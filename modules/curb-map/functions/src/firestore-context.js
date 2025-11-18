import admin from 'firebase-admin'
import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, Blockface, Organization, Project, User } from '../../src/types/index.js'

/**
 * Single-date encoder for Firestore serialization
 * @sig encodeTimestamp :: Date -> Timestamp
 */
const encodeTimestamp = date => admin.firestore.Timestamp.fromDate(date)

/**
 * Creates a Firestore context for a specific organization/project scope
 * Hides namespace and hierarchical collection complexity from handlers
 * @sig createFirestoreContext :: (String, String, String?, Transaction?) -> FirestoreContext
 */
const createFirestoreContext = (namespace, organizationId, projectId, tx = null) => {
    const organizationPrefix = `${namespace}/organizations/${organizationId}`
    const projectsPrefix = `${organizationPrefix}/projects/${projectId}`

    const completedActions = FirestoreAdminFacade(ActionRequest, `${namespace}`, tx)
    const organizations = FirestoreAdminFacade(Organization, `${namespace}`, tx)
    const users = FirestoreAdminFacade(User, `${namespace}/`, tx)
    const projects = organizationId ? FirestoreAdminFacade(Project, organizationPrefix, tx) : null
    const blockfaces = organizationId && projectId ? FirestoreAdminFacade(Blockface, projectsPrefix, tx) : null

    return {
        completedActions,
        organizations,
        users,
        projects,
        blockfaces,
        deleteField: FirestoreAdminFacade.deleteField,
        encodeTimestamp,

        // Scoped context factories - preserve transaction and namespace
        forOrganization: newOrgId => createFirestoreContext(namespace, newOrgId, null, tx),
        forProject: (newOrgId, newProjectId) => createFirestoreContext(namespace, newOrgId, newProjectId, tx),
        forUser: () => createFirestoreContext(namespace, null, null, tx),
    }
}

export { createFirestoreContext }
