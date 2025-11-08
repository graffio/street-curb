import { Box, Button, Flex, Grid, Heading, Link } from '@radix-ui/themes'
import React from 'react'
import { layoutChannel, useChannel } from '../channels/index.js'
import { TitleAndSubtitle } from './TitleAndSubtitle.jsx'

const renderTopBarAction = (action, index) => (
    <Button key={index} size="2">
        {action.label}
    </Button>
)
/**
 * TopBar component provides the application header
 */
const TopBar = () => {
    let [{ title, subtitle, topBarActions }] = useChannel(layoutChannel, ['title', 'subtitle', 'topBarActions'])
    topBarActions ||= []

    return (
        <Flex height="100%" align="center" px="4" style={{ borderBottom: '1px solid var(--accent-3)' }}>
            <TitleAndSubtitle gap="tight">
                <TitleAndSubtitle.Title size="lg">{title}</TitleAndSubtitle.Title>
                {subtitle && <TitleAndSubtitle.Subtitle size="xs">{subtitle}</TitleAndSubtitle.Subtitle>}
            </TitleAndSubtitle>

            <Flex gap="2" ml="auto">
                {topBarActions.map(renderTopBarAction)}
            </Flex>
        </Flex>
    )
}

const renderSidebarItem = (item, i) => (
    <Button key={i} variant="soft" size="2" asChild style={{ justifyContent: 'flex-start' }}>
        <Link href={item.href} underline="none" weight="medium">
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

/**
 * Sidebar component provides navigation for the application
 *
 * @sig Sidebar :: () -> ReactElement
 */
const Sidebar = () => {
    let [sidebarItems] = useChannel(layoutChannel, 'sidebarItems')
    sidebarItems ||= []

    return (
        <Flex direction="column" gap="1" height="100%" style={{ backgroundColor: 'var(--gray-1)' }}>
            {sidebarItems.map(renderSidebarSection)}
        </Flex>
    )
}

const MainLayout = ({ children }) => {
    const mainLayoutGridProperties = {
        columns: '240px 1fr',
        rows: '60px 1fr',
        areas: `
            "topbar topbar"
            "sidebar main"
        `,
    }

    return (
        <Grid {...mainLayoutGridProperties} style={{ height: '100vh', width: '100vw' }}>
            <Box gridArea="topbar">
                <TopBar />
            </Box>
            <Box gridArea="sidebar">
                <Sidebar />
            </Box>
            <Box gridArea="main">{children}</Box>
        </Grid>
    )
}

export { MainLayout }
