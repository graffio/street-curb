// ABOUTME: Container for tab groups with horizontal flex layout
// ABOUTME: Reads tabLayout from Redux, renders groups with resize handles

import { Box, Flex } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import * as S from '../store/selectors.js'
import { Action } from '../types/action.js'
import { TabStyles } from '../utils/tab-styles.js'
import { TabGroup } from './TabGroup.jsx'

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Whether a specific handle element is the one being dragged
    // @sig isDraggingHandle :: Element -> Boolean
    isDraggingHandle: el => dragHandleEl === el,

    // Calculates and persists new widths based on drag delta
    // @sig persistGroupWidths :: (Object, Number) -> void
    persistGroupWidths: (drag, clientX) => {
        const { startX, containerWidth, startLeftWidth, startRightWidth, totalWidth, leftGroupId, rightGroupId } = drag
        const deltaX = clientX - startX
        const deltaPercent = (deltaX / containerWidth) * 100
        const newLeft = startLeftWidth + deltaPercent
        const newRight = startRightWidth - deltaPercent
        const { left, right } = TabStyles.toClampedWidths(newLeft, newRight, totalWidth, MIN_GROUP_WIDTH)
        post(Action.SetTabGroupWidth(leftGroupId, left))
        post(Action.SetTabGroupWidth(rightGroupId, right))
    },

    // Handles mousemove during drag — updates group widths
    // @sig handleDragMove :: MouseEvent -> void
    handleDragMove: moveEvent => currentDrag && E.persistGroupWidths(currentDrag, moveEvent.clientX),

    // Handles mouseup — cleans up drag state and listeners
    // @sig handleDragUp :: () -> void
    handleDragUp: () => {
        const el = dragHandleEl
        currentDrag = null
        dragHandleEl = null
        if (el) el.style.backgroundColor = 'var(--color-background)'
        document.removeEventListener('mousemove', E.handleDragMove)
        document.removeEventListener('mouseup', E.handleDragUp)
    },

    // Initializes drag state and attaches mouse event listeners
    // @sig handleDragInit :: (MouseEvent, TabGroup, TabGroup) -> void
    handleDragInit: (e, leftGroup, rightGroup) => {
        e.preventDefault()
        const container = containerEl.current
        if (!container) return

        dragHandleEl = e.currentTarget
        const { width: leftWidth, id: leftId } = leftGroup
        const { width: rightWidth, id: rightId } = rightGroup
        const containerRect = container.getBoundingClientRect()
        currentDrag = {
            startX: e.clientX,
            containerWidth: containerRect.width,
            startLeftWidth: leftWidth,
            startRightWidth: rightWidth,
            totalWidth: leftWidth + rightWidth,
            leftGroupId: leftId,
            rightGroupId: rightId,
        }

        document.addEventListener('mousemove', E.handleDragMove)
        document.addEventListener('mouseup', E.handleDragUp)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Draggable divider between adjacent tab groups
// @sig ResizeHandle :: { leftGroup: TabGroup, rightGroup: TabGroup } -> ReactElement
const ResizeHandle = ({ leftGroup, rightGroup }) => {
    const resizeProps = {
        style: handleStyle,
        onMouseDown: e => E.handleDragInit(e, leftGroup, rightGroup),
        onMouseEnter: e => (e.currentTarget.style.backgroundColor = 'var(--accent-8)'),
        onMouseLeave: e => {
            if (!E.isDraggingHandle(e.currentTarget)) e.currentTarget.style.backgroundColor = 'var(--color-background)'
        },
    }

    return <Box {...resizeProps} />
}

// Renders a tab group with optional resize handle to next group
// @sig GroupWithHandle :: { group: TabGroup, nextGroup: TabGroup|null } -> ReactElement
const GroupWithHandle = ({ group, nextGroup }) => (
    <>
        <TabGroup key={group.id} group={group} />
        {nextGroup && (
            <ResizeHandle key={`handle-${group.id}-${nextGroup.id}`} leftGroup={group} rightGroup={nextGroup} />
        )}
    </>
)

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const HANDLE_WIDTH = 4
const MIN_GROUP_WIDTH = 10 // percent

const handleStyle = {
    width: `${HANDLE_WIDTH}px`,
    cursor: 'col-resize',
    backgroundColor: 'var(--color-background)',
    flexShrink: 0,
    transition: 'background-color 0.1s',
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

// Module-level drag state — only one drag at a time
let currentDrag = null
let dragHandleEl = null
const containerEl = { current: null }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Horizontal flex container for tab groups with resize handles
// @sig TabGroupContainer :: () -> ReactElement
const TabGroupContainer = () => {
    const tabLayout = useSelector(S.tabLayout)
    const { tabGroups } = tabLayout

    return (
        <Flex ref={el => (containerEl.current = el)} style={{ flex: 1, minHeight: 0, width: '100%' }}>
            {tabGroups.map((g, i) => (
                <GroupWithHandle key={g.id} group={g} nextGroup={tabGroups[i + 1]} />
            ))}
        </Flex>
    )
}

export { TabGroupContainer }
