// ABOUTME: TanStack Router configuration with tab-based content area
// ABOUTME: Defines MainLayout shell with sidebar navigation and TabGroupContainer
// COMPLEXITY: Router file contains layout component + route config - cohesion groups don't apply to React components

import { Box, Button, Dialog, Flex, Heading, MainLayout, Separator, Text } from '@graffio/design-system'
import { createRootRoute, createRoute, createRouter, Link, redirect } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { post } from './commands/post.js'
import { AccountList, ReportsList, TabGroupContainer } from './components/index.js'
import { getRaw, setRaw } from './services/storage.js'
import { loadEntitiesFromFile } from './services/sqlite-service.js'
import { Action } from './types/action.js'

const FILE_HANDLE_KEY = 'fileHandle'

// prettier-ignore
const sidebarSections = [
    { title: 'Dashboard', items: [{ label: 'Overview', to: '/dashboard' }] },
]

// ---------------------------------------------------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------------------------------------------------

// COMPLEXITY: TanStack Router requires getParentRoute callback - naming constrained by API
// @sig root :: () -> Route
const root = () => rootRoute

// COMPLEXITY: TanStack Router beforeLoad pattern - naming constrained by API
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

    // @sig loadFileFromHandle :: FileSystemFileHandle -> Promise<void>
    const loadFileFromHandle = async handle => {
        const file = await handle.getFile()
        const entities = await loadEntitiesFromFile(file)
        const { accounts, categories, lotAllocations, lots, prices, securities, splits, tags, transactions } = entities
        post(
            Action.LoadFile(accounts, categories, securities, tags, splits, transactions, lots, lotAllocations, prices),
        )
    }

    // @sig handleOpenFile :: () -> Promise<void>
    const handleOpenFile = async () => {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Financial files', accept: { 'application/*': ['.sqlite', '.qif'] } }],
            })
            setRaw(FILE_HANDLE_KEY, handle)
            await loadFileFromHandle(handle)
        } catch (error) {
            if (error.name !== 'AbortError') console.error('Failed to open file:', error.message)
        }
    }

    // @sig handleReopen :: () -> Promise<void>
    const handleReopen = async () => {
        try {
            const permission = await storedHandle.requestPermission({ mode: 'read' })
            if (permission === 'granted') {
                await loadFileFromHandle(storedHandle)
                setShowReopenBanner(false)
            }
        } catch (error) {
            console.error('Failed to reopen file:', error.message)
            setShowReopenBanner(false)
        }
    }

    // @sig handleOpenNew :: () -> Promise<void>
    const handleOpenNew = async () => {
        setShowReopenBanner(false)
        await handleOpenFile()
    }

    // @sig FileOpenDialog :: () -> ReactElement
    const FileOpenDialog = () => (
        <Dialog.Root open={showReopenBanner} onOpenChange={setShowReopenBanner}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content maxWidth="320px">
                    <Dialog.Title>Open File</Dialog.Title>
                    <Text size="2" style={{ marginBottom: 'var(--space-4)' }}>
                        Would you like to reopen your last file or choose a new one?
                    </Text>
                    <Flex gap="3" justify="end">
                        <Button variant="soft" onClick={handleOpenNew}>
                            Open New...
                        </Button>
                        <Button variant="solid" onClick={handleReopen}>
                            Reopen Last
                        </Button>
                    </Flex>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )

    // @sig hydrateFileHandle :: FileSystemFileHandle? -> void
    const hydrateFileHandle = handle => {
        if (handle) {
            setStoredHandle(handle)
            setShowReopenBanner(true)
        }
    }

    // @sig loadStoredFileHandle :: () -> void
    const loadStoredFileHandle = () => {
        const promise = getRaw(FILE_HANDLE_KEY)
        promise.then(hydrateFileHandle)
    }

    const [storedHandle, setStoredHandle] = useState(null)
    const [showReopenBanner, setShowReopenBanner] = useState(false)

    useEffect(loadStoredFileHandle, [])

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
                    <Button variant="soft" style={{ width: '100%' }} onClick={handleOpenFile}>
                        Open File
                    </Button>
                </Box>
            </MainLayout.Sidebar>
            <FileOpenDialog />
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
