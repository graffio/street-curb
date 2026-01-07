// ABOUTME: TanStack Router configuration
// ABOUTME: Defines route tree with RootLayout as the root component

import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/index.js'

// COMPLEXITY: TanStack Router requires getParentRoute callback - naming constrained by API
// @sig root :: () -> Route
const root = () => rootRoute

// COMPLEXITY: TanStack Router beforeLoad pattern - naming constrained by API
// @sig redirectToDefaultRoute :: () -> never
const redirectToDefaultRoute = () => {
    throw redirect({ to: '/dashboard' })
}

const rootRoute = createRootRoute({ component: RootLayout })

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/', beforeLoad: redirectToDefaultRoute }),
    createRoute({ getParentRoute: root, path: '/dashboard' }),
])

const router = createRouter({ routeTree })

export { router }
