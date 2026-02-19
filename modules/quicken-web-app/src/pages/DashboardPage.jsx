// ABOUTME: Dashboard overview page
// ABOUTME: Renders financial dashboard placeholder

import { Box, Flex, Text } from '@radix-ui/themes'

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Top-level dashboard
// @sig DashboardPage :: () -> ReactElement
const DashboardPage = () => (
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

export { DashboardPage }
