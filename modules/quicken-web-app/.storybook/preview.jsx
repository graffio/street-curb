import { MainTheme } from '@graffio/design-system'
import React from 'react'

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },

        a11y: { test: 'todo' },
    },

    decorators: [
        Story => (
            <MainTheme>
                <Story />
            </MainTheme>
        ),
    ],
}

export default preview
