// ABOUTME: TanStack Router configuration
// ABOUTME: Defines route tree with RootLayout as the root component
// COMPLEXITY: function-naming — root and redirectToDefaultRoute are TanStack Router API callbacks
// COMPLEXITY: cohesion-structure — TanStack Router API callbacks don't fit P/T/F/V/A/E
// COMPLEXITY: export-structure — Single-property namespace wraps TanStack router instance for import consistency

import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import { RootLayout } from './components/index.js'

// Returns root route for getParentRoute callback
// @sig root :: () -> Route
const root = () => rootRoute

// Redirects root path to /dashboard
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const Router = { router }
export { Router }
