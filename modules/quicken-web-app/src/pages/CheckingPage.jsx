// ABOUTME: Checking account transactions page
// ABOUTME: Sets layout title via layoutChannel

import { Box, Flex, layoutChannel, Text } from '@graffio/design-system'
import { useEffect } from 'react'

const CheckingPage = () => {
    useEffect(() => {
        layoutChannel.setState({ title: 'Checking Account' })
    }, [])

    return (
        <Box p="4">
            <Flex direction="column" gap="4">
                <Text size="6" weight="bold">
                    Checking Account
                </Text>
                <Text size="3" color="gray">
                    Transaction register will appear here.
                </Text>
            </Flex>
        </Box>
    )
}

export default CheckingPage
