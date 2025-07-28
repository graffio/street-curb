import { useRef } from 'react'

/**
 * @sig DraggableDivider :: ({ onDrag: Function, onDragStart?: Function, onDragEnd?: Function, orientation?: String }) -> JSXElement
 * Creates a draggable divider handle for resizing segments
 * orientation = 'horizontal' | 'vertical'
 */
const DraggableDivider = ({ onDrag, onDragStart, onDragEnd, orientation = 'horizontal' }) => {
    const isVertical = orientation === 'vertical'
    const dragState = useRef({ isDragging: false, startCoord: null, totalDelta: 0 })

    const createMouseHandlers = () => {
        const onMove = e => {
            if (!dragState.current.isDragging) return
            const currentCoord = isVertical ? e.clientY : e.clientX
            const totalDelta = currentCoord - dragState.current.startCoord
            const incrementalDelta = totalDelta - dragState.current.totalDelta
            dragState.current.totalDelta = totalDelta
            onDrag(incrementalDelta)
        }

        const onUp = () => {
            dragState.current.isDragging = false
            dragState.current.startCoord = null
            dragState.current.totalDelta = 0
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
            onDragEnd?.()
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    const createTouchHandlers = () => {
        const onTouchMove = e => {
            if (!dragState.current.isDragging) return
            const currentCoord = isVertical ? e.touches[0].clientY : e.touches[0].clientX
            const totalDelta = currentCoord - dragState.current.startCoord
            const incrementalDelta = totalDelta - dragState.current.totalDelta
            dragState.current.totalDelta = totalDelta
            onDrag(incrementalDelta)
        }

        const onTouchEnd = () => {
            dragState.current.isDragging = false
            dragState.current.startCoord = null
            dragState.current.totalDelta = 0
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
            onDragEnd?.()
        }

        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
    }

    const handleMouseDown = e => {
        e.stopPropagation()
        e.preventDefault()
        dragState.current.isDragging = true
        dragState.current.startCoord = isVertical ? e.clientY : e.clientX
        dragState.current.totalDelta = 0
        onDragStart?.()
        createMouseHandlers()
    }

    const handleTouchStart = e => {
        dragState.current.isDragging = true
        dragState.current.startCoord = isVertical ? e.touches[0].clientY : e.touches[0].clientX
        dragState.current.totalDelta = 0
        onDragStart?.()
        createTouchHandlers()
    }
    const cursor = isVertical ? 'row-resize' : 'col-resize'

    return (
        <div
            className="draggable-divider"
            style={{ width: '100%', height: '100%', cursor, touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        />
    )
}

export default DraggableDivider
