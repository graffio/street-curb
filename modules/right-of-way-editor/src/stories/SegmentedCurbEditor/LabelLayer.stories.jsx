import { MainTheme } from '@graffio/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { LabelLayer } from '../../components/SegmentedCurbEditor/LabelLayer.jsx'
import { addSegment, createBlockface, updateSegmentLength, updateSegmentUse } from '../../store/actions.js'
import store from '../../store/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'
import '../../index.css'

/**
 * LabelLayer Component Showcase
 *
 * Showcases the LabelLayer component in isolation with test data.
 * Demonstrates label positioning and dropdown functionality.
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
                    }}
                />
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
        dispatch(createBlockface('label-showcase', {}, 'Label Street'))
        dispatch(addSegment(-1))
        dispatch(updateSegmentLength(0, 60))
        dispatch(updateSegmentUse(0, 'Parking'))
        dispatch(addSegment(0))
        dispatch(updateSegmentLength(1, 40))
        dispatch(updateSegmentUse(1, 'Loading'))
        dispatch(addSegment(1))
        dispatch(updateSegmentLength(2, 50))
        dispatch(updateSegmentUse(2, 'Bus Stop'))
        dispatch(addSegment(2))
        dispatch(updateSegmentLength(3, 30))
        dispatch(updateSegmentUse(3, 'Disabled'))
    }, [dispatch])
}

/**
 * Mock event handlers for testing
 * @sig mockHandlers :: Object
 */
const mockHandlers = {
    handleChangeType: (index, type) => console.log('Change type:', index, type),
    handleAddLeft: index => console.log('Add left:', index),
}

/**
 * Story content showcasing LabelLayer component
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>LabelLayer Component</h3>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '400px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            margin: '0 auto',
                            display: 'flex',
                        }}
                    >
                        {/* Segment container for visual context */}
                        <div style={{ position: 'relative', width: '120px', height: '100%' }}>
                            <SegmentVisualizer segments={mockSegments} total={mockTotal} />
                        </div>

                        {/* Label layer positioned alongside segments */}
                        <div style={{ position: 'absolute', left: '130px', top: 0, right: 0, bottom: 0 }}>
                            <LabelLayer
                                handleChangeType={mockHandlers.handleChangeType}
                                handleAddLeft={mockHandlers.handleAddLeft}
                            />
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Label positioning with dropdown functionality
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
                        ✅ <strong>Label Positioning</strong>: Intelligent collision detection and slot cycling
                    </div>
                    <div>
                        ✅ <strong>Radix Dropdown</strong>: Modern dropdown implementation
                    </div>
                    <div>
                        ✅ <strong>Channel Coordination</strong>: Editing state via channels
                    </div>
                    <div>
                        ✅ <strong>Event Handlers</strong>: Type changes and segment addition
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
    { id: 1, type: 'Parking', length: 60 },
    { id: 2, type: 'Loading', length: 40 },
    { id: 3, type: 'Bus Stop', length: 50 },
    { id: 4, type: 'Disabled', length: 30 },
]
const mockTotal = 240

const meta = {
    title: 'SegmentedCurbEditor/LabelLayer',
    component: LabelLayer,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Label positioning component with dropdown functionality and collision detection',
            },
        },
    },
    argTypes: {
        handleChangeType: {
            action: 'type-changed',
            description: 'Handler for changing segment type (index, type) => void',
        },
        handleAddLeft: {
            action: 'segment-added',
            description: 'Handler for adding segment to the left (index) => void',
        },
        editingIndex: {
            control: { type: 'number', min: -1, max: 3, step: 1 },
            description: 'Index of label being edited (controlled via channel)',
        },
    },
}

const LabelLayer_ = { name: 'LabelLayer', render: ShowcaseRender, args: { editingIndex: null } }

export { meta as default, LabelLayer_ }
