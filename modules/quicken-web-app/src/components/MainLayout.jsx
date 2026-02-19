// ABOUTME: Main application layout with grid structure for topbar, sidebar, and main content
// ABOUTME: Uses compound component pattern (MainLayout.TopBar, MainLayout.Sidebar)
// COMPLEXITY: react-redux-separation — React.Children.find/filter for compound component slot detection

import { Box, Button, Flex, Grid } from '@radix-ui/themes'
import React from 'react'
import { TitleAndSubtitle } from './TitleAndSubtitle.jsx'

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Renders a single action button in the top bar
// @sig TopBarAction :: { action: { label: String }, index: Number } -> ReactElement
const TopBarAction = ({ action, index }) => (
    <Button key={index} size="2">
        {action.label}
    </Button>
)

// Application header with title, subtitle, and action buttons
// @sig TopBar :: { title: String, subtitle: String?, actions: [{ label: String }]? } -> ReactElement
const TopBar = ({ title, subtitle, actions = [] }) => (
    <Flex height="100%" align="center" px="4" style={{ borderBottom: '1px solid var(--accent-3)' }}>
        <TitleAndSubtitle title={title} subtitle={subtitle} gap="tight" titleSize="lg" subtitleSize="xs" />

        <Flex gap="2" ml="auto">
            {actions.map((action, index) => (
                <TopBarAction key={index} action={action} index={index} />
            ))}
        </Flex>
    </Flex>
)

// Sidebar slot component - renders children in sidebar area
// @sig Sidebar :: { children: ReactNode } -> ReactElement
const Sidebar = ({ children }) => (
    <Flex direction="column" gap="1" height="100%" style={SIDEBAR_STYLE}>
        {children}
    </Flex>
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const SIDEBAR_STYLE = { backgroundColor: 'var(--gray-1)', minHeight: 0, overflow: 'hidden' }
const GRID_STYLE = { height: '100vh', width: '100vw' }
const GRID_PROPS = {
    columns: '320px 1fr',
    rows: '60px 1fr',
    areas: `
        "topbar topbar"
        "sidebar main"
    `,
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Grid layout for application with topbar, sidebar, and main content areas
// @sig MainLayout :: { title: String, subtitle: String?, actions: [Action]?, children: ReactNode } -> ReactElement
const MainLayout = ({ title, subtitle, actions, children }) => {
    const childrenArray = React.Children.toArray(children)
    const sidebar = childrenArray.find(child => child.type === Sidebar)
    const main = childrenArray.filter(child => child.type !== Sidebar)

    return (
        <Grid {...GRID_PROPS} style={GRID_STYLE}>
            <Box gridArea="topbar">
                <TopBar title={title} subtitle={subtitle} actions={actions} />
            </Box>
            <Box gridArea="sidebar" style={{ overflow: 'hidden' }}>
                {sidebar}
            </Box>
            <Flex direction="column" style={{ gridArea: 'main', minHeight: 0 }}>
                {main}
            </Flex>
        </Grid>
    )
}

MainLayout.Sidebar = Sidebar

export { MainLayout }
