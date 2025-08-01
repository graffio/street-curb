import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

const container = style({
    height: '100%',
    backgroundColor: tokens.colors.surface,
    borderBottom: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.space.md}`,
})

const rightSection = style({ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: tokens.space.sm })

export { container, rightSection }
