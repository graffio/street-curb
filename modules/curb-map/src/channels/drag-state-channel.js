// ABOUTME: Drag state channel for SegmentedCurbEditor components
// ABOUTME: Coordinates drag/edit UI state between sibling components

import { Channel } from './channel.js'

const { createChannel } = Channel

const initialDragState = { isDragging: false, draggedIndex: null, dragType: null, editingIndex: null }

// @sig dragStateChannel :: Channel
const dragStateChannel = createChannel(initialDragState)

const DragStateChannel = { dragStateChannel }
export { DragStateChannel }
