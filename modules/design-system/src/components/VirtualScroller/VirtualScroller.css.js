/*
 * VirtualScroller.css.js - Vanilla Extract styles for VirtualScroller component
 *
 * This file defines the visual styling for the VirtualScroller component using
 * Vanilla Extract CSS-in-JS. It provides optimized styles for virtual scrolling
 * performance and visual consistency.
 *
 * STYLING APPROACH:
 * - Uses Vanilla Extract for type-safe, build-time CSS generation
 * - Optimizes for scrolling performance with GPU acceleration hints
 * - Provides zebra striping for better row visibility
 * - Includes accessibility and focus management styles
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - willChange: 'transform' for smooth scrolling animations
 * - backfaceVisibility: 'hidden' for better rendering performance
 * - Absolute positioning for virtual row placement
 * - GPU-accelerated transforms for positioning
 *
 * VISUAL DESIGN:
 * - Zebra striping with alternating row backgrounds
 * - Subtle borders for row separation
 * - Clean, minimal styling that works in various contexts
 * - Focus management for keyboard accessibility
 */
import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

/*
 * Root container style
 *
 * @sig root :: StyleRule
 */
const root = style({ fontFamily: 'sans-serif' })

/*
 * Scrollable container style with keyboard focus support
 *
 * @sig scrollContainer :: StyleRule
 */
const scrollContainer = style({ height: '100%', overflow: 'auto', outline: 'none' })

/*
 * Virtual content container for absolute positioning
 *
 * @sig virtualContainer :: StyleRule
 */
const virtualContainer = style({ width: '100%', position: 'relative' })

/*
 * Virtual row base style with performance optimizations
 *
 * @sig virtualRowBase :: StyleRule
 */
const virtualRowBase = style({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
})

/*
 * Even row style (zebra striping)
 *
 * @sig virtualRowEven :: StyleRule
 */
const virtualRowEven = style({ background: `rgba(from ${tokens.colors.accent} r g b / 0.3)` })

/*
 * Odd row style (zebra striping)
 *
 * @sig virtualRowOdd :: StyleRule
 */
const virtualRowOdd = style({ background: tokens.colors.background })

export { root, scrollContainer, virtualContainer, virtualRowBase, virtualRowEven, virtualRowOdd }
