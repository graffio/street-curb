import { Box, tokens } from '@qt/design-system'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS } from '../../constants.js'
import {
    addSegment,
    addSegmentLeft,
    replaceSegments,
    selectBlockfaceLength,
    selectCumulativePositions,
    selectSegments,
    updateSegmentLength,
} from '../../store/curbStore.js'
import { addUnifiedEventListener, createDragManager, getPrimaryCoordinate } from '../../utils/event-utils.js'
import { formatLength, roundToPrecision } from '../../utils/formatting.js'
import { DividerLayer } from './DividerLayer.jsx'
import { DragDropHandler } from './DragDropHandler.jsx'
import { LabelLayerNew } from './LabelLayerNew.jsx'
import { SegmentRenderer } from './SegmentRenderer.jsx'

/**
 * SegmentedCurbEditorNew - Redesigned street curb configuration editor
 *
 * Phase 2: Container Structure Only - Incremental Implementation
 * This component replaces ONLY the outer container structure with Radix components:
 * - Uses Radix Box instead of div#editor-wrapper and div.segment-container
 * - Imports existing old components: SegmentRenderer, DividerLayer, LabelLayer (unchanged)
 * - Preserves exact same layout, dimensions, and positioning
 * - Maintains all drag logic and event handlers
 */

/**
 * Main component for editing segmented curb configurations with drag and drop functionality (vertical orientation only)
 * @sig SegmentedCurbEditorNew :: ({ blockfaceLength?: Number, blockfaceId?: String }) -> JSXElement
 */
