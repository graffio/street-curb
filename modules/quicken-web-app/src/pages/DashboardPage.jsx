// ABOUTME: Dashboard overview page
// ABOUTME: Sets page title via Redux

import { Box, Flex, Text } from '@graffio/design-system'
import { useEffect } from 'react'
import { post } from '../commands/post.js'
import { Action } from '../types/action.js'

// Top-level dashboard
// @sig DashboardPage :: () -> ReactElement
const DashboardPage = () => {
    useEffect(() => post(Action.SetPageTitle('Dashboard')), [])

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

export { DashboardPage }
