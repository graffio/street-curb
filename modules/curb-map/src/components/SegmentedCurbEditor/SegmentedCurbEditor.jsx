import { Box, Button, Flex, Text } from '@radix-ui/themes'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../../commands/index.js'
import { COLORS } from '../../constants.js'
import * as S from '../../store/selectors.js'
import { Action, Blockface } from '../../types/index.js'
import { addUnifiedEventListener, createDragManager, getPrimaryCoordinate } from '../../utils/event-utils.js'
import { formatLength, roundToPrecision } from '../../utils/formatting.js'
import { DividerLayer } from './DividerLayer.jsx'
import { DragDropHandler } from './DragDropHandler.jsx'
import { LabelLayer } from './LabelLayer.jsx'
import { SegmentRenderer } from './SegmentRenderer.jsx'

/**
 * SegmentedCurbEditorNew - Redesigned street curb configuration editor
 *
 * Phase 3: CSS-to-Radix Migration Complete - Incremental Implementation
 * This component migrates all CSS-dependent sections to Radix design system:
 * - Container structure migrated to Radix Box components
 * - Ruler tick marks migrated to Radix Box and Text components
 * - Bottom controls migrated to Radix Flex, Button, and Text components
 * - Drag preview migrated to Radix Box with inline styling
 * - Imports all *New components: SegmentRendererNew, DividerLayerNew, LabelLayerNew
 * - Preserves exact same layout, dimensions, and positioning
 * - Maintains all drag logic and event handlers
 */

/**
 * Main component for editing segmented curb configurations with drag and drop functionality (vertical orientation only)
 * @sig SegmentedCurbEditor :: ({ blockfaceLength?: Number, blockfaceId?: String }) -> JSXElement
 */
