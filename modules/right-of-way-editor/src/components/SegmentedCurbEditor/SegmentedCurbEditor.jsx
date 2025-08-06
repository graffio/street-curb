import { useCallback, useEffect, useRef, useState } from 'react'
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
import { LabelLayer } from './LabelLayer.jsx'
import { SegmentRenderer } from './SegmentRenderer.jsx'

/**
 * SegmentedCurbEditor - Interactive street curb configuration editor
 *
 * This component provides a visual interface for designing street curb layouts with:
 *
 * - Drag-and-drop segment reordering (both desktop and mobile)
 * - Resizable segment boundaries via dividers
 * - Interactive labels with type changing and segment addition
 * - Visual drag preview for mobile touch interactions
 * - Responsive layout calculations and overlap handling
 *
 * The implementation follows functional programming principles with single-level
 * indentation, early returns, and pure functions for state updates.
 */

/**
 * Main component for editing segmented curb configurations with drag and drop functionality (vertical orientation only)
 * @sig SegmentedCurbEditor :: ({ blockfaceLength?: Number, blockfaceId?: String }) -> JSXElement
 */
const SegmentedCurbEditor = ({ blockfaceLength = 240 }) => {
    const dispatch = useDispatch()
    const segments = useSelector(selectSegments) || []
    const reduxBlockfaceLength = useSelector(selectBlockfaceLength)

    // Use Redux values if available, otherwise use props
    const total = reduxBlockfaceLength || blockfaceLength

    // Calculate remaining space locally
    const segmentsLength = segments.reduce((sum, segment) => sum + segment.length, 0)
    const unknownRemaining = total - segmentsLength

    /**
     * Creates handler for divider dragging that uses universal boundary adjustment
     * @sig buildDragHandler :: (Number, Function) -> (Number, Number, Number) -> Void
     */

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
        if (!segmentDragState?.segmentIndex) return null

        const segment = segments[segmentDragState.segmentIndex]
        const size = (segment.length / total) * 100

        const previewStyle = {
            position: 'absolute',
            left: `${segmentDragState.previewPos.x}px`,
            top: `${segmentDragState.previewPos.y}px`,
            backgroundColor: COLORS[segment.type] || '#999',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '6px',
            opacity: 0.9,
            zIndex: 200,
            pointerEvents: 'none',
            width: '80px',
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

    // Component state and refs
    // Segments are now managed by Redux
    const [segmentDragState, setSegmentDragState] = useState(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const containerRef = useRef(null)

    // Drag and drop handler
    const dragDropHandler = DragDropHandler({
        segments,
        onSwap: newSegments => dispatch(replaceSegments(newSegments)),
        draggingIndex: segmentDragState?.segmentIndex ?? null,
        setDraggingIndex: index =>
            setSegmentDragState(index !== null ? { ...segmentDragState, segmentIndex: index } : null),
        dragPreviewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 },
        setDragPreviewPos: pos =>
            setSegmentDragState(segmentDragState ? { ...segmentDragState, previewPos: pos } : null),
        containerRef,
    })

    // Direct drag implementation without DraggableDivider
    const dragState = useRef({ isDragging: false, startCoord: null, startLength: null, index: null })

    /**
     * Attempts zero snap adjustment when length is very small
     * @sig attemptZeroSnap :: (Number, Number, Number, Function) -> Void
     */
    const attemptZeroSnap = (index, unknownRemaining, segments, dispatch) => {
        const segment = segments[index]
        if (!segment) return
        if (unknownRemaining <= 0) return
        if (unknownRemaining >= 1) return

        // Snap to zero when very close
        try {
            dispatch(updateSegmentLength(index, dragState.current.startLength + unknownRemaining))
        } catch (error) {
            console.warn('Invalid segment adjustment:', error.message)
        }
    }

    /**
     * Handles drag move events with length adjustment (unified touch/mouse)
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
            attemptZeroSnap(index, unknownRemaining, segments, dispatch)
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
        e.preventDefault()
        e.stopPropagation()

        const segment = segments[index]
        if (!segment) return

        const startCoord = getPrimaryCoordinate(e)
        dragState.current = { isDragging: true, startCoord, startLength: segment.length, index }

        const dragManager = createDragManager()
        const handleMove = createDragMoveHandler(index, total, dispatch, unknownRemaining, segments)
        const handleEnd = () => {
            createDragEndCleanup()
            dragManager.cleanup()
        }

        dragManager.startDrag(handleMove, handleEnd)
    }

    const handleDirectDragStart = useCallback(handleDirectDragStartImpl, [segments, total, dispatch, unknownRemaining])
    const handleChangeType = buildChangeTypeHandler(
        newSegments => dispatch(replaceSegments(newSegments)),
        setEditingIndex,
    )
    /**
     * Handles adding segment to the left
     * @sig handleAddLeftImpl :: Number -> Void
     */
    const handleAddLeftImpl = index => {
        dispatch(addSegmentLeft(index))
        setEditingIndex(null)
    }

    const handleAddLeft = useCallback(handleAddLeftImpl, [dispatch])
    const tickPoints = useSelector(selectCumulativePositions)

    // Redux handles blockface initialization and segment management

    // Global unified event handlers for better cross-platform support
    useEffect(() => setupGlobalEventListeners(), [dragDropHandler])

    const containerClassName = 'segment-container'

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

    return (
        <>
            <div id="editor-wrapper">
                <div className={containerClassName} ref={containerRef}>
                    <SegmentRenderer
                        segments={segments}
                        total={total}
                        unknownRemaining={unknownRemaining}
                        draggingIndex={segmentDragState?.segmentIndex ?? null}
                        dragDropHandler={dragDropHandler}
                        setDraggingIndex={index =>
                            setSegmentDragState(index !== null ? { ...segmentDragState, segmentIndex: index } : null)
                        }
                    />
                    <DividerLayer
                        segments={segments}
                        total={total}
                        unknownRemaining={unknownRemaining}
                        handleDirectDragStart={handleDirectDragStart}
                    />
                    {renderDragPreview(segmentDragState, segments, total)}
                </div>

                <LabelLayer
                    segments={segments}
                    tickPoints={tickPoints}
                    total={total}
                    effectiveBlockfaceLength={total}
                    editingIndex={editingIndex}
                    setEditingIndex={setEditingIndex}
                    handleChangeType={handleChangeType}
                    handleAddLeft={handleAddLeft}
                />

                <div className="ruler">{tickPoints.map((p, i) => renderTick(p, i, total))}</div>

                {renderBottomControls(unknownRemaining, segments.length, dispatch)}
            </div>
        </>
    )
}

export { SegmentedCurbEditor }
