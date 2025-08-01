import { recipe } from '@vanilla-extract/recipes'
import { tokens } from '../../themes/tokens.css.js'

// prettier-ignore
const container = recipe({
    base: {
        display: 'grid',
        gridTemplateRows: 'auto auto',
        alignContent: 'center',
    },
    variants: {
        gap: {
            tight: { gap: '1px' },
            normal: { gap: '2px' },
            loose: { gap: '4px' },
        },
    },
    defaultVariants: {
        gap: 'normal',
    },
})

// prettier-ignore
const title = recipe({
    base: {
        fontWeight: tokens.typography.weight.bold,
        color: tokens.colors.text,
        lineHeight: 1,
        margin: 0,
    },
    variants: {
        size: {
            md: { fontSize: tokens.typography.size.md },
            lg: { fontSize: tokens.typography.size.lg },
            xl: { fontSize: tokens.typography.size.xl },
        },
    },
    defaultVariants: {
        size: 'lg',
    },
})

// prettier-ignore
const subtitle = recipe({
    base: {
        color: tokens.colors.text,
        lineHeight: 1,
        margin: 0,
    },
    variants: {
        size: {
            xs: { fontSize: tokens.typography.size.xs },
            sm: { fontSize: tokens.typography.size.sm },
            md: { fontSize: tokens.typography.size.md },
        },
    },
    defaultVariants: {
        size: 'xs',
    },
})

export { container, title, subtitle }
