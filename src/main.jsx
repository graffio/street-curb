import React, { useCallback, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Provider , useDispatch, useSelector } from 'react-redux'
import CurbTable from './components/CurbTable.jsx'
import MapboxMap from './components/MapboxMap.jsx'
import SegmentedCurbEditor from './components/SegmentedCurbEditor.jsx'
import { initializeSegments, selectSegments, selectBlockfaceLength } from './store/curbStore.js'
import store from './store/index.js'
import './index.css'

const accessToken = 'pk.eyJ1IjoiZ3JhZmZpbyIsImEiOiJjbWRkZ3lkNjkwNG9xMmpuYmt4bHd2YTVvIn0.lzlmjq8mnXOSKB18lKLBpg'

const App = () => {
    const dispatch = useDispatch()
    const segments = useSelector(selectSegments)
    const blockfaceLength = useSelector(selectBlockfaceLength)

    const [selectedBlockface, setSelectedBlockface] = useState(null)
    const [isEditorVisible, setIsEditorVisible] = useState(false)
    const [showCurbTable, setShowCurbTable] = useState(false)

    /** Handles blockface selection from map
     * @sig handleBlockfaceSelect :: (String, Feature, Number) -> Void
     */
    const handleBlockfaceSelect = useCallback(
        blockfaceData => {
            console.log('Selected blockface:', blockfaceData)
            setSelectedBlockface(blockfaceData)
            setIsEditorVisible(true)

            // Initialize Redux store with new blockface
            dispatch(initializeSegments(blockfaceData.length, blockfaceData.id))
        },
        [dispatch],
    )

    /**
     * Closes the editor
     * @sig handleEditorClose :: () -> Void
     */
    const handleEditorClose = useCallback(() => {
        setIsEditorVisible(false)
    }, [])

    const toggleCurbTable = useCallback(() => {
        setShowCurbTable(prev => !prev)
    }, [])

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
                currentSegments={Array.isArray(segments) ? segments : []}
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

                        {/* Editor Toggle */}
                        {selectedBlockface && (
                            <div
                                style={{
                                    marginBottom: '16px',
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px',
                                }}
                            >
                                <label
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={showCurbTable}
                                        onChange={toggleCurbTable}
                                        style={{ marginRight: '8px' }}
                                    />
                                    Show Table View (for field data collection)
                                </label>
                            </div>
                        )}

                        {/* Editor Content */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                            {selectedBlockface &&
                                (showCurbTable ? (
                                    <div style={{ flex: 1, overflow: 'auto' }}>
                                        <CurbTable blockfaceLength={blockfaceLength} />
                                    </div>
                                ) : (
                                    <SegmentedCurbEditor
                                        orientation="vertical"
                                        blockfaceLength={blockfaceLength}
                                        blockfaceId={selectedBlockface.id}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>,
)
