// ABOUTME: Individual tab group with tab bar and content area
// ABOUTME: Uses View.match() for exhaustive content rendering

import { Box, Button, Flex, Text } from '@graffio/design-system'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { CategoryReportPage } from '../pages/CategoryReportPage.jsx'
import { InvestmentRegisterPage } from '../pages/InvestmentRegisterPage.jsx'
import { InvestmentReportPage } from '../pages/InvestmentReportPage.jsx'
import { TransactionRegisterPage } from '../pages/TransactionRegisterPage.jsx'
import * as S from '../store/selectors/index.js'
import { Action } from '../types/action.js'

const VIEW_ICONS = { Register: '☰', Report: '◑', Reconciliation: '✓' }
const VIEW_COLORS = {
    Register: { focused: 'var(--blue-6)', active: 'var(--blue-4)', inactive: 'var(--blue-2)' },
    Report: { focused: 'var(--purple-6)', active: 'var(--purple-4)', inactive: 'var(--purple-3)' },
    Reconciliation: { focused: 'var(--green-6)', active: 'var(--green-4)', inactive: 'var(--green-2)' },
}

const P = {
    // @sig isInvestmentAccount :: Account -> Boolean
    isInvestmentAccount: account => account?.type === 'Investment' || account?.type === '401(k)/403(b)',
}

const T = {
    // @sig toViewColor :: (View, Boolean) -> String
    toViewColor: (view, isActiveGroup) => {
        if (!view) return 'var(--accent-8)'
        const colors = VIEW_COLORS[view['@@tagName']]
        if (!colors) return 'var(--accent-8)'
        return isActiveGroup ? colors.focused : colors.active
    },

    // @sig toDragData :: String -> { viewId: String, groupId: String } | null
    toDragData: data => {
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    },

    // @sig toTabStyle :: (String, Boolean, Boolean, Boolean) -> Object
    toTabStyle: (tagName, active, isDragging, activeGroup) => {
        const { focused, active: activeColor, inactive } = VIEW_COLORS[tagName] || VIEW_COLORS.Register
        const bg = active && activeGroup ? focused : active ? activeColor : inactive
        return {
            padding: '6px 12px',
            marginRight: 'var(--space-1)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: isDragging ? 0.5 : 1,
            backgroundColor: bg,
            borderRadius: 'var(--radius-3) var(--radius-3) 0 0',
            border: '1px solid var(--gray-5)',
            borderBottom: 'none',
        }
    },

    // @sig toSerializedDragData :: (String, String) -> String
    toSerializedDragData: (viewId, groupId) => JSON.stringify({ viewId, groupId }),

    // @sig toTabProps :: (View, String, String, Boolean) -> Object
    toTabProps: (view, groupId, activeViewId, isActiveGroup) => ({
        key: view.id,
        view,
        groupId,
        isActive: view.id === activeViewId,
        isActiveGroup,
    }),
}

// @sig Tab ::  { view: View, groupId: String, isActive: Boolean, isActiveGroup: Boolean } -> ReactElement
const Tab = ({ view, groupId, isActive, isActiveGroup }) => {
    const handleClick = () => post(Action.SetActiveView(groupId, view.id))

    const handleClose = e => {
        e.stopPropagation()
        post(Action.CloseView(view.id, groupId))
    }

    const handleDragStart = e => {
        setIsDragging(true)
        e.dataTransfer.setData('application/json', T.toSerializedDragData(view.id, groupId))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => setIsDragging(false)

    const [isDragging, setIsDragging] = useState(false)
    const { title } = view
    const tagName = view['@@tagName']
    const icon = VIEW_ICONS[tagName] || '○'

    return (
        <Flex
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={T.toTabStyle(tagName, isActive, isDragging, isActiveGroup)}
            onClick={handleClick}
        >
            <Text size="2" color="gray">
                {icon}
            </Text>
            <Text size="2" weight={isActive ? 'medium' : 'regular'}>
                {title}
            </Text>
            <Button size="1" variant="ghost" onClick={handleClose} style={{ padding: '0 4px' }}>
                ×
            </Button>
        </Flex>
    )
}

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
// @sig TabBar :: { group: TabGroup, groupCount: Number, isActiveGroup: Boolean } -> ReactElement
const TabBar = ({ group, groupCount, isActiveGroup }) => {
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
        const dragData = T.toDragData(e.dataTransfer.getData('application/json'))
        if (!dragData) return
        const { viewId, groupId: sourceGroupId } = dragData
        if (sourceGroupId === group.id && group.views[viewId]) return // Same group, already there
        post(Action.MoveView(viewId, sourceGroupId, group.id, null))
    }

    const [isDropTarget, setIsDropTarget] = useState(false)

    const style = {
        backgroundColor: isDropTarget ? 'var(--accent-3)' : 'var(--color-background)',
        minHeight: '40px',
        padding: 'var(--space-2) var(--space-2) 0 var(--space-2)',
        transition: 'background-color 0.1s',
    }

    return (
        <Flex align="end" style={style} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {group.views.map(v => (
                <Tab {...T.toTabProps(v, group.id, group.activeViewId, isActiveGroup)} />
            ))}
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

// @sig ViewContent :: { group: TabGroup, isActive: Boolean } -> ReactElement
const ViewContent = ({ group, isActive }) => {
    const accounts = useSelector(S.accounts)

    if (!group.activeViewId) return <EmptyState />

    const activeView = group.views[group.activeViewId]
    if (!activeView) return <EmptyState />

    const { accountId, id, reportType } = activeView
    return activeView.match({
        Register: () => {
            const account = accounts.get(accountId)
            const Page = P.isInvestmentAccount(account) ? InvestmentRegisterPage : TransactionRegisterPage
            return <Page accountId={accountId} isActive={isActive} />
        },
        Report: () => {
            if (reportType === 'holdings') return <InvestmentReportPage viewId={id} />
            return <CategoryReportPage viewId={id} />
        },
        Reconciliation: () => (
            <Flex align="center" justify="center" style={{ height: '100%' }}>
                <Text>Reconciliation: {accountId}</Text>
            </Flex>
        ),
    })
}

// @sig TabGroup :: { group: TabGroup } -> ReactElement
const TabGroup = ({ group }) => {
    const { activeViewId, id, views, width } = group
    const tabLayout = useSelector(S.tabLayout)
    const isActive = tabLayout.activeTabGroupId === id
    const groupCount = tabLayout.tabGroups.length
    const activeView = views.get ? views.get(activeViewId) : views[activeViewId]
    const activeColor = T.toViewColor(activeView, isActive)

    const style = { width: `${width}%`, height: '100%', borderRight: '4px solid var(--color-background)' }
    const contentStyle = { flex: 1, overflow: 'auto', backgroundColor: activeColor, padding: '2px' }
    const innerStyle = { backgroundColor: 'var(--color-background)', height: '100%', overflow: 'auto' }

    return (
        <Flex direction="column" onClick={() => !isActive && post(Action.SetActiveTabGroup(id))} style={style}>
            <TabBar group={group} groupCount={groupCount} isActiveGroup={isActive} />
            <Box style={contentStyle}>
                <Box style={innerStyle}>
                    <ViewContent group={group} isActive={isActive} />
                </Box>
            </Box>
        </Flex>
    )
}

export { TabGroup }
