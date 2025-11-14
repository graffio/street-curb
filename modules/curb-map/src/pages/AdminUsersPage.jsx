// ABOUTME: Admin users page
// ABOUTME: Connects UserManagementPage to Redux state

import { layoutChannel } from '@graffio/design-system'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { UserManagementPage } from '../components/UserManagementPage.jsx'

const AdminUsersPage = () => {
    // should be selectors
    const members = useSelector(state => state.members)
    const currentUser = useSelector(state => state.currentUser)
    const currentOrganization = useSelector(state => state.currentOrganization)
    const isAdmin = currentOrganization?.members?.[currentUser?.id]?.role === 'admin'

    useEffect(() => {
        layoutChannel.setState({ title: 'User Management' })
    }, [])

    return (
        <UserManagementPage
            members={members}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            onRoleChange={undefined}
        />
    )
}

export default AdminUsersPage
