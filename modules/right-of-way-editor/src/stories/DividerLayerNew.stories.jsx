import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider , useDispatch } from 'react-redux'
import { DividerLayer } from '../components/SegmentedCurbEditor/DividerLayer.jsx'
import { DividerLayerNew } from '../components/SegmentedCurbEditor/DividerLayerNew.jsx'
import { DragStateDecorator } from './DragStateDecorator.jsx'
import store from '../store/index.js'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../store/curbStore.js'
import '../index.css'

/**
 * TDD Story for DividerLayerNew - Side-by-side comparison during development
 *
 * This story provides immediate visual feedback during iterative implementation:
 * - Shows original DividerLayer vs new DividerLayerNew side-by-side
 * - Starts with placeholder component, evolves as features are implemented
 * - Validates props interface and positioning logic
 * - Documents expected behavior and progress
 */

/**
 * Maps segment data to visual div elements for testing backdrop
 * @sig mapSegmentToDiv :: (Segment, Number, [Segment], Number) -> JSXElement
 */
const mapSegmentToDiv = (segment, index, segments, total) => {
    const startPercent = segments.slice(0, index).reduce((acc, seg) => acc + (seg.length / total) * 100, 0)
    const heightPercent = (segment.length / total) * 100

    const backgroundStyle = {
        position: 'absolute',
        top: `${startPercent}%`,
        left: 0,
        width: '100%',
        height: `${heightPercent}%`,
        backgroundColor: index % 2 === 0 ? '#e3f2fd' : '#f3e5f5',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#333',
    }
    return (
        <div key={segment.id} style={backgroundStyle}>
            {segment.type} {segment.length}ft
        </div>
    )
}

/**
 * Renders visual segment background for consistent testing
 * @sig SegmentVisualizer :: ({ segments: [Segment], total: Number, unknownRemaining: Number }) -> JSXElement
 */
const SegmentVisualizer = ({ segments, total, unknownRemaining }) => (
    <>
        {segments.map((segment, index) => mapSegmentToDiv(segment, index, segments, total))}

        {unknownRemaining > 0 && (
            <div
                style={{
                    position: 'absolute',
                    top: `${(segments.reduce((acc, seg) => acc + seg.length, 0) / total) * 100}%`,
                    left: 0,
                    width: '100%',
                    height: `${(unknownRemaining / total) * 100}%`,
                    backgroundColor: '#fff3e0',
                    border: '1px dashed #ff9800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#666',
                }}
            >
                Unknown {unknownRemaining}ft
            </div>
        )}
    </>
)

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        dispatch(initializeSegments(mockTotal, 'storybook-test'))
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
 * Inner component that uses Redux hooks
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                    <h4>Original DividerLayer (CSS)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '120px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                        }}
                    >
                        <SegmentVisualizer
                            segments={mockSegments}
                            total={mockTotal}
                            unknownRemaining={mockUnknownRemaining}
                        />
                        <DividerLayer
                            segments={mockSegments}
                            total={mockTotal}
                            unknownRemaining={mockUnknownRemaining}
                            handleDirectDragStart={args.handleDirectDragStart}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        CSS-based with pseudo-elements
                    </p>
                </div>

                <div>
                    <h4>New DividerLayerNew (Pure JSX)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '120px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                        }}
                    >
                        <SegmentVisualizer
                            segments={mockSegments}
                            total={mockTotal}
                            unknownRemaining={mockUnknownRemaining}
                        />
                        <DividerLayerNew handleDirectDragStart={args.handleDirectDragStart} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>Pure JSX with Radix Theme</p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Implementation Progress</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>✅ Props interface defined and logging</div>
                    <div>✅ Expected positioning calculated</div>
                    <div>✅ Pure JSX thumb handles</div>
                    <div>✅ React state hover effects</div>
                    <div>✅ Mouse and touch interactions</div>
                    <div>✅ Radix CSS variables for styling</div>
                    <div>✅ Drag visual states (blue highlight)</div>
                    <div>✅ Redux integration with useSelector</div>
                    <div style={{ color: 'green', fontWeight: 'bold', marginTop: '8px' }}>
                        🎉 Task Complete - DividerLayerNew with Redux!
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
                        ✅ <strong>Visual drag states</strong>: Use controls isDragging=true, draggedIndex=0-2 to see
                        blue highlighting
                    </div>
                    <div>
                        ✅ <strong>Hover effects</strong>: Mouse over thumbs to see size/shadow changes
                    </div>
                    <div>
                        ✅ <strong>Redux integration</strong>: Component connects directly to Redux store
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <strong>Testing Limitations:</strong>
                    </div>
                    <div>
                        ❌ <strong>Real dragging</strong>: Thumbs don't move on drag - missing drag handlers
                    </div>
                    <div>
                        ❌ <strong>Segment updates</strong>: No real-time segment length changes
                    </div>
                    <div>
                        📍 <strong>Full testing</strong>: Use TestApp for complete drag functionality
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

// Mock segment data for testing divider positioning
const mockSegments = [
    { id: 1, type: 'Parking', length: 80 },
    { id: 2, type: 'Loading', length: 60 },
    { id: 3, type: 'Parking', length: 50 },
]

const mockTotal = 240
const mockUnknownRemaining = 50

const meta = {
    title: 'TDD/DividerLayerNew',
    component: DividerLayerNew,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'TDD story defining expected behavior for pure JSX DividerLayer migration from F114 specification',
            },
        },
    },
    argTypes: {
        handleDirectDragStart: { action: 'drag-started' },
        // Drag state controlled via channel, not props
        isDragging: { control: 'boolean', description: 'Controls drag state via channel (not component prop)' },
        draggedIndex: {
            control: { type: 'number', min: 0, max: 2, step: 1 },
            description: 'Index of divider being dragged via channel (0-based)',
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
                    'Side-by-side comparison of original CSS-based DividerLayer vs new pure JSX implementation. ' +
                    'Shows development progress in real-time.',
            },
        },
    },
}

export { meta as default, SideBySideComparison }
