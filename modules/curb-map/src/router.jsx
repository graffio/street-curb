// ABOUTME: TanStack Router configuration
// ABOUTME: Defines routes with lazy loading and MainLayout shell

import { LoadingSpinner, MainLayout } from '@graffio/design-system'
import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const MapPage = lazy(() => import('./pages/MapPage.jsx'))
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage.jsx'))

const root = () => rootRoute
const redirectToDefaultRoute = () => {
    throw redirect({ to: '/map' })
}

const mainLayout = (
    <MainLayout>
        <Suspense fallback={<LoadingSpinner />}>
            <Outlet />
        </Suspense>
    </MainLayout>
)

const rootRoute = createRootRoute({ component: () => mainLayout })

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/',            beforeLoad: redirectToDefaultRoute, }),
    createRoute({ getParentRoute: root, path: '/map',         component: MapPage }),
    createRoute({ getParentRoute: root, path: '/admin/users', component: AdminUsersPage, })
])

const router = createRouter({ routeTree })

export { router }
