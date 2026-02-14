// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer
// COMPLEXITY: react-redux-separation — 3 useEffect for mount-time init and keyboard routing lifecycle

import { Box, Button, Flex, Separator, Spinner, Text } from '@radix-ui/themes'
import { KeymapDrawer } from './KeymapDrawer.jsx'
import { MainLayout } from './MainLayout.jsx'
import { KeymapModule } from '@graffio/keymap'
import { KeymapConfig } from '../keymap-config.js'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { currentStore } from '../store/index.js'
import { Action } from '../types/action.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { MainSidebar } from './MainSidebar.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

const { ActionRegistry, handleKeydown, toAvailableIntents } = KeymapModule
const { DEFAULT_BINDINGS, GROUP_NAMES } = KeymapConfig
const keydownHandler = handleKeydown(DEFAULT_BINDINGS)

const E = {
    // Dismisses banner and opens file picker for new file
    // @sig handleOpenNew :: () -> void
    handleOpenNew: () => {
        post(Action.SetShowReopenBanner(false))
        post(Action.OpenFile())
    },

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

    // Keydown handler parameterized by app bindings, reads tabLayout at call time
    // @sig keydownEffect :: () -> () -> void
    keydownEffect: () => {
        const handler = e => keydownHandler(S.tabLayout(currentStore().getState()), e)
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
    const { handleOpenNew, keydownEffect, toggleShortcutsEffect } = E
    const showReopenBanner = useSelector(S.showReopenBanner)
    const showDrawer = useSelector(S.showDrawer)
    const loadingStatus = useSelector(S.loadingStatus)
    const { title: pageTitle, subtitle: pageSubtitle } = useSelector(S.activeViewPageTitle)
    const activeViewId = useSelector(S.activeViewId)

    const availableIntents = showDrawer ? toAvailableIntents(DEFAULT_BINDINGS, GROUP_NAMES, activeViewId) : []

    useEffect(() => post(Action.InitializeSystem()), [])
    useEffect(keydownEffect, [])
    useEffect(toggleShortcutsEffect, [])

    return (
        <MainLayout title={pageTitle} subtitle={pageSubtitle}>
            <MainLayout.Sidebar>
                <MainSidebar />
                <Separator size="4" my="3" />
                <AccountList />
                <Separator size="4" my="3" />
                <ReportsList />
                <Separator size="4" my="3" />
                <Box mx="3">
                    <Button variant="soft" style={{ width: '100%' }} onClick={() => post(Action.OpenFile())}>
                        Open File
                    </Button>
                </Box>
            </MainLayout.Sidebar>
            <FileOpenDialog
                open={showReopenBanner}
                onOpenChange={show => post(Action.SetShowReopenBanner(show))}
                onReopen={() => post(Action.ReopenFile())}
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
