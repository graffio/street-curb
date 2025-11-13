// ABOUTME: Admin users page placeholder
// ABOUTME: Will be replaced with UserManagementPage integration

import { Box, layoutChannel } from '@graffio/design-system'
import { useEffect } from 'react'

const AdminUsersPage = () => {
    useEffect(() => {
        layoutChannel.setState({ title: 'User Management' })
    }, [])

    return <Box p="4">User Management - Coming Soon</Box>
}

export default AdminUsersPage
