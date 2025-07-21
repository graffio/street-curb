import React from 'react'
import ReactDOM from 'react-dom/client'
import MapboxMap from './components/MapboxMap.jsx'
import SegmentedCurbEditor from './components/SegmentedCurbEditor.jsx'
import './index.css'

const accessToken = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg'

const App = () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <MapboxMap accessToken={accessToken} />
        <div
            style={{
                position: 'absolute',
                top: '2rem',
                left: '2rem',
                zIndex: 10,
                pointerEvents: 'none', // Allow events to pass through to map
            }}
        >
            <div style={{ pointerEvents: 'auto' }}>
                {' '}
                {/* Re-enable events just for the editor */}
                <SegmentedCurbEditor orientation="vertical" />
            </div>
        </div>
    </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
