import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { LabelLayer } from '../components/SegmentedCurbEditor/LabelLayer.jsx'
import { LabelLayerNew } from '../components/SegmentedCurbEditor/LabelLayerNew.jsx'
import {
    addSegment,
    initializeSegments,
    selectBlockfaceLength,
    selectSegments,
    updateSegmentLength,
    updateSegmentType,
} from '../store/curbStore.js'
import store from '../store/index.js'
import { DragStateDecorator } from './DragStateDecorator.jsx'
import '../index.css'

/**
 * TDD Story for LabelLayerNew - Side-by-side comparison during development
 *
 * This story provides immediate visual feedback during iterative implementation:
 * - Shows original LabelLayer vs new LabelLayerNew side-by-side
 * - Starts with placeholder component, evolves as features are implemented
 * - Validates props interface and label positioning logic
 * - Documents expected behavior and progress
 */

/**
 * Initializes test data in Redux store - worst-case collision scenario
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        // Create worst-case scenario: many short segments causing severe label collision
        dispatch(initializeSegments(320, 'storybook-collision-test'))

        // Create test scenario: 10, 10, 10, 8, 2 ft for collision detection validation
        dispatch(addSegment(-1))
        dispatch(updateSegmentLength(0, 10))
        dispatch(updateSegmentType(0, 'Parking'))

        dispatch(addSegment(0))
        dispatch(updateSegmentLength(1, 10))
        dispatch(updateSegmentType(1, 'No Parking'))

        dispatch(addSegment(1))
        dispatch(updateSegmentLength(2, 10))
        dispatch(updateSegmentType(2, 'Bus Stop'))

        dispatch(addSegment(2))
        dispatch(updateSegmentLength(3, 8))
        dispatch(updateSegmentType(3, 'Disabled'))

        dispatch(addSegment(3))
        dispatch(updateSegmentLength(4, 2))
        dispatch(updateSegmentType(4, 'Taxi'))

        dispatch(addSegment(4))
        dispatch(updateSegmentLength(5, 80))
        dispatch(updateSegmentType(5, 'Curb Cut'))

        dispatch(addSegment(5))
        dispatch(updateSegmentLength(6, 60))
        dispatch(updateSegmentType(6, 'Loading'))
    }, [dispatch])
}

/**
 * Mock event handlers for testing
 * @sig mockHandlers :: Object
 */
const mockHandlers = {
    handleChangeType: (index, type) => console.log('Change type:', index, type),
    handleAddLeft: index => console.log('Add left:', index),
    setEditingIndex: index => console.log('Set editing index:', index),
}

/**
 * Calculates tick points from segments (replicates original calculation)
 * @sig calculateTickPoints :: ([Segment]) -> [Number]
 */
const calculateTickPoints = segments =>
    segments.reduce((positions, segment, index) => {
        const start = index === 0 ? 0 : positions[index - 1] + segments[index - 1].length
        return [...positions, start]
    }, [])

