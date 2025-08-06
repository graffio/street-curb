# LLM Loader for F109 – Component Design System Migration

This specification defines the migration of right-of-way-editor components to use the design system with Radix Themes and Vanilla Extract CSS-in-JS.

## Load Order
1. `meta.yaml`: Provides spec metadata and file roles
2. `logic.yaml`: Defines migration requirements, component mappings, and implementation strategy
3. `tests.yaml`: Validation cases to ensure migration success

## Scope
This specification covers migrating CurbTable.jsx components from custom CSS to design system integration, creating reusable Table and Select components for potential promotion to design-system.

## Implementation Approach
- Create "New" versions of components alongside originals for comparison
- Extract generic Table and Select components within right-of-way-editor
- Create Storybook stories comparing original vs migrated components
- Use developer subagent for complex CurbTable migration
- Replace originals once New versions are validated in Storybook
