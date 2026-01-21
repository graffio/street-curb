// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer

import { Box, Button, Flex, KeymapDrawer, MainLayout, Separator, Spinner, Text } from '@graffio/design-system'
import { LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { FileHandling } from '../services/file-handling.js'
import { KeymapRouting } from '../services/keymap-routing.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { SidebarNav } from './MainSidebar.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

const { Intent, Keymap } = KeymapModule

const GLOBAL_KEYMAP_ID = 'global'

const F = {
    // Creates global keymap with shortcuts panel toggle
    // @sig createGlobalKeymap :: Function -> Keymap
    createGlobalKeymap: toggleDrawer => {
        const intents = LookupTable([Intent('Toggle shortcuts', ['?'], toggleDrawer)], Intent, 'description')
        return Keymap(GLOBAL_KEYMAP_ID, 'Global', 0, false, null, intents)
    },
}

const E = {
    // Effect to register/unregister global keymap
    // @sig globalKeymapEffect :: Keymap -> () -> () -> void
    globalKeymapEffect: keymap => () => {
        post(Action.RegisterKeymap(keymap))
        return () => post(Action.UnregisterKeymap(GLOBAL_KEYMAP_ID))
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
    // EXEMPT: file-handling - storedHandle is FileSystemFileHandle (not serializable)
    const [storedHandle, setStoredHandle] = useState(null)

    const showReopenBanner = useSelector(S.showReopenBanner)
    const showDrawer = useSelector(S.showDrawer)
    const loadingStatus = useSelector(S.loadingStatus)
    const pageTitle = useSelector(S.UI.pageTitle)
    const pageSubtitle = useSelector(S.UI.pageSubtitle)
    const registeredKeymaps = useSelector(S.keymaps)
    const tabLayout = useSelector(S.tabLayout)
    const availableIntents = useSelector(S.Keymaps.availableIntents)

    const toggleDrawer = useCallback(() => post(Action.SetShowDrawer(!showDrawer)), [showDrawer])
    const globalKeymap = useMemo(() => F.createGlobalKeymap(toggleDrawer), [toggleDrawer])

    const handleOpenFile = useCallback(() => FileHandling.openFile(setStoredHandle), [])
    const handleReopen = useCallback(() => FileHandling.reopenFile(storedHandle), [storedHandle])
    const handleOpenNew = useCallback(() => FileHandling.openNewFile(setStoredHandle), [])
    const handleKeyDown = useCallback(KeymapRouting.handleKeydown(registeredKeymaps, tabLayout), [
        registeredKeymaps,
        tabLayout,
    ])

    useEffect(() => FileHandling.loadStoredHandle(setStoredHandle), [])
    useEffect(KeymapRouting.keydownEffect(handleKeyDown), [handleKeyDown])
    useEffect(E.globalKeymapEffect(globalKeymap), [globalKeymap])

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
