import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

const dropdownContainer = style({ position: 'relative' })

const dropdown = style({
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: tokens.colors.surface,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    boxShadow: 'var(--shadow-4)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
})

const dropdownItem = style({
    padding: tokens.space.sm,
    cursor: 'pointer',
    borderBottom: `1px solid var(--gray-3)`,

    ':hover': { backgroundColor: 'var(--gray-2)' },
    ':last-child': { borderBottom: 'none' },
})

const dropdownItemHighlighted = style({ backgroundColor: 'var(--gray-3)' })

const moreItemsIndicator = style({
    padding: tokens.space.sm,
    backgroundColor: 'var(--gray-1)',
    borderTop: `1px solid var(--gray-3)`,
})

const badgeContainer = style({ display: 'flex', flexWrap: 'wrap', gap: tokens.space.xs })

export { dropdownContainer, dropdown, dropdownItem, dropdownItemHighlighted, moreItemsIndicator, badgeContainer }
