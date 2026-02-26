// ABOUTME: Main application layout with sidebar and file handling
// ABOUTME: Renders MainLayout shell with navigation sidebar and TabGroupContainer

import { KeymapModule } from '@graffio/keymap'
import { Box, Button, Flex, Separator, Spinner, Text } from '@radix-ui/themes'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { currentStore } from '../store/index.js'
import { KeymapConfig } from '../keymap-config.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { AccountList } from './AccountList.jsx'
import { FileOpenDialog } from './FileOpenDialog.jsx'
import { KeymapDrawer } from './KeymapDrawer.jsx'
import { MainLayout } from './MainLayout.jsx'
import { MainSidebar } from './MainSidebar.jsx'
import { QuickPicker } from './QuickPicker.jsx'
import { ReportsList } from './ReportsList.jsx'
import { TabGroupContainer } from './TabGroupContainer.jsx'

const { ActionRegistry, toAvailableIntents } = KeymapModule
const { DEFAULT_BINDINGS, GROUP_NAMES } = KeymapConfig

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Dismisses banner and opens file picker for new file
    // @sig handleOpenNew :: () -> void
    handleOpenNew: () => {
        post(Action.SetShowReopenBanner(false))
        post(Action.OpenFile())
    },

    // Closes the active tab in the active group — reads state at call time (dispatch-intent)
    // @sig closeActiveTab :: () -> void
    closeActiveTab: () => {
        const tabLayout = S.tabLayout(currentStore().getState())
        const group = tabLayout.tabGroups.get(tabLayout.activeTabGroupId)
        if (!group) return // no groups when no file is open
        const { activeViewId, id } = group
        if (activeViewId) post(Action.CloseView(activeViewId, id))
    },

    // Registers global actions when Open File button mounts — global scope (undefined viewId)
    // @sig registerGlobalActions :: Element? -> void
    registerGlobalActions: element => {
        globalActionsCleanup?.()
        globalActionsCleanup = undefined
        if (!element) return
        globalActionsCleanup = ActionRegistry.register(undefined, [
            { id: 'file:open', description: 'Open File', execute: () => post(Action.OpenFile()) },
            { id: 'tab:close', description: 'Close tab', execute: E.closeActiveTab },
            { id: 'tab:split', description: 'Split', execute: () => post(Action.CreateTabGroup()) },
        ])
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

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
    const setShowBanner = show => post(Action.SetShowReopenBanner(show))
    const reopenFile = () => post(Action.ReopenFile())
    const setDrawer = show => post(Action.SetShowDrawer(show))
    const showReopenBanner = useSelector(S.showReopenBanner)
    const showDrawer = useSelector(S.showDrawer)
    const loadingStatus = useSelector(S.loadingStatus)
    const { title: pageTitle, subtitle: pageSubtitle } = useSelector(S.activeViewPageTitle)
    const activeViewId = useSelector(S.activeViewId)

    const availableIntents = showDrawer ? toAvailableIntents(DEFAULT_BINDINGS, GROUP_NAMES, activeViewId) : []
    const dialogProps = {
        open: showReopenBanner,
        onOpenChange: setShowBanner,
        onReopen: reopenFile,
        onOpenNew: E.handleOpenNew,
    }
    const openFileProps = {
        ref: E.registerGlobalActions,
        variant: 'soft',
        style: OPEN_FILE_BUTTON_STYLE,
        onClick: () => post(Action.OpenFile()),
    }

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
                    <Button {...openFileProps}>Open File</Button>
                </Box>
            </MainLayout.Sidebar>
            <FileOpenDialog {...dialogProps} />
            <QuickPicker />
            <Flex direction="column" style={{ flex: 1 }}>
                <TabGroupContainer />
                <KeymapDrawer open={showDrawer} onOpenChange={setDrawer} intents={availableIntents} />
            </Flex>
            {loadingStatus && <LoadingOverlay status={loadingStatus} />}
        </MainLayout>
    )
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const OPEN_FILE_BUTTON_STYLE = { width: '100%' }

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let globalActionsCleanup

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

export { RootLayout }
