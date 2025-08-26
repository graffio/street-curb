import { useChannel } from '@graffio/design-system'
import { Box } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { dragStateChannel } from '../../channels/drag-state-channel.js'
import { COLORS } from '../../constants.js'
import { selectBlockfaceLength, selectSegments, selectUnknownRemaining } from '../../store/selectors.js'

/**
 * SegmentRendererNew - Pure JSX segment renderer with Redux and channel integration
 *
 * This component replaces the CSS-dependent SegmentRenderer with pure JSX implementation.
 * Uses Radix Box components instead of CSS classes, connects directly to Redux for data,
 * and coordinates drag state via channels instead of prop drilling.
 *
 * Architecture:
 * - SegmentRendererNew: Main container, gets segments from Redux
 * - SegmentItem: Individual segment components with Redux/channel integration
 * - UnknownSpaceItem: Renders unknown space with Redux integration
 *
 * DragDropHandler Interface:
 * The dragDropHandler prop provides drag and drop event handlers:
 * - getDragStartHandler(index): Returns onDragStart handler for segment at index
 * - getDropHandler(index): Returns onDrop handler for segment at index
 * - getUnifiedStartHandler(index): Returns unified mouse/touch start handler for segment at index
 *
 * Each handler function returns an event handler function that manages:
 * - Setting drag state in Redux/channels
 * - Coordinating drag feedback across components
 * - Handling segment reordering and position updates
 *
 * Channel Coordination:
 * Uses dragStateChannel for real-time drag visual feedback:
 * - isDragging: Boolean indicating if any drag is active
 * - draggedIndex: Index of segment being dragged (null if none)
 * - dragType: Type of drag operation ('segment', 'divider', etc.)
 */

/**
 * Individual segment component with drag interaction support
 * @sig SegmentItem :: ({ segment: Segment, index: Number, dragDropHandler: DragDropHandler }) -> JSXElement
 */
const SegmentItem = ({ segment, index, dragDropHandler }) => {
    const total = useSelector(selectBlockfaceLength) || 0
    const [dragState, setDragState] = useChannel(dragStateChannel, ['isDragging', 'draggedIndex', 'dragType'])
    const isDragging = dragState.isDragging && dragState.dragType === 'segment' && dragState.draggedIndex === index

    const size = (segment.length / total) * 100
    const backgroundColor = COLORS[segment.type] || '#666'

    // Apply drag visual effects
    const style = {
        backgroundColor,
        boxSizing: 'border-box',
        height: `${size}%`,
        width: '100%',
        cursor: 'grab',
        transition: isDragging ? 'none' : 'opacity 0.2s ease-out',
        opacity: isDragging ? 0.7 : 1,
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
    }

    return (
        <Box
            style={style}
            draggable
            onDragStart={dragDropHandler.getDragStartHandler(index)}
            onDragOver={e => e.preventDefault()}
            onDrop={dragDropHandler.getDropHandler(index)}
            onDragEnd={() => setDragState({ isDragging: false, draggedIndex: null, dragType: null })}
            onMouseDown={dragDropHandler.getUnifiedStartHandler(index)}
            onTouchStart={dragDropHandler.getUnifiedStartHandler(index)}
        />
    )
}

/**
 * Unknown space component with dashed border styling
 * @sig UnknownSpaceItem :: () -> JSXElement?
 */
const UnknownSpaceItem = () => {
    const total = useSelector(selectBlockfaceLength) || 0
    const unknownRemaining = useSelector(selectUnknownRemaining) || 0

    if (unknownRemaining <= 0) return null

    const size = (unknownRemaining / total) * 100
    const style = {
        backgroundColor: '#f5f5f5',
        border: '1px dashed #ccc',
        boxSizing: 'border-box',
        height: `${size}%`,
        width: '100%',
    }

    return <Box style={style} />
}

/**
 * SegmentRendererNew - Pure JSX implementation for TDD migration
 *
 * Interactive segments rendered as pure JSX elements using Radix CSS variables.
 * No external CSS dependencies - all styling inline via style props.
 *
 * @sig SegmentRenderer :: ({ dragDropHandler: DragDropHandler }) -> JSXElement
 */
const SegmentRenderer = ({ dragDropHandler }) => {
    const segments = useSelector(selectSegments) || []

    if (!segments || segments.length === 0) return null

    return (
        <>
            {segments.map((segment, index) => (
                <SegmentItem key={segment.id} segment={segment} index={index} dragDropHandler={dragDropHandler} />
            ))}
            <UnknownSpaceItem />
        </>
    )
}

export { SegmentRenderer }
