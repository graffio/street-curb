import { MainTheme } from '@graffio/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { DividerLayer } from '../../components/SegmentedCurbEditor/DividerLayer.jsx'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../../store/curbStore.js'
import store from '../../store/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'
import '../../index.css'

/**
 * DividerLayer Component Showcase
 *
 * Showcases the DividerLayer component in isolation with test data.
 * Demonstrates interactive thumb handles for resizing segments.
 */

/**
 * Visual segment background for component testing
 * @sig SegmentVisualizer :: ({ segments: [Segment], total: Number }) -> JSXElement
 */
const SegmentVisualizer = ({ segments, total }) => (
    <>
        {segments.map((segment, index) => {
            const startPercent = segments.slice(0, index).reduce((acc, seg) => acc + (seg.length / total) * 100, 0)
            const heightPercent = (segment.length / total) * 100
            return (
                <div
                    key={segment.id}
                    style={{
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
                    }}
                >
                    {segment.type} {segment.length}ft
                </div>
            )
        })}
    </>
)

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        dispatch(initializeSegments(240, 'divider-showcase'))
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
 * Story content showcasing DividerLayer component
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>DividerLayer Component</h3>
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
                        <SegmentVisualizer segments={mockSegments} total={mockTotal} />
                        <DividerLayer handleDirectDragStart={args.handleDirectDragStart} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Interactive divider thumbs with pure JSX styling
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
                        ✅ <strong>Interactive Thumbs</strong>: Hover and drag state visual feedback
                    </div>
                    <div>
                        ✅ <strong>Radix Styling</strong>: Uses CSS variables for consistent theming
                    </div>
                    <div>
                        ✅ <strong>Touch Support</strong>: Works on mobile and desktop
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

// Mock data for demonstration
const mockSegments = [
    { id: 1, type: 'Parking', length: 80 },
    { id: 2, type: 'Loading', length: 60 },
    { id: 3, type: 'Parking', length: 50 },
]
const mockTotal = 240

const meta = {
    title: 'SegmentedCurbEditor/DividerLayer',
    component: DividerLayer,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Interactive divider component for resizing segments with pure JSX implementation',
            },
        },
    },
    argTypes: {
        handleDirectDragStart: { action: 'drag-started' },
        isDragging: { control: 'boolean', description: 'Controls drag state via channel' },
        draggedIndex: {
            control: { type: 'number', min: 0, max: 2, step: 1 },
            description: 'Index of divider being dragged (0-based)',
        },
    },
}

const DividerLayer_ = { name: 'DividedLayer', render: ShowcaseRender, args: { isDragging: false, draggedIndex: null } }

export { meta as default, DividerLayer_ }
