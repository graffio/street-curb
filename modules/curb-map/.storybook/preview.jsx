import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import React from 'react'
import '../src/index.css'

const preview = {
    parameters: { controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } }, a11y: { test: 'todo' } },
    decorators: [
        Story => (
            <Theme appearance="light" accentColor="blue" grayColor="slate" radius="medium" scaling="100%">
                <Story />
            </Theme>
        ),
    ],
}

export default preview