const SegmentedCurbEditorNew = ({ blockfaceLength = 240 }) => {
    /**
     * Creates handler for changing segment type through label dropdown
     * @sig buildChangeTypeHandler :: (Function, SetStateFn) -> (Number, String) -> Void
     */
    const buildChangeTypeHandler = (updateRedux, setEditingIndex) => (index, newType) => {
        const next = [...segments]
        next[index] = { ...next[index], type: newType }
        updateRedux(next)
        setEditingIndex(null)
    }

    /**
     * Renders individual ruler tick mark with distance label
     * @sig renderTick :: (Number, Number, Number) -> JSXElement
     */
    const renderTick = (p, i, total) => {
        const ft = formatLength((p / total) * total)
        const pct = (p / total) * 100

        const tickStyle = { top: `${pct}%` }

        return (
            <div key={`tick-${i}`} className="tick" style={tickStyle}>
                {ft}
            </div>
        )
    }

    /**
     * Renders floating preview of dragged segment for mobile touch interactions
     * @sig renderDragPreview :: (Object?, [Segment], Number) -> JSXElement?
     */
    const renderDragPreview = (segmentDragState, segments, total) => {
        if (!segmentDragState?.segmentIndex || !segmentDragState?.previewPos) return null

        const segment = segments[segmentDragState.segmentIndex]
        if (!segment) return null

        const size = (segment.length / total) * 100

        const previewStyle = {
            position: 'absolute',
            left: `${segmentDragState.previewPos.x || 0}px`,
            top: `${segmentDragState.previewPos.y || 0}px`,
            backgroundColor: COLORS[segment.type] || tokens.SegmentedCurbEditor.fallback,
            border: `${tokens.SegmentedCurbEditor.borderWidth} solid ${tokens.SegmentedCurbEditor.overlay}`,
            borderRadius: tokens.SegmentedCurbEditor.borderRadius,
            opacity: 0.9,
            zIndex: 200,
            pointerEvents: 'none',
            width: tokens.SegmentedCurbEditor.previewWidth,
            height: `${size}%`,
        }

        return <div className="drag-preview" style={previewStyle} />
    }

    /**
     * Sets up and manages global unified event listeners for drag operations
     * @sig setupGlobalEventListeners :: () -> () -> Void
     */
    const setupGlobalEventListeners = () => {
        const container = containerRef.current
        if (!container) return

        const { handleTouchMove, handleTouchEnd } = dragDropHandler.getGlobalTouchHandlers()

        // Use unified event handling for better cross-platform support
        const cleanupMove = addUnifiedEventListener(container, 'MOVE', handleTouchMove, { passive: false })
        const cleanupEnd = addUnifiedEventListener(container, 'END', handleTouchEnd)

        return () => {
            cleanupMove()
            cleanupEnd()
        }
    }

    /**
     * Handles drag move events with length adjustment (unified touch/mouse) - uses local state for smooth updates
     * @sig createDragMoveHandler :: (Number, Number, Function, Number, Number) -> (Event) -> Void
     */
    const createDragMoveHandler = (index, total, dispatch, unknownRemaining, segments) => moveEvent => {
        if (!dragState.current.isDragging) return

        const currentCoord = getPrimaryCoordinate(moveEvent)
        const deltaPixels = currentCoord - dragState.current.startCoord

        if (!containerRef.current) return
        const containerSize = containerRef.current.offsetHeight
        const pxPerUnit = containerSize / total
        const deltaUnits = deltaPixels / pxPerUnit
        const newLength = roundToPrecision(dragState.current.startLength + deltaUnits)

        // Allow going to exactly 0 if close enough (within thumb constraint distance)
        if (newLength < 0.1) {
            // For zero snap, still need to sync to Redux immediately
            try {
                dispatch(updateSegmentLength(index, dragState.current.startLength + unknownRemaining))
            } catch (error) {
                console.warn('Invalid segment adjustment:', error.message)
            }
            return
        }

        try {
            dispatch(updateSegmentLength(index, newLength))
        } catch (error) {
            console.warn('Invalid segment adjustment:', error.message)
        }
    }

    /**
     * Creates drag end cleanup handler (unified touch/mouse)
     * @sig createDragEndCleanup :: () -> Void
     */
    const createDragEndCleanup = () =>
        (dragState.current = { isDragging: false, startCoord: null, startLength: null, index: null })

    /**
     * Handles direct drag start for dividers (unified touch/mouse)
     * @sig handleDirectDragStartImpl :: (Event, Number) -> Void
     */
    const handleDirectDragStartImpl = (e, index) => {
        const handleEnd = () => {
            createDragEndCleanup()
            dragManager.cleanup()
        }

        e.preventDefault()
        e.stopPropagation()

        const segment = segments[index]
        if (!segment) return

        const startCoord = getPrimaryCoordinate(e)
        dragState.current = { isDragging: true, startCoord, startLength: segment.length, index }

        const dragManager = createDragManager()
        const handleMove = createDragMoveHandler(index, total, dispatch, unknownRemaining, segments)

        dragManager.startDrag(handleMove, handleEnd)
    }

    /**
     * Renders bottom controls for segment creation and remaining space display
     * @sig renderBottomControls :: (Number, Number, Function) -> JSXElement
     */
    const renderBottomControls = (unknownRemaining, segmentsLength, dispatch) => (
        <div className="segment-controls-bottom">
            <div className="remaining-space-info">Remaining: {formatLength(unknownRemaining)} ft</div>
            <div className="add-buttons-container">
                {segmentsLength === 0 && unknownRemaining > 0 && (
                    <button className="add-segment-button" onClick={() => dispatch(addSegment(0))}>
                        + Add First Segment
                    </button>
                )}
                {segmentsLength > 0 && unknownRemaining > 0 && (
                    <button className="add-segment-button" onClick={() => dispatch(addSegment(segmentsLength))}>
                        + Add Segment
                    </button>
                )}
            </div>
        </div>
    )

    const dispatch = useDispatch()
    const segments = useSelector(selectSegments) || []
    const reduxBlockfaceLength = useSelector(selectBlockfaceLength)

    // Use Redux values if available, otherwise use props
    const total = reduxBlockfaceLength || blockfaceLength

    // Calculate remaining space locally
    const segmentsLength = segments.reduce((sum, segment) => sum + segment.length, 0)
    const unknownRemaining = total - segmentsLength

    // Component state and refs
    // Segments are now managed by Redux
    const [segmentDragState, setSegmentDragState] = useState(null)
    const containerRef = useRef(null)

    // Drag and drop handler
    const dragDropHandler = DragDropHandler({
        segments,
        onSwap: newSegments => dispatch(replaceSegments(newSegments)),
        draggingIndex: segmentDragState?.segmentIndex ?? null,
        setDraggingIndex: index =>
            setSegmentDragState(
                index !== null
                    ? { segmentIndex: index, previewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 } }
                    : null,
            ),
        dragPreviewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 },
        setDragPreviewPos: pos =>
            setSegmentDragState(
                segmentDragState ? { ...segmentDragState, previewPos: pos } : { segmentIndex: null, previewPos: pos },
            ),
        containerRef,
    })

    // Direct drag implementation without DraggableDivider
    const dragState = useRef({ isDragging: false, startCoord: null, startLength: null, index: null })

    const handleDirectDragStart = useCallback(handleDirectDragStartImpl, [segments, total, dispatch, unknownRemaining])
    const handleChangeType = buildChangeTypeHandler(
        newSegments => dispatch(replaceSegments(newSegments)),
        () => {}, // setEditingIndex not needed since we removed it
    )

    const handleAddLeft = useCallback(
        index => {
            dispatch(addSegmentLeft(index))
        },
        [dispatch],
    )
    const tickPoints = useSelector(selectCumulativePositions)

    // Redux handles blockface initialization and segment management

    // Global unified event handlers for better cross-platform support
    useEffect(() => setupGlobalEventListeners(), [dragDropHandler])

    return (
        <>
            <Box style={{ position: 'relative', width: '100%' }}>
                <Box
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        height: '400px',
                        width: '80px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible',
                        userSelect: 'none',
                        touchAction: 'manipulation',
                    }}
                >
                    <SegmentRenderer
                        segments={segments}
                        total={total}
                        unknownRemaining={unknownRemaining}
                        draggingIndex={segmentDragState?.segmentIndex ?? null}
                        dragDropHandler={dragDropHandler}
                        setDraggingIndex={index =>
                            setSegmentDragState(
                                index !== null
                                    ? {
                                          segmentIndex: index,
                                          previewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 },
                                      }
                                    : null,
                            )
                        }
                    />
                    <DividerLayer
                        segments={segments}
                        total={total}
                        unknownRemaining={unknownRemaining}
                        handleDirectDragStart={handleDirectDragStart}
                    />
                    {renderDragPreview(segmentDragState, segments, total)}
                </Box>

                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '130px',
                        width: 'auto',
                        minWidth: '60px',
                        height: '400px',
                    }}
                >
                    <LabelLayerNew handleChangeType={handleChangeType} handleAddLeft={handleAddLeft} />
                </Box>

                <div className="ruler">{tickPoints.map((p, i) => renderTick(p, i, total))}</div>

                {renderBottomControls(unknownRemaining, segments.length, dispatch)}
            </Box>
        </>
    )
}

export { SegmentedCurbEditorNew }
