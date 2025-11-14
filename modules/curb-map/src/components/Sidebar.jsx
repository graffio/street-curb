// ABOUTME: Application sidebar with navigation links
// ABOUTME: Uses TanStack Router for client-side navigation

import { Box, Button, Flex, Heading } from '@graffio/design-system'
import { Link } from '@tanstack/react-router'

const renderSidebarItem = (item, i) => (
    <Button key={i} variant="soft" size="2" asChild style={{ justifyContent: 'flex-start' }}>
        <Link to={item.to} activeProps={{ style: { fontWeight: 'bold' } }}>
            {item.label}
        </Link>
    </Button>
)

const renderSidebarSection = (sectionData, i) => (
    <Box key={i} mb="4">
        <Heading as="h3" size="3" ml="3" mt="3" color="plum">
            {sectionData.title}
        </Heading>
        <Flex direction="column">{sectionData.items.map(renderSidebarItem)}</Flex>
    </Box>
)

// prettier-ignore
const sidebarSections = [
    { title: 'Navigation', items: [{ label: 'Map',        to: '/map' }], },
    { title: 'Admin',      items: [{ label: 'User Admin', to: '/admin/users' }], },
]

const Sidebar = () => <>{sidebarSections.map(renderSidebarSection)}</>

export { Sidebar }
