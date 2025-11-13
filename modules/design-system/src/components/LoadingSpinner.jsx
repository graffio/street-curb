// ABOUTME: Loading spinner component for Suspense fallback
// ABOUTME: Centered spinner displayed while lazy-loaded components are loading

import { Box, Flex, Spinner } from '@radix-ui/themes'

const LoadingSpinner = () => (
    <Flex width="100%" height="100%" align="center" justify="center">
        <Box>
            <Spinner size="3" />
        </Box>
    </Flex>
)

export { LoadingSpinner }
