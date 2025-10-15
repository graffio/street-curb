import { FirestoreAdminFacade } from '../../src/firestore-facade/firestore-admin-facade.js'
import { ActionRequest, Organization, Project, User } from '../../src/types/index.js'

/**
 * Creates a Firestore context for a specific organization/project scope
 * Hides namespace and hierarchical collection complexity from handlers
 * @sig createFirestoreContext :: (String, String, String?, Transaction?) -> FirestoreContext
 */
const createFirestoreContext = (namespace, organizationId, projectId, tx = null) => {
    const completedActions = FirestoreAdminFacade(ActionRequest, `${namespace}/`, undefined, 'completedActions', tx)
    const organizations = FirestoreAdminFacade(Organization, `${namespace}/`, undefined, null, tx)
    const users = FirestoreAdminFacade(User, `${namespace}/`, undefined, null, tx)
    const projects = FirestoreAdminFacade(Project, `${namespace}/organizations/${organizationId}/`, undefined, null, tx)

    return {
        completedActions,
        organizations,
        users,
        projects,
        serverTimestamp: FirestoreAdminFacade.serverTimestamp,
        deleteField: FirestoreAdminFacade.deleteField,
    }
}

export { createFirestoreContext }
