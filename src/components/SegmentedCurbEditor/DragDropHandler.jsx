import { useRef } from 'react'

/**
 * DragDropHandler - Manages all drag and drop logic for segment reordering
 *
 * Handles both desktop and mobile drag operations with preview functionality.
 * Provides event handlers that parent components can attach to draggable elements.
 */

/**
 * DragDropHandler component for segment reordering via drag and drop
 * @sig DragDropHandler :: DragDropConfig -> DragHandlers
 */
const DragDropHandler = ({
    segments,
    onSwap,
    draggingIndex,
    setDraggingIndex,
    dragPreviewPos,
    setDragPreviewPos,
    containerRef,
}) => {
    const dragData = useRef({})

    /**
     * Creates handler for reordering segments via drag and drop
     * @sig buildSwapHandler :: Function -> (Number, Number) -> Void
     */
    const buildSwapHandler = updateFunction => (fromIndex, toIndex) => {
        const copy = [...segments]
        const [moved] = copy.splice(fromIndex, 1)
        copy.splice(toIndex, 0, moved)
        updateFunction(copy)
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
     * @sig buildTouchStartHandler :: TouchStartConfig -> Event -> Void
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
     * Checks if segment contains touch coordinate
     * @sig isSegmentUnderTouch :: (Element, Number, Number) -> Boolean
     */
    const isSegmentUnderTouch = (segment, touchCoord, totalSize) => {
        if (!segment.classList.contains('segment')) return false
        const segmentSize = segment.offsetHeight
        return touchCoord >= totalSize && touchCoord <= totalSize + segmentSize
    }

    /**
     * Checks if segment is at touch coordinate
     * @sig checkSegmentAtTouch :: (Element, Number, MutableNumber) -> Boolean
     */
    const checkSegmentAtTouch = (segment, touchCoord, sizeTracker) => {
        if (!segment.classList.contains('segment')) return false

        const found = isSegmentUnderTouch(segment, touchCoord, sizeTracker.value)
        if (found) return true

        sizeTracker.value += segment.offsetHeight
        return false
    }

    /**
     * Determines which segment index is under the given touch coordinate
     * @sig findSegmentUnderTouch :: (Element, Number) -> Number
     */
    const findSegmentUnderTouch = (container, touchCoord) => {
        const segments = Array.from(container.children)
        const sizeTracker = { value: 0 }

        return segments.findIndex(segment => checkSegmentAtTouch(segment, touchCoord, sizeTracker))
    }

    /**
     * Creates touch move handler for mobile drag operations
     * @sig createTouchMoveHandler :: Event -> Void
     */
    const createTouchMoveHandler = e => {
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

    /**
     * Creates touch end handler for mobile drag operations
     * @sig createTouchEndHandler :: Event -> Void
     */
    const createTouchEndHandler = e => {
        if (dragData.current.index === undefined) return
        e.preventDefault()

        const from = dragData.current.index
        const to = dragData.current.targetIndex !== undefined ? dragData.current.targetIndex : from

        if (from !== undefined && from !== to) handleSwap(from, to)

        setDraggingIndex(null)
        setDragPreviewPos({ x: 0, y: 0 })
        dragData.current = {}
    }

    /**
     * Creates global touch event handlers for mobile drag operations
     * @sig buildGlobalTouchHandlers :: () -> TouchHandlers
     */
    const buildGlobalTouchHandlers = () => ({
        handleTouchMove: createTouchMoveHandler,
        handleTouchEnd: createTouchEndHandler,
    })

    const handleSwap = buildSwapHandler(onSwap)

    /**
     * Creates touch start handler for specific segment index
     * @sig createTouchStartHandler :: Number -> Event -> Void
     */
    const createTouchStartHandler = i =>
        buildTouchStartHandler(dragData, setDraggingIndex, i, containerRef, setDragPreviewPos)

    /**
     * Creates global touch handlers for drag operations
     * @sig createGlobalTouchHandlers :: () -> TouchHandlers
     */
    const createGlobalTouchHandlers = () => buildGlobalTouchHandlers()

    return {
        // Event handlers for parent to attach
        getDragStartHandler: i => buildDragStartHandler(dragData, setDraggingIndex, i),
        getDropHandler: i => buildDropHandler(dragData, setDraggingIndex, handleSwap, i),
        getTouchStartHandler: createTouchStartHandler,

        // Global touch handlers
        getGlobalTouchHandlers: createGlobalTouchHandlers,

        // Utility functions
        findSegmentUnderTouch,
        isSegmentUnderTouch,
    }
}

export { DragDropHandler }
