// Using argTypes action syntax instead of importing action function
import NumberPad from './NumberPad.jsx'

/**
 * Storybook stories comparing original and Radix-migrated NumberPad components
 */

const commonArgs = { value: 25, min: 1, max: 240, label: 'Length' }

export default {
    title: 'Migration/NumberPad Comparison',
    component: NumberPad,
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'Comparison between original NumberPad and new Radix UI version' } },
    },
    argTypes: { onSave: { action: 'saved' }, onCancel: { action: 'cancelled' } },
}

export const RadixNumberPad = { name: 'NumberPad', render: args => <NumberPad {...args} />, args: commonArgs }

export const MobileTest = {
    name: 'Mobile Viewport Test',
    render: args => <NumberPad {...args} />,
    args: commonArgs,
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
        docs: { description: { story: 'Test the new NumberPad on mobile viewport' } },
    },
}

export const ErrorStates = {
    name: 'Error States',
    render: args => (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
            <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Below Minimum (Radix)</h3>
                <NumberPad {...args} value={0} min={1} />
            </div>
        </div>
    ),
    args: commonArgs,
}