const SegmentedCurbEditor = () => {
    /**
     * Creates handler for changing segment type through label dropdown
     * @sig buildChangeTypeHandler :: (Number, String) -> Void
     */
    const buildChangeTypeHandler = (index, newType) => {
        post(Action.SegmentUseUpdated(index, newType))
    }

    /**
     * Individual ruler tick mark component
     * @sig RulerTick :: ({ position: Number, total: Number, index: Number }) -> JSXElement
     */
    const RulerTick = ({ position, total, index }) => {
        const ft = formatLength((position / total) * total)
        const pct = (position / total) * 100

        return (
            <Box
                key={`tick-${index}`}
                style={{
                    position: 'absolute',
                    top: `${pct}%`,
                    transform: 'translateY(-50%)',
                    left: 0,
                    right: 'auto',
                    width: '100%',
                    display: 'block',
                }}
            >
                <Text size="1" color="gray">
                    {ft}
                </Text>
            </Box>
        )
    }

    /**
     * Floating drag preview component for mobile touch interactions
     * @sig DragPreview :: ({ segmentDragState: Object?, segments: [Segment], total: Number }) -> JSXElement?
     */
    const DragPreview = ({ segmentDragState, segments, total }) => {
        if (!segmentDragState?.segmentIndex || !segmentDragState?.previewPos) return null

        const segment = segments[segmentDragState.segmentIndex]
        if (!segment) return null

        const size = (segment.length / total) * 100

        return (
            <Box
                style={{
                    position: 'absolute',
                    left: `${segmentDragState.previewPos.x || 0}px`,
                    top: `${segmentDragState.previewPos.y || 0}px`,
                    backgroundColor: COLORS[segment.use] || '#666',
                    border: '2px solid rgba(255, 255, 255, 0.9)',
                    borderRadius: '6px',
                    opacity: 0.9,
                    zIndex: 200,
                    pointerEvents: 'none',
                    width: '80px',
                    height: `${size}%`,
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
                }}
            />
        )
    }

    /**
     * Sets up and manages global unified event listeners for drag operations
     * @sig setupGlobalEventListeners :: () -> () -> Void
     */
    const setupGlobalEventListeners = () => {
        const container = containerRef.current
        if (!container) return

        const { handleTouchMove, handleTouchEnd } = dragDropHandler.getGlobalTouchHandlers()

        // Use unified event handling for better cross-platform support
        const cleanupMove = addUnifiedEventListener(container, 'MOVE', handleTouchMove, { passive: false })
        const cleanupEnd = addUnifiedEventListener(container, 'END', handleTouchEnd)

        return () => {
            cleanupMove()
            cleanupEnd()
        }
    }

    /**
     * Handles drag move events with length adjustment (unified touch/mouse) - uses local state for smooth updates
     * @sig createDragMoveHandler :: (Number, Number, Number) -> (Event) -> Void
     */
    const createDragMoveHandler = (index, total, unknownRemaining) => moveEvent => {
        if (!dragState.current.isDragging) return

        const currentCoord = getPrimaryCoordinate(moveEvent)
        const deltaPixels = currentCoord - dragState.current.startCoord

        if (!containerRef.current) return
        const containerSize = containerRef.current.offsetHeight
        const pxPerUnit = containerSize / total
        const deltaUnits = deltaPixels / pxPerUnit
        const newLength = roundToPrecision(dragState.current.startLength + deltaUnits)

        // Allow going to exactly 0 if close enough (within thumb constraint distance)
        if (newLength < 0.1) {
            // For zero snap, still need to sync to Redux immediately
            try {
                post(Action.SegmentLengthUpdated(index, dragState.current.startLength + unknownRemaining))
            } catch (error) {
                console.warn('Invalid segment adjustment:', error.message)
            }
            return
        }

        try {
            post(Action.SegmentLengthUpdated(index, newLength))
        } catch (error) {
            console.warn('Invalid segment adjustment:', error.message)
        }
    }

    /**
     * Creates drag end cleanup handler (unified touch/mouse)
     * @sig createDragEndCleanup :: () -> Void
     */
    const createDragEndCleanup = () =>
        (dragState.current = { isDragging: false, startCoord: null, startLength: null, index: null })

    /**
     * Handles direct drag start for dividers (unified touch/mouse)
     * @sig handleDirectDragStartImpl :: (Event, Number) -> Void
     */
    const handleDirectDragStartImpl = (e, index) => {
        const handleEnd = () => {
            createDragEndCleanup()
            dragManager.cleanup()
        }

        e.preventDefault()
        e.stopPropagation()

        const segment = segments[index]
        if (!segment) return

        const startCoord = getPrimaryCoordinate(e)
        dragState.current = { isDragging: true, startCoord, startLength: segment.length, index }

        const dragManager = createDragManager()
        const handleMove = createDragMoveHandler(index, total, unknownRemaining)

        dragManager.startDrag(handleMove, handleEnd)
    }

    /**
     * Bottom controls component for segment creation and remaining space display
     * @sig BottomControls :: ({ unknownRemaining: Number, segmentsLength: Number }) -> JSXElement
     */
    const BottomControls = ({ unknownRemaining, segmentsLength }) => (
        <Flex direction="column" gap="2" style={{ marginTop: '16px' }}>
            <Text size="2" color="gray" align="center">
                Remaining: {formatLength(unknownRemaining)} ft
            </Text>
            <Flex gap="2" justify="center">
                {segmentsLength === 0 && unknownRemaining > 0 && (
                    <Button size="2" variant="soft" onClick={() => post(Action.SegmentAdded(0))}>
                        + Add First Segment
                    </Button>
                )}
                {segmentsLength > 0 && unknownRemaining > 0 && (
                    <Button size="2" variant="soft" onClick={() => post(Action.SegmentAdded(segmentsLength))}>
                        + Add Segment
                    </Button>
                )}
            </Flex>
        </Flex>
    )

    const blockface = useSelector(S.currentBlockface)

    if (!blockface) return <div>Loading...</div>

    const segments = blockface.segments
    const total = Blockface.totalLength(blockface)

    // Calculate remaining space locally
    const segmentsLength = segments.reduce((sum, segment) => sum + segment.length, 0)
    const unknownRemaining = total - segmentsLength

    // Component state and refs
    // Segments are now managed by Redux
    const [segmentDragState, setSegmentDragState] = useState(null)
    const containerRef = useRef(null)

    // Drag and drop handler
    const dragDropHandler = DragDropHandler({
        segments,
        onSwap: newSegments => post(Action.SegmentsReplaced(newSegments)),
        draggingIndex: segmentDragState?.segmentIndex ?? null,
        setDraggingIndex: index =>
            setSegmentDragState(
                index !== null
                    ? { segmentIndex: index, previewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 } }
                    : null,
            ),
        dragPreviewPos: segmentDragState?.previewPos ?? { x: 0, y: 0 },
        setDragPreviewPos: pos =>
            setSegmentDragState(
                segmentDragState ? { ...segmentDragState, previewPos: pos } : { segmentIndex: null, previewPos: pos },
            ),
        containerRef,
    })

    // Direct drag implementation without DraggableDivider
    const dragState = useRef({ isDragging: false, startCoord: null, startLength: null, index: null })

    const handleDirectDragStart = useCallback(handleDirectDragStartImpl, [segments, total, unknownRemaining])
    const handleChangeType = buildChangeTypeHandler

    const handleAddLeft = useCallback(index => post(Action.SegmentAddedLeft(index)), [])
    const tickPoints = Blockface.cumulativePositions(blockface)

    // Redux handles blockface initialization and segment management

    // Global unified event handlers for better cross-platform support
    useEffect(() => setupGlobalEventListeners(), [dragDropHandler])

    return (
        <>
            <Box style={{ position: 'relative', width: '100%' }}>
                <Box
                    ref={containerRef}
                    style={{
                        position: 'relative',
                        height: '400px',
                        width: '80px',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'visible',
                        userSelect: 'none',
                        touchAction: 'manipulation',
                    }}
                >
                    <SegmentRenderer dragDropHandler={dragDropHandler} />
                    <DividerLayer handleDirectDragStart={handleDirectDragStart} />
                    <DragPreview segmentDragState={segmentDragState} segments={segments} total={total} />
                </Box>

                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '130px',
                        width: 'auto',
                        minWidth: '60px',
                        height: '400px',
                    }}
                >
                    <LabelLayer handleChangeType={handleChangeType} handleAddLeft={handleAddLeft} />
                </Box>

                <Box
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '90px',
                        height: '400px',
                        width: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {tickPoints.map((p, i) => (
                        <RulerTick key={`tick-${i}`} position={p} total={total} index={i} />
                    ))}
                </Box>

                <BottomControls unknownRemaining={unknownRemaining} segmentsLength={segments.length} />
            </Box>
        </>
    )
}

export { SegmentedCurbEditor }
