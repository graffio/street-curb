import { useRef } from 'react'

/**
 * @sig DraggableDivider :: ({ onDrag: Function, orientation?: String }) -> JSXElement
 * Creates a draggable divider handle for resizing segments
 * orientation = 'horizontal' | 'vertical'
 */
const DraggableDivider = ({ onDrag, orientation = 'horizontal' }) => {
    const isVertical = orientation === 'vertical'

    const createMouseHandlers = startCoord => {
        const onMove = e => {
            if (startCoord.current === null) return
            const currentCoord = isVertical ? e.clientY : e.clientX
            const delta = currentCoord - startCoord.current
            startCoord.current = currentCoord
            onDrag(delta)
        }

        const onUp = () => {
            startCoord.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    const createTouchHandlers = startCoord => {
        const onTouchMove = e => {
            if (startCoord.current === null) return
            const currentCoord = isVertical ? e.touches[0].clientY : e.touches[0].clientX
            const delta = currentCoord - startCoord.current
            startCoord.current = currentCoord
            onDrag(delta)
        }

        const onTouchEnd = () => {
            startCoord.current = null
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }

        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
    }

    const handleMouseDown = (startCoord, e) => {
        e.stopPropagation()
        e.preventDefault()
        startCoord.current = isVertical ? e.clientY : e.clientX
        createMouseHandlers(startCoord)
    }

    const handleTouchStart = (startCoord, e) => {
        startCoord.current = isVertical ? e.touches[0].clientY : e.touches[0].clientX
        createTouchHandlers(startCoord)
    }

    const startCoord = useRef(null)
    const cursor = isVertical ? 'row-resize' : 'col-resize'

    return (
        <div
            className="draggable-divider"
            style={{ width: '100%', height: '100%', cursor, touchAction: 'none' }}
            onMouseDown={e => handleMouseDown(startCoord, e)}
            onTouchStart={e => handleTouchStart(startCoord, e)}
        />
    )
}

export default DraggableDivider
