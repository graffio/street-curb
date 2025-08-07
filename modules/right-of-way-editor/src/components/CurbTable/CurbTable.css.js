import { style } from '@vanilla-extract/css'
import { recipe } from '@vanilla-extract/recipes'
import { tokens } from '@qt/design-system'

/**
 * Vanilla Extract styles for CurbTable component
 * Replaces CSS classes from index.css with design system tokens
 */

const container = style({
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'transparent',
    fontSize: tokens.typography.size.sm,
    userSelect: 'none',
    padding: tokens.space.md,
    boxSizing: 'border-box',

    '@media': { 'screen and (max-width: 480px)': { fontSize: tokens.typography.size.xs } },
})

const header = style({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.space.sm,
    paddingBottom: tokens.space.xs,
    borderBottom: `1px solid ${tokens.colors.border}`,
    flexWrap: 'wrap',
    gap: tokens.space.xs,
})

const headerTitle = style({
    margin: 0,
    fontSize: tokens.typography.size.lg,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.text,
    flexShrink: 0,

    '@media': {
        'screen and (max-width: 480px)': { fontSize: tokens.typography.size.md },
        'screen and (max-width: 375px)': { fontSize: tokens.typography.size.sm },
    },
})

const blockfaceInfo = style({
    fontSize: tokens.typography.size.sm,
    color: tokens.colors.muted,
    fontWeight: tokens.typography.weight.normal,
    flexShrink: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',

    '@media': { 'screen and (max-width: 480px)': { fontSize: tokens.typography.size.xs } },
})

const wrapper = style({
    position: 'relative',
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    overflow: 'auto',
    background: tokens.colors.surface,
    maxWidth: '100%',

    '@media': {
        '(prefers-color-scheme: dark)': { background: 'var(--color-panel-solid)', borderColor: 'var(--gray-6)' },
    },
})

// Type cell styling
const typeCell = style({
    position: 'relative',
    width: 'auto', // Take remaining space
    minWidth: '100px',
    padding: '4px',
})

const typeContainer = style({ position: 'relative', display: 'inline-block', width: '100%' })

// Length and Start cell styling
const lengthCell = style({
    fontWeight: tokens.typography.weight.normal,
    color: tokens.colors.text,
    textAlign: 'right',
    width: '80px', // Fixed width to fit content
    minWidth: '75px',
    fontSize: tokens.typography.size.sm,
    cursor: 'pointer',
    transition: 'background-color 0.1s ease',

    ':hover': { backgroundColor: 'rgba(0, 123, 255, 0.1)' },

    '@media': { 'screen and (max-width: 480px)': { fontSize: tokens.typography.size.xs } },
})

const startCell = style({
    fontWeight: tokens.typography.weight.normal,
    color: tokens.colors.text,
    textAlign: 'right',
    width: '80px', // Fixed width to fit content
    minWidth: '75px',
    fontSize: tokens.typography.size.sm,

    '@media': { 'screen and (max-width: 480px)': { fontSize: tokens.typography.size.xs, minWidth: '65px' } },
})

// Add button cell styling
const addCell = style({
    width: '1px', // Force minimum width
    minWidth: '1px',
    maxWidth: '48px', // 32px button + 16px padding
    textAlign: 'center',
    padding: '8px',
    whiteSpace: 'nowrap',
})

const addButton = recipe({
    base: {
        width: '32px',
        height: '32px',
        border: `1px solid ${tokens.colors.border}`,
        backgroundColor: tokens.colors.surface,
        color: tokens.colors.muted,
        borderRadius: tokens.borderRadius.sm,
        fontSize: tokens.typography.size.lg,
        fontWeight: tokens.typography.weight.semibold,
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        ':hover': { backgroundColor: 'var(--gray-2)', color: tokens.colors.text, transform: 'translateY(-1px)' },

        ':active': { transform: 'translateY(0)' },

        ':disabled': { borderColor: 'var(--gray-4)', color: 'var(--gray-6)', cursor: 'not-allowed', opacity: 0.5 },

        ':disabled:hover': { backgroundColor: tokens.colors.surface, color: 'var(--gray-6)', transform: 'none' },

        '@media': {
            'screen and (max-width: 480px)': { width: '28px', height: '28px', fontSize: tokens.typography.size.md },
            'screen and (max-width: 375px)': { width: '26px', height: '26px', fontSize: tokens.typography.size.sm },
            '(prefers-color-scheme: dark)': {
                backgroundColor: 'var(--gray-3)',
                borderColor: 'var(--gray-6)',
                color: 'var(--gray-11)',
                ':hover': { backgroundColor: 'var(--gray-4)', color: 'var(--gray-12)' },
                ':disabled': { backgroundColor: 'var(--gray-2)', borderColor: 'var(--gray-5)', color: 'var(--gray-8)' },
            },
        },
    },
})

