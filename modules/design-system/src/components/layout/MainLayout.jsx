import { Box, Button, Flex, Grid, Heading, Link } from '@radix-ui/themes'
import React from 'react'
import { layoutChannel, useChannel } from '../../channels/index.js'
import { tokens } from '../../themes/tokens.css.js'
import { TitleAndSubtitle } from '../TitleAndSubtitle/TitleAndSubtitle.jsx'

const { borderRadius, colors, layout, space } = tokens

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
        <Flex height="100%" align="center" p={`0 ${space.md}`} style={{ borderBottom: `1px solid ${colors.accent}` }}>
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

// Reusable design system tokens for interactive elements
const interactiveElement = {
    padding: `${space.sm} ${space.md}`,
    borderRadius: borderRadius.sm,
    transition: 'background-color 0.2s ease',
}

const renderSidebarItem = (item, i) => (
    <Button key={i} variant="soft" size="2" asChild style={{ justifyContent: 'flex-start', ...interactiveElement }}>
        <Link href={item.href} underline="none" weight="medium">
            {item.label}
        </Link>
    </Button>
)

const renderSidebarSection = (sectionData, i) => (
    <Box key={i} style={{ marginBottom: space.lg }}>
        <Heading as="h3" size="3" ml={space.md} mt={space.md} color="plum">
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
        <Flex direction="column" gap={space.xs} height="100%" style={{ backgroundColor: 'var(--gray-1)' }}>
            {sidebarItems.map(renderSidebarSection)}
        </Flex>
    )
}

const MainLayout = ({ children }) => {
    const mainLayoutGridProperties = {
        columns: `${layout.sidebarWidth} 1fr`,
        rows: `${layout.topBarHeight} 1fr`,
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
