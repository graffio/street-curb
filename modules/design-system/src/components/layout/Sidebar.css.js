import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

const sidebar = style({
    height: '100%',
    backgroundColor: tokens.colors.surface,
    borderRight: `1px solid ${tokens.colors.border}`,
    overflowY: 'auto',
    padding: tokens.space.md,
})

const nav = style({ display: 'flex', flexDirection: 'column', gap: tokens.space.xs })

const navItem = style({
    display: 'flex',
    alignItems: 'center',
    padding: `${tokens.space.sm} ${tokens.space.md}`,
    borderRadius: tokens.borderRadius.sm,
    color: tokens.colors.text,
    textDecoration: 'none',
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',

    ':hover': { backgroundColor: tokens.colors.accent },
})

const navItemActive = style({
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.surface,

    ':hover': { backgroundColor: tokens.colors.primary },
})

const section = style({ marginBottom: tokens.space.lg })

const sectionTitle = style({
    fontSize: tokens.typography.size.xs,
    fontWeight: tokens.typography.weight.semibold,
    color: tokens.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: tokens.space.sm,
    padding: `0 ${tokens.space.md}`,
})

export { sidebar, nav, navItem, navItemActive, section, sectionTitle }
