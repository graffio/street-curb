// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer

import { Box, Button, Flex, KeymapDrawer, MainLayout, Separator, Spinner, Text } from '@graffio/design-system'
import { KeymapModule } from '@graffio/keymap'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { FileHandling } from '../services/file-handling.js'
import { KeymapRouting } from '../services/keymap-routing.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { SidebarNav } from './MainSidebar.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

const { ActionRegistry } = KeymapModule

const E = {
    // Registers global toggle-shortcuts action (reads showDrawer from ref for stable identity)
    // @sig toggleShortcutsEffect :: React.Ref -> () -> (() -> void)
    toggleShortcutsEffect: showDrawerRef => () =>
        ActionRegistry.register(null, [
            {
                id: 'toggle-shortcuts',
                description: 'Toggle shortcuts',
                execute: () => post(Action.SetShowDrawer(!showDrawerRef.current)),
            },
        ]),
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
    // EXEMPT: non-serializable - FileSystemFileHandle can't be stored in Redux
    const [storedHandle, setStoredHandle] = useState(null)

    const showReopenBanner = useSelector(S.showReopenBanner)
    const showDrawer = useSelector(S.showDrawer)
    const loadingStatus = useSelector(S.loadingStatus)
    const pageTitle = useSelector(S.UI.pageTitle)
    const pageSubtitle = useSelector(S.UI.pageSubtitle)
    const tabLayout = useSelector(S.tabLayout)
    const activeViewId = useSelector(S.activeViewId)

    // EXEMPT: non-DOM ref — stable closure for ActionRegistry execute callback
    const showDrawerRef = useRef(showDrawer)
    showDrawerRef.current = showDrawer

    const handleOpenFile = useCallback(() => FileHandling.openFile(setStoredHandle), [])
    const handleReopen = useCallback(() => FileHandling.reopenFile(storedHandle), [storedHandle])
    const handleOpenNew = useCallback(() => FileHandling.openNewFile(setStoredHandle), [])
    const handleKeyDown = useCallback(KeymapRouting.handleKeydown(tabLayout), [tabLayout])

    const availableIntents = showDrawer ? KeymapRouting.collectAvailableIntents(activeViewId) : []

    useEffect(() => FileHandling.loadStoredHandle(setStoredHandle), [])
    useEffect(() => FileHandling.loadTestFileIfPresent(), [])
    useEffect(KeymapRouting.keydownEffect(handleKeyDown), [handleKeyDown])
    useEffect(E.toggleShortcutsEffect(showDrawerRef), [])

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
