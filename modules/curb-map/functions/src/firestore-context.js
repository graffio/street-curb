import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, Organization, Project, User } from '../../src/types/index.js'

/**
 * Creates a Firestore context for a specific organization/project scope
 * Hides namespace and hierarchical collection complexity from handlers
 * @sig createFirestoreContext :: (String, String, String?, Transaction?) -> FirestoreContext
 */
const createFirestoreContext = (namespace, organizationId, projectId, tx = null) => {
    const completedActions = FirestoreAdminFacade(ActionRequest, `${namespace}/`, tx)
    const organizations = FirestoreAdminFacade(Organization, `${namespace}/`, tx)
    const users = FirestoreAdminFacade(User, `${namespace}/`, tx)
    const projects = FirestoreAdminFacade(Project, `${namespace}/organizations/${organizationId}/`, tx)

    return {
        completedActions,
        organizations,
        users,
        projects,
        deleteField: FirestoreAdminFacade.deleteField,
        encodeTimestamps: FirestoreAdminFacade.encodeTimestamps,
        decodeTimestamps: FirestoreAdminFacade.decodeTimestamps,

        // Scoped context factories - preserve transaction and namespace
        forOrganization: newOrgId => createFirestoreContext(namespace, newOrgId, null, tx),
        forProject: (newOrgId, newProjectId) => createFirestoreContext(namespace, newOrgId, newProjectId, tx),
        forUser: () => createFirestoreContext(namespace, null, null, tx),
    }
}

export { createFirestoreContext }
