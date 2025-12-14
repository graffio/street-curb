// ABOUTME: Individual tab group with tab bar and content area
// ABOUTME: Uses View.match() for exhaustive content rendering

import { Box, Button, Flex, Text } from '@graffio/design-system'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { TransactionRegisterPage } from '../pages/TransactionRegisterPage.jsx'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

// @sig getTabStyle :: (String, String, Boolean) -> Object
const getTabStyle = (viewId, activeViewId, isDragging) => ({
    padding: '4px 12px',
    borderBottom: viewId === activeViewId ? '2px solid var(--accent-9)' : '2px solid transparent',
    cursor: isDragging ? 'grabbing' : 'grab',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: isDragging ? 0.5 : 1,
})

// Serialize drag data for transfer between components
// @sig serializeDragData :: (String, String) -> String
const serializeDragData = (viewId, groupId) => JSON.stringify({ viewId, groupId })

// Parse drag data from transfer
// @sig parseDragData :: String -> { viewId: String, groupId: String } | null
const parseDragData = data => {
    try {
        return JSON.parse(data)
    } catch {
        return null
    }
}

// @sig Tab ::  { view: View, groupId: String, isActive: Boolean } -> ReactElement
const Tab = ({ view, groupId, isActive }) => {
    const handleClick = () => post(Action.SetActiveView(groupId, view.id))

    const handleClose = e => {
        e.stopPropagation()
        post(Action.CloseView(view.id, groupId))
    }

    const handleDragStart = e => {
        setIsDragging(true)
        e.dataTransfer.setData('application/json', serializeDragData(view.id, groupId))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => setIsDragging(false)

    const [isDragging, setIsDragging] = useState(false)
    const { id, title } = view

    return (
        <Flex
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={getTabStyle(id, isActive ? id : null, isDragging)}
            onClick={handleClick}
        >
            <Text size="2" weight={isActive ? 'medium' : 'regular'}>
                {title}
            </Text>
            <Button size="1" variant="ghost" onClick={handleClose} style={{ padding: '0 4px' }}>
                ×
            </Button>
        </Flex>
    )
}

// @sig renderTab :: (View, String, String) -> ReactElement
const renderTab = (view, groupId, activeViewId) => (
    <Tab key={view.id} view={view} groupId={groupId} isActive={view.id === activeViewId} />
)

const MAX_GROUPS = 4

// @sig SplitButton :: { groupCount: Number } -> ReactElement|null
const SplitButton = ({ groupCount }) => {
    if (groupCount >= MAX_GROUPS) return null

    return (
        <Button
            size="1"
            variant="ghost"
            onClick={e => {
                e.stopPropagation()
                post(Action.CreateTabGroup())
            }}
            style={{ padding: '4px 8px', marginLeft: 'auto' }}
        >
            Split ▸
        </Button>
    )
}

// Handle drop of a tab onto this tab bar
// @sig TabBar :: { group: TabGroup, groupCount: Number } -> ReactElement
const TabBar = ({ group, groupCount }) => {
    const handleDragOver = e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setIsDropTarget(true)
    }

    const handleDragLeave = e => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDropTarget(false)
    }

    // Handle tab drop - move view from source group to this group
    // @sig handleDrop :: DragEvent -> void
    const handleDrop = e => {
        e.preventDefault()
        setIsDropTarget(false)
        const dragData = parseDragData(e.dataTransfer.getData('application/json'))
        if (!dragData) return
        const { viewId, groupId: sourceGroupId } = dragData
        if (sourceGroupId === group.id && group.views[viewId]) return // Same group, already there
        post(Action.MoveView(viewId, sourceGroupId, group.id, null))
    }

    const [isDropTarget, setIsDropTarget] = useState(false)

    const style = {
        borderBottom: '1px solid var(--gray-5)',
        backgroundColor: isDropTarget ? 'var(--accent-3)' : 'var(--gray-2)',
        minHeight: '36px',
        transition: 'background-color 0.1s',
    }

    return (
        <Flex
            align="center"
            style={style}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {group.views.map(view => renderTab(view, group.id, group.activeViewId))}
            <SplitButton groupCount={groupCount} />
        </Flex>
    )
}

// @sig EmptyState :: () -> ReactElement
const EmptyState = () => (
    <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Text size="2" color="gray">
            No tabs open
        </Text>
    </Flex>
)

// @sig renderViewContent :: View -> ReactElement
const renderViewContent = view =>
    view.match({
        Register: () => <TransactionRegisterPage accountId={view.accountId} />,
        Report: () => (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Text>Report: {view.reportType}</Text>
            </Flex>
        ),
        Reconciliation: () => (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Text>Reconciliation: {view.accountId}</Text>
            </Flex>
        ),
    })

// @sig ViewContent :: { group: TabGroup } -> ReactElement
const ViewContent = ({ group }) => {
    if (!group.activeViewId) return <EmptyState />

    const activeView = group.views[group.activeViewId]
    if (!activeView) return <EmptyState />

    return renderViewContent(activeView)
}

// @sig TabGroup :: { group: TabGroup } -> ReactElement
const TabGroup = ({ group }) => {
    const tabLayout = useSelector(S.tabLayout)
    const isActive = tabLayout.activeTabGroupId === group.id
    const groupCount = tabLayout.tabGroups.length

    const style = {
        width: `${group.width}%`,
        height: '100%',
        borderRight: '1px solid var(--gray-5)',
        outline: isActive ? '2px solid var(--accent-8)' : 'none',
        outlineOffset: '-2px',
    }
    return (
        <Flex direction="column" onClick={() => !isActive && post(Action.SetActiveTabGroup(group.id))} style={style}>
            <TabBar group={group} groupCount={groupCount} />
            <Box style={{ flex: 1, overflow: 'auto' }}>
                <ViewContent group={group} />
            </Box>
        </Flex>
    )
}

export { TabGroup }
