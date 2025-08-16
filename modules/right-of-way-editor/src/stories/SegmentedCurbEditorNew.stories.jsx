import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { SegmentedCurbEditor } from '../components/SegmentedCurbEditor/SegmentedCurbEditor.jsx'
import { SegmentedCurbEditorNew } from '../components/SegmentedCurbEditor/SegmentedCurbEditorNew.jsx'
import { DragStateDecorator } from './DragStateDecorator.jsx'
import store from '../store/index.js'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../store/curbStore.js'
import '../index.css'

/**
 * TDD Story for SegmentedCurbEditorNew - Side-by-side comparison during development
 *
 * This story provides immediate visual feedback during iterative implementation:
 * - Shows original SegmentedCurbEditor vs new SegmentedCurbEditorNew side-by-side
 * - Starts with placeholder component, evolves as features are implemented
 * - Validates props interface and Redux integration
 * - Documents expected behavior and progress
 */

/**
 * Initializes test segment data in Redux store
 * @sig initializeTestSegments :: (Function) -> Void
 */
const initializeTestSegments = dispatch => {
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
}

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()
    React.useEffect(() => initializeTestSegments(dispatch), [dispatch])
}

/**
 * Inner component that uses Redux hooks
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '800px' }}>
            <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
                <div>
                    <h4>Original SegmentedCurbEditor</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '500px',
                            width: '300px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}
                    >
                        <SegmentedCurbEditor blockfaceLength={mockTotal} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Full-featured with CSS styling
                    </p>
                </div>

                <div>
                    <h4>New SegmentedCurbEditorNew (Design System)</h4>
                    <div
                        style={{
                            position: 'relative',
                            height: '500px',
                            width: '300px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <SegmentedCurbEditorNew blockfaceLength={mockTotal} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Phase 3: Container, ruler, and controls with Radix components
                    </p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Implementation Progress - F114 Task 5</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>✅ Placeholder component created</div>
                    <div>✅ Props interface defined (minimal: blockfaceLength)</div>
                    <div>✅ Redux integration with useSelector</div>
                    <div>✅ Side-by-side Storybook comparison</div>
                    <div>✅ Test data initialization pattern</div>
                    <div>✅ Container structure replaced with Radix Box components</div>
                    <div>✅ Existing old components imported and integrated</div>
                    <div>✅ Exact visual layout preserved from original CSS</div>
                    <div>✅ Ruler tick marks migrated to Radix Box and Text components</div>
                    <div>✅ Bottom controls migrated to Radix Flex, Button, and Text</div>
                    <div>✅ Drag preview migrated to Radix Box styling</div>
                    <div>
                        ✅ All components migrated to *New versions (SegmentRendererNew, DividerLayerNew, LabelLayerNew)
                    </div>
                    <div>✅ Full Redux integration with useSelector for all components</div>
                    <div style={{ color: 'green', fontWeight: 'bold', marginTop: '8px' }}>
                        ✅ Phase 5 Complete - Full Design System Migration Achieved
                    </div>
                </div>

                <div
                    style={{
                        padding: '10px',
                        backgroundColor: '#fff3e0',
                        borderRadius: '4px',
                        marginTop: '10px',
                        fontSize: '12px',
                    }}
                >
                    <strong>Next Implementation Phases:</strong>
                    <div>
                        ✅ <strong>Phase 2</strong>: Container structure with Radix Box (COMPLETE)
                    </div>
                    <div>
                        ✅ <strong>Phase 3</strong>: Replace remaining CSS-styled sections with design system (COMPLETE)
                    </div>
                    <div>
                        ✅ <strong>Phase 4</strong>: Implement label layer with Radix components (COMPLETE)
                    </div>
                    <div>
                        ✅ <strong>Phase 5</strong>: Add drag and drop functionality (COMPLETE)
                    </div>
                    <div>
                        ⏳ <strong>Phase 6</strong>: Full feature parity testing and validation
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
                    <strong>Architectural Requirements Verified:</strong>
                    <div>
                        ✅ <strong>Minimal props</strong>: Only blockfaceLength (optional with default)
                    </div>
                    <div>
                        ✅ <strong>Redux useSelector</strong>: No prop drilling for data access
                    </div>
                    <div>
                        ✅ <strong>Channel coordination ready</strong>: For future drag state management
                    </div>
                    <div>
                        ✅ <strong>A001 compliance</strong>: Narrowest scope functions, single indentation
                    </div>
                    <div>
                        ✅ <strong>Design system patterns</strong>: Following DividerLayerNew story structure
                    </div>
                </div>

                <div
                    style={{
                        padding: '10px',
                        backgroundColor: '#e8f5e8',
                        borderRadius: '4px',
                        marginTop: '10px',
                        fontSize: '12px',
                    }}
                >
                    <strong>Testing Capabilities (Phase 1):</strong>
                    <div>
                        ✅ <strong>Redux state logging</strong>: Component logs Redux state to console
                    </div>
                    <div>
                        ✅ <strong>Props interface</strong>: blockfaceLength prop properly handled
                    </div>
                    <div>
                        ✅ <strong>Visual placeholder</strong>: Clear "Coming Soon" indication
                    </div>
                    <div>
                        ✅ <strong>State display</strong>: Shows current segment count and remaining space
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

// Mock segment data for testing
const mockTotal = 240

const meta = {
    title: 'TDD/SegmentedCurbEditorNew',
    component: SegmentedCurbEditorNew,
    decorators: [DragStateDecorator],
    parameters: { layout: 'fullscreen', docs: {} },
    argTypes: {
        blockfaceLength: {
            control: { type: 'number', min: 100, max: 500, step: 10 },
            description: 'Total blockface length in feet (optional, defaults to 240)',
        },
        // Future drag state controls (not yet implemented)
        isDragging: { control: 'boolean', description: 'Controls drag state via channel (future implementation)' },
        draggedIndex: {
            control: { type: 'number', min: 0, max: 5, step: 1 },
            description: 'Index of element being dragged via channel (future implementation)',
        },
    },
}

const SideBySideComparison = {
    name: 'Original vs New (TDD Development)',
    render: SideBySideComparisonRender,
    args: { blockfaceLength: 240, isDragging: false, draggedIndex: null },
    parameters: {},
}

export { meta as default, SideBySideComparison }
