import { useChannel } from '@graffio/design-system'
import { Box, DropdownMenu, Text } from '@radix-ui/themes'
import React, { useState, useLayoutEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { dragStateChannel } from '../../channels/drag-state-channel.js'
import { COLORS } from '../../constants.js'
import { Blockface } from '@graffio/types/generated/right-of-way/index.js'
import * as S from '../../store/selectors.js'
import { formatLength } from '../../utils/formatting.js'
import { calculateSimplePositions } from './label-positioning-simple.js'

/**
 * Individual menu item for segment type selection
 * @sig TypeMenuItem :: ({ type: String, segment: Segment, isSelected: Boolean, onSelect: String -> Void }) -> JSXElement
 */
const TypeMenuItem = ({ type, isSelected, onSelect }) => (
    <DropdownMenu.Item
        key={type}
        onSelect={() => onSelect(type)}
        style={{ backgroundColor: isSelected ? 'var(--accent-3)' : undefined }}
    >
        <Box
            style={{
                width: '12px',
                height: '12px',
                backgroundColor: COLORS[type],
                borderRadius: '2px',
                marginRight: '8px',
            }}
        />
        <Text size="2">{type}</Text>
    </DropdownMenu.Item>
)

// Layout constants
const LABEL_VERTICAL_OFFSET = 12 // Half label height for centering

// Reserved for future fixed-width implementation:
// const calculateOptimalLabelWidth = () => {
//     const longestSegmentType = Math.max(...Object.keys(COLORS).map(type => type.length))
//     const maxReasonableLength = "399.9 ft".length
//     const totalChars = longestSegmentType + 1 + maxReasonableLength
//     const CHAR_WIDTH = 6.5, PADDING = 16
//     return Math.ceil(totalChars * CHAR_WIDTH + PADDING)
// }

/**
 * Individual label dropdown menu component with Radix DropdownMenu primitives
 * @sig LabelDropdownMenu :: React.memo(({ segment: Segment, index: Number, isOpen: Boolean,
 *                                         onClose: () -> Void, handleChangeType: (Number, String) -> Void,
 *                                         handleAddLeft: Number -> Void }) -> JSXElement)
 */
const LabelDropdownMenu = React.memo(({ segment, index, isOpen, onClose, handleChangeType, handleAddLeft }) => {
    const segmentTypes = Object.keys(COLORS)

    const handleTypeSelect = type => {
        handleChangeType(index, type)
        onClose()
    }

    const handleAddLeftClick = () => {
        handleAddLeft(index)
        onClose()
    }

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={open => !open && onClose()}>
            <DropdownMenu.Trigger asChild>
                <Box />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size="2">
                <DropdownMenu.Item onSelect={handleAddLeftClick}>
                    <Text size="2">Add Left</Text>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                {segmentTypes.map(type => (
                    <TypeMenuItem
                        key={type}
                        type={type}
                        isSelected={segment.use === type}
                        onSelect={handleTypeSelect}
                    />
                ))}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    )
})

/**
 * Individual label component with drag interaction support and hover state
 * @sig LabelItem :: React.memo(React.forwardRef(({ segment: Segment, index: Number,
 *                                                 position: { top: Number, left: Number },
 *                                                 width: Number, contentWidth: Number,
 *                                                 handleChangeType: (Number, String) -> Void,
 *                                                 handleAddLeft: Number -> Void }) -> JSXElement))
 */
