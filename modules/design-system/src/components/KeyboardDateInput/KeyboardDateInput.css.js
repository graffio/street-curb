import { tokens } from '../../themes/tokens.css.js'
import { keyframes, style } from '@vanilla-extract/css'

/*
 * Keyframe animations for smooth transitions
 */
const fadeIn = keyframes({
    from: { opacity: 0, transform: 'translateY(-2px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
})

const highlightPulse = keyframes({
    '0%': { backgroundColor: tokens.colors.primary },
    '50%': { backgroundColor: 'var(--accent-10)' },
    '100%': { backgroundColor: tokens.colors.primary },
})

/*
 * Hidden input for capturing keyboard events
 */
const hiddenInput = style({ opacity: 0, position: 'absolute', left: '-9999px', width: '1px', height: '1px' })

/*
 * Keyboard mode container
 */
const keyboardContainer = style({ position: 'relative', display: 'inline-block' })

/*
 * Main keyboard date display
 */
const keyboardDisplay = style({
    display: 'flex',
    alignItems: 'center',
    padding: tokens.space.sm,
    border: `2px solid ${tokens.colors.primary}`,
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.typography.size.md,
    fontFamily: 'var(--font-mono)',
    backgroundColor: tokens.colors.accent,
    cursor: 'text',
    minWidth: '140px',
    animation: `${fadeIn} 0.2s ease-out`,
    transition: 'all 0.2s ease',
})

/*
 * Individual date part (month/day/year)
 */
const datePart = style({
    padding: '2px 4px',
    borderRadius: tokens.borderRadius.sm,
    textAlign: 'center',
    transition: 'all 0.2s ease',
    minWidth: '24px',

    selectors: {
        '&[data-active="true"]': {
            backgroundColor: tokens.colors.primary,
            color: tokens.colors.background,
            fontWeight: tokens.typography.weight.medium,
            animation: `${highlightPulse} 2s ease-in-out infinite`,
        },
    },
})

/*
 * Year part has wider minimum width
 */
const yearPart = style([datePart, { minWidth: '40px' }])

/*
 * Date separator (/)
 */
const separator = style({ color: tokens.colors.text, fontWeight: tokens.typography.weight.medium, margin: '0 2px' })

/*
 * Help text below the keyboard input
 */
const helpText = style({
    marginTop: tokens.space.xs,
    fontSize: tokens.typography.size.xs,
    color: tokens.colors.muted,
    textAlign: 'center',
    lineHeight: 1.3,
    maxWidth: '280px',
})

/*
 * Typing buffer indicator
 */
const typingIndicator = style({ color: tokens.colors.primary, fontWeight: tokens.typography.weight.medium })

/*
 * Keyboard shortcut highlighting
 */
const keyHighlight = style({
    color: tokens.colors.primary,
    fontWeight: tokens.typography.weight.bold,
    backgroundColor: 'var(--accent-3)',
    padding: '1px 3px',
    borderRadius: '2px',
    fontSize: '0.9em',
})

/*
 * Regular input field (non-keyboard mode)
 */
const regularInput = style({
    // Base styles will be handled by Radix TextField
    // This allows for any custom overrides if needed
})

/*
 * Focus styles for keyboard mode
 */
const focusRing = style({
    selectors: {
        '&:focus-within': { boxShadow: `0 0 0 2px ${tokens.colors.accent}`, borderColor: tokens.colors.primary },
    },
})

/*
 * Responsive adjustments
 */
const responsiveContainer = style({
    '@media': { 'screen and (max-width: 480px)': { fontSize: tokens.typography.size.sm } },
})

export {
    datePart,
    focusRing,
    helpText,
    hiddenInput,
    keyHighlight,
    keyboardContainer,
    keyboardDisplay,
    regularInput,
    responsiveContainer,
    separator,
    typingIndicator,
    yearPart,
}
