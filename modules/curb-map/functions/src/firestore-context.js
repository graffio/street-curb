import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, Organization, Project, User } from '../../src/types/index.js'

/**
 * Creates a Firestore context for a specific organization/project scope
 * Hides namespace and hierarchical collection complexity from handlers
 * @sig createFirestoreContext :: (String, String, String?) -> FirestoreContext
 */
const createFirestoreContext = (namespace, organizationId, projectId) => {
    const actionRequests = FirestoreAdminFacade(ActionRequest, `${namespace}/`)
    const completedActions = FirestoreAdminFacade(ActionRequest, `${namespace}/`, undefined, 'completedActions')
    const organizations = FirestoreAdminFacade(Organization, `${namespace}/`)
    const users = FirestoreAdminFacade(User, `${namespace}/`)
    const projects = FirestoreAdminFacade(Project, `${namespace}/organizations/${organizationId}/`)

    return {
        actionRequests,
        completedActions,
        organizations,
        users,
        projects,
        serverTimestamp: FirestoreAdminFacade.serverTimestamp,
        deleteField: FirestoreAdminFacade.deleteField,
    }
}

export { createFirestoreContext }
