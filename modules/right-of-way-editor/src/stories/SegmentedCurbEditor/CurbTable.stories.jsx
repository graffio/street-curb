import { MainTheme } from '@qt/design-system'
import { Provider } from 'react-redux'
import { createStoreWithScenario } from '../../test/test-store.js'
import CurbTable from '../components/CurbTable/CurbTable.jsx'

/**
 * Storybook stories for CurbTable component
 * Uses MainTheme wrapper for design system consistency
 */

/**
 * Wrapper component for stories with Redux provider and theme
 * @sig StoryWrapper :: ({ children: ReactNode, store: Store }) -> JSXElement
 */
const StoryWrapper = ({ children, store }) => (
    <Provider store={store}>
        <MainTheme>
            <div style={{ padding: '20px', background: 'var(--color-background)', minHeight: '100vh' }}>{children}</div>
        </MainTheme>
    </Provider>
)

// Uses unified test store architecture shared with Playwright and tap tests

const meta = {
    title: 'Components/CurbTable',
    component: CurbTable,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
# CurbTable Component

The CurbTable component provides an interface for managing curb segments with the following features:

## Key Features:
- **Design System Integration**: Uses Radix Themes and design system tokens
- **Redux State Management**: Full integration with curb store for state persistence
- **Responsive Design**: Mobile-optimized with touch-friendly interactions
- **NumberPad Integration**: Easy length editing with validation
- **Accessibility**: Full ARIA labeling and keyboard navigation support
- **Type Safety**: Comprehensive validation and error handling

## Usage:
- Click on segment types to change them via dropdown
- Click on length values to edit with NumberPad
- Use + buttons to add new segments
- View remaining space and collection status in header
                `,
            },
        },
    },
}

/**
 * Default story showing populated CurbTable
 * @sig Default :: Object
 */
const Default = {
    render: () => {
        const store = createStoreWithScenario('multiple')

        return (
            <StoryWrapper store={store}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable Component</h2>
                    <CurbTable blockfaceLength={240} />
                </div>
            </StoryWrapper>
        )
    },
    parameters: {
        docs: { description: { story: 'Default CurbTable showing multiple segments with remaining unknown space.' } },
    },
}

/**
 * Empty state story
 * @sig EmptyState :: Object
 */
const EmptyState = {
    render: () => {
        const store = createStoreWithScenario('empty')

        return (
            <StoryWrapper store={store}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable - Empty State</h2>
                    <CurbTable blockfaceLength={240} />
                </div>
            </StoryWrapper>
        )
    },
    parameters: { docs: { description: { story: 'Empty state with "Add First Segment" functionality.' } } },
}

/**
 * Mobile responsive view
 * @sig MobileView :: Object
 */
const MobileView = {
    render: () => {
        const store = createStoreWithScenario('multiple')

        return (
            <StoryWrapper store={store}>
                <div style={{ maxWidth: '375px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--gray-12)', fontSize: '16px' }}>
                        CurbTable - Mobile View
                    </h3>
                    <CurbTable blockfaceLength={240} />
                </div>
            </StoryWrapper>
        )
    },
    parameters: {
        viewport: { defaultViewport: 'mobile1' },
        docs: {
            description: { story: 'Mobile responsive view demonstrating touch-friendly design and compact layout.' },
        },
    },
}

/**
 * Complete collection state
 * @sig CompleteCollection :: Object
 */
const CompleteCollection = {
    render: () => {
        const store = createStoreWithScenario('full')

        return (
            <StoryWrapper store={store}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable - Complete Collection</h2>
                    <CurbTable blockfaceLength={240} />
                </div>
            </StoryWrapper>
        )
    },
    parameters: { docs: { description: { story: 'Complete collection state with no remaining unknown segments.' } } },
}

/**
 * Feature showcase with detailed information
 * @sig FeatureShowcase :: Object
 */
const FeatureShowcase = {
    render: () => {
        const store = createStoreWithScenario('multiple')

        return (
            <StoryWrapper store={store}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)', textAlign: 'center' }}>
                        CurbTable - Feature Showcase
                    </h2>
                    <CurbTable blockfaceLength={240} />
                    <div
                        style={{
                            marginTop: '30px',
                            padding: '20px',
                            backgroundColor: 'var(--gray-2)',
                            borderRadius: '8px',
                        }}
                    >
                        <h3 style={{ color: 'var(--gray-12)', marginBottom: '12px' }}>Interactive Features:</h3>
                        <ul style={{ color: 'var(--gray-11)', fontSize: '14px', lineHeight: '1.6' }}>
                            <li>
                                <strong>Type Selection:</strong> Click any segment type to change it via dropdown
                            </li>
                            <li>
                                <strong>Length Editing:</strong> Click length values to open NumberPad for precise
                                editing
                            </li>
                            <li>
                                <strong>Add Segments:</strong> Use + buttons to insert new segments at any position
                            </li>
                            <li>
                                <strong>Row Selection:</strong> Click rows to highlight and track current segment
                            </li>
                            <li>
                                <strong>Real-time Updates:</strong> All changes immediately update remaining space
                                calculations
                            </li>
                            <li>
                                <strong>Mobile Optimized:</strong> Touch-friendly design with proper sizing and spacing
                            </li>
                            <li>
                                <strong>Accessibility:</strong> Full keyboard navigation and screen reader support
                            </li>
                        </ul>

                        <h3 style={{ color: 'var(--gray-12)', marginBottom: '12px', marginTop: '20px' }}>
                            Technical Implementation:
                        </h3>
                        <ul style={{ color: 'var(--gray-11)', fontSize: '14px', lineHeight: '1.6' }}>
                            <li>
                                <strong>Design System:</strong> Uses Radix Themes with MainTheme integration
                            </li>
                            <li>
                                <strong>State Management:</strong> Redux with optimized selectors and memoization
                            </li>
                            <li>
                                <strong>Styling:</strong> Vanilla Extract CSS-in-JS with design tokens
                            </li>
                            <li>
                                <strong>Performance:</strong> Proper React memoization and efficient re-renders
                            </li>
                            <li>
                                <strong>Testing:</strong> 147 comprehensive tests covering all functionality
                            </li>
                        </ul>
                    </div>
                </div>
            </StoryWrapper>
        )
    },
    parameters: {
        docs: { description: { story: 'Detailed showcase of CurbTable features and implementation details.' } },
    },
}

export { meta as default, Default, EmptyState, MobileView, CompleteCollection, FeatureShowcase }
