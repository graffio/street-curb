import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

const customDateContainer = style({
    marginTop: tokens.space.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.space.sm,
})

const dateFieldContainer = style({ display: 'flex', flexDirection: 'column', gap: tokens.space.xs })

const dateFieldLabel = style({
    fontSize: tokens.typography.size.xs,
    color: tokens.colors.muted,
    fontWeight: tokens.typography.weight.medium,
})

const filterContainer = style({ display: 'flex', flexDirection: 'column', gap: tokens.space.sm })

const filterLabel = style({
    fontSize: tokens.typography.size.sm,
    fontWeight: tokens.typography.weight.medium,
    color: tokens.colors.muted,
})

export { customDateContainer, dateFieldContainer, dateFieldLabel, filterContainer, filterLabel }
