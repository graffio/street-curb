// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer
// COMPLEXITY: react-redux-separation — 4 useEffect for mount-time init and keyboard routing lifecycle

import { Box, Button, Flex, KeymapDrawer, MainLayout, Separator, Spinner, Text } from '@graffio/design-system'
import { KeymapModule } from '@graffio/keymap'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { FileHandling } from '../services/file-handling.js'
import { KeymapRouting } from '../services/keymap-routing.js'
import * as S from '../store/selectors.js'
import { currentStore } from '../store/index.js'
import { Action } from '../types/action.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { SidebarNav } from './MainSidebar.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

const { ActionRegistry } = KeymapModule

// Module-level state — FileSystemFileHandle is non-serializable (can't go in Redux)
let storedHandle = null

const E = {
    // Stores a FileSystemFileHandle in module-level state
    // @sig setStoredHandle :: FileSystemFileHandle? -> void
    setStoredHandle: handle => (storedHandle = handle),

    // Opens file picker and loads selected file
    // @sig handleOpenFile :: () -> void
    handleOpenFile: () => FileHandling.openFile(E.setStoredHandle),

    // Reopens previously stored file handle
    // @sig handleReopen :: () -> void
    handleReopen: () => FileHandling.reopenFile(storedHandle),

    // Dismisses banner and opens file picker for new file
    // @sig handleOpenNew :: () -> void
    handleOpenNew: () => FileHandling.openNewFile(E.setStoredHandle),

    // Registers global toggle-shortcuts action (reads showDrawer from store at call time)
    // @sig toggleShortcutsEffect :: () -> () -> void
    toggleShortcutsEffect: () =>
        ActionRegistry.register(null, [
            {
                id: 'toggle-shortcuts',
                description: 'Toggle shortcuts',
                execute: () => post(Action.SetShowDrawer(!S.showDrawer(currentStore().getState()))),
            },
        ]),

    // Keydown handler that reads tabLayout from store at call time
    // @sig keydownEffect :: () -> () -> void
    keydownEffect: () => {
        const handler = e => KeymapRouting.handleKeydown(S.tabLayout(currentStore().getState()))(e)
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    },
}

const LOADING_OVERLAY_STYLE = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--color-background)',
    opacity: 0.9,
    zIndex: 1000,
}

// Loading overlay shown while file is being loaded
// @sig LoadingOverlay :: { status: String } -> ReactElement
const LoadingOverlay = ({ status }) => (
    <Flex style={LOADING_OVERLAY_STYLE} direction="column" align="center" justify="center" gap="3">
        <Spinner size="3" />
        <Text size="3" color="gray">
            {status}
        </Text>
    </Flex>
)

// Main application layout with sidebar, file handling, and keyboard routing
// @sig RootLayout :: () -> ReactElement
const RootLayout = () => {
    const { handleOpenFile, handleReopen, handleOpenNew, setStoredHandle, keydownEffect, toggleShortcutsEffect } = E

    const showReopenBanner = useSelector(S.showReopenBanner)
    const showDrawer = useSelector(S.showDrawer)
    const loadingStatus = useSelector(S.loadingStatus)
    const pageTitle = useSelector(S.UI.pageTitle)
    const pageSubtitle = useSelector(S.UI.pageSubtitle)
    const activeViewId = useSelector(S.activeViewId)

    const availableIntents = showDrawer ? KeymapRouting.toAvailableIntents(activeViewId) : []

    useEffect(() => FileHandling.loadStoredHandle(setStoredHandle), [])
    useEffect(() => FileHandling.loadTestFileIfPresent(), [])
    useEffect(keydownEffect, [])
    useEffect(toggleShortcutsEffect, [])

    return (
        <MainLayout title={pageTitle} subtitle={pageSubtitle}>
            <MainLayout.Sidebar>
                <SidebarNav />
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
            <FileOpenDialog
                open={showReopenBanner}
                onOpenChange={show => post(Action.SetShowReopenBanner(show))}
                onReopen={handleReopen}
                onOpenNew={handleOpenNew}
            />
            <Flex direction="column" style={{ flex: 1 }}>
                <TabGroupContainer />
                <KeymapDrawer
                    open={showDrawer}
                    onOpenChange={show => post(Action.SetShowDrawer(show))}
                    intents={availableIntents}
                />
            </Flex>
            {loadingStatus && <LoadingOverlay status={loadingStatus} />}
        </MainLayout>
    )
}

export { RootLayout }
