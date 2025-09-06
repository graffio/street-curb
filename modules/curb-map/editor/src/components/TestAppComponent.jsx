import React from 'react'
import { useDispatch } from 'react-redux'
import { DEFAULT_STORY_GEOMETRY } from '../test-data/mock-geometries.js'
import SegmentedCurbEditor from './SegmentedCurbEditor'
import { addSegment, selectBlockface, updateSegmentLength, updateSegmentUse } from '../store/actions.js'

/**
 * Reusable test component for Storybook and other testing contexts
 * Provides isolated test environment with scenario switching
 */
const TestAppComponent = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        // Initialize with empty test data
        dispatch(selectBlockface('test-blockface', DEFAULT_STORY_GEOMETRY, 'Test Street'))

        // Expose test control functions for Playwright
        window.setTestConfig = scenarioName => {
            // Reset and apply scenario
            dispatch(
                selectBlockface(
                    `test-blockface-${scenarioName}`,
                    DEFAULT_STORY_GEOMETRY,
                    `Test Street ${scenarioName}`,
                ),
            )

            // Apply test scenarios using proper action creators
            switch (scenarioName) {
                case 'single':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 100))
                        dispatch(updateSegmentUse(0, 'Parking'))
                    }, 100)
                    break
                case 'multiple':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 80))
                        dispatch(updateSegmentUse(0, 'Parking'))
                        dispatch(addSegment(0))
                        dispatch(updateSegmentLength(1, 60))
                        dispatch(updateSegmentUse(1, 'Loading'))
                        dispatch(addSegment(1))
                        dispatch(updateSegmentLength(2, 50))
                        dispatch(updateSegmentUse(2, 'Parking'))
                    }, 100)
                    break
                case 'full':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 120))
                        dispatch(updateSegmentUse(0, 'Parking'))
                        dispatch(addSegment(0))
                        dispatch(updateSegmentLength(1, 120))
                        dispatch(updateSegmentUse(1, 'Loading'))
                    }, 100)
                    break
            }
        }
    }, [dispatch])

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>SegmentedCurbEditor Test</h1>
            <SegmentedCurbEditor />
        </div>
    )
}

export default TestAppComponent
