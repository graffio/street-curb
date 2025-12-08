/*
 * Components index.js - Main export for all components in web-app
 *
 * This file provides a centralized export point for all components in the web-app.
 * It follows the design system pattern of having a single export point for all components
 * while keeping individual implementations in separate directories.
 *
 * EXPORT STRUCTURE:
 * - Re-exports all components from their respective directories
 * - Maintains clean import paths for consumers: import { TransactionRegister } from '@components'
 * - Allows for easy discovery of all available components
 * - Provides a stable API boundary for the entire component library
 *
 * COMPONENT ORGANIZATION:
 * - Each component lives in its own directory with implementation and styles
 * - Component directories contain: Component.jsx, Component.css.js, Component.stories.jsx
 * - This index provides the public API for consuming applications
 * - Future components can be added here without breaking existing imports
 *
 * INTEGRATION PATTERNS:
 * - Components use channel-based state management for data flow
 * - Vanilla Extract CSS-in-JS for consistent styling
 * - Storybook integration for documentation and testing
 * - PropTypes for runtime validation in development
 */

export { TransactionRegister } from './TransactionRegister/TransactionRegister'
