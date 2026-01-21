// ABOUTME: Storybook decorator for drag state channel
// ABOUTME: Syncs Storybook controls with dragStateChannel for testing
// COMPLEXITY-TODO: cohesion-structure — File predates style rules (expires 2026-04-01)

import React from 'react'
import { Channel } from '../channels/channel.js'
import { DragStateChannel } from '../channels/drag-state-channel.js'

const { dragStateChannel } = DragStateChannel

const { useChannel } = Channel

/**
 * Updates drag state channel when Storybook controls change
 * @sig updateDragStateFromArgs :: (Boolean, Number?, Function) -> Void
 */
const updateDragStateFromArgs = (isDragging, draggedIndex, setDragState) =>
    setDragState({ isDragging, draggedIndex, dragType: isDragging ? 'divider' : null })

/**
 * Storybook decorator that provides drag state channel controls
 * @sig DragStateDecorator :: (Story, Context) -> JSXElement
 */
const DragStateDecorator = (Story, context) => {
    const [, setDragState] = useChannel(dragStateChannel)
    const { isDragging = false, draggedIndex = null } = context.args

    // Update channel when Storybook controls change
    React.useEffect(
        () => updateDragStateFromArgs(isDragging, draggedIndex, setDragState),
        [isDragging, draggedIndex, setDragState],
    )

    return <Story />
}

export { DragStateDecorator }
