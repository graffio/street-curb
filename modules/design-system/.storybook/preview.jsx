import React from 'react'
import { MainTheme } from '../src/index.js'

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
