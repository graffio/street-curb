import { MainTheme } from '@graffio/design-system'
import React from 'react'
import NumberPad from '../components/NumberPad.jsx'

/**
 * NumberPad - Mobile-optimized number input component for CurbTable
 *
 * Provides a custom number pad interface for one-handed thumb interaction
 * during field data collection, replacing the device keyboard.
 */

export default {
    title: 'SegmentedCurbEditor/NumberPad',
    component: NumberPad,
    decorators: [
        Story => (
            <MainTheme>
                <Story />
            </MainTheme>
        ),
    ],
}

/**
 * Basic NumberPad with default value
 */
export const Basic = { args: { value: 20, min: 1, max: 240, label: 'Length' } }

/**
 * Dark mode testing
 */
export const DarkMode = {
    args: { value: 18, min: 1, max: 240, label: 'Length' },
    parameters: { backgrounds: { default: 'dark' } },
}
