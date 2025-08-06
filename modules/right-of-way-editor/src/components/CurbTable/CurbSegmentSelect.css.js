import { style } from '@vanilla-extract/css'
import { tokens } from '@qt/design-system'

/**
 * Vanilla Extract styles for generic Select component
 * Integrates with MainTheme tokens and supports color-coded options
 */

const wrapper = style({
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    minWidth: '60px',
})

const trigger = style({
    width: '100%',
    minHeight: '32px',
    border: '1px solid rgba(0, 0, 0, 0.25)',
    borderRadius: tokens.borderRadius.sm,
    color: 'white',
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    cursor: 'pointer',
    transition: 'all 0.1s ease',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    
    ':hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    
    ':active': {
        transform: 'translateY(0)',
    },
    
    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
        transform: 'none',
    },
    
    ':disabled:hover': {
        transform: 'none',
        boxShadow: 'none',
    },
    
    '@media': {
        'screen and (max-width: 480px)': {
            minHeight: '28px',
            fontSize: tokens.typography.size.xs,
            padding: '2px 3px',
        },
        'screen and (max-width: 375px)': {
            minHeight: '26px',
            fontSize: '11px',
        }
    }
})

const value = style({
    color: 'white',
    fontWeight: tokens.typography.weight.medium,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
})

const content = style({
    backgroundColor: '#666',
    border: '1px solid rgba(0, 0, 0, 0.75)',
    borderRadius: tokens.borderRadius.md,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    minWidth: '120px',
    zIndex: 9999,
    
    '@media': {
        '(prefers-color-scheme: dark)': {
            backgroundColor: 'var(--gray-2)',
            borderColor: 'var(--gray-6)',
        }
    }
})

const viewport = style({
    padding: 0,
})

const item = style({
    padding: '4px 12px',
    cursor: 'pointer',
    color: 'white',
    fontSize: tokens.typography.size.sm,
    display: 'flex',
    alignItems: 'center',
    minHeight: '28px',
    WebkitTapHighlightColor: 'transparent',
    transition: 'background-color 0.1s ease',
    outline: 'none',
    
    ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
    },
    
    ':active': {
        backgroundColor: 'rgba(255, 255, 255, 0.3) !important',
    },
    
    ':focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
        outline: 'none',
    },
    
    ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    
    '[data-highlighted]': {
        backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
    },
    
    '@media': {
        'screen and (max-width: 480px)': {
            padding: '4px 8px',
            fontSize: tokens.typography.size.xs,
            minHeight: '26px',
        }
    }
})

const itemText = style({
    color: 'white',
    fontWeight: tokens.typography.weight.medium,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
})

// Special style for unknown/default options
const unknownOption = style({
    backgroundColor: '#666',
    color: 'white',
})

export const selectStyles = {
    wrapper,
    trigger,
    value,
    content,
    viewport,
    item,
    itemText,
    unknownOption,
}