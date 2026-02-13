// ABOUTME: Sidebar navigation components
// ABOUTME: Renders titled sections with navigation links

import { Box, Button, Flex, Heading } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'
import React from 'react'

// prettier-ignore
const sidebarSections = [
    { title: 'Dashboard', items: [{ label: 'Overview', to: '/dashboard' }] },
]

// Renders a navigation button for a sidebar item
// @sig SidebarItem :: { label: String, to: String } -> ReactElement
const SidebarItem = ({ label, to }) => (
    <Button ml="3" mb="3" mr="3" variant="ghost" asChild style={{ justifyContent: 'flex-start' }}>
        <Link to={to} activeProps={{ style: { backgroundColor: 'var(--accent-3)' } }}>
            {label}
        </Link>
    </Button>
)

// Renders a titled section with navigation items
// @sig SidebarSection :: { title: String, items: [{ label: String, to: String }] } -> ReactElement
const SidebarSection = ({ title, items }) => (
    <Box mb="4">
        <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
            {title}
        </Heading>
        <Flex direction="column">
            {items.map(({ label, to }) => (
                <SidebarItem key={label} label={label} to={to} />
            ))}
        </Flex>
    </Box>
)

// Renders all sidebar navigation sections
// @sig SidebarNav :: () -> ReactElement
const MainSidebar = () => (
    <>
        {sidebarSections.map(({ title, items }) => (
            <SidebarSection key={title} title={title} items={items} />
        ))}
    </>
)

export { MainSidebar }
