import { style } from '@vanilla-extract/css'

/*
 * NumberPad.css.js - Vanilla Extract styles for NumberPad component
 *
 * This file defines the visual styling for the NumberPad component using
 * Vanilla Extract CSS-in-JS. It provides mobile-optimized styling for the
 * number pad dialog with bottom positioning for thumb-friendly interaction.
 *
 * STYLING APPROACH:
 * - Uses Vanilla Extract for type-safe, build-time CSS generation
 * - Positions dialog at bottom of screen for mobile thumb interaction
 * - Provides consistent styling with design system
 * - Optimizes for one-handed mobile usage
 */

/*
 * Dialog overlay for backdrop
 *
 * @sig dialogOverlay :: StyleRule
 */
const dialogOverlay = style({ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000 })

/*
 * Dialog content positioned and styled
 *
 * @sig dialogContent :: StyleRule
 */
const dialogContent = style({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '236px',
    maxHeight: '80vh',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
    fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, ' +
        '"Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
    zIndex: 10001,
})

/*
 * Dialog title styling
 *
 * @sig dialogTitle :: StyleRule
 */
const dialogTitle = style({
    textAlign: 'center',
    marginBottom: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#374151',
})

/*
 * Hidden dialog description for accessibility
 *
 * @sig dialogDescription :: StyleRule
 */
const dialogDescription = style({ display: 'none' })

/*
 * Input display container with validation styling
 *
 * @sig inputContainer :: StyleRule
 */
const inputContainer = style({
    backgroundColor: 'var(--gray-2)',
    borderRadius: '12px',
    border: '2px solid var(--gray-6)',
    textAlign: 'center',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
})

/*
 * Input container with error state styling
 *
 * @sig inputContainerError :: StyleRule
 */
const inputContainerError = style({ backgroundColor: 'var(--red-2)', border: '2px solid var(--red-6)' })

/*
 * Number button styling for consistent grid layout
 *
 * @sig numberButton :: StyleRule
 */
const numberButton = style({
    aspectRatio: '1',
    fontSize: '20px',
    fontWeight: '600',
    height: '64px',
    width: '64px',
    minWidth: '64px',
    backgroundColor: 'var(--accent-3)',
    border: '1px solid var(--accent-6)',
    borderRadius: 'var(--radius-2)',
    margin: '3px',
    ':hover': { backgroundColor: 'var(--accent-4)', border: '1px solid var(--accent-7)' },
    ':active': { backgroundColor: 'var(--accent-5)' },
})

/*
 * Function button styling (backspace, enter, cancel, clear)
 *
 * @sig functionButton :: StyleRule
 */
const functionButton = style({
    aspectRatio: '1',
    fontSize: '18px',
    fontWeight: '600',
    height: '64px',
    width: '64px',
    minWidth: '64px',
    borderRadius: 'var(--radius-2)',
    border: '1px solid var(--gray-6)',
    margin: '3px',
    ':hover': { backgroundColor: 'var(--gray-3)', border: '1px solid var(--gray-7)' },
    ':active': { backgroundColor: 'var(--gray-4)' },
})

export {
    dialogOverlay,
    dialogContent,
    dialogTitle,
    dialogDescription,
    inputContainer,
    inputContainerError,
    numberButton,
    functionButton,
}
