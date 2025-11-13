import { createChannel } from '@graffio/design-system'

/**
 * Channel for coordinating UI state within SegmentedCurbEditor components
 * Domain-specific channel for editor interactions (drag, label editing, etc.)
 */
const initialDragState = {
    isDragging: false,
    draggedIndex: null,
    dragType: null, // 'divider', 'segment', etc.
    editingIndex: null, // Index of label currently being edited (dropdown open)
}

/**
 * Editor-specific drag state channel instance
 * @sig dragStateChannel :: Channel
 */
const dragStateChannel = createChannel(initialDragState)

export { dragStateChannel }
