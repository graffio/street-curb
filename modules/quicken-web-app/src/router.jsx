// ABOUTME: TanStack Router configuration
// ABOUTME: Defines routes with lazy loading and MainLayout shell

import {
    Box,
    Button,
    FilePickerButton,
    Flex,
    Heading,
    LoadingSpinner,
    MainLayout,
    Separator,
} from '@graffio/design-system'
import { createRootRoute, createRoute, createRouter, Link, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { post } from './commands/post.js'
import { loadEntitiesFromFile } from './services/sqlite-service.js'
import { Action } from './types/action.js'

// ---------------------------------------------------------------------------------------------------------------------
// Sidebar rendering
// ---------------------------------------------------------------------------------------------------------------------

const renderSidebarItem = item => (
    <Button key={item.label} ml="3" mb="3" mr="3" variant="ghost" asChild style={{ justifyContent: 'flex-start' }}>
        <Link to={item.to} activeProps={{ style: { backgroundColor: 'var(--accent-3)' } }}>
            {item.label}
        </Link>
    </Button>
)

const renderSidebarSection = sectionData => (
    <Box key={sectionData.title} mb="4">
        <Heading as="h3" size="3" m="3" style={{ fontWeight: 'lighter' }}>
            {sectionData.title}
        </Heading>
        <Flex direction="column">{sectionData.items.map(renderSidebarItem)}</Flex>
    </Box>
)

// prettier-ignore
const sidebarSections = [
    { title: 'Dashboard', items: [{ label: 'Overview', to: '/dashboard' }] },
    { title: 'Transactions', items: [{ label: 'Checking', to: '/transactions/checking' }] },
]

/*
 * Handle file selection from the file picker
 * Loads SQLite file and dispatches LoadFile action with all entities
 */
const handleFileSelect = async file => {
    try {
        const { accounts, categories, securities, tags, splits, transactions } = await loadEntitiesFromFile(file)
        post(Action.LoadFile(accounts, categories, securities, tags, splits, transactions))
    } catch (error) {
        // TODO: Show error in UI instead of console
        console.error('Failed to load file:', error.message)
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Lazy / suspense
// ---------------------------------------------------------------------------------------------------------------------
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const CheckingPage = lazy(() => import('./pages/TransactionRegisterPage.jsx'))

// ---------------------------------------------------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------------------------------------------------

const root = () => rootRoute
const redirectToDefaultRoute = () => {
    throw redirect({ to: '/dashboard' })
}

const rootRoute = createRootRoute({
    component: () => (
        <MainLayout>
            <MainLayout.Sidebar>
                {sidebarSections.map(renderSidebarSection)}
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
            <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
            </Suspense>
        </MainLayout>
    ),
})

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/', beforeLoad: redirectToDefaultRoute }),
    createRoute({ getParentRoute: root, path: '/dashboard', component: DashboardPage }),
    createRoute({ getParentRoute: root, path: '/transactions/checking', component: CheckingPage })
])

const router = createRouter({ routeTree })

export { router }