const LabelItem = React.memo(
    React.forwardRef(({ segment, index, position, width, contentWidth, handleChangeType, handleAddLeft }, ref) => {
        const handleLabelClick = () => setDragState({ editingIndex: isEditing ? null : index })
        const handleDropdownClose = () => setDragState({ editingIndex: null })

        const [isHovered, setIsHovered] = useState(false)
        const [dragState, setDragState] = useChannel(dragStateChannel, ['editingIndex'])
        const labelRef = useRef(null)

        const isEditing = dragState.editingIndex === index
        const effectiveWidth = Math.max(width, 80) // Component enforces minimum width

        // Synchronous position updates using useLayoutEffect for instant responsiveness
        useLayoutEffect(() => {
            if (labelRef.current) {
                labelRef.current.style.top = `calc(${position.top}% - ${LABEL_VERTICAL_OFFSET}px)`
                labelRef.current.style.left = `${position.left}px`
                labelRef.current.style.width = `${effectiveWidth}px`
            }
        }, [position.top, position.left, effectiveWidth])

        const labelStyle = {
            position: 'absolute',
            // Remove top, left, width from here since useLayoutEffect handles them
            backgroundColor: COLORS[segment.use] || '#666',
            color: 'white',
            padding: '3px 6px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: isHovered ? '2px solid var(--accent-8)' : '1px solid rgba(0,0,0,0.2)',
            boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'all 0.15s ease-out',
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
            zIndex: isHovered || isEditing ? 1000 : 100,
            pointerEvents: 'auto',
            whiteSpace: 'nowrap', // Prevent text wrapping
        }

        return (
            <>
                <Box
                    ref={labelRef}
                    style={labelStyle}
                    onClick={handleLabelClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {segment.use} {formatLength(segment.length)}
                </Box>

                {isEditing && (
                    <LabelDropdownMenu
                        segment={segment}
                        index={index}
                        isOpen={isEditing}
                        onClose={handleDropdownClose}
                        handleChangeType={handleChangeType}
                        handleAddLeft={handleAddLeft}
                    />
                )}
            </>
        )
    }),
)

/**
 * Calculates label positions using memoized computation
 * @sig calculateMemoizedPositions :: ([Segment], Number, Number?) -> LabelPositions
 */
const calculateMemoizedPositions = (segments, blockfaceLength) =>
    !segments.length || !blockfaceLength
        ? { positions: [], uniformWidth: 0, contentWidth: 0 }
        : calculateSimplePositions(segments, blockfaceLength)

/**
 * Calculates vertical positions for segment midpoints
 * @sig calculateSegmentPositions :: ([Segment], Number) -> [Number]
 */
const calculateSegmentPositions = (segments, blockfaceLength) => {
    if (!blockfaceLength) return []

    let currentPosition = 0
    return segments.map(segment => {
        // Calculate midpoint like original: tickPoints[index] + segment.length / 2
        const midpoint = currentPosition + segment.length / 2
        const position = (midpoint / blockfaceLength) * 100
        currentPosition += segment.length
        return position
    })
}

/**
 * Creates label item element for rendering
 * @sig createLabelItem :: (LabelPositions, [Number], Function, Function) ->
 *                         (Segment, Number) -> JSXElement
 */
const createLabelItem = (labelPositions, segmentPositions, handleChangeType, handleAddLeft) => (segment, index) => {
    const segmentTop = segmentPositions[index] || 0

    return (
        <LabelItem
            key={index}
            segment={segment}
            index={index}
            position={{ top: segmentTop, left: labelPositions.positions[index] || 0 }}
            width={labelPositions.uniformWidth || 80}
            contentWidth={labelPositions.contentWidth || 60}
            handleChangeType={handleChangeType}
            handleAddLeft={handleAddLeft}
        />
    )
}

/**
 * LabelLayerNew - Pure JSX label renderer with optimized performance
 *
 * Uses Radix Box components and receives data via props for optimal performance.
 * Coordinates label UI state via channels instead of prop drilling.
 *
 * Architecture:
 * - LabelLayerNew: Main container, receives segments/blockfaceLength as props
 * - LabelItem: Individual label components with channel integration and hover state
 * - LabelDropdownMenu: Radix-based dropdown for type selection and actions
 *
 * Performance Optimization:
 * - Receives segments and blockfaceLength as props (no Redux selectors)
 * - Parent component handles local drag state for smooth updates
 * - Labels render immediately when parent state changes
 *
 * Channel Coordination:
 * Uses dragStateChannel for UI state coordination:
 * - editingIndex: Index of label currently being edited (dropdown open)
 * - isDragging/draggedIndex: Coordinated with other component drag states
 *
 * Pure Mathematical Positioning:
 * - Uses mathematical collision detection (no DOM dependencies)
 * - Calculates label positions at segment midpoints
 * - Applies minimal horizontal offsets to prevent overlap
 * - Predictable, deterministic results
 *
 * @sig LabelLayer :: ({ segments: [Segment], blockfaceLength: Number,
 *                      handleChangeType: (Number, String) -> Void,
 *                      handleAddLeft: Number -> Void }) -> JSXElement
 */
const LabelLayer = ({ handleChangeType, handleAddLeft }) => {
    const blockface = useSelector(S.currentBlockface)

    if (!blockface) return null

    const segments = blockface.segments
    const blockfaceLength = Blockface.totalLength(blockface)

    // Calculate label positions using pure math - no DOM dependencies
    const labelPositions = React.useMemo(
        () => calculateMemoizedPositions(segments, blockfaceLength),
        [segments, blockfaceLength],
    )

    const segmentPositions = React.useMemo(
        () => calculateSegmentPositions(segments, blockfaceLength),
        [segments, blockfaceLength],
    )

    if (!segments || segments.length === 0) return null

    return (
        /* Allow clicks to pass through to segments */
        <Box position="relative" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
            {segments.map((segment, index) =>
                createLabelItem(labelPositions, segmentPositions, handleChangeType, handleAddLeft)(segment, index),
            )}
        </Box>
    )
}

export { LabelLayer }
