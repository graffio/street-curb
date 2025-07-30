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
    selectUnknownRemaining,
    updateSegmentLength,
} from '../../store/curbStore.js'
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
    const unknownRemaining = useSelector(selectUnknownRemaining) || 0

    // Use Redux values if available, otherwise use props
    const effectiveBlockfaceLength = reduxBlockfaceLength || blockfaceLength

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
        const ft = formatLength((p / total) * effectiveBlockfaceLength)
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
     * @sig renderDragPreview :: (Number?, { x: Number, y: Number }, [Segment], Number) -> JSXElement?
     */
    const renderDragPreview = (draggingIndex, dragPreviewPos, segments, total) => {
        if (draggingIndex === null) return null

        const segment = segments[draggingIndex]
        const size = (segment.length / total) * 100

        const previewStyle = {
            position: 'absolute',
            left: `${dragPreviewPos.x}px`,
            top: `${dragPreviewPos.y}px`,
            backgroundColor: COLORS[segment.type] || '#999',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            borderRadius: '6px',
            opacity: 0.9,
            zIndex: 200,
            pointerEvents: 'none',
            transform: 'scale(1.08)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            filter: 'brightness(1.1)',
            width: '80px',
            height: `${size}%`,
        }

        return <div className="drag-preview" style={previewStyle} />
    }

    /**
     * Sets up and manages global touch event listeners for mobile drag operations
     * @sig setupGlobalTouchListeners :: () -> () -> Void
     */
    const setupGlobalTouchListeners = () => {
        const container = containerRef.current
        if (!container) return

        const { handleTouchMove, handleTouchEnd } = dragDropHandler.getGlobalTouchHandlers()

        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }

    // Component state and refs
    // Segments are now managed by Redux
    const [draggingIndex, setDraggingIndex] = useState(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const [dragPreviewPos, setDragPreviewPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)
    // Drag and drop handler
    const dragDropHandler = DragDropHandler({
        segments,
        onSwap: newSegments => dispatch(replaceSegments(newSegments)),
        draggingIndex,
        setDraggingIndex,
        dragPreviewPos,
        setDragPreviewPos,
        containerRef,
    })

    // Derived values and handlers - total includes unknown space for visual rendering
    const total = effectiveBlockfaceLength // Use full blockface length for visual calculations

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
     * Handles drag move events with length adjustment
     * @sig createDragMoveHandler :: (Number, Number, Function, Number, Number) -> (Event) -> Void
     */
    const createDragMoveHandler = (index, total, dispatch, unknownRemaining, segments) => moveEvent => {
        if (!dragState.current.isDragging) return

        const currentCoord = moveEvent.type === 'touchmove' ? moveEvent.touches[0].clientY : moveEvent.clientY
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
     * Creates drag end cleanup handler
     * @sig createDragEndCleanup :: (Function) -> () -> Void
     */
    const createDragEndCleanup = handleMove => () => {
        dragState.current = { isDragging: false, startCoord: null, startLength: null, index: null }
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('touchmove', handleMove)
        window.removeEventListener('mouseup', createDragEndCleanup(handleMove))
        window.removeEventListener('touchend', createDragEndCleanup(handleMove))
    }

    /**
     * Handles drag end events with cleanup
     * @sig createDragEndHandler :: (Function) -> Function
     */
    const createDragEndHandler = handleMove => createDragEndCleanup(handleMove)

    /**
     * Handles direct drag start for dividers
     * @sig handleDirectDragStartImpl :: (Event, Number) -> Void
     */
    const handleDirectDragStartImpl = (e, index) => {
        e.preventDefault()
        e.stopPropagation()

        const segment = segments[index]
        if (!segment) return

        const startCoord = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
        dragState.current = { isDragging: true, startCoord, startLength: segment.length, index }

        const handleMove = createDragMoveHandler(index, total, dispatch, unknownRemaining, segments)
        const handleEnd = createDragEndHandler(handleMove)

        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleEnd)
        window.addEventListener('touchmove', handleMove, { passive: false })
        window.addEventListener('touchend', handleEnd)
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

    // Global touch handlers for better mobile support
    useEffect(() => setupGlobalTouchListeners(), [dragDropHandler])

    const containerClassName = 'segment-container vertical'

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
                        draggingIndex={draggingIndex}
                        dragDropHandler={dragDropHandler}
                        setDraggingIndex={setDraggingIndex}
                    />
                    <DividerLayer
                        segments={segments}
                        total={total}
                        unknownRemaining={unknownRemaining}
                        handleDirectDragStart={handleDirectDragStart}
                    />
                    {renderDragPreview(draggingIndex, dragPreviewPos, segments, total)}
                </div>

                <LabelLayer
                    segments={segments}
                    tickPoints={tickPoints}
                    total={total}
                    effectiveBlockfaceLength={effectiveBlockfaceLength}
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
