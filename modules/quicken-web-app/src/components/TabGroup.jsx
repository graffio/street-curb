// ABOUTME: Individual tab group with tab bar and content area
// ABOUTME: Uses View.match() for exhaustive content rendering

import { Box, Button, Flex, Text, Tooltip } from '@radix-ui/themes'
import React from 'react'
import { useSelector } from 'react-redux'
import { post } from '../commands/post.js'
import { CategoryReportPage } from '../pages/CategoryReportPage.jsx'
import { InvestmentRegisterPage } from '../pages/InvestmentRegisterPage.jsx'
import { InvestmentReportPage } from '../pages/InvestmentReportPage.jsx'
import { TransactionRegisterPage } from '../pages/TransactionRegisterPage.jsx'
import * as S from '../store/selectors.js'
import { Account, Action } from '../types/index.js'
import { TabStyles } from '../utils/tab-styles.js'

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Parses drag data JSON, returns null on failure
    // @sig toDragData :: String -> { viewId: String, groupId: String } | null
    toDragData: data => {
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    },

    // Serializes view and group IDs for drag transfer
    // @sig toSerializedDragData :: (String, String) -> String
    toSerializedDragData: (viewId, groupId) => JSON.stringify({ viewId, groupId }),

    // Builds props for Tab component from view and group state
    // @sig toTabProps :: (View, String, String, Boolean) -> Object
    toTabProps: (view, groupId, activeViewId, isActiveGroup) => ({
        view,
        groupId,
        isActive: view.id === activeViewId,
        isActiveGroup,
    }),

    // Determines drop index from cursor position relative to tab elements
    // @sig toDropIndex :: (Element, Number, Number) -> Number
    toDropIndex: (container, clientX, tabCount) => {
        const tabs = Array.from(container.children).slice(0, tabCount)
        const idx = tabs.findIndex(
            el => clientX < el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2,
        )
        return idx === -1 ? tabCount : idx
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Functions
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Returns the appropriate register page component for an account type
    // @sig createRegisterPage :: (Account, String) -> ReactElement
    createRegisterPage: (account, accountId) =>
        Account.isInvestment(account) ? (
            <InvestmentRegisterPage accountId={accountId} />
        ) : (
            <TransactionRegisterPage accountId={accountId} />
        ),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Draggable tab with icon, title, and close button
// @sig Tab :: { view: View, groupId: String, isActive: Boolean, isActiveGroup: Boolean } -> ReactElement
const Tab = ({ view, groupId, isActive, isActiveGroup }) => {
    const handleClick = () => post(Action.SetActiveView(groupId, view.id))

    const handleClose = e => {
        e.stopPropagation()
        post(Action.CloseView(view.id, groupId))
    }

    const handleDragStart = e => {
        post(Action.SetDraggingView(view.id))
        e.dataTransfer.setData('application/json', T.toSerializedDragData(view.id, groupId))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragEnd = () => post(Action.SetDraggingView(null))

    const isDragging = useSelector(S.draggingViewId) === view.id
    const { title } = view
    const tagName = view['@@tagName']
    const icon = VIEW_ICONS[tagName] || '○'
    const tabProps = {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        style: TabStyles.toTabStyle(tagName, isActive, isDragging, isActiveGroup),
        onClick: handleClick,
    }

    return (
        <Tooltip content={title} delayDuration={200}>
            <Flex {...tabProps}>
                <Text size="2" color="gray">
                    {icon}
                </Text>
                <Text size="2" weight={isActive ? 'medium' : 'regular'} style={TAB_TITLE_STYLE}>
                    {title}
                </Text>
                <Button size="1" variant="ghost" onClick={handleClose} style={CLOSE_BUTTON_STYLE}>
                    ×
                </Button>
            </Flex>
        </Tooltip>
    )
}

// Button to create new tab group, hidden at max group count
// @sig SplitButton :: { groupCount: Number } -> ReactElement|null
const SplitButton = ({ groupCount }) => {
    const onClick = e => {
        e.stopPropagation()
        post(Action.CreateTabGroup())
    }
    if (groupCount >= MAX_GROUPS) return null

    return (
        <Button size="1" variant="ghost" onClick={onClick} style={SPLIT_BUTTON_STYLE}>
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
        post(Action.SetDropTarget(group.id))
    }

    const handleDragLeave = e => {
        if (!e.currentTarget.contains(e.relatedTarget)) post(Action.SetDropTarget(null))
    }

    // Handle tab drop — move or reorder view
    // @sig handleDrop :: DragEvent -> void
    const handleDrop = e => {
        const { clientX, currentTarget, dataTransfer } = e
        e.preventDefault()
        post(Action.SetDropTarget(null))
        const dragData = T.toDragData(dataTransfer.getData('application/json'))
        if (!dragData) return
        const { viewId, groupId: sourceGroupId } = dragData
        const toIndex = T.toDropIndex(currentTarget, clientX, group.views.length)
        post(Action.MoveView(viewId, sourceGroupId, group.id, toIndex))
    }

    const isDropTarget = useSelector(S.dropTargetGroupId) === group.id
    const style = {
        backgroundColor: isDropTarget ? 'var(--accent-3)' : 'var(--color-background)',
        minHeight: '40px',
        padding: 'var(--space-2) var(--space-2) 0 var(--space-2)',
        transition: 'background-color 0.1s',
    }

    return (
        <Flex align="end" style={style} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {group.views.map(v => (
                <Tab key={v.id} {...T.toTabProps(v, group.id, group.activeViewId, isActiveGroup)} />
            ))}
            <SplitButton groupCount={groupCount} />
        </Flex>
    )
}

// Placeholder shown when no tabs are open in a group
// @sig EmptyState :: () -> ReactElement
const EmptyState = () => (
    <Flex align="center" justify="center" style={{ height: '100%' }}>
        <Text size="2" color="gray">
            No tabs open
        </Text>
    </Flex>
)

// Renders the appropriate page component for the active view
// @sig ViewContent :: { group: TabGroup } -> ReactElement
const ViewContent = ({ group }) => {
    const accounts = useSelector(S.accounts)

    if (!group.activeViewId) return <EmptyState />

    const activeView = group.views[group.activeViewId]
    if (!activeView) return <EmptyState />

    const { accountId, id, reportType } = activeView
    return activeView.match({
        Register: () => {
            const account = accounts.get(accountId)
            if (!account) return <EmptyState /> // Account not loaded yet
            return F.createRegisterPage(account, accountId)
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

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const VIEW_ICONS = { Register: '☰', Report: '◑', Reconciliation: '✓' }
const TAB_TITLE_STYLE = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }
const CLOSE_BUTTON_STYLE = { padding: '0 4px', flexShrink: 0 }
const SPLIT_BUTTON_STYLE = { padding: '4px 8px', marginLeft: 'auto' }
const MAX_GROUPS = 4

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Container with tab bar and content area for a group of views
// @sig TabGroup :: { group: TabGroup } -> ReactElement
const TabGroup = ({ group }) => {
    const { activeViewId, id, views, width } = group
    const tabLayout = useSelector(S.tabLayout)
    const isActive = tabLayout.activeTabGroupId === id
    const groupCount = tabLayout.tabGroups.length
    const activeView = views.get ? views.get(activeViewId) : views[activeViewId]
    const activeColor = TabStyles.toViewColor(activeView, isActive)

    const style = { width: `${width}%`, height: '100%', borderRight: '4px solid var(--color-background)' }
    const contentStyle = { flex: 1, overflow: 'auto', backgroundColor: activeColor, padding: '2px' }
    const innerStyle = { backgroundColor: 'var(--color-background)', height: '100%', overflow: 'auto' }

    return (
        <Flex direction="column" onClick={() => !isActive && post(Action.SetActiveTabGroup(id))} style={style}>
            <TabBar group={group} groupCount={groupCount} isActiveGroup={isActive} />
            <Box style={contentStyle}>
                <Box style={innerStyle}>
                    <ViewContent group={group} />
                </Box>
            </Box>
        </Flex>
    )
}

export { TabGroup }
