import CurbTable from '../components/CurbTable.jsx'
import '../index.css'

/**
 * CurbTable Storybook Stories
 *
 * Comprehensive stories covering various use cases and screen sizes
 * for the mobile-optimized curb configuration table component.
 */
export default {
    title: 'Components/CurbTable',
    component: CurbTable,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
Mobile-friendly table-based curb editor optimized for field data collection.
Designed for one-handed phone use while collecting street curb data.

**Key Features:**
- Table-based interface with dropdown type selection
- One-handed mobile interaction optimized for thumb use
- Row addition via + buttons
- Real-time length/start calculations
- Responsive design for small screens including iPhone 14 mini
- Dark mode support

**Use Cases:**
- Field data collection on street
- Creating curb configurations from scratch
- Mobile-first curb data entry
                `,
            },
        },
    },
    argTypes: {
        blockfaceLength: {
            control: { type: 'number', min: 50, max: 1000, step: 10 },
            description: 'Total length of the blockface in feet',
        },
        onSegmentsChange: { action: 'segments-changed', description: 'Callback fired when segments are modified' },
        segments: { control: false, description: 'External segments to sync with (used by main app)' },
    },
}

/**
 * Default story with standard blockface length
 */
export const Default = { args: { blockfaceLength: 240 } }

/**
 * Short blockface for compact display
 */
export const ShortBlockface = {
    args: { blockfaceLength: 120 },
    parameters: {
        docs: {
            description: { story: 'Shorter blockface length for testing compact layouts and smaller segment sizes.' },
        },
    },
}

/**
 * Long blockface testing scrolling behavior
 */
export const LongBlockface = {
    args: { blockfaceLength: 480 },
    parameters: {
        docs: {
            description: {
                story: 'Longer blockface to test how the component handles larger values and more segments.',
            },
        },
    },
}

/**
 * iPhone 14 Pro viewport (393x852)
 */
export const iPhone14Pro = {
    args: { blockfaceLength: 240 },
    parameters: {
        viewport: {
            viewports: { iphone14pro: { name: 'iPhone 14 Pro', styles: { width: '393px', height: '852px' } } },
            defaultViewport: 'iphone14pro',
        },
        docs: {
            description: { story: 'Component displayed in iPhone 14 Pro viewport to test standard mobile experience.' },
        },
    },
}

/**
 * iPhone 14 mini viewport (375x812) - smallest target
 */
export const iPhone14Mini = {
    args: { blockfaceLength: 240 },
    parameters: {
        viewport: {
            viewports: { iphone14mini: { name: 'iPhone 14 mini', styles: { width: '375px', height: '812px' } } },
            defaultViewport: 'iphone14mini',
        },
        docs: {
            description: {
                story: 'Component displayed in iPhone 14 mini viewport - our smallest target screen size. Tests ultra-compact layout and touch target sizes.',
            },
        },
    },
}

/**
 * Android Small Phone viewport (360x640)
 */
export const AndroidSmall = {
    args: { blockfaceLength: 240 },
    parameters: {
        viewport: {
            viewports: { androidsmall: { name: 'Android Small', styles: { width: '360px', height: '640px' } } },
            defaultViewport: 'androidsmall',
        },
        docs: {
            description: {
                story: 'Component on a typical small Android device to ensure cross-platform mobile compatibility.',
            },
        },
    },
}

/**
 * Modal presentation story
 */
export const InModal = {
    args: { blockfaceLength: 240 },
    decorators: [
        Story => (
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '95vw',
                    maxWidth: '450px',
                    maxHeight: '85vh',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    overflow: 'auto',
                    zIndex: 1000,
                    padding: '16px',
                }}
            >
                <Story />
            </div>
        ),
    ],
    parameters: {
        docs: {
            description: {
                story: 'Component presented in a modal overlay as it would appear in the actual application. Tests modal behavior and scrolling.',
            },
        },
    },
}

/**
 * Dark mode story
 */
export const DarkMode = {
    args: { blockfaceLength: 240 },
    parameters: {
        backgrounds: { default: 'dark' },
        docs: { description: { story: 'Component in dark mode to test dark theme styling and contrast.' } },
    },
    decorators: [
        Story => (
            <div style={{ colorScheme: 'dark' }}>
                <Story />
            </div>
        ),
    ],
}

/**
 * With callback logging
 */
export const WithLogging = {
    args: {
        blockfaceLength: 240,
        onSegmentsChange: segments => {
            console.log('Segments changed:', segments)
            // This will show in Storybook's Actions panel
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Component with console logging enabled. Check the Actions panel and browser console to see segment changes.',
            },
        },
    },
}

/**
 * Stress test with multiple configurations
 */
export const StressTest = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <CurbTable blockfaceLength={120} />
            <CurbTable blockfaceLength={240} />
            <CurbTable blockfaceLength={480} />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Multiple CurbTable instances with different blockface lengths to test performance and layout consistency.',
            },
        },
    },
}

/**
 * Interaction test story for manual testing
 */
export const InteractionTest = {
    args: { blockfaceLength: 240 },
    parameters: {
        docs: {
            description: {
                story: `
**Manual Testing Checklist:**
1. Tap type button to open dropdown
2. Select different curb types (Parking, Loading, Curb Cut)
3. Tap + button to add new segments
4. Verify segments split correctly from Unknown segments
5. Test that + button is disabled when segment is too small (≤20ft)
6. Verify start positions update correctly
7. Test dropdown closes when selecting an option
8. Test dropdown closes when tapping outside (if implemented)
9. **NEW: Click on Length or Start cells to test NumberPad**
10. **NEW: Test NumberPad input, validation, and save/cancel**

**Expected Behavior:**
- Type button should show color corresponding to segment type
- Dropdown should show all available types plus Unknown
- + button should split current segment and add new 20ft Parking segment
- Length and Start columns should update automatically
- Component should feel responsive to touch on mobile
- **NEW: Length/Start cells should be clickable and show hover effect**
- **NEW: NumberPad should open with current value and proper validation**
                `,
            },
        },
    },
}

/**
 * Empty/Edge cases story
 */
export const EdgeCases = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
            <div>
                <h4>Very Small Blockface (50ft)</h4>
                <CurbTable blockfaceLength={50} />
            </div>
            <div>
                <h4>Large Blockface (800ft)</h4>
                <CurbTable blockfaceLength={800} />
            </div>
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'Edge cases testing very small and very large blockface lengths to ensure component handles extreme values gracefully.',
            },
        },
    },
}

/**
 * NumberPad integration test
 */
export const NumberPadIntegration = {
    args: { blockfaceLength: 240 },
    parameters: {
        docs: {
            description: {
                story: `
**NumberPad Integration Testing:**
1. Click on any Length cell to open NumberPad for length editing
2. Click on any Start cell to open NumberPad for start position editing
3. Test number input with decimal values (e.g., 12.5)
4. Test validation (min/max limits)
5. Test cancel functionality (should revert to original value)
6. Test enter functionality (should save new value)
7. Verify table updates correctly after saving

**Expected Behavior:**
- Length cells should open NumberPad with min=1, max=blockfaceLength
- Start cells should open NumberPad with min=0, max=blockfaceLength
- NumberPad should slide up from bottom with fade-in backdrop
- Invalid values should show error messages
- Cancel should close NumberPad without saving changes
- Enter should save changes and update the table
- Table should recalculate start positions after length changes
                `,
            },
        },
    },
}

/**
 * Mobile NumberPad testing
 */
export const MobileNumberPad = {
    args: { blockfaceLength: 240 },
    parameters: {
        viewport: {
            viewports: { iphone14mini: { name: 'iPhone 14 mini', styles: { width: '375px', height: '812px' } } },
            defaultViewport: 'iphone14mini',
        },
        docs: {
            description: {
                story: `
**Mobile NumberPad Testing (iPhone 14 mini):**
1. Test NumberPad on smallest target device
2. Verify touch targets are 44px+ for accessibility
3. Test one-handed thumb interaction
4. Verify NumberPad positioning doesn't cover important UI
5. Test keyboard navigation (Escape key)
6. Test backdrop click to close

**Expected Behavior:**
- NumberPad should be easily accessible with thumb
- Buttons should be large enough for comfortable tapping
- NumberPad should position near bottom of screen
- All interactions should work smoothly on mobile
                `,
            },
        },
    },
}
