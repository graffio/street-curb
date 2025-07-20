import { useRef } from 'react'

/**
 * @sig DraggableDivider :: ({ onDrag: Function }) -> JSXElement
 * Creates a draggable divider handle for resizing segments
 */
const DraggableDivider = ({ onDrag }) => {
    const createMouseHandlers = startX => {
        const onMove = e => {
            if (startX.current === null) return
            const delta = e.clientX - startX.current
            startX.current = e.clientX
            onDrag(delta)
        }

        const onUp = () => {
            startX.current = null
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }

        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    }

    const createTouchHandlers = startX => {
        const onTouchMove = e => {
            if (startX.current === null) return
            const delta = e.touches[0].clientX - startX.current
            startX.current = e.touches[0].clientX
            onDrag(delta)
        }

        const onTouchEnd = () => {
            startX.current = null
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }

        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('touchend', onTouchEnd)
    }

    const handleMouseDown = (startX, e) => {
        e.stopPropagation()
        e.preventDefault()
        startX.current = e.clientX
        createMouseHandlers(startX)
    }

    const handleTouchStart = (startX, e) => {
        startX.current = e.touches[0].clientX
        createTouchHandlers(startX)
    }

    const startX = useRef(null)

    return (
        <div
            className="divider"
            onMouseDown={e => handleMouseDown(startX, e)}
            onTouchStart={e => handleTouchStart(startX, e)}
        />
    )
}

export default DraggableDivider