// Empty state styling
const emptyStateRow = style({
    // Empty state row styling
})

const emptyStateCell = style({
    // Empty state cell styling
})

const emptyStateMessage = style({
    textAlign: 'center',
    color: tokens.colors.muted,
    fontStyle: 'italic',
    padding: tokens.space.lg,
})

// Table row styling for selection
const tableRow = style({
    borderBottom: `1px solid var(--gray-4)`,
    transition: 'background-color 0.1s ease',

    ':hover': { backgroundColor: 'var(--gray-2)' },

    ':last-child': { borderBottom: 'none' },

    '@media': {
        '(prefers-color-scheme: dark)': {
            borderBottomColor: 'var(--gray-6)',
            ':hover': { backgroundColor: 'var(--gray-3)' },
        },
    },
})

const selectedRow = style({
    backgroundColor: 'var(--accent-3)',
    borderLeft: `3px solid var(--accent-9)`,

    ':hover': { backgroundColor: 'var(--accent-4)' },

    '@media': {
        '(prefers-color-scheme: dark)': {
            backgroundColor: 'var(--accent-3)',
            borderLeftColor: 'var(--accent-9)',
            ':hover': { backgroundColor: 'var(--accent-4)' },
        },
    },
})

// Bottom controls styling
const segmentControlsBottom = style({
    marginTop: tokens.space.md,
    padding: tokens.space.sm,
    backgroundColor: 'white', // Pure white instead of light gray
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: tokens.space.sm,

    '@media': {
        'screen and (max-width: 480px)': {
            padding: '10px',
            gap: tokens.space.xs,
            flexDirection: 'column',
            alignItems: 'stretch',
        },
        '(prefers-color-scheme: dark)': {
            backgroundColor: 'var(--color-panel-solid)', // Use Radix dark mode color
            borderColor: 'var(--gray-6)',
        },
    },
})

const remainingSpaceInfo = style({
    fontSize: tokens.typography.size.sm,
    color: tokens.colors.muted,
    fontWeight: tokens.typography.weight.medium,
    flexShrink: 0,

    '@media': {
        'screen and (max-width: 480px)': { textAlign: 'center', fontSize: tokens.typography.size.xs },
        '(prefers-color-scheme: dark)': { color: 'var(--gray-11)' },
    },
})

const addButtonsContainer = style({
    display: 'flex',
    gap: tokens.space.xs,
    flexWrap: 'wrap',

    '@media': { 'screen and (max-width: 480px)': { justifyContent: 'center' } },
})

const addSegmentButton = recipe({
    base: {
        padding: `${tokens.space.xs} ${tokens.space.md}`,
        backgroundColor: '#4CAF50', // Lighter green instead of #28a745
        color: 'white',
        border: '1px solid #45a049', // Lighter border
        borderRadius: tokens.borderRadius.sm,
        fontSize: tokens.typography.size.sm,
        fontWeight: tokens.typography.weight.medium,
        cursor: 'pointer',
        transition: 'all 0.1s ease',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap',

        ':hover': {
            backgroundColor: '#45a049', // Lighter hover state
            transform: 'translateY(-1px)',
        },

        ':active': {
            backgroundColor: '#3d8b40', // Lighter active state
            transform: 'translateY(0)',
        },

        '@media': {
            'screen and (max-width: 480px)': {
                padding: `${tokens.space.xs} ${tokens.space.sm}`,
                fontSize: tokens.typography.size.xs,
            },
        },
    },
})

export const curbTableStyles = {
    container,
    header,
    headerTitle,
    blockfaceInfo,
    wrapper,
    typeCell,
    typeContainer,
    lengthCell,
    startCell,
    addCell,
    addButton,
    emptyStateRow,
    emptyStateCell,
    emptyStateMessage,
    tableRow,
    selectedRow,
    segmentControlsBottom,
    remainingSpaceInfo,
    addButtonsContainer,
    addSegmentButton,
}
