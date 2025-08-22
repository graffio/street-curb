import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { SegmentedCurbEditorNew } from '../components/SegmentedCurbEditor/SegmentedCurbEditorNew.jsx'
import { DragStateDecorator } from './DragStateDecorator.jsx'
import store from '../store/index.js'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../store/curbStore.js'
import '../index.css'

/**
 * SegmentedCurbEditorNew - Design System Implementation
 *
 * Showcases the fully migrated SegmentedCurbEditor using pure JSX and Radix design system:
 * - Complete Redux integration with useSelector
 * - Channel coordination for UI state management
 * - All sub-components use Radix theme components
 * - Full feature parity with legacy implementation
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
 * Story content showcasing the new implementation
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>
                        SegmentedCurbEditor - Design System Implementation
                    </h3>
                    <div
                        style={{
                            position: 'relative',
                            height: '500px',
                            width: '300px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            margin: '0 auto',
                        }}
                    >
                        <SegmentedCurbEditorNew blockfaceLength={mockTotal} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Pure JSX with Radix theme components
                    </p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Architecture Features</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>
                        ✅ <strong>Pure JSX</strong>: All components use Radix theme primitives, no CSS classes
                    </div>
                    <div>
                        ✅ <strong>Redux Integration</strong>: Direct useSelector data access, minimal prop drilling
                    </div>
                    <div>
                        ✅ <strong>Channel Coordination</strong>: Drag state and UI coordination via channels
                    </div>
                    <div>
                        ✅ <strong>Component Decomposition</strong>: Individual components for each UI concern
                    </div>
                    <div>
                        ✅ <strong>Design System</strong>: Consistent Radix theme integration throughout
                    </div>
                    <div>
                        ✅ <strong>Performance</strong>: Optimized rendering with React.memo and useLayoutEffect
                    </div>
                    <div style={{ color: 'green', fontWeight: 'bold', marginTop: '8px' }}>
                        ✅ F114 Migration Complete - Production Ready
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Renders the new design system implementation story
 * @sig DesignSystemRender :: (Object) -> JSXElement
 */
const DesignSystemRender = args => (
    <MainTheme>
        <Provider store={store}>
            <StoryContent {...args} />
        </Provider>
    </MainTheme>
)

// Mock segment data for testing
const mockTotal = 240

const meta = {
    title: 'Components/SegmentedCurbEditorNew',
    component: SegmentedCurbEditorNew,
    decorators: [DragStateDecorator],
    parameters: { layout: 'fullscreen', docs: {} },
    argTypes: {
        blockfaceLength: {
            control: { type: 'number', min: 100, max: 500, step: 10 },
            description: 'Total blockface length in feet (optional, defaults to 240)',
        },
    },
}

const DesignSystemImplementation = {
    name: 'Design System Implementation',
    render: DesignSystemRender,
    args: { blockfaceLength: 240 },
    parameters: {},
}

export { meta as default, DesignSystemImplementation }
