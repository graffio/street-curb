// ABOUTME: Admin users page
// ABOUTME: Connects UserManagementPage to Redux state

import { layoutChannel } from '@graffio/design-system'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/index.js'
import { AdminUsersTabbedPanel } from '../components/AdminUsersTabbedPanel.jsx'
import * as S from '../store/selectors.js'
import { Action, Organization } from '../types/index.js'

const AdminUsersPage = () => {
    const currentOrganization = useSelector(S.currentOrganization)
    const currentUserId = useSelector(S.currentUser).id
    const isAdmin = Organization.isAdmin(currentOrganization, currentUserId)

    const onRoleChange = (userId, role) => post(Action.RoleChanged(userId, currentOrganization.id, role))

    useEffect(() => {
        layoutChannel.setState({ title: 'User Management' })
    }, [])

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
