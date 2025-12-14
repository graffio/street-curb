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
    backgroundColor: 'var(--gray-5)',
    flexShrink: 0,
    transition: 'background-color 0.1s',
}

// @sig clampWidths :: (Number, Number, Number, Number) -> { left: Number, right: Number }
const clampWidths = (leftWidth, rightWidth, totalWidth, minWidth) => {
    if (leftWidth < minWidth) return { left: minWidth, right: totalWidth - minWidth }
    if (rightWidth < minWidth) return { left: totalWidth - minWidth, right: minWidth }
    return { left: leftWidth, right: rightWidth }
}

// @sig updateGroupWidths :: (Object, Number) -> void
const updateGroupWidths = (drag, clientX) => {
    const { startX, containerWidth, startLeftWidth, startRightWidth, totalWidth, leftGroupId, rightGroupId } = drag
    const deltaX = clientX - startX
    const deltaPercent = (deltaX / containerWidth) * 100
    const { left, right } = clampWidths(
        startLeftWidth + deltaPercent,
        startRightWidth - deltaPercent,
        totalWidth,
        MIN_GROUP_WIDTH,
    )
    post(Action.SetTabGroupWidth(leftGroupId, left))
    post(Action.SetTabGroupWidth(rightGroupId, right))
}

// @sig cleanupDrag :: (Object, Function, Function) -> void
const cleanupDrag = (drag, onMove, onUp) => {
    drag.active = false
    if (drag.handleRef?.current) drag.handleRef.current.style.backgroundColor = 'var(--gray-5)'
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
}

// @sig initDrag :: (MouseEvent, Ref, Ref, TabGroup, TabGroup, Ref) -> void
const initDrag = (e, containerRef, dragStateRef, leftGroup, rightGroup, handleRef) => {
    const onMove = moveEvent =>
        dragStateRef.current.active && updateGroupWidths(dragStateRef.current, moveEvent.clientX)

    const onUp = () => cleanupDrag(dragStateRef.current, onMove, onUp)

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
}

// @sig setHandleColor :: (Ref, String) -> void
const setHandleColor = (handleRef, color) => handleRef.current && (handleRef.current.style.backgroundColor = color)

// @sig ResizeHandle :: { leftGroup: TabGroup, rightGroup: TabGroup, containerRef: Ref } -> ReactElement
const ResizeHandle = ({ leftGroup, rightGroup, containerRef }) => {
    const handleRef = useRef(null)
    const dragStateRef = useRef({ active: false })

    return (
        <Box
            ref={handleRef}
            style={handleStyle}
            onMouseDown={e => initDrag(e, containerRef, dragStateRef, leftGroup, rightGroup, handleRef)}
            onMouseEnter={() => setHandleColor(handleRef, 'var(--accent-8)')}
            onMouseLeave={() => !dragStateRef.current.active && setHandleColor(handleRef, 'var(--gray-5)')}
        />
    )
}

// @sig renderGroupWithHandle :: (TabGroup, Number, TabGroup[], Ref) -> ReactElement[]
const renderGroupWithHandle = (group, index, groups, containerRef) => {
    const elements = [<TabGroup key={group.id} group={group} />]

    if (index < groups.length - 1) {
        const nextGroup = groups[index + 1]
        elements.push(
            <ResizeHandle
                key={`handle-${group.id}-${nextGroup.id}`}
                leftGroup={group}
                rightGroup={nextGroup}
                containerRef={containerRef}
            />,
        )
    }

    return elements
}

// @sig TabGroupContainer :: () -> ReactElement
const TabGroupContainer = () => {
    const tabLayout = useSelector(S.tabLayout)
    const containerRef = useRef(null)
    const tabGroups = tabLayout.tabGroups

    return (
        <Flex ref={containerRef} style={{ height: '100%', width: '100%' }}>
            {tabGroups.flatMap((group, index) => renderGroupWithHandle(group, index, tabGroups, containerRef))}
        </Flex>
    )
}

export { TabGroupContainer }
