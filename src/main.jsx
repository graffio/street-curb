import React, { useState, useCallback } from 'react'
import ReactDOM from 'react-dom/client'
import MapboxMap from './components/MapboxMap.jsx'
import SegmentedCurbEditor from './components/SegmentedCurbEditor.jsx'
import { initialSegments, STREET_LENGTH } from './constants.js'
import './index.css'

const accessToken = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg'

const App = () => {
    const [isEditorVisible, setIsEditorVisible] = useState(false)
    const [selectedBlockface, setSelectedBlockface] = useState(null)
    const [currentSegments, setCurrentSegments] = useState(null)

    /**
     * Scales initial segments to match actual blockface length
     * @sig scaleInitialSegments :: (Number, Number) -> [Segment]
     */
    const scaleInitialSegments = (actualLength, defaultLength = STREET_LENGTH) => {
        const scale = actualLength / defaultLength
        return initialSegments.map(segment => ({ ...segment, length: Math.round(segment.length * scale) }))
    }

    /**
     * Handles blockface selection from map
     * @sig handleBlockfaceSelect :: (String, Feature, Number) -> Void
     */
    const handleBlockfaceSelect = useCallback((blockfaceId, feature, length) => {
        console.log('Blockface selected:', blockfaceId, 'Length:', length, 'feet')

        // Create initial segments scaled to blockface length
        const initialScaledSegments = scaleInitialSegments(length)

        setSelectedBlockface({ id: blockfaceId, feature, length })
        setCurrentSegments(initialScaledSegments)
        setIsEditorVisible(true)
    }, [])

    /**
     * Handles segment updates from editor
     * @sig handleSegmentsChange :: [Segment] -> Void
     */
    const handleSegmentsChange = useCallback(segments => {
        setCurrentSegments(segments)
    }, [])

    /**
     * Closes the editor
     * @sig handleEditorClose :: () -> Void
     */
    const handleEditorClose = () => {
        setIsEditorVisible(false)
        setSelectedBlockface(null)
        setCurrentSegments(null)
    }

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <h1
                style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '2rem',
                    zIndex: 5,
                    margin: 0,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: '28px',
                    fontWeight: 'bold',
                }}
            >
                Row Canvas
            </h1>

            <MapboxMap
                accessToken={accessToken}
                onBlockfaceSelect={handleBlockfaceSelect}
                selectedBlockface={selectedBlockface}
                currentSegments={currentSegments}
            />

            {/* Sliding Editor Panel */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: isEditorVisible ? '0' : '-450px',
                    width: '450px',
                    height: '100vh',
                    backgroundColor: 'white',
                    boxShadow: isEditorVisible ? '-4px 0 20px rgba(0,0,0,0.15)' : 'none',
                    transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 10,
                    pointerEvents: isEditorVisible ? 'auto' : 'none',
                    borderLeft: '1px solid #e0e0e0',
                }}
            >
                {isEditorVisible && (
                    <div
                        style={{
                            padding: '24px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                                borderBottom: '2px solid #f0f0f0',
                                paddingBottom: '16px',
                            }}
                        >
                            <h2 style={{ margin: 0, color: '#333', fontSize: '20px', fontWeight: '600' }}>
                                Edit Blockface ({selectedBlockface?.length || 0} ft)
                            </h2>
                            <button
                                onClick={handleEditorClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '28px',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#666',
                                    transition: 'background-color 0.2s, color 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.target.style.backgroundColor = '#f0f0f0'
                                    e.target.style.color = '#333'
                                }}
                                onMouseLeave={e => {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = '#666'
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Editor Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {selectedBlockface && (
                                <SegmentedCurbEditor
                                    orientation="vertical"
                                    blockfaceLength={selectedBlockface.length}
                                    blockfaceId={selectedBlockface.id}
                                    onSegmentsChange={handleSegmentsChange}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
