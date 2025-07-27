import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { COLORS, formatLength, roundToPrecision } from '../constants.js'
import { calculateLabelPositions } from '../label-positioning.js'
import {
    addSegment,
    replaceSegments,
    selectBlockfaceLength,
    selectSegments,
    selectUnknownRemaining,
    updateSegmentLength,
} from '../store/curbStore.js'

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
     * Creates cumulative position markers for ruler display including unknown space
     * @sig buildTickPoints :: ([Segment], Number) -> [Number]
     */
    const buildTickPoints = (segments, unknownRemaining) => {
        const addCumulative = (acc, s) => [...acc, acc[acc.length - 1] + s.length]
        const segmentTicks = segments.reduce(addCumulative, [0])

        // Add final tick point including unknown space if it exists
        if (unknownRemaining > 0) {
            const lastPoint = segmentTicks[segmentTicks.length - 1]
            return [...segmentTicks, lastPoint + unknownRemaining]
        }

        return segmentTicks
    }

    /**
     * Creates handler for divider dragging that uses universal boundary adjustment
     * @sig buildDragHandler :: (Number, Function) -> (Number, Number, Number) -> Void
     */

    /**
     * Creates handler for reordering segments via drag and drop
     * @sig buildSwapHandler :: Function -> (Number, Number) -> Void
     */
    const buildSwapHandler = updateRedux => (fromIndex, toIndex) => {
        const copy = [...segments]
        const [moved] = copy.splice(fromIndex, 1)
        copy.splice(toIndex, 0, moved)
        updateRedux(copy)
    }

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
     * Creates handler for adding new segment to the left of clicked segment
     * @sig buildAddLeftHandler :: (Function, SetStateFn) -> Number -> Void
     */
    const buildAddLeftHandler = (updateRedux, setEditingIndex) => index => {
        const desiredLength = 10
        const fromSegment = segments[index]
        if (!fromSegment) return

        const createNewSegment = () => ({
            id: 's' + Math.random().toString(36).slice(2, 7),
            type: 'Parking',
            length: roundToPrecision(desiredLength),
        })

        const canSplitCurrent = fromSegment.length >= desiredLength + 1
        if (canSplitCurrent) {
            const next = [...segments]
            next[index] = { ...fromSegment, length: roundToPrecision(fromSegment.length - desiredLength) }
            next.splice(index, 0, createNewSegment())
            updateRedux(next)
            setEditingIndex(null)
            return
        }

        const canSplitPrevious = index > 0 && segments[index - 1].length >= desiredLength + 1
        if (canSplitPrevious) {
            const next = [...segments]
            next[index - 1] = {
                ...segments[index - 1],
                length: roundToPrecision(segments[index - 1].length - desiredLength),
            }
            next.splice(index, 0, createNewSegment())
            updateRedux(next)
            setEditingIndex(null)
        }
    }

    /**
     * Creates handler for desktop drag start events
     * @sig buildDragStartHandler :: (RefObject, SetStateFn, Number) -> Event -> Void
     */
    const buildDragStartHandler = (dragData, setDraggingIndex, i) => e => {
        if (e.target.classList.contains('divider')) {
            e.preventDefault()
            return
        }

        dragData.current = { index: i }
        setDraggingIndex(i)
        e.dataTransfer.effectAllowed = 'move'
    }

    /**
     * Creates handler for desktop drop events
     * @sig buildDropHandler :: (RefObject, SetStateFn, Function, Number) -> Event -> Void
     */
    const buildDropHandler = (dragData, setDraggingIndex, handleSwap, i) => e => {
        if (e.target.classList.contains('divider')) return

        const from = dragData.current.index
        const to = i
        setDraggingIndex(null)
        if (from !== undefined && from !== to) handleSwap(from, to)
    }

    /**
     * Creates handler for mobile touch start events with drag preview setup
     * @sig buildTouchStartHandler :: (RefObject, SetStateFn, Number, RefObject, SetStateFn) -> Event -> Void
     */
    const buildTouchStartHandler = (dragData, setDraggingIndex, i, containerRef, setDragPreviewPos) => e => {
        if (e.target.classList.contains('divider')) return
        e.preventDefault()

        const touch = e.touches[0]
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return

        const targetRect = e.target.getBoundingClientRect()
        const offsetX = touch.clientX - targetRect.left
        const offsetY = touch.clientY - targetRect.top

        dragData.current = {
            index: i,
            startY: touch.clientY,
            startX: touch.clientX,
            isDragging: true,
            offsetX,
            offsetY,
        }

        setDraggingIndex(i)
        setDragPreviewPos({ x: touch.clientX - rect.left - offsetX, y: touch.clientY - rect.top - offsetY })
    }

    /**
     * Creates handler for label click events to toggle dropdown
     * @sig buildLabelClickHandler :: (Number?, SetStateFn, Number) -> Event -> Void
     */
    const buildLabelClickHandler = (editingIndex, setEditingIndex, i) => e => {
        e.stopPropagation()
        setEditingIndex(editingIndex === i ? null : i)
    }

    /**
     * Creates handler for dropdown type selection
     * @sig buildTypeClickHandler :: (Function, Number) -> (Event, String) -> Void
     */
    const buildTypeClickHandler = (handleChangeType, i) => (e, type) => {
        e.stopPropagation()
        handleChangeType(i, type)
    }

    /**
     * Creates handler for "Add left" dropdown option
     * @sig buildAddLeftClickHandler :: (Function, Number) -> Event -> Void
     */
    const buildAddLeftClickHandler = (handleAddLeft, i) => e => {
        e.stopPropagation()
        handleAddLeft(i)
    }

    /**
     * Determines which segment index is under the given touch coordinate
     * @sig findSegmentUnderTouch :: (Element, Number) -> Number
     */
    const findSegmentUnderTouch = (container, touchCoord) => {
        let totalSize = 0
        const segments = container.children

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]
            if (!segment.classList.contains('segment')) continue

            const segmentSize = segment.offsetHeight
            if (touchCoord >= totalSize && touchCoord <= totalSize + segmentSize) return i
            totalSize += segmentSize
        }

        return -1
    }

    /**
     * Creates global touch event handlers for mobile drag operations
     * @sig buildGlobalTouchHandlers :: (RefObject, RefObject, SetStateFn, Function, SetStateFn) -> { handleTouchMove: Function, handleTouchEnd: Function }
     */
    const buildGlobalTouchHandlers = (containerRef, dragData, setDragPreviewPos, handleSwap, setDraggingIndex) => {
        const handleTouchMove = e => {
            if (dragData.current.index === undefined) return
            e.preventDefault()

            const touch = e.touches[0]
            const container = containerRef.current
            if (!container) return

            const rect = container.getBoundingClientRect()
            const coord = touch.clientY - rect.top

            setDragPreviewPos({
                x: touch.clientX - rect.left - dragData.current.offsetX,
                y: touch.clientY - rect.top - dragData.current.offsetY,
            })

            dragData.current.targetIndex = findSegmentUnderTouch(container, coord)
        }

        const handleTouchEnd = e => {
            if (dragData.current.index === undefined) return
            e.preventDefault()

            const from = dragData.current.index
            const to = dragData.current.targetIndex !== undefined ? dragData.current.targetIndex : from

            if (from !== undefined && from !== to) handleSwap(from, to)

            setDraggingIndex(null)
            setDragPreviewPos({ x: 0, y: 0 })
            dragData.current = {}
        }

        return { handleTouchMove, handleTouchEnd }
    }

    /**
     * Renders Unknown space as visual element without text (text will be in label)
     * @sig renderUnknownSpace :: (Number, Number) -> JSXElement?
     */
    const renderUnknownSpace = (unknownRemaining, total) => {
        if (unknownRemaining <= 0) return null

        const size = (unknownRemaining / total) * 100
        const unknownStyle = {
            backgroundColor: '#f0f0f0',
            border: '2px dashed #ccc',
            boxSizing: 'border-box',
            height: `${size}%`,
            width: '100%',
        }

        return <div key="unknown-space" className="unknown-space" style={unknownStyle} />
    }

    /**
     * Renders individual segment with drag and drop capabilities
     * @sig renderSegment :: (Segment, Number, [Segment], Number, Number?, RefObject, SetStateFn, Function, RefObject, SetStateFn) -> JSXElement
     */
    const renderSegment = (
        segment,
        i,
        segments,
        total,
        draggingIndex,
        dragData,
        setDraggingIndex,
        handleSwap,
        containerRef,
        setDragPreviewPos,
    ) => {
        const size = (segment.length / total) * 100
        const isDragging = draggingIndex === i

        const segmentStyle = {
            backgroundColor: COLORS[segment.type] || '#999',
            boxSizing: 'border-box',
            height: `${size}%`,
            width: '100%',
        }

        return (
            <div
                key={segment.id}
                className={`segment${isDragging ? ' dragging' : ''}`}
                style={segmentStyle}
                draggable
                onDragStart={buildDragStartHandler(dragData, setDraggingIndex, i)}
                onDragOver={e => e.preventDefault()}
                onDrop={buildDropHandler(dragData, setDraggingIndex, handleSwap, i)}
                onDragEnd={() => setDraggingIndex(null)}
                onTouchStart={buildTouchStartHandler(dragData, setDraggingIndex, i, containerRef, setDragPreviewPos)}
            />
        )
    }

    /**
     * Renders draggable divider between segments for resizing
     * @sig renderDivider :: (Number, [Segment], Number, RefObject) -> JSXElement?
     */
    const renderDivider = (i, segments, total) => {
        // Allow divider after last segment if there's unknown space
        if (i >= segments.length && unknownRemaining <= 0) return null
        if (i >= segments.length - 1 && unknownRemaining <= 0) return null

        const calculatePositionPercent = () => {
            let positionPercent = 0
            for (let j = 0; j <= i; j++) {
                positionPercent += (segments[j].length / total) * 100
            }
            return positionPercent
        }

        const positionPercent = calculatePositionPercent()

        const dividerStyle = {
            position: 'absolute',
            top: `${positionPercent}%`,
            transform: 'translateY(-50%)',
            left: 0,
            width: '100%',
            height: '40px',
        }

        return (
            <div
                key={`divider-${i}-${segments.length}`}
                className="divider"
                style={{ ...dividerStyle, cursor: 'row-resize', touchAction: 'none' }}
                onMouseDown={e => handleDirectDragStart(e, i)}
                onTouchStart={e => handleDirectDragStart(e, i)}
            >
                <div
                    style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '2px' }}
                />
            </div>
        )
    }

    /**
     * Renders dropdown menu items for segment type changing and addition
     * @sig renderDropdownItems :: (Function, Function, Number) -> JSXElement
     */
    const renderDropdownItems = (handleChangeType, handleAddLeft, i) => (
        <>
            {Object.keys(COLORS).map(type => (
                <div
                    key={type}
                    className="dropdown-item"
                    style={{ backgroundColor: COLORS[type] }}
                    onClick={e => buildTypeClickHandler(handleChangeType, i)(e, type)}
                >
                    {type}
                </div>
            ))}
            <div
                className="dropdown-item"
                style={{ backgroundColor: 'red', textAlign: 'center', marginTop: '10px' }}
                onClick={buildAddLeftClickHandler(handleAddLeft, i)}
            >
                + Add left
            </div>
        </>
    )

    /**
     * Renders floating label with interactive dropdown for segment configuration
     * @sig renderLabel :: (Segment, Number, [Number], Number, [Number], RefObject, Number?, SetStateFn, Function, Function) -> JSXElement
     */
    const renderLabel = (
        s,
        i,
        tickPoints,
        total,
        smartLabelPositions,
        labelRefs,
        editingIndex,
        setEditingIndex,
        handleChangeType,
        handleAddLeft,
    ) => {
        const mid = tickPoints[i] + s.length / 2
        const positionPct = (mid / total) * 100
        const feet = formatLength((s.length / total) * effectiveBlockfaceLength)

        const labelStyle = {
            backgroundColor: COLORS[s.type] || '#999',
            top: `${positionPct}%`,
            left: `${smartLabelPositions[i] || 0}px`,
            transform: 'translateY(-50%)',
            width: uniformLabelWidth > 0 ? `${uniformLabelWidth}px` : 'auto',
        }

        const labelContent =
            editingIndex === i ? (
                <>
                    <span>
                        {s.type} {feet}
                    </span>
                    <div className="dropdown">{renderDropdownItems(handleChangeType, handleAddLeft, i)}</div>
                </>
            ) : (
                `${s.type} ${feet}`
            )

        return (
            <div
                key={`label-${s.id}`}
                className="floating-label"
                style={labelStyle}
                ref={el => (labelRefs.current[i] = el)}
                onClick={buildLabelClickHandler(editingIndex, setEditingIndex, i)}
            >
                {labelContent}
            </div>
        )
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
     * @sig setupGlobalTouchListeners :: (RefObject, RefObject, SetStateFn, Function, SetStateFn) -> () -> Void
     */
    const setupGlobalTouchListeners = (containerRef, dragData, setDragPreviewPos, handleSwap, setDraggingIndex) => {
        const container = containerRef.current
        if (!container) return

        const { handleTouchMove, handleTouchEnd } = buildGlobalTouchHandlers(
            containerRef,
            dragData,
            setDragPreviewPos,
            handleSwap,
            setDraggingIndex,
        )

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
    const labelRefs = useRef([])
    const [smartLabelPositions, setSmartLabelPositions] = useState([])
    const [uniformLabelWidth, setUniformLabelWidth] = useState(0)
    const dragData = useRef({})

    // Derived values and handlers - total includes unknown space for visual rendering
    const total = effectiveBlockfaceLength // Use full blockface length for visual calculations

    // Direct drag implementation without DraggableDivider
    const dragState = useRef({ isDragging: false, startCoord: null, startLength: null, index: null })

    const handleDirectDragStart = useCallback(
        (e, index) => {
            e.preventDefault()
            e.stopPropagation()

            const segment = segments[index]
            if (!segment) return

            const startCoord = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY

            dragState.current = { isDragging: true, startCoord, startLength: segment.length, index }

            const handleMove = moveEvent => {
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
                    const segment = segments[index]
                    if (segment && unknownRemaining > 0 && unknownRemaining < 1) {
                        // Snap to zero when very close
                        try {
                            dispatch(updateSegmentLength(index, dragState.current.startLength + unknownRemaining))
                        } catch (error) {
                            console.warn('Invalid segment adjustment:', error.message)
                        }
                    }
                    return
                }

                try {
                    dispatch(updateSegmentLength(index, newLength))
                } catch (error) {
                    console.warn('Invalid segment adjustment:', error.message)
                }
            }

            const handleEnd = () => {
                dragState.current = { isDragging: false, startCoord: null, startLength: null, index: null }
                window.removeEventListener('mousemove', handleMove)
                window.removeEventListener('mouseup', handleEnd)
                window.removeEventListener('touchmove', handleMove)
                window.removeEventListener('touchend', handleEnd)
            }

            window.addEventListener('mousemove', handleMove)
            window.addEventListener('mouseup', handleEnd)
            window.addEventListener('touchmove', handleMove, { passive: false })
            window.addEventListener('touchend', handleEnd)
        },
        [segments, total, dispatch, unknownRemaining],
    )
    const handleSwap = buildSwapHandler(newSegments => dispatch(replaceSegments(newSegments)))
    const handleChangeType = buildChangeTypeHandler(
        newSegments => dispatch(replaceSegments(newSegments)),
        setEditingIndex,
    )
    const handleAddLeft = buildAddLeftHandler(newSegments => dispatch(replaceSegments(newSegments)), setEditingIndex)
    const tickPoints = buildTickPoints(segments, unknownRemaining)

    // Redux handles blockface initialization and segment management

    // Global touch handlers for better mobile support
    useEffect(
        () => setupGlobalTouchListeners(containerRef, dragData, setDragPreviewPos, handleSwap, setDraggingIndex),
        [handleSwap],
    )

    useEffect(() => {
        // Use requestAnimationFrame to ensure labels are rendered before calculating offsets
        const calculateOffsets = () => {
            const { positions, contentWidth } = calculateLabelPositions(true, labelRefs.current) // Always vertical
            setSmartLabelPositions(positions)
            setUniformLabelWidth(contentWidth) // Store contentWidth for CSS
        }

        const timeoutId = setTimeout(calculateOffsets, 0)
        return () => clearTimeout(timeoutId)
    }, [segments])

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
                    {segments.map((segment, i) =>
                        renderSegment(
                            segment,
                            i,
                            segments,
                            total,
                            draggingIndex,
                            dragData,
                            setDraggingIndex,
                            handleSwap,
                            containerRef,
                            setDragPreviewPos,
                        ),
                    )}
                    {renderUnknownSpace(unknownRemaining, total)}
                    {segments.map((_, i) => renderDivider(i, segments, total, containerRef))}
                    {unknownRemaining > 0 &&
                        segments.length > 0 &&
                        renderDivider(segments.length - 1, segments, total, containerRef)}
                    {renderDragPreview(draggingIndex, dragPreviewPos, segments, total)}
                </div>

                <div className="label-layer">
                    {segments.map((s, i) =>
                        renderLabel(
                            s,
                            i,
                            tickPoints,
                            total,
                            smartLabelPositions,
                            labelRefs,
                            editingIndex,
                            setEditingIndex,
                            handleChangeType,
                            handleAddLeft,
                        ),
                    )}
                </div>

                <div className="ruler">{tickPoints.map((p, i) => renderTick(p, i, total))}</div>

                {renderBottomControls(unknownRemaining, segments.length, dispatch)}
            </div>
        </>
    )
}

export default SegmentedCurbEditor
