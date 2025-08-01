import { Theme } from '@radix-ui/themes'
import React from 'react'
import { defaultTheme } from './tokens.css.js'

/**
 * MainTheme wrapper component that provides Radix themes with custom design tokens
 * @sig MainTheme :: ({ children: ReactNode, ...props }) -> ReactElement
 */
const MainTheme = ({ children, ...props }) => (
    <Theme
        className={defaultTheme}
        appearance="light"
        accentColor="blue"
        grayColor="slate"
        radius="medium"
        scaling="100%"
        {...props}
    >
        {children}
    </Theme>
)

export { MainTheme }
