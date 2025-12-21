// ABOUTME: TanStack Router configuration with tab-based content area
// ABOUTME: Defines MainLayout shell with sidebar navigation and TabGroupContainer

import { Box, Button, FilePickerButton, Flex, Heading, MainLayout, Separator } from '@graffio/design-system'
import { createRootRoute, createRoute, createRouter, Link, redirect } from '@tanstack/react-router'
import React from 'react'
import { post } from './commands/post.js'
import { AccountList, ReportsList, TabGroupContainer } from './components/index.js'
import { loadEntitiesFromFile } from './services/sqlite-service.js'
import { Action } from './types/action.js'

// prettier-ignore
const sidebarSections = [
    { title: 'Dashboard', items: [{ label: 'Overview', to: '/dashboard' }] },
]

// ---------------------------------------------------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------------------------------------------------

// @sig root :: () -> Route
const root = () => rootRoute

// @sig redirectToDefaultRoute :: () -> never
const redirectToDefaultRoute = () => {
    throw redirect({ to: '/dashboard' })
}

// @sig RootLayout :: () -> ReactElement
const RootLayout = () => {
    // @sig renderSidebarItem :: Object -> ReactElement
    const renderSidebarItem = ({ label, to }) => (
        <Button key={label} ml="3" mb="3" mr="3" variant="ghost" asChild style={{ justifyContent: 'flex-start' }}>
            <Link to={to} activeProps={{ style: { backgroundColor: 'var(--accent-3)' } }}>
                {label}
            </Link>
        </Button>
    )

    // @sig renderSidebarSection :: Object -> ReactElement
    const renderSidebarSection = ({ title, items }) => (
        <Box key={title} mb="4">
            <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
                {title}
            </Heading>
            <Flex direction="column">{items.map(renderSidebarItem)}</Flex>
        </Box>
    )

    // @sig handleFileSelect :: File -> Promise<void>
    const handleFileSelect = async file => {
        try {
            const { accounts, categories, securities, tags, splits, transactions } = await loadEntitiesFromFile(file)
            post(Action.LoadFile(accounts, categories, securities, tags, splits, transactions))
        } catch (error) {
            // TODO: Show error in UI instead of console
            console.error('Failed to load file:', error.message)
        }
    }

    return (
        <MainLayout>
            <MainLayout.Sidebar>
                {sidebarSections.map(renderSidebarSection)}
                <Separator size="4" my="3" />
                <AccountList />
                <Separator size="4" my="3" />
                <ReportsList />
                <Separator size="4" my="3" />
                <Box mx="3">
                    <FilePickerButton
                        accept=".sqlite,.qif"
                        onFileSelect={handleFileSelect}
                        variant="soft"
                        style={{ width: '100%' }}
                    >
                        Open File
                    </FilePickerButton>
                </Box>
            </MainLayout.Sidebar>
            <TabGroupContainer />
        </MainLayout>
    )
}

const rootRoute = createRootRoute({ component: RootLayout })

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/', beforeLoad: redirectToDefaultRoute }),
    createRoute({ getParentRoute: root, path: '/dashboard' }),
])

const router = createRouter({ routeTree })

export { router }
