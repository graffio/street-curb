// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer

import { Box, Button, Flex, KeymapDrawer, MainLayout, Separator } from '@graffio/design-system'
import { LookupTable } from '@graffio/functional'
import { KeymapModule } from '@graffio/keymap'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

const T = {
    // Gets the active view ID from the tab layout
    // @sig toActiveViewId :: TabLayout -> String | null
    toActiveViewId: tabLayout => {
        const activeGroup = tabLayout?.tabGroups?.find(g => g.id === tabLayout.activeTabGroupId)
        return activeGroup?.activeViewId ?? null
    },
}

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

// Main application layout with sidebar, file handling, and keyboard routing
// @sig RootLayout :: () -> ReactElement
const RootLayout = () => {
    const [storedHandle, setStoredHandle] = useState(null)
    const [showReopenBanner, setShowReopenBanner] = useState(false)
    const [showDrawer, setShowDrawer] = useState(false)
    const keymaps = useSelector(S.keymaps)
    const tabLayout = useSelector(S.tabLayout)

    const toggleDrawer = useCallback(() => setShowDrawer(prev => !prev), [])
    const globalKeymap = useMemo(() => F.createGlobalKeymap(toggleDrawer), [toggleDrawer])
    const activeViewId = useMemo(() => T.toActiveViewId(tabLayout), [tabLayout])
    const availableIntents = useMemo(() => Keymap.collectAvailable(keymaps, activeViewId), [keymaps, activeViewId])

    const handleOpenFile = useCallback(() => FileHandling.openFile(setStoredHandle), [])
    const handleReopen = useCallback(() => FileHandling.reopenFile(storedHandle, setShowReopenBanner), [storedHandle])
    const handleOpenNew = useCallback(() => FileHandling.openNewFile(setStoredHandle, setShowReopenBanner), [])
    const handleKeyDown = useCallback(KeymapRouting.handleKeydown(keymaps, tabLayout), [keymaps, tabLayout])

    useEffect(() => FileHandling.loadStoredHandle(setStoredHandle, setShowReopenBanner), [])
    useEffect(KeymapRouting.keydownEffect(handleKeyDown), [handleKeyDown])
    useEffect(E.globalKeymapEffect(globalKeymap), [globalKeymap])

    return (
        <MainLayout>
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
                onOpenChange={setShowReopenBanner}
                onReopen={handleReopen}
                onOpenNew={handleOpenNew}
            />
            <Flex direction="column" style={{ flex: 1 }}>
                <TabGroupContainer />
                <KeymapDrawer open={showDrawer} onOpenChange={setShowDrawer} intents={availableIntents} />
            </Flex>
        </MainLayout>
    )
}

export { RootLayout }
