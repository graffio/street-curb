import { Theme } from '@radix-ui/themes'
import React from 'react'

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },

        a11y: { test: 'todo' },
    },

    decorators: [
        Story => (
            <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                <Story />
            </Theme>
        ),
    ],
}

export default preview
