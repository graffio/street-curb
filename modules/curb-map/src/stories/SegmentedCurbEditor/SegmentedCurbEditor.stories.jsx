import React from 'react'
import { Provider } from 'react-redux'
import { post } from '../../commands/index.js'
import { SegmentedCurbEditor } from '../../components/SegmentedCurbEditor/SegmentedCurbEditor.jsx'
import { store } from '../../store/index.js'
import { mockOrganization, mockUser } from '../../test-data/mock-auth.js'
import { DEFAULT_STORY_GEOMETRY } from '../../test-data/mock-geometries.js'
import { Action, Blockface } from '../../types/index.js'
import { DragStateDecorator } from '../DragStateDecorator.jsx'

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
    React.useEffect(() => {
        const blockface = Blockface.from({
            id: 'blk_000000000000',
            sourceId: 'editor-showcase',
            organizationId: mockOrganization.id,
            projectId: mockOrganization.defaultProjectId,
            geometry: DEFAULT_STORY_GEOMETRY,
            streetName: 'Editor Street',
            segments: [],
            createdAt: new Date(),
            createdBy: mockUser.id,
            updatedAt: new Date(),
            updatedBy: mockUser.id,
        })

        post(Action.LoadAllInitialData(mockUser, mockOrganization))
        post(Action.SelectBlockface(blockface))
        post(Action.AddSegment(-1))
        post(Action.UpdateSegmentLength(0, 80))
        post(Action.UpdateSegmentUse(0, 'Parking'))
        post(Action.AddSegment(0))
        post(Action.UpdateSegmentLength(1, 60))
        post(Action.UpdateSegmentUse(1, 'Loading'))
        post(Action.AddSegment(1))
        post(Action.UpdateSegmentLength(2, 50))
        post(Action.UpdateSegmentUse(2, 'Bus Stop'))
        post(Action.AddSegment(2))
        post(Action.UpdateSegmentLength(3, 50))
        post(Action.UpdateSegmentUse(3, 'Parking'))
    }, [])
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
                        <SegmentedCurbEditor />
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
    <Provider store={store}>
        <StoryContent {...args} />
    </Provider>
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
    argTypes: {},
}

const SegmentedCurbEditor_ = { name: 'SegmentedCurbEditor', render: ShowcaseRender, args: {} }

export { meta as default, SegmentedCurbEditor_ }
