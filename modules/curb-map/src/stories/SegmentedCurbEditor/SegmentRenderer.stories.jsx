import React from 'react'
import { Provider } from 'react-redux'
import { post } from '../../commands/index.js'
import { SegmentRenderer } from '../../components/SegmentedCurbEditor/SegmentRenderer.jsx'
import { store } from '../../store/index.js'
import { mockOrganization, mockUser } from '../../test-data/mock-auth.js'
import { DEFAULT_STORY_GEOMETRY } from '../../test-data/mock-geometries.js'
import { Action, Blockface } from '../../types/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'

/**
 * SegmentRenderer Component Showcase
 *
 * Showcases the SegmentRenderer component in isolation with test data.
 * Demonstrates segment rendering with different types and drag states.
 */

/**
 * Mock drag drop handler for testing
 * @sig mockDragDropHandler :: Object
 */
const mockDragDropHandler = {
    getDragStartHandler: index => e => console.log('Drag start:', index),
    getDropHandler: index => e => console.log('Drop:', index),
    getUnifiedStartHandler: index => e => console.log('Unified start:', index),
}

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    React.useEffect(() => {
        const blockface = Blockface.from({
            id: 'blk_000000000000',
            sourceId: 'segment-showcase',
            organizationId: mockOrganization.id,
            projectId: mockOrganization.defaultProjectId,
            geometry: DEFAULT_STORY_GEOMETRY,
            streetName: 'Showcase Street',
            segments: [],
            createdAt: new Date(),
            createdBy: mockUser.id,
            updatedAt: new Date(),
            updatedBy: mockUser.id,
        })

        post(Action.AllInitialDataLoaded(mockUser, mockOrganization))
        post(Action.BlockfaceCreated(blockface))
        post(Action.SegmentAdded(-1))
        post(Action.SegmentLengthUpdated(0, 80))
        post(Action.SegmentUseUpdated(0, 'Parking'))
        post(Action.SegmentAdded(0))
        post(Action.SegmentLengthUpdated(1, 60))
        post(Action.SegmentUseUpdated(1, 'Loading'))
        post(Action.SegmentAdded(1))
        post(Action.SegmentLengthUpdated(2, 40))
        post(Action.SegmentUseUpdated(2, 'Bus Stop'))
        post(Action.SegmentAdded(2))
        post(Action.SegmentLengthUpdated(3, 30))
        post(Action.SegmentUseUpdated(3, 'Disabled'))
    }, [])
}

/**
 * Story content showcasing SegmentRenderer component
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>SegmentRenderer Component</h3>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '120px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            margin: '0 auto',
                        }}
                    >
                        <SegmentRenderer dragDropHandler={mockDragDropHandler} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Colored segments with drag and drop support
                    </p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Component Features</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>
                        ✅ <strong>Pure JSX</strong>: No CSS class dependencies
                    </div>
                    <div>
                        ✅ <strong>Redux Integration</strong>: Direct data access via useSelector
                    </div>
                    <div>
                        ✅ <strong>Segment Colors</strong>: Visual distinction by segment type
                    </div>
                    <div>
                        ✅ <strong>Drag Support</strong>: Integrated with drag and drop handlers
                    </div>
                    <div>
                        ✅ <strong>Unknown Space</strong>: Handles remaining space visualization
                    </div>
                    <div>
                        ✅ <strong>Channel Coordination</strong>: Drag state via channels
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Main story render function
 * @sig ShowcaseRender :: (Object) -> JSXElement
 */
const ShowcaseRender = args => (
    <Provider store={store}>
        <StoryContent {...args} />
    </Provider>
)

const meta = {
    title: 'SegmentedCurbEditor/SegmentRenderer',
    component: SegmentRenderer,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'Segment rendering component with color coding and drag support' } },
    },
    argTypes: {
        dragDropHandler: { control: false, description: 'Drag and drop handler object' },
        isDragging: { control: 'boolean', description: 'Controls drag state via channel' },
        draggedIndex: {
            control: { type: 'number', min: 0, max: 3, step: 1 },
            description: 'Index of segment being dragged (0-based)',
        },
    },
}

const SegmentRenderer_ = {
    name: 'SegmentRenderer',
    render: ShowcaseRender,
    args: { isDragging: false, draggedIndex: null },
}

export { meta as default, SegmentRenderer_ }
