import { style } from '@vanilla-extract/css'
import { tokens } from '../../themes/tokens.css.js'

const mainGrid = style({
    display: 'grid',
    gridTemplateColumns: `${tokens.layout.sidebarWidth} 1fr`,
    gridTemplateRows: `${tokens.layout.topBarHeight} 1fr`,
    gridTemplateAreas: `
        "topbar topbar"
        "sidebar main"
    `,
    height: '100vh',
    width: '100vw',
    backgroundColor: tokens.colors.background,
})

const topBarArea = style({
    gridArea: 'topbar',
    backgroundColor: tokens.colors.surface,
    borderBottom: `1px solid ${tokens.colors.border}`,
})

const sidebarArea = style({
    gridArea: 'sidebar',
    backgroundColor: tokens.colors.surface,
    borderRight: `1px solid ${tokens.colors.border}`,
    overflowY: 'auto',
})

const mainArea = style({
    gridArea: 'main',
    backgroundColor: tokens.colors.background,
    overflowY: 'auto',
    padding: tokens.layout.contentPadding,
})

export { mainGrid, topBarArea, sidebarArea, mainArea }
