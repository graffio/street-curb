import { Box, Button, Flex, Grid } from '@radix-ui/themes'
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

/**
 * Sidebar slot component - renders children in sidebar area
 */
const Sidebar = ({ children }) => (
    <Flex direction="column" gap="1" height="100%" style={{ backgroundColor: 'var(--gray-1)' }}>
        {children}
    </Flex>
)

/**
 * MainLayout provides grid structure for application layout
 * Use as compound component with MainLayout.TopBar and MainLayout.Sidebar
 */
const MainLayout = ({ children }) => {
    const mainLayoutGridProperties = {
        columns: '240px 1fr',
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
            <Box gridArea="main">{main}</Box>
        </Grid>
    )
}

MainLayout.TopBar = TopBar
MainLayout.Sidebar = Sidebar

export { MainLayout }
