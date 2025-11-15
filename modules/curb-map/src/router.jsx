// ABOUTME: TanStack Router configuration
// ABOUTME: Defines routes with lazy loading and MainLayout shell

import { Box, Button, Flex, Heading, LoadingSpinner, MainLayout } from '@graffio/design-system'
import { createRootRoute, createRoute, createRouter, Link, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

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
    { title: 'Navigation', items: [{ label: 'Map',        to: '/map' }], },
    { title: 'Admin',      items: [
        { label: 'User Admin', to: '/admin/users' },
        { label: 'Foo', to: '/admin/users2' }
    ]},
]

// ---------------------------------------------------------------------------------------------------------------------
// Lazy / suspense
// ---------------------------------------------------------------------------------------------------------------------
const MapPage = lazy(() => import('./pages/MapPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage.jsx'))

// ---------------------------------------------------------------------------------------------------------------------
// Main Router
// ---------------------------------------------------------------------------------------------------------------------

const root = () => rootRoute
const redirectToDefaultRoute = () => {
    throw redirect({ to: '/map' })
}

const rootRoute = createRootRoute({
    component: () => (
        <MainLayout>
            <MainLayout.Sidebar>{sidebarSections.map(renderSidebarSection)}</MainLayout.Sidebar>
            <Suspense fallback={<LoadingSpinner />}>
                <Outlet />
            </Suspense>
        </MainLayout>
    ),
})

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/',            beforeLoad: redirectToDefaultRoute, }),
    createRoute({ getParentRoute: root, path: '/map',         component: MapPage }),
    createRoute({ getParentRoute: root, path: '/admin/users', component: AdminUsersPage, })
])

const router = createRouter({ routeTree })

export { router }
