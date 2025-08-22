import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { SegmentRenderer } from '../components/SegmentedCurbEditor/SegmentRenderer.jsx'
import { SegmentRendererNew } from '../components/SegmentedCurbEditor/SegmentRendererNew.jsx'
import {
    addSegment,
    initializeSegments,
    selectBlockfaceLength,
    selectSegments,
    selectUnknownRemaining,
    updateSegmentLength,
    updateSegmentType,
} from '../store/curbStore.js'
import store from '../store/index.js'
import { DragStateDecorator } from './DragStateDecorator.jsx'
import '../index.css'

/**
 * TDD Story for SegmentRendererNew - Side-by-side comparison during development
 *
 * This story provides immediate visual feedback during iterative implementation:
 * - Shows original SegmentRenderer vs new SegmentRendererNew side-by-side
 * - Starts with placeholder component, evolves as features are implemented
 * - Validates props interface and segment rendering logic
 * - Documents expected behavior and progress
 */

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        dispatch(initializeSegments(240, 'storybook-test'))
        dispatch(addSegment(-1))
        dispatch(updateSegmentLength(0, 80))
        dispatch(updateSegmentType(0, 'Parking'))
        dispatch(addSegment(0))
        dispatch(updateSegmentLength(1, 60))
        dispatch(updateSegmentType(1, 'Loading'))
        dispatch(addSegment(1))
        dispatch(updateSegmentLength(2, 50))
        dispatch(updateSegmentType(2, 'Parking'))
    }, [dispatch])
}

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
 * Inner component that uses Redux hooks
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()
    const [mockDraggingIndex, setMockDraggingIndex] = React.useState(null)

    // Get real Redux data for the old component that needs props
    const segments = useSelector(selectSegments) || []
    const total = useSelector(selectBlockfaceLength) || 0
    const unknownRemaining = useSelector(selectUnknownRemaining) || 0

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                    <h4>Original SegmentRenderer (CSS)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '120px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                        }}
                    >
                        <SegmentRenderer
                            segments={segments}
                            total={total}
                            unknownRemaining={unknownRemaining}
                            draggingIndex={mockDraggingIndex}
                            dragDropHandler={mockDragDropHandler}
                            setDraggingIndex={setMockDraggingIndex}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>CSS-based with classes</p>
                </div>

                <div>
                    <h4>New SegmentRendererNew (Pure JSX)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '120px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                        }}
                    >
                        <SegmentRendererNew dragDropHandler={mockDragDropHandler} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>Pure JSX with Radix Theme</p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Implementation Progress</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>✅ Placeholder component created</div>
                    <div>✅ Redux integration with useSelector</div>
                    <div>✅ Channel integration for drag state</div>
                    <div>⏳ Individual SegmentItem components</div>
                    <div>⏳ UnknownSpaceItem component</div>
                    <div>⏳ Radix CSS variables for styling</div>
                    <div>⏳ Drag visual states</div>
                    <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '8px' }}>
                        🚧 Task 2 In Progress - Building SegmentRendererNew
                    </div>
                </div>

                <div
                    style={{
                        padding: '10px',
                        backgroundColor: '#f0f8ff',
                        borderRadius: '4px',
                        marginTop: '10px',
                        fontSize: '12px',
                    }}
                >
                    <strong>Testing Capabilities:</strong>
                    <div>
                        ✅ <strong>Redux integration</strong>: Component connects directly to Redux store
                    </div>
                    <div>
                        ✅ <strong>Channel integration</strong>: Connects to drag state channel
                    </div>
                    <div>
                        ⏳ <strong>Segment rendering</strong>: Individual segments with colors
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <strong>Next Steps:</strong>
                    </div>
                    <div>
                        🔄 <strong>Component decomposition</strong>: Split into SegmentItem + UnknownSpaceItem
                    </div>
                    <div>
                        🔄 <strong>Visual implementation</strong>: Replace placeholder with real segments
                    </div>
                    <div>
                        🔄 <strong>Drag integration</strong>: Connect drag handlers and visual states
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Renders side-by-side comparison story for TDD development
 * @sig SideBySideComparisonRender :: (Object) -> JSXElement
 */
const SideBySideComparisonRender = args => (
    <MainTheme>
        <Provider store={store}>
            <StoryContent {...args} />
        </Provider>
    </MainTheme>
)

const meta = {
    title: 'Components/SegmentRendererNew',
    component: SegmentRendererNew,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'TDD story defining expected behavior for pure JSX SegmentRenderer migration from F114 specification',
            },
        },
    },
    argTypes: {
        dragDropHandler: { control: false, description: 'Drag and drop handler object with event methods' },
        // Drag state controlled via channel, not props
        isDragging: { control: 'boolean', description: 'Controls drag state via channel (not component prop)' },
        draggedIndex: {
            control: { type: 'number', min: 0, max: 2, step: 1 },
            description: 'Index of segment being dragged via channel (0-based)',
        },
    },
}

const SideBySideComparison = {
    name: 'Original vs New (TDD Development)',
    render: SideBySideComparisonRender,
    args: { isDragging: false, draggedIndex: null },
    parameters: {
        docs: {
            description: {
                story:
                    'Side-by-side comparison of original CSS-based SegmentRenderer vs new pure JSX implementation. ' +
                    'Shows development progress in real-time.',
            },
        },
    },
}

export { meta as default, SideBySideComparison }
