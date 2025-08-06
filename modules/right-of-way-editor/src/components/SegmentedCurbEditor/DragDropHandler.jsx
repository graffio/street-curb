import { useRef } from 'react'
import { getBothCoordinates } from '../../utils/event-utils.js'

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
     * @sig createSwapHandler :: Function -> (Number, Number) -> Void
     */
    const createSwapHandler = updateFunction => (fromIndex, toIndex) => {
        const copy = [...segments]
        const [moved] = copy.splice(fromIndex, 1)
        copy.splice(toIndex, 0, moved)
        updateFunction(copy)
    }

    /**
     * Creates handler for desktop drag start events
     * @sig createDragStartHandler :: Number -> Event -> Void
     */
    const createDragStartHandler = index => e => {
        if (e.target.classList.contains('divider')) {
            e.preventDefault()
            return
        }

        dragData.current = { index }
        setDraggingIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    /**
     * Creates handler for desktop drop events
     * @sig createDropHandler :: Number -> Event -> Void
     */
    const createDropHandler = index => e => {
        if (e.target.classList.contains('divider')) return

        const from = dragData.current.index
        const to = index
        setDraggingIndex(null)
        if (from !== undefined && from !== to) handleSwap(from, to)
    }

    /**
     * Creates handler for unified drag start events (touch/mouse)
     * @sig createUnifiedStartHandler :: Number -> Event -> Void
     */
    const createUnifiedStartHandler = index => e => {
        if (e.target.classList.contains('divider')) return

        const coords = getBothCoordinates(e)

        dragData.current = { index, startY: coords.y, startX: coords.x, isDragging: true }

        setDraggingIndex(index)
        setDragPreviewPos({ x: coords.x, y: coords.y })
    }

    /**
     * Determines which segment index is under the given touch coordinate
     * @sig findSegmentUnderTouch :: (Element, Number) -> Number
     */
    const findSegmentUnderTouch = (container, touchCoord) => {
        const segments = Array.from(container.children).filter(el => el.classList.contains('segment'))
        if (segments.length === 0) return -1

        const containerRect = container.getBoundingClientRect()
        const relativeY = touchCoord - containerRect.top
        const segmentHeight = containerRect.height / segments.length
        const index = Math.floor(relativeY / segmentHeight)

        return Math.max(0, Math.min(index, segments.length - 1))
    }

    /**
     * Creates unified move handler for drag operations
     * @sig createMoveHandler :: Event -> Void
     */
    const createMoveHandler = e => {
        if (dragData.current.index === undefined) return

        const coords = getBothCoordinates(e)
        const container = containerRef.current
        if (!container) return

        setDragPreviewPos({ x: coords.x, y: coords.y })

        const rect = container.getBoundingClientRect()
        const coord = coords.y - rect.top
        dragData.current.targetIndex = findSegmentUnderTouch(container, coord)
    }

    /**
     * Creates unified end handler for drag operations
     * @sig createEndHandler :: Event -> Void
     */
    const createEndHandler = e => {
        if (dragData.current.index === undefined) return

        const from = dragData.current.index
        const to = dragData.current.targetIndex !== undefined ? dragData.current.targetIndex : from

        if (from !== undefined && from !== to) handleSwap(from, to)

        setDraggingIndex(null)
        setDragPreviewPos({ x: 0, y: 0 })
        dragData.current = {}
    }

    const handleSwap = createSwapHandler(onSwap)

    return {
        // Event handlers for parent to attach
        getDragStartHandler: createDragStartHandler,
        getDropHandler: createDropHandler,
        getUnifiedStartHandler: createUnifiedStartHandler,

        // Global unified handlers
        getGlobalTouchHandlers: () => ({ handleTouchMove: createMoveHandler, handleTouchEnd: createEndHandler }),
    }
}

export { DragDropHandler }
