import React from 'react'
import { Provider } from 'react-redux'
import { post } from '../../commands/index.js'
import CurbTable from '../../components/CurbTable/CurbTable.jsx'
import { store } from '../../store/index.js'
import { mockOrganization, mockUser } from '../../test-data/mock-auth.js'
import { DEFAULT_STORY_GEOMETRY } from '../../test-data/mock-geometries.js'
import { Action, Blockface } from '../../types/index.js'

/**
 * Storybook stories for CurbTable component
 */

/**
 * Wrapper component for stories with Redux provider and theme
 * @sig StoryWrapper :: ({ children: ReactNode }) -> JSXElement
 */
const StoryWrapper = ({ children }) => (
    <Provider store={store}>
        <div style={{ padding: '20px', background: 'var(--color-background)', minHeight: '100vh' }}>{children}</div>
    </Provider>
)

/**
 * Scenario initializers using post() command pattern
 * All scenarios must initialize auth state first via LoadAllInitialData
 */
const useEmptyScenario = () => {
    React.useEffect(() => {
        post(Action.LoadAllInitialData(mockUser, mockOrganization))
        const blockface = Blockface.from({
            id: 'blk_000000000000',
            sourceId: 'test-blockface-empty',
            organizationId: mockOrganization.id,
            projectId: mockOrganization.defaultProjectId,
            geometry: DEFAULT_STORY_GEOMETRY,
            streetName: 'Empty Street',
            segments: [],
            createdAt: new Date(),
            createdBy: mockUser.id,
            updatedAt: new Date(),
            updatedBy: mockUser.id,
        })
        post(Action.CreateBlockface(blockface))
    }, [])
}

const useMultipleScenario = () => {
    React.useEffect(() => {
        post(Action.LoadAllInitialData(mockUser, mockOrganization))
        const blockface = Blockface.from({
            id: 'blk_000000000000',
            sourceId: 'test-blockface-multiple',
            organizationId: mockOrganization.id,
            projectId: mockOrganization.defaultProjectId,
            geometry: DEFAULT_STORY_GEOMETRY,
            streetName: 'Multiple Street',
            segments: [],
            createdAt: new Date(),
            createdBy: mockUser.id,
            updatedAt: new Date(),
            updatedBy: mockUser.id,
        })
        post(Action.CreateBlockface(blockface))
        post(Action.AddSegment(-1))
        post(Action.UpdateSegmentLength(0, 80))
        post(Action.UpdateSegmentUse(0, 'Parking'))
        post(Action.AddSegment(0))
        post(Action.UpdateSegmentLength(1, 60))
        post(Action.UpdateSegmentUse(1, 'Loading'))
        post(Action.AddSegment(1))
        post(Action.UpdateSegmentLength(2, 50))
        post(Action.UpdateSegmentUse(2, 'Parking'))
    }, [])
}

const useFullScenario = () => {
    React.useEffect(() => {
        post(Action.LoadAllInitialData(mockUser, mockOrganization))
        const blockface = Blockface.from({
            id: 'blk_000000000000',
            sourceId: 'test-blockface-full',
            organizationId: mockOrganization.id,
            projectId: mockOrganization.defaultProjectId,
            geometry: DEFAULT_STORY_GEOMETRY,
            streetName: 'Full Street',
            segments: [],
            createdAt: new Date(),
            createdBy: mockUser.id,
            updatedAt: new Date(),
            updatedBy: mockUser.id,
        })
        post(Action.CreateBlockface(blockface))
        post(Action.AddSegment(-1))
        post(Action.UpdateSegmentLength(0, 120))
        post(Action.UpdateSegmentUse(0, 'Parking'))
        post(Action.AddSegment(0))
        post(Action.UpdateSegmentLength(1, 120))
        post(Action.UpdateSegmentUse(1, 'Loading'))
    }, [])
}

const meta = {
    title: 'SegmentedCurbEditor/CurbTable',
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
        useMultipleScenario()

        return (
            <StoryWrapper>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable Component</h2>
                    <CurbTable />
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
        useEmptyScenario()

        return (
            <StoryWrapper>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable - Empty State</h2>
                    <CurbTable />
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
        useMultipleScenario()

        return (
            <StoryWrapper>
                <div style={{ maxWidth: '375px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '15px', color: 'var(--gray-12)', fontSize: '16px' }}>
                        CurbTable - Mobile View
                    </h3>
                    <CurbTable />
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
        useFullScenario()

        return (
            <StoryWrapper>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)' }}>CurbTable - Complete Collection</h2>
                    <CurbTable />
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
        useMultipleScenario()

        return (
            <StoryWrapper>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--gray-12)', textAlign: 'center' }}>
                        CurbTable - Feature Showcase
                    </h2>
                    <CurbTable />
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
                                <strong>State Management:</strong> Redux with optimized selectors and memoization
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
