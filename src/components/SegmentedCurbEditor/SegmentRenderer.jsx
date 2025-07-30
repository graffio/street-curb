import { COLORS } from '../../constants.js'

/**
 * SegmentRenderer - Renders individual segments and unknown space
 *
 * This component handles the visual rendering of curb segments with proper
 * drag and drop event handlers attached.
 */

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
 * @sig renderSegment :: (Segment, Number, [Segment], Number, Number?, DragDropHandler) -> JSXElement
 *     Segment = { id: String, type: String, length: Number }
 *     DragDropHandler = { getDragStartHandler: Function, getDropHandler: Function, getTouchStartHandler: Function }
 */
const renderSegment = (segment, i, segments, total, draggingIndex, dragDropHandler, setDraggingIndex) => {
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
            onDragStart={dragDropHandler.getDragStartHandler(i)}
            onDragOver={e => e.preventDefault()}
            onDrop={dragDropHandler.getDropHandler(i)}
            onDragEnd={() => setDraggingIndex(null)}
            onMouseDown={dragDropHandler.getUnifiedStartHandler(i)}
            onTouchStart={dragDropHandler.getUnifiedStartHandler(i)}
        />
    )
}

/**
 * Main SegmentRenderer component that renders all segments and unknown space
 * @sig SegmentRenderer :: (SegmentRendererProps) -> JSXElement
 *     SegmentRendererProps = {
 *         segments: [Segment],
 *         total: Number,
 *         unknownRemaining: Number,
 *         draggingIndex: Number?,
 *         dragDropHandler: DragDropHandler,
 *         setDraggingIndex: Function
 *     }
 */
const SegmentRenderer = ({ segments, total, unknownRemaining, draggingIndex, dragDropHandler, setDraggingIndex }) => (
    <>
        {segments.map((segment, i) =>
            renderSegment(segment, i, segments, total, draggingIndex, dragDropHandler, setDraggingIndex),
        )}
        {renderUnknownSpace(unknownRemaining, total)}
    </>
)

export { SegmentRenderer }
