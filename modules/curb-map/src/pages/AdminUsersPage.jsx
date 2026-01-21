// ABOUTME: Admin users page
// ABOUTME: Connects UserManagementPage to Redux state
// COMPLEXITY-TODO: export-structure — File predates style rules (expires 2026-04-01)
// COMPLEXITY-TODO: function-declaration-ordering — File predates style rules (expires 2026-04-01)
// COMPLEXITY-TODO: sig-documentation — File predates style rules (expires 2026-04-01)

import { useSelector } from 'react-redux'
import { post } from '../commands/index.js'
import { AdminUsersTabbedPanel } from '../components/AdminUsersTabbedPanel.jsx'
import * as S from '../store/selectors.js'
import { Action, Organization } from '../types/index.js'

const AdminUsersPage = () => {
    const currentOrganization = useSelector(S.currentOrganization)
    const currentUserId = useSelector(S.currentUser).id
    const isAdmin = Organization.isAdmin(currentOrganization, currentUserId)

    const onRoleChange = (userId, role) => post(Action.RoleChanged(userId, role))

    return (
        <AdminUsersTabbedPanel
            members={currentOrganization.members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onRoleChange={onRoleChange}
        />
    )
}

export default AdminUsersPage
