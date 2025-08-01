import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { tokens } from '../../themes/tokens.css.js'

/*
 * VirtualTable.css.js - Vanilla Extract styles for VirtualTable components
 *
 * This file defines the visual styling for all VirtualTable compound components using
 * Vanilla Extract CSS-in-JS. It provides both base styles and recipe variants for
 * dynamic styling based on props.
 *
 * STYLING APPROACH:
 * - Uses Vanilla Extract for type-safe, build-time CSS generation
 * - Provides base styles for consistent component appearance
 * - Uses recipe patterns for variant-based styling (text alignment)
 * - Follows design system tokens for colors, spacing, and typography
 *
 * COMPONENT STYLES:
 * - root: Base container styling
 * - header: Fixed header with background and typography
 * - headerCell: Recipe with text alignment variants
 * - row: Flex container for table rows
 * - cell: Recipe with text alignment and overflow handling
 *
 * DESIGN TOKENS:
 * - Colors from Tailwind-inspired palette (gray scale)
 * - Consistent spacing (8px, 12px) for padding and gaps
 * - Typography scale (0.875rem for body text)
 * - Responsive flex layouts with proper overflow handling
 */

/*
 * Root container style
 *
 * @sig root :: StyleRule
 */
const root = style({ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' })

/*
 * Header container style
 *
 * @sig header :: StyleRule
 */
const header = style({
    display: 'flex',
    alignItems: 'center',
    padding: `${tokens.space.sm} ${tokens.space.md}`,
    backgroundColor: tokens.colors.accent,
    fontWeight: tokens.typography.weight.bold,
    fontSize: tokens.typography.size.sm,
    color: tokens.colors.text,
    gap: tokens.space.sm,
    flex: 'none',
})

/*
 * Header cell style recipe with text alignment variants
 *
 * @sig headerCell :: Recipe
 */
const headerCell = recipe({
    base: { flexShrink: 0 },
    variants: {
        textAlign: { left: { textAlign: 'left' }, center: { textAlign: 'center' }, right: { textAlign: 'right' } },
    },
    defaultVariants: { textAlign: 'left' },
})

/*
 * Row container style
 *
 * @sig row :: StyleRule
 */
const row = style({
    display: 'flex',
    alignItems: 'center',
    padding: `${tokens.space.sm} ${tokens.space.md}`,
    gap: tokens.space.sm,
})

/*
 * Cell style recipe with text alignment variants
 *
 * @sig cell :: Recipe
 */
const cell = recipe({
    base: {
        fontSize: tokens.typography.size.sm,
        color: tokens.colors.muted,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flexShrink: 0,
    },
    variants: {
        textAlign: { left: { textAlign: 'left' }, center: { textAlign: 'center' }, right: { textAlign: 'right' } },
    },
    defaultVariants: { textAlign: 'left' },
})

/*
 * Body container style
 *
 * @sig body :: StyleRule
 */
const body = style({ flex: 1, minHeight: 0 })

export { root, header, headerCell, row, cell, body }
