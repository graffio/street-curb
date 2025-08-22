import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { SegmentRenderer } from '../../components/SegmentedCurbEditor/SegmentRenderer.jsx'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../../store/curbStore.js'
import store from '../../store/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'
import '../../index.css'

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
    const dispatch = useDispatch()

    React.useEffect(() => {
        dispatch(initializeSegments(240, 'segment-showcase'))
        dispatch(addSegment(-1))
        dispatch(updateSegmentLength(0, 80))
        dispatch(updateSegmentType(0, 'Parking'))
        dispatch(addSegment(0))
        dispatch(updateSegmentLength(1, 60))
        dispatch(updateSegmentType(1, 'Loading'))
        dispatch(addSegment(1))
        dispatch(updateSegmentLength(2, 40))
        dispatch(updateSegmentType(2, 'Bus Stop'))
        dispatch(addSegment(2))
        dispatch(updateSegmentLength(3, 30))
        dispatch(updateSegmentType(3, 'Disabled'))
    }, [dispatch])
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
    <MainTheme>
        <Provider store={store}>
            <StoryContent {...args} />
        </Provider>
    </MainTheme>
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
