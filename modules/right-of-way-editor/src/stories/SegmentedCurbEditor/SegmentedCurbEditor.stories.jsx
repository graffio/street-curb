import { MainTheme } from '@qt/design-system'
import React from 'react'
import { Provider, useDispatch } from 'react-redux'
import { SegmentedCurbEditor } from '../../components/SegmentedCurbEditor/SegmentedCurbEditor.jsx'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from '../../store/curbStore.js'
import store from '../../store/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'
import '../../index.css'

/**
 * SegmentedCurbEditor Component Showcase
 *
 * Showcases the complete SegmentedCurbEditor with all sub-components integrated.
 * Demonstrates the full editor functionality with pure JSX and Radix design system.
 */

/**
 * Initializes test data in Redux store
 * @sig useTestData :: () -> Void
 */
const useTestData = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        dispatch(initializeSegments(240, 'editor-showcase'))
        dispatch(addSegment(-1))
        dispatch(updateSegmentLength(0, 80))
        dispatch(updateSegmentType(0, 'Parking'))
        dispatch(addSegment(0))
        dispatch(updateSegmentLength(1, 60))
        dispatch(updateSegmentType(1, 'Loading'))
        dispatch(addSegment(1))
        dispatch(updateSegmentLength(2, 50))
        dispatch(updateSegmentType(2, 'Bus Stop'))
        dispatch(addSegment(2))
        dispatch(updateSegmentLength(3, 50))
        dispatch(updateSegmentType(3, 'Parking'))
    }, [dispatch])
}

/**
 * Story content showcasing SegmentedCurbEditor component
 * @sig StoryContent :: (Object) -> JSXElement
 */
const StoryContent = args => {
    useTestData()

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>SegmentedCurbEditor Component</h3>
                    <div
                        style={{
                            position: 'relative',
                            height: '500px',
                            width: '300px',
                            backgroundColor: '#fafafa',
                            border: '2px solid #ddd',
                            borderRadius: '6px',
                            margin: '0 auto',
                        }}
                    >
                        <SegmentedCurbEditor blockfaceLength={args.blockfaceLength} />
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                        Complete editor with all sub-components integrated
                    </p>
                </div>
            </div>

            <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}>
                <h4>Component Features</h4>
                <div style={{ fontSize: '14px' }}>
                    <div>
                        ✅ <strong>Pure JSX</strong>: All components use Radix theme primitives
                    </div>
                    <div>
                        ✅ <strong>Redux Integration</strong>: Direct data access via useSelector
                    </div>
                    <div>
                        ✅ <strong>Sub-Components</strong>: SegmentRenderer, DividerLayer, LabelLayer
                    </div>
                    <div>
                        ✅ <strong>Drag & Drop</strong>: Interactive segment resizing and reordering
                    </div>
                    <div>
                        ✅ <strong>Label Management</strong>: Type selection and positioning
                    </div>
                    <div>
                        ✅ <strong>Channel Coordination</strong>: State management via channels
                    </div>
                    <div>
                        ✅ <strong>Design System</strong>: Consistent Radix theme integration
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
    title: 'SegmentedCurbEditor/SegmentedCurbEditor',
    component: SegmentedCurbEditor,
    decorators: [DragStateDecorator],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Complete curb segment editor with integrated sub-components and Radix design system',
            },
        },
    },
    argTypes: {
        blockfaceLength: {
            control: { type: 'number', min: 100, max: 500, step: 10 },
            description: 'Total blockface length in feet (optional, defaults to 240)',
        },
    },
}

const SegmentedCurbEditor_ = { name: 'SegmentedCurbEditor', render: ShowcaseRender, args: { blockfaceLength: 240 } }

export { meta as default, SegmentedCurbEditor_ }
