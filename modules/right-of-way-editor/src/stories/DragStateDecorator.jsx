import React from 'react'
import { useChannel } from '@qt/design-system'
import { dragStateChannel } from '../channels/drag-state-channel.js'

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
