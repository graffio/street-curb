// ABOUTME: Main application layout with grid structure for topbar, sidebar, and main content
// ABOUTME: Uses compound component pattern (MainLayout.TopBar, MainLayout.Sidebar)

import { Box, Button, Flex, Grid } from '@radix-ui/themes'
import React from 'react'
import { layoutChannel, useChannel } from '../channels/index.js'
import { TitleAndSubtitle } from './TitleAndSubtitle.jsx'

// Renders a single action button in the top bar
// @sig TopBarAction :: { action: { label: String }, index: Number } -> ReactElement
const TopBarAction = ({ action, index }) => (
    <Button key={index} size="2">
        {action.label}
    </Button>
)

// Application header with title, subtitle, and action buttons
// @sig TopBar :: () -> ReactElement
const TopBar = () => {
    let [{ title, subtitle, topBarActions }] = useChannel(layoutChannel, ['title', 'subtitle', 'topBarActions'])
    topBarActions ||= []

    return (
        <Flex height="100%" align="center" px="4" style={{ borderBottom: '1px solid var(--accent-3)' }}>
            <TitleAndSubtitle title={title} subtitle={subtitle} gap="tight" titleSize="lg" subtitleSize="xs" />

            <Flex gap="2" ml="auto">
                {topBarActions.map((action, index) => (
                    <TopBarAction key={index} action={action} index={index} />
                ))}
            </Flex>
        </Flex>
    )
}

// Sidebar slot component - renders children in sidebar area
// @sig Sidebar :: { children: ReactNode } -> ReactElement
const Sidebar = ({ children }) => (
    <Flex direction="column" gap="1" height="100%" style={{ backgroundColor: 'var(--gray-1)' }}>
        {children}
    </Flex>
)

// Grid layout for application with topbar, sidebar, and main content areas
// @sig MainLayout :: { children: ReactNode } -> ReactElement
const MainLayout = ({ children }) => {
    const mainLayoutGridProperties = {
        columns: '320px 1fr',
        rows: '60px 1fr',
        areas: `
            "topbar topbar"
            "sidebar main"
        `,
    }

    const childrenArray = React.Children.toArray(children)
    const topbar = childrenArray.find(child => child.type === TopBar) || <TopBar />
    const sidebar = childrenArray.find(child => child.type === Sidebar)
    const main = childrenArray.filter(child => child.type !== TopBar && child.type !== Sidebar)

    return (
        <Grid {...mainLayoutGridProperties} style={{ height: '100vh', width: '100vw' }}>
            <Box gridArea="topbar">{topbar}</Box>
            <Box gridArea="sidebar">{sidebar}</Box>
            <Flex direction="column" style={{ gridArea: 'main', minHeight: 0 }}>
                {main}
            </Flex>
        </Grid>
    )
}

MainLayout.TopBar = TopBar
MainLayout.Sidebar = Sidebar

export { MainLayout }
