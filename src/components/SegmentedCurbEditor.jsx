import { useCallback, useEffect, useRef, useState } from 'react'
import { COLORS, initialSegments, STREET_LENGTH } from '../constants.js'
import DraggableDivider from './DraggableDivider.jsx'

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
 * Main component for editing segmented curb configurations with drag and drop functionality
 * @sig SegmentedCurbEditor :: () -> JSXElement
 */
const SegmentedCurbEditor = () => {
    /**
     * Creates cumulative position markers for ruler display
     * @sig buildTickPoints :: [Segment] -> [Number]
     */
    const buildTickPoints = segments => {
        const addCumulative = (acc, s) => [...acc, acc[acc.length - 1] + s.length]
        return segments.reduce(addCumulative, [0])
    }

    /**
     * Calculates vertical offsets for overlapping labels to prevent visual conflicts
     * @sig calculateLabelOffsets :: { current: [Element] } -> [Number]
     */
    const calculateLabelOffsets = labelRefs => {
        const boxes = labelRefs.current.map(el => el?.getBoundingClientRect())
        const offsets = new Array(boxes.length).fill(0)

        const hasOverlap = (a, b) => !(a.right < b.left || a.left > b.right)

        for (let i = 0; i < boxes.length; i++) {
            if (!boxes[i]) continue

            for (let j = 0; j < i; j++) {
                if (!boxes[j]) continue
                if (!hasOverlap(boxes[i], boxes[j])) continue
                if (offsets[i] <= offsets[j]) offsets[i] = offsets[j] + 1
            }
        }

        return offsets
    }

    /**
     * Creates handler for divider dragging that resizes adjacent segments
     * @sig buildDragHandler :: (Number, SetStateFn) -> (Number, Number, Number) -> Void
     */
    const buildDragHandler = (total, setSegments) =>
        useCallback(
            (index, deltaPx, containerWidth) => {
                const updateSegments = prev => {
                    const pxPerUnit = containerWidth / total
                    const deltaUnits = deltaPx / pxPerUnit
                    const left = prev[index]
                    const right = prev[index + 1]

                    if (!left || !right) return prev

                    const newLeftLength = left.length + deltaUnits
                    const newRightLength = right.length - deltaUnits
                    if (newLeftLength < 1 || newRightLength < 1) return prev

                    const next = [...prev]
                    next[index] = { ...left, length: newLeftLength }
                    next[index + 1] = { ...right, length: newRightLength }
                    return next
                }

                setSegments(updateSegments)
            },
            [total],
        )

    /**
     * Creates handler for reordering segments via drag and drop
     * @sig buildSwapHandler :: SetStateFn -> (Number, Number) -> Void
     */
    const buildSwapHandler = setSegments => (fromIndex, toIndex) => {
        const swapSegments = prev => {
            const copy = [...prev]
            const [moved] = copy.splice(fromIndex, 1)
            copy.splice(toIndex, 0, moved)
            return copy
        }

        setSegments(swapSegments)
    }

    /**
     * Creates handler for changing segment type through label dropdown
     * @sig buildChangeTypeHandler :: (SetStateFn, SetStateFn) -> (Number, String) -> Void
     */
    const buildChangeTypeHandler = (setSegments, setEditingIndex) => (index, newType) => {
        const updateType = prev => {
            const next = [...prev]
            next[index] = { ...next[index], type: newType }
            return next
        }

        setSegments(updateType)
        setEditingIndex(null)
    }

    /**
     * Creates handler for adding new segment to the left of clicked segment
     * @sig buildAddLeftHandler :: (SetStateFn, SetStateFn) -> Number -> Void
     */
    const buildAddLeftHandler = (setSegments, setEditingIndex) => index => {
        const addSegment = prev => {
            const desiredLength = 10
            const fromSegment = prev[index]
            if (!fromSegment) return prev

            const createNewSegment = () => ({
                id: 's' + Math.random().toString(36).slice(2, 7),
                type: 'Parking',
                length: desiredLength,
            })

            const canSplitCurrent = fromSegment.length >= desiredLength + 1
            if (canSplitCurrent) {
                const next = [...prev]
                next[index] = { ...fromSegment, length: fromSegment.length - desiredLength }
                next.splice(index, 0, createNewSegment())
                return next
            }

            const canSplitPrevious = index > 0 && prev[index - 1].length >= desiredLength + 1
            if (canSplitPrevious) {
                const next = [...prev]
                next[index - 1] = { ...prev[index - 1], length: prev[index - 1].length - desiredLength }
                next.splice(index, 0, createNewSegment())
                return next
            }

            return prev
        }

        setSegments(addSegment)
        setEditingIndex(null)
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
     * Determines which segment index is under the given touch x-coordinate
     * @sig findSegmentUnderTouch :: (Element, Number) -> Number
     */
    const findSegmentUnderTouch = (container, touchX) => {
        let totalWidth = 0
        const segments = container.children

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i]
            if (!segment.classList.contains('segment')) continue

            const segmentWidth = segment.offsetWidth
            if (touchX >= totalWidth && touchX <= totalWidth + segmentWidth) return i
            totalWidth += segmentWidth
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
            const x = touch.clientX - rect.left

            setDragPreviewPos({
                x: touch.clientX - rect.left - dragData.current.offsetX,
                y: touch.clientY - rect.top - dragData.current.offsetY,
            })

            dragData.current.targetIndex = findSegmentUnderTouch(container, x)
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
        const width = (segment.length / total) * 100
        const isDragging = draggingIndex === i

        return (
            <div
                key={segment.id}
                className={`segment${isDragging ? ' dragging' : ''}`}
                style={{ width: `${width}%`, backgroundColor: COLORS[segment.type] || '#999' }}
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
     * @sig renderDivider :: (Number, [Segment], Number, Function, RefObject) -> JSXElement?
     */
    const renderDivider = (i, segments, total, handleDrag, containerRef) => {
        if (i >= segments.length - 1) return null

        const calculateLeftPercent = () => {
            let leftPercent = 0
            for (let j = 0; j <= i; j++) {
                leftPercent += (segments[j].length / total) * 100
            }
            return leftPercent
        }

        const leftPercent = calculateLeftPercent()

        return (
            <div
                key={`divider-${i}`}
                className="divider"
                style={{
                    left: `${leftPercent}%`,
                    transform: 'translateX(-50%)',
                    position: 'absolute',
                    top: 0,
                    width: '40px',
                    height: '100%',
                }}
            >
                <DraggableDivider
                    onDrag={delta => {
                        if (!containerRef.current) return
                        handleDrag(i, delta, containerRef.current.offsetWidth)
                    }}
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
        labelOffsets,
        labelRefs,
        editingIndex,
        setEditingIndex,
        handleChangeType,
        handleAddLeft,
    ) => {
        const mid = tickPoints[i] + s.length / 2
        const leftPct = (mid / total) * 100
        const feet = Math.round((s.length / total) * STREET_LENGTH)

        const labelContent =
            editingIndex === i ? (
                <>
                    <span>
                        {s.type} {feet} ft
                    </span>
                    <div className="dropdown">{renderDropdownItems(handleChangeType, handleAddLeft, i)}</div>
                </>
            ) : (
                `${s.type} ${feet} ft`
            )

        return (
            <div
                key={`label-${s.id}`}
                className="floating-label"
                style={{
                    left: `${leftPct}%`,
                    top: `${labelOffsets[i] * 1.5}em`,
                    backgroundColor: COLORS[s.type] || '#999',
                }}
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
        const ft = Math.round((p / total) * STREET_LENGTH)
        const pct = (p / total) * 100
        return (
            <div key={`tick-${i}`} className="tick" style={{ left: `${pct}%` }}>
                {ft} ft
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
        return (
            <div
                className="drag-preview"
                style={{
                    position: 'absolute',
                    left: `${dragPreviewPos.x}px`,
                    top: `${dragPreviewPos.y}px`,
                    width: `${(segment.length / total) * 100}%`,
                    height: '80px',
                    backgroundColor: COLORS[segment.type] || '#999',
                    border: '2px solid rgba(255, 255, 255, 0.8)',
                    borderRadius: '6px',
                    opacity: 0.9,
                    zIndex: 200,
                    pointerEvents: 'none',
                    transform: 'scale(1.08)',
                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
                    filter: 'brightness(1.1)',
                }}
            />
        )
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
    const [segments, setSegments] = useState(initialSegments)
    const [draggingIndex, setDraggingIndex] = useState(null)
    const [editingIndex, setEditingIndex] = useState(null)
    const [dragPreviewPos, setDragPreviewPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)
    const labelRefs = useRef([])
    const [labelOffsets, setLabelOffsets] = useState([])
    const dragData = useRef({})

    // Derived values and handlers
    const total = segments.reduce((sum, s) => sum + s.length, 0)
    const handleDrag = buildDragHandler(total, setSegments)
    const handleSwap = buildSwapHandler(setSegments)
    const handleChangeType = buildChangeTypeHandler(setSegments, setEditingIndex)
    const handleAddLeft = buildAddLeftHandler(setSegments, setEditingIndex)
    const tickPoints = buildTickPoints(segments)

    // Global touch handlers for better mobile support
    useEffect(
        () => setupGlobalTouchListeners(containerRef, dragData, setDragPreviewPos, handleSwap, setDraggingIndex),
        [handleSwap],
    )

    useEffect(() => {
        setLabelOffsets(calculateLabelOffsets(labelRefs))
    }, [segments])

    return (
        <>
            <h1>Segmented Curb Editor</h1>
            <div id="editor-wrapper">
                <div className="segment-container" ref={containerRef}>
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
                    {segments.map((_, i) => renderDivider(i, segments, total, handleDrag, containerRef))}
                    {renderDragPreview(draggingIndex, dragPreviewPos, segments, total)}
                </div>

                <div className="label-layer">
                    {segments.map((s, i) =>
                        renderLabel(
                            s,
                            i,
                            tickPoints,
                            total,
                            labelOffsets,
                            labelRefs,
                            editingIndex,
                            setEditingIndex,
                            handleChangeType,
                            handleAddLeft,
                        ),
                    )}
                </div>

                <div className="ruler">{tickPoints.map((p, i) => renderTick(p, i, total))}</div>
            </div>
        </>
    )
}

export default SegmentedCurbEditor
