// ABOUTME: Container for tab groups with horizontal flex layout
// ABOUTME: Reads tabLayout from Redux, renders groups with resize handles

import { Box, Flex } from '@graffio/design-system'
import React, { useRef } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'
import { TabGroup } from './TabGroup.jsx'

const HANDLE_WIDTH = 4
const MIN_GROUP_WIDTH = 10 // percent

const handleStyle = {
    width: `${HANDLE_WIDTH}px`,
    cursor: 'col-resize',
    backgroundColor: 'var(--color-background)',
    flexShrink: 0,
    transition: 'background-color 0.1s',
}

const T = {
    // Clamps widths to ensure neither group falls below minimum
    // @sig toClampedWidths :: (Number, Number, Number, Number) -> { left: Number, right: Number }
    toClampedWidths: (leftWidth, rightWidth, totalWidth, minWidth) => {
        if (leftWidth < minWidth) return { left: minWidth, right: totalWidth - minWidth }
        if (rightWidth < minWidth) return { left: totalWidth - minWidth, right: minWidth }
        return { left: leftWidth, right: rightWidth }
    },
}

const E = {
    // Calculates and persists new widths based on drag delta
    // @sig persistGroupWidths :: (Object, Number) -> void
    persistGroupWidths: (drag, clientX) => {
        const { startX, containerWidth, startLeftWidth, startRightWidth, totalWidth, leftGroupId, rightGroupId } = drag
        const deltaX = clientX - startX
        const deltaPercent = (deltaX / containerWidth) * 100
        const { left, right } = T.toClampedWidths(
            startLeftWidth + deltaPercent,
            startRightWidth - deltaPercent,
            totalWidth,
            MIN_GROUP_WIDTH,
        )
        post(Action.SetTabGroupWidth(leftGroupId, left))
        post(Action.SetTabGroupWidth(rightGroupId, right))
    },

    // Resets drag state and removes mouse event listeners
    // @sig handleDragCleanup :: (Object, Function, Function) -> void
    handleDragCleanup: (drag, onMove, onUp) => {
        drag.active = false
        if (drag.handleRef?.current) drag.handleRef.current.style.backgroundColor = 'var(--color-background)'
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    },

    // Initializes drag state and attaches mouse event listeners
    // @sig handleDragInit :: (MouseEvent, Ref, Ref, TabGroup, TabGroup, Ref) -> void
    handleDragInit: (e, containerRef, dragStateRef, leftGroup, rightGroup, handleRef) => {
        const onMove = moveEvent =>
            dragStateRef.current.active && E.persistGroupWidths(dragStateRef.current, moveEvent.clientX)

        const onUp = () => E.handleDragCleanup(dragStateRef.current, onMove, onUp)

        e.preventDefault()
        const container = containerRef.current
        if (!container) return

        const { width: leftWidth, id: leftId } = leftGroup
        const { width: rightWidth, id: rightId } = rightGroup
        const containerRect = container.getBoundingClientRect()
        dragStateRef.current = {
            active: true,
            startX: e.clientX,
            containerWidth: containerRect.width,
            startLeftWidth: leftWidth,
            startRightWidth: rightWidth,
            totalWidth: leftWidth + rightWidth,
            leftGroupId: leftId,
            rightGroupId: rightId,
            handleRef,
        }

        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    },

    // Updates handle background color for hover/drag feedback
    // @sig persistHandleColor :: (Ref, String) -> void
    persistHandleColor: (handleRef, color) => handleRef.current && (handleRef.current.style.backgroundColor = color),
}

// Draggable divider between adjacent tab groups
// @sig ResizeHandle :: { leftGroup: TabGroup, rightGroup: TabGroup, containerRef: Ref } -> ReactElement
const ResizeHandle = ({ leftGroup, rightGroup, containerRef }) => {
    const handleRef = useRef(null)
    const dragStateRef = useRef({ active: false })

    return (
        <Box
            ref={handleRef}
            style={handleStyle}
            onMouseDown={e => E.handleDragInit(e, containerRef, dragStateRef, leftGroup, rightGroup, handleRef)}
            onMouseEnter={() => E.persistHandleColor(handleRef, 'var(--accent-8)')}
            onMouseLeave={() =>
                !dragStateRef.current.active && E.persistHandleColor(handleRef, 'var(--color-background)')
            }
        />
    )
}

// Renders a tab group with optional resize handle to next group
// @sig GroupWithHandle :: { group: TabGroup, nextGroup: TabGroup|null, containerRef: Ref } -> ReactElement
const GroupWithHandle = ({ group, nextGroup, containerRef }) => (
    <>
        <TabGroup key={group.id} group={group} />
        {nextGroup && (
            <ResizeHandle
                key={`handle-${group.id}-${nextGroup.id}`}
                leftGroup={group}
                rightGroup={nextGroup}
                containerRef={containerRef}
            />
        )}
    </>
)

// Horizontal flex container for tab groups with resize handles
// @sig TabGroupContainer :: () -> ReactElement
const TabGroupContainer = () => {
    const tabLayout = useSelector(S.tabLayout)
    const containerRef = useRef(null)
    const { tabGroups } = tabLayout

    return (
        <Flex ref={containerRef} style={{ flex: 1, minHeight: 0, width: '100%' }}>
            {tabGroups.map((g, i) => (
                <GroupWithHandle key={g.id} group={g} nextGroup={tabGroups[i + 1]} containerRef={containerRef} />
            ))}
        </Flex>
    )
}

export { TabGroupContainer }
