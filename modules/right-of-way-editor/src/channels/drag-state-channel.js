import { createChannel } from '@qt/design-system'

/**
 * Channel for coordinating drag state within SegmentedCurbEditor components
 * Domain-specific channel for editor drag interactions
 */
const initialDragState = {
    isDragging: false,
    draggedIndex: null,
    dragType: null, // 'divider', 'segment', etc.
}

/**
 * Editor-specific drag state channel instance
 * @sig dragStateChannel :: Channel
 */
const dragStateChannel = createChannel(initialDragState)

export { dragStateChannel }
