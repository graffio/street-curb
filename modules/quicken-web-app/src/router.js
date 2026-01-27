// ABOUTME: TanStack Router configuration
// ABOUTME: Defines route tree with RootLayout as the root component

import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/index.js'

// COMPLEXITY: TanStack Router requires getParentRoute callback - naming constrained by API
// @sig root :: () -> Route
const root = () => rootRoute

// COMPLEXITY: TanStack Router beforeLoad pattern - naming constrained by API
// @sig redirectToDefaultRoute :: Object -> never
const redirectToDefaultRoute = ({ location }) => {
    throw redirect({ to: '/dashboard', search: location.search })
}

const rootRoute = createRootRoute({ component: RootLayout })

// prettier-ignore
const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: root, path: '/', beforeLoad: redirectToDefaultRoute }),
    createRoute({ getParentRoute: root, path: '/dashboard' }),
])

const router = createRouter({ routeTree })

const Router = { router }
export { Router }
