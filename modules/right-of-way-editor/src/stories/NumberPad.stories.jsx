import NumberPad from '../components/NumberPad.jsx'

/**
 * NumberPad - Mobile-optimized number input component for CurbTable
 *
 * Provides a custom number pad interface for one-handed thumb interaction
 * during field data collection, replacing the device keyboard.
 */

const meta = {
    title: 'SegmentedCurbEditor/NumberPad',
    component: NumberPad,
    parameters: { layout: 'centered', viewport: { defaultViewport: 'mobile1' } },
    argTypes: {
        value: { control: 'number' },
        min: { control: 'number' },
        max: { control: 'number' },
        onSave: { action: 'saved' },
        onCancel: { action: 'cancelled' },
        label: { control: 'text' },
    },
}

/**
 * Basic NumberPad with default value
 */
const Basic = { args: { value: 20, min: 1, max: 240, label: 'Length' } }

/**
 * NumberPad with decimal value
 */
const DecimalValue = { args: { value: 12.5, min: 0, max: 100, label: 'Start' } }

/**
 * NumberPad with zero value
 */
const ZeroValue = { args: { value: 0, min: 0, max: 240, label: 'Start' } }

/**
 * NumberPad with high value
 */
const HighValue = { args: { value: 200, min: 1, max: 240, label: 'Length' } }

/**
 * NumberPad with tight constraints
 */
const TightConstraints = { args: { value: 5, min: 5, max: 10, label: 'Length' } }

/**
 * NumberPad for length input (typical use case)
 */
const LengthInput = {
    args: { value: 20, min: 1, max: 240, label: 'Length' },
    parameters: { docs: { description: { story: 'Typical use case for editing segment length in CurbTable' } } },
}

/**
 * NumberPad for start position input
 */
const StartInput = {
    args: { value: 0, min: 0, max: 240, label: 'Start' },
    parameters: { docs: { description: { story: 'Use case for editing segment start position in CurbTable' } } },
}

/**
 * Mobile viewport testing - iPhone 14 mini
 */
const MobileViewport = {
    args: { value: 15, min: 1, max: 240, label: 'Length' },
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
        docs: { description: { story: 'Optimized for iPhone 14 mini and similar mobile devices' } },
    },
}

/**
 * Tablet viewport testing
 */
const TabletViewport = {
    args: { value: 25, min: 1, max: 240, label: 'Length' },
    parameters: { viewport: { defaultViewport: 'tablet' } },
}

/**
 * Desktop viewport testing
 */
const DesktopViewport = {
    args: { value: 30, min: 1, max: 240, label: 'Length' },
    parameters: { viewport: { defaultViewport: 'desktop' } },
}

/**
 * Dark mode testing
 */
const DarkMode = {
    args: { value: 18, min: 1, max: 240, label: 'Length' },
    parameters: { backgrounds: { default: 'dark' } },
}

/**
 * Integration test - within CurbTable context
 */
const InCurbTableContext = {
    args: { value: 20, min: 1, max: 240, label: 'Length' },
    decorators: [
        Story => (
            <div
                style={{
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: '#f5f5f5',
                    padding: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Curb Configuration</h3>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Total: 240 ft • Remaining: 220 ft
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Type</th>
                                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Length</th>
                                <th style={{ padding: '8px 6px', textAlign: 'right' }}>Start</th>
                                <th style={{ padding: '8px 6px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                                <td style={{ padding: '6px' }}>
                                    <button
                                        style={{
                                            backgroundColor: '#666',
                                            color: 'white',
                                            border: '1px solid rgba(0,0,0,0.25)',
                                            borderRadius: '4px',
                                            padding: '2px 4px',
                                            fontSize: '13px',
                                            width: '100%',
                                            minHeight: '32px',
                                        }}
                                    >
                                        Unknown
                                    </button>
                                </td>
                                <td
                                    style={{
                                        padding: '6px',
                                        textAlign: 'right',
                                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                                        borderLeft: '3px solid #007bff',
                                    }}
                                >
                                    20 ft
                                </td>
                                <td style={{ padding: '6px', textAlign: 'right' }}>0 ft</td>
                                <td style={{ padding: '6px' }}>
                                    <button
                                        style={{
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            width: '32px',
                                            height: '32px',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        +
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <Story />
            </div>
        ),
    ],
    parameters: { docs: { description: { story: 'NumberPad shown in context of CurbTable interface' } } },
}

export {
    meta as default,
    Basic,
    DarkMode,
    DecimalValue,
    DesktopViewport,
    HighValue,
    InCurbTableContext,
    LengthInput,
    MobileViewport,
    StartInput,
    TabletViewport,
    TightConstraints,
    ZeroValue,
}
