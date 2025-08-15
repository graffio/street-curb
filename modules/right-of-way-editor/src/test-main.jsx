import { MainTheme } from '@qt/design-system'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider, useDispatch } from 'react-redux'
import SegmentedCurbEditor from './components/SegmentedCurbEditor'
import { addSegment, initializeSegments, updateSegmentLength, updateSegmentType } from './store/curbStore.js'
import store from './store/index.js'
import './index.css'

/**
 * Test harness for Playwright tests
 * Provides isolated test environment with scenario switching
 */
const TestApp = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        // Initialize with empty test data
        dispatch(initializeSegments(240, 'test-blockface'))

        // Expose test control functions for Playwright
        window.setTestConfig = scenarioName => {
            // Reset and apply scenario
            dispatch(initializeSegments(240, `test-blockface-${scenarioName}`))

            // Apply test scenarios using proper action creators
            switch (scenarioName) {
                case 'single':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 100))
                        dispatch(updateSegmentType(0, 'Parking'))
                    }, 100)
                    break
                case 'multiple':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 80))
                        dispatch(updateSegmentType(0, 'Parking'))
                        dispatch(addSegment(0))
                        dispatch(updateSegmentLength(1, 60))
                        dispatch(updateSegmentType(1, 'Loading'))
                        dispatch(addSegment(1))
                        dispatch(updateSegmentLength(2, 50))
                        dispatch(updateSegmentType(2, 'Parking'))
                    }, 100)
                    break
                case 'full':
                    setTimeout(() => {
                        dispatch(addSegment(-1))
                        dispatch(updateSegmentLength(0, 120))
                        dispatch(updateSegmentType(0, 'Parking'))
                        dispatch(addSegment(0))
                        dispatch(updateSegmentLength(1, 120))
                        dispatch(updateSegmentType(1, 'Loading'))
                    }, 100)
                    break
            }
        }
    }, [dispatch])

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>SegmentedCurbEditor Test</h1>
            <SegmentedCurbEditor blockfaceLength={240} />
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <MainTheme>
            <Provider store={store}>
                <TestApp />
            </Provider>
        </MainTheme>
    </React.StrictMode>,
)