/**
 * Inner component that uses Redux hooks
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()
    const [mockEditingIndex, setMockEditingIndex] = React.useState(null)

    // Get real Redux data for the old component that needs props
    const segments = useSelector(selectSegments) || []
    const total = useSelector(selectBlockfaceLength) || 0

    // Calculate derived data that original component expects
    const tickPoints = calculateTickPoints(segments)
    const effectiveBlockfaceLength = total

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', gap: '80px', marginBottom: '20px' }}>
                <div>
                    <h4>Original LabelLayer (CSS)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '400px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            display: 'flex',
                        }}
                    >
                        {/* Segment container - needs .segment-container class for CSS */}
                        <div
                            className="segment-container"
                            style={{ position: 'relative', width: '120px', height: '100%' }}
                        >
                            {/* Render segments vertically - no text inside */}
                            {segments.map((segment, index) => {
                                const startPercent = (tickPoints[index] / total) * 100
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
                                            backgroundColor: '#e3f2fd',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                )
                            })}
                        </div>

                        {/* Label layer - CSS positions it at left: 130px */}
                        <LabelLayer
                            segments={segments}
                            tickPoints={tickPoints}
                            total={total}
                            effectiveBlockfaceLength={effectiveBlockfaceLength}
                            editingIndex={mockEditingIndex}
                            setEditingIndex={setMockEditingIndex}
                            handleChangeType={mockHandlers.handleChangeType}
                            handleAddLeft={mockHandlers.handleAddLeft}
                        />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        CSS-based with collision detection
                    </p>
                </div>

                <div>
                    <h4>New LabelLayerNew (Pure JSX)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '400px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            display: 'flex',
                        }}
                    >
                        {/* Segment container for new version */}
                        <div style={{ position: 'relative', width: '120px', height: '100%' }}>
                            {/* Render segments vertically - no text inside */}
                            {segments.map((segment, index) => {
                                const startPercent = (tickPoints[index] / total) * 100
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
                                            backgroundColor: '#e3f2fd',
                                            border: '1px solid #ccc',
                                        }}
                                    />
                                )
                            })}
                        </div>

                        <div style={{ position: 'absolute', left: '130px', top: 0, right: 0, bottom: 0 }}>
                            <LabelLayerNew
                                handleChangeType={mockHandlers.handleChangeType}
                                handleAddLeft={mockHandlers.handleAddLeft}
                            />
                        </div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>Pure JSX with Radix Theme</p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Implementation Progress</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>✅ Placeholder component created</div>
                    <div>✅ Redux integration with useSelector</div>
                    <div>✅ Channel integration for editing state</div>
                    <div>✅ Eliminated prop drilling (12 props → 2 handlers)</div>
                    <div>⏳ Individual LabelItem components</div>
                    <div>⏳ Radix DropdownMenu implementation</div>
                    <div>⏳ Preserve collision detection positioning</div>
                    <div>⏳ Replace CSS classes with Radix styling</div>
                    <div style={{ color: 'orange', fontWeight: 'bold', marginTop: '8px' }}>
                        🚧 Task 3 In Progress - Building LabelLayerNew
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
                    <strong>Architectural Improvements:</strong>
                    <div>
                        ✅ <strong>Redux integration</strong>: Component connects directly to Redux store
                    </div>
                    <div>
                        ✅ <strong>Channel coordination</strong>: Uses dragStateChannel for editingIndex
                    </div>
                    <div>
                        ✅ <strong>No prop drilling</strong>: Eliminated 12 props, only essential handlers remain
                    </div>
                    <div>
                        ✅ <strong>Hybrid approach</strong>: Preserves proven positioning while modernizing architecture
                    </div>

                    <div style={{ marginTop: '8px' }}>
                        <strong>Next Steps:</strong>
                    </div>
                    <div>
                        🔄 <strong>Component decomposition</strong>: Split into LabelItem + DropdownMenu
                    </div>
                    <div>
                        🔄 <strong>Radix components</strong>: Replace CSS classes with Box/DropdownMenu
                    </div>
                    <div>
                        🔄 <strong>Positioning integration</strong>: Preserve label-positioning.js logic
                    </div>
                    <div>
                        🔄 <strong>Event coordination</strong>: Connect label clicks to channel state
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
    title: 'Components/LabelLayerNew',
    component: LabelLayerNew,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'TDD story defining expected behavior for pure JSX LabelLayer migration from F114 specification',
            },
        },
    },
    argTypes: {
        handleChangeType: { control: false, description: 'Handler for changing segment type (index, type) => void' },
        handleAddLeft: { control: false, description: 'Handler for adding segment to the left (index) => void' },
        // UI state controlled via channel, not props
        editingIndex: {
            control: { type: 'number', min: -1, max: 2, step: 1 },
            description: 'Controls editing state via channel (not component prop)',
        },
    },
}

const SideBySideComparison = {
    name: 'Original vs New (TDD Development)',
    render: SideBySideComparisonRender,
    args: { editingIndex: null },
    parameters: {
        docs: {
            description: {
                story:
                    'Side-by-side comparison of original CSS-based LabelLayer vs new pure JSX implementation. ' +
                    'Shows development progress and architectural improvements.',
            },
        },
    },
}

export { meta as default, SideBySideComparison }
