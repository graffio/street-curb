// ABOUTME: Admin users page
// ABOUTME: Connects UserManagementPage to Redux state

import { layoutChannel } from '@graffio/design-system'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { UserManagementPage } from '../components/UserManagementPage.jsx'
import { post } from '../store/index.js'
import { Action, Organization } from '../types/index.js'

const AdminUsersPage = () => {
    const onRoleChange = (userId, role) => post(Action.RoleChanged(userId, currentOrganization.id, role))

    // should be selectors
    const currentOrganization = useSelector(state => state.currentOrganization)
    const currentUserId = useSelector(state => state.currentUser).id
    const isAdmin = Organization.isAdmin(currentOrganization, currentUserId)

    useEffect(() => {
        layoutChannel.setState({ title: 'User Management' })
    }, [])

    return (
        <UserManagementPage
            members={currentOrganization.members}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onRoleChange={onRoleChange}
        />
    )
}

export default AdminUsersPage
