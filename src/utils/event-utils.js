/**
 * Unified event handling utilities to eliminate touch/mouse duplication
 *
 * Provides coordinate extraction, event type detection, and unified event handlers
 * that work consistently across touch and mouse interactions.
 */

/**
 * Extracts normalized coordinates from touch or mouse events
 * @sig getEventCoordinates :: Event -> { x: Number, y: Number }
 */
const getEventCoordinates = event => {
    if (event.touches && event.touches.length > 0) {
        const touch = event.touches[0]
        return { x: touch.clientX, y: touch.clientY }
    }
    return { x: event.clientX, y: event.clientY }
}

/**
 * Detects if event is a touch event
 * @sig isTouchEvent :: Event -> Boolean
 */
const isTouchEvent = event => event.type.startsWith('touch')

/**
 * Gets primary coordinate for vertical operations (Y-axis)
 * @sig getPrimaryCoordinate :: Event -> Number
 */
const getPrimaryCoordinate = event => getEventCoordinates(event).y

/**
 * Gets both coordinates for positioning operations
 * @sig getBothCoordinates :: Event -> { x: Number, y: Number }
 */
const getBothCoordinates = event => getEventCoordinates(event)

/**
 * Creates unified event handler that works for both touch and mouse
 * @sig createUnifiedHandler :: (Event -> Void) -> Event -> Void
 */
const createUnifiedHandler = handler => event => {
    // Prevent default for touch events to avoid scrolling
    if (isTouchEvent(event)) event.preventDefault()
    return handler(event)
}

/**
 * Event type mappings for unified registration
 */
const EVENT_TYPES = {
    START: { mouse: 'mousedown', touch: 'touchstart' },
    MOVE: { mouse: 'mousemove', touch: 'touchmove' },
    END: { mouse: 'mouseup', touch: 'touchend' },
}

/**
 * Registers both touch and mouse event listeners with unified handler
 * @sig addUnifiedEventListener :: (Element, String, Function, Object?) -> () -> Void
 */
const addUnifiedEventListener = (element, eventCategory, handler, options = {}) => {
    const { mouse, touch } = EVENT_TYPES[eventCategory]
    const unifiedHandler = createUnifiedHandler(handler)

    element.addEventListener(mouse, unifiedHandler, options)
    element.addEventListener(touch, unifiedHandler, options)

    return () => {
        element.removeEventListener(mouse, unifiedHandler, options)
        element.removeEventListener(touch, unifiedHandler, options)
    }
}

/**
 * Creates drag operation manager with unified touch/mouse handling
 * @sig createDragManager :: () -> DragManager
 */
const createDragManager = () => {
    const activeCleanups = new Set()

    return {
        /**
         * Starts drag operation with unified event handling
         * @sig startDrag :: (Function, Function) -> Void
         */
        startDrag: (moveHandler, endHandler) => {
            const cleanupMove = addUnifiedEventListener(window, 'MOVE', moveHandler, { passive: false })

            const handleEnd = () => {
                endHandler()
                cleanup()
            }

            const cleanupEnd = addUnifiedEventListener(window, 'END', handleEnd)

            const cleanup = () => {
                cleanupMove()
                cleanupEnd()
                activeCleanups.delete(cleanup)
            }

            activeCleanups.add(cleanup)
            return cleanup
        },

        /**
         * Cleans up all active drag operations
         * @sig cleanup :: () -> Void
         */
        cleanup: () => {
            activeCleanups.forEach(cleanup => cleanup())
            activeCleanups.clear()
        },
    }
}

export {
    getEventCoordinates,
    isTouchEvent,
    getPrimaryCoordinate,
    getBothCoordinates,
    createUnifiedHandler,
    EVENT_TYPES,
    addUnifiedEventListener,
    createDragManager,
}
