// ABOUTME: Dashboard overview page
// ABOUTME: Sets layout title via layoutChannel

import { Box, Flex, layoutChannel, Text } from '@graffio/design-system'
import { useEffect } from 'react'

const DashboardPage = () => {
    useEffect(() => {
        layoutChannel.setState({ title: 'Dashboard' })
    }, [])

    return (
        <Box p="4">
            <Flex direction="column" gap="4">
                <Text size="6" weight="bold">
                    Financial Dashboard
                </Text>
                <Text size="3" color="gray">
                    Overview of your financial data will appear here.
                </Text>
            </Flex>
        </Box>
    )
}

export default DashboardPage
