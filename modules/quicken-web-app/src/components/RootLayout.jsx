// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer

import { Box, Button, MainLayout, Separator } from '@graffio/design-system'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FileHandling } from '../services/file-handling.js'
import { KeymapRouting } from '../services/keymap-routing.js'
import * as S from '../store/selectors/index.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { SidebarNav } from './MainSidebar.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

// Main application layout with sidebar, file handling, and keyboard routing
// @sig RootLayout :: () -> ReactElement
const RootLayout = () => {
    const [storedHandle, setStoredHandle] = useState(null)
    const [showReopenBanner, setShowReopenBanner] = useState(false)
    const keymaps = useSelector(S.keymaps)
    const tabLayout = useSelector(S.tabLayout)

    const handleOpenFile = useCallback(() => FileHandling.openFile(setStoredHandle), [])
    const handleReopen = useCallback(() => FileHandling.reopenFile(storedHandle, setShowReopenBanner), [storedHandle])
    const handleOpenNew = useCallback(() => FileHandling.openNewFile(setStoredHandle, setShowReopenBanner), [])
    const handleKeyDown = useCallback(KeymapRouting.handleKeydown(keymaps, tabLayout), [keymaps, tabLayout])

    useEffect(() => FileHandling.loadStoredHandle(setStoredHandle, setShowReopenBanner), [])
    useEffect(KeymapRouting.keydownEffect(handleKeyDown), [handleKeyDown])

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
            <TabGroupContainer />
        </MainLayout>
    )
}

export { RootLayout }
