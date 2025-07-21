import React from 'react'
import ReactDOM from 'react-dom/client'
import SegmentedCurbEditor from './components/SegmentedCurbEditor.jsx'
import './index.css'

const App = () => (
    <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        <div>
            <SegmentedCurbEditor orientation="horizontal" />
        </div>
        <div>
            <SegmentedCurbEditor orientation="vertical" />
        </div>
    </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
