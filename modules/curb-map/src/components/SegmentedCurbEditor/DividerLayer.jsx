// ABOUTME: Divider drag handles for SegmentedCurbEditor
// ABOUTME: Renders draggable dividers between curb segments
// COMPLEXITY-TODO: chain-extraction — File predates style rules (expires 2026-04-01)
// COMPLEXITY-TODO: cohesion-structure — File predates style rules (expires 2026-04-01)
// COMPLEXITY-TODO: import-ordering — File predates style rules (expires 2026-04-01)
// COMPLEXITY-TODO: react-redux-separation — File predates style rules (expires 2026-04-01)

import { Box } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { Channel } from '../../channels/channel.js'
import { DragStateChannel } from '../../channels/drag-state-channel.js'
import * as S from '../../store/selectors.js'
import { Blockface } from '../../types/index.js'

const { dragStateChannel } = DragStateChannel

const { useChannel } = Channel

/**
 * Gets visual state for divider thumb based on interaction state
 * @sig getVisualState :: (Boolean, Boolean) -> Object
 */
const getVisualState = (isBeingDragged, isHovered) => {
    if (isBeingDragged)
        return {
            backgroundColor: 'var(--blue-a-10)',
            border: '2px solid var(--blue-a-11)',
            boxShadow: '0 4px 12px rgba(0,100,255,0.3)',
            width: '36px',
            height: '14px',
        }

    if (isHovered)
        return {
            backgroundColor: 'var(--gray-a-10)',
            border: '1px solid var(--gray-a-12)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            width: '32px',
            height: '12px',
        }

    return {
        backgroundColor: 'var(--gray-a-8)',
        border: '1px solid var(--gray-a-10)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        width: '28px',
        height: '10px',
    }
}

/**
 * Individual divider component with hover state management
 * @sig DividerThumb :: ({ index: Number, handleDirectDragStart: Function }) -> JSXElement?
 */
const DividerThumb = ({ index, handleDirectDragStart }) => {
    const [isHovered, setIsHovered] = React.useState(false)
    const blockface = useSelector(S.currentBlockface)

    if (!blockface) return null

    const segments = blockface.segments
    const total = Blockface.totalLength(blockface)
    const unknownRemaining = Blockface.unknownRemaining(blockface)
    const [dragState] = useChannel(dragStateChannel, ['isDragging', 'draggedIndex', 'dragType'])

    const isDragging = dragState.isDragging && dragState.dragType === 'divider'
    const draggedIndex = dragState.draggedIndex

    // Allow divider after last segment if there's unknown space
    if (index >= segments.length && unknownRemaining <= 0) return null
    if (index >= segments.length - 1 && unknownRemaining <= 0) return null

    const positionPercent = segments
        .slice(0, index + 1)
        .reduce((acc, segment) => acc + (segment.length / total) * 100, 0)

    const isBeingDragged = isDragging && draggedIndex === index
    const visualState = getVisualState(isBeingDragged, isHovered)
    const style = {
        transform: 'translate(-50%, -50%)',
        borderRadius: '3px',
        cursor: 'row-resize',
        transition: isBeingDragged ? 'none' : 'all 0.15s ease-out',
        ...visualState,
    }

    return (
        <Box
            position="absolute"
            top={`${positionPercent}%`}
            left="0"
            width="100%"
            height="8px"
            style={{ transform: 'translateY(-50%)', cursor: 'row-resize', touchAction: 'none', zIndex: 100 }}
            onMouseDown={e => handleDirectDragStart(e, index)}
            onTouchStart={e => handleDirectDragStart(e, index)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Box position="absolute" top="50%" left="50%" style={style} />
        </Box>
    )
}

/**
 * DividerLayerNew - Pure JSX implementation for TDD migration
 *
 * Interactive dividers rendered as pure JSX elements using Radix CSS variables.
 * No external CSS dependencies - all styling inline via style props.
 *
 * @sig DividerLayer :: ({ handleDirectDragStart: Function }) -> JSXElement?
 */
const DividerLayer = ({ handleDirectDragStart }) => {
    const blockface = useSelector(S.currentBlockface)

    if (!blockface) return null

    const segments = blockface.segments
    const unknownRemaining = Blockface.unknownRemaining(blockface)

    if (!segments || segments.length === 0) return null

    // Create array of divider indices - one between each segment, plus final if unknown space
    const baseDividers = segments.map((_, i) => i).slice(0, -1) // All but last segment
    const finalDivider = unknownRemaining > 0 ? [segments.length - 1] : []
    const dividerIndices = [...baseDividers, ...finalDivider]

    return (
        <>
            {dividerIndices.map(index => (
                <DividerThumb key={`divider-${index}`} index={index} handleDirectDragStart={handleDirectDragStart} />
            ))}
        </>
    )
}

export { DividerLayer }
