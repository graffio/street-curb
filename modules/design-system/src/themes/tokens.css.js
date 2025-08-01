import { createTheme, createThemeContract } from '@vanilla-extract/css'

// Define the contract for our design tokens
const tokens = createThemeContract({
    layout: { topBarHeight: null, sidebarWidth: null, contentPadding: null },
    colors: { background: null, surface: null, border: null, text: null, primary: null, accent: null, muted: null },
    space: { xs: null, sm: null, md: null, lg: null, xl: null },
    typography: {
        size: { xs: null, sm: null, md: null, lg: null, xl: null },
        weight: { normal: null, medium: null, semibold: null, bold: null },
    },
    borderRadius: { sm: null, md: null, lg: null },
})

// Default theme that integrates with Radix Themes
const defaultTheme = createTheme(tokens, {
    // Custom layout dimensions for your application
    layout: { topBarHeight: '60px', sidebarWidth: '240px', contentPadding: 'var(--space-4)' },

    // Use Radix Themes color variables for consistency
    colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--gray-6)',
        text: 'var(--gray-12)',
        primary: 'var(--accent-9)',
        accent: 'var(--accent-3)',
        muted: 'var(--gray-11)',
    },
    // Use Radix spacing scale
    space: {
        xs: 'var(--space-1)',
        sm: 'var(--space-2)',
        md: 'var(--space-4)',
        lg: 'var(--space-6)',
        xl: 'var(--space-8)',
    },
    // Use Radix typography scale
    typography: {
        size: {
            xs: 'var(--font-size-1)',
            sm: 'var(--font-size-2)',
            md: 'var(--font-size-3)',
            lg: 'var(--font-size-4)',
            xl: 'var(--font-size-5)',
        },
        weight: {
            normal: 'var(--font-weight-regular)',
            medium: 'var(--font-weight-medium)',
            semibold: 'var(--font-weight-bold)',
            bold: 'var(--font-weight-bold)',
        },
    },
    // Use Radix border radius scale
    borderRadius: { sm: 'var(--radius-2)', md: 'var(--radius-3)', lg: 'var(--radius-4)' },
})

export { tokens, defaultTheme }
