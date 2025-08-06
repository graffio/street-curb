import { style } from '@vanilla-extract/css'
import { tokens } from '@qt/design-system'

/**
 * Vanilla Extract styles for generic Table component
 * Integrates with MainTheme tokens and maintains mobile responsiveness
 */

const wrapper = style({
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    overflow: 'auto',
    background: tokens.colors.surface,
    
    // Mobile scrolling optimization
    WebkitOverflowScrolling: 'touch',
    overscrollBehavior: 'contain',
    
    '@media': {
        'screen and (max-width: 480px)': {
            fontSize: tokens.typography.size.sm,
        },
        'screen and (max-width: 375px)': {
            fontSize: tokens.typography.size.xs,
        },
        '(prefers-color-scheme: dark)': {
            background: 'var(--color-panel-solid)',
            borderColor: 'var(--gray-6)',
        }
    }
})

const root = style({
    width: '100%',
    minWidth: '300px',
    borderCollapse: 'separate',
    borderSpacing: '0',
    tableLayout: 'fixed',
})

const headerCell = style({
    backgroundColor: 'var(--gray-2)',
    fontWeight: tokens.typography.weight.semibold,
    fontSize: tokens.typography.size.sm,
    color: 'var(--gray-11)',
    borderBottom: `1px solid ${tokens.colors.border}`,
    padding: `${tokens.space.sm} ${tokens.space.xs}`,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    
    '@media': {
        'screen and (max-width: 480px)': {
            padding: `${tokens.space.xs} 4px`,
            fontSize: '11px',
        },
        'screen and (max-width: 375px)': {
            padding: '3px 2px',
        },
        '(prefers-color-scheme: dark)': {
            backgroundColor: 'var(--gray-3)',
            color: 'var(--gray-12)',
            borderBottomColor: 'var(--gray-6)',
        }
    }
})

const row = style({
    borderBottom: `1px solid var(--gray-4)`,
    transition: 'background-color 0.1s ease',
    
    ':hover': {
        backgroundColor: 'var(--gray-2)',
    },
    
    ':last-child': {
        borderBottom: 'none',
    },
    
    '@media': {
        '(prefers-color-scheme: dark)': {
            borderBottomColor: 'var(--gray-6)',
            ':hover': {
                backgroundColor: 'var(--gray-3)',
            }
        }
    }
})

const selectedRow = style({
    backgroundColor: 'var(--accent-3)',
    borderLeft: `3px solid var(--accent-9)`,
    
    ':hover': {
        backgroundColor: 'var(--accent-4)',
    },
    
    '@media': {
        '(prefers-color-scheme: dark)': {
            backgroundColor: 'var(--accent-3)',
            borderLeftColor: 'var(--accent-9)',
            ':hover': {
                backgroundColor: 'var(--accent-4)',
            }
        }
    }
})

const cell = style({
    padding: `${tokens.space.xs} ${tokens.space.xs}`,
    verticalAlign: 'middle',
    fontSize: tokens.typography.size.sm,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--gray-12)',
    
    '@media': {
        'screen and (max-width: 480px)': {
            padding: '4px',
            fontSize: tokens.typography.size.xs,
        },
        'screen and (max-width: 375px)': {
            padding: '3px 2px',
        }
    }
})

const emptyCell = style({
    padding: `${tokens.space.lg} ${tokens.space.md}`,
    textAlign: 'center',
    color: 'var(--gray-9)',
})

const emptyMessage = style({
    fontStyle: 'italic',
    fontSize: tokens.typography.size.sm,
    color: 'var(--gray-9)',
})

export const tableStyles = {
    wrapper,
    root,
    headerCell,
    row,
    selectedRow,
    cell,
    emptyCell,
    emptyMessage,
}