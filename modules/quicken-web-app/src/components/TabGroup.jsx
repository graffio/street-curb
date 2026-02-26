// ABOUTME: Individual tab group with tab bar and content area
// ABOUTME: Uses View.match() for exhaustive content rendering
// COMPLEXITY-TODO: require-action-registry — Predates require-action-registry rule (expires 2026-04-01)

import { Box, Button, ContextMenu, Flex, Kbd, Text } from '@radix-ui/themes'
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
// Factories
//
// ---------------------------------------------------------------------------------------------------------------------

const F = {
    // Parses drag data JSON, returns undefined on failure
    // @sig parseDragData :: String -> { viewId: String, groupId: String }?
    parseDragData: data => {
        try {
            return JSON.parse(data)
        } catch {
            return undefined
        }
    },

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
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Placeholder shown when no tabs are open in a group
// @sig EmptyState :: () -> ReactElement
const EmptyState = () => (
    <Flex align="center" justify="center" style={EMPTY_STATE_STYLE}>
        <Text size="2" color="gray">
            No tabs open
        </Text>
    </Flex>
)

// Self-selecting register page — picks account from state, renders correct register type
// @sig RegisterPage :: { accountId: String } -> ReactElement
const RegisterPage = ({ accountId }) => {
    const accounts = useSelector(S.accounts)
    const account = accounts.get(accountId)
    if (!account) return <EmptyState />
    return Account.isInvestment(account) ? (
        <InvestmentRegisterPage accountId={accountId} />
    ) : (
        <TransactionRegisterPage accountId={accountId} />
    )
}

// Draggable tab with right-click context menu — self-selects view, isActive, isActiveGroup
// @sig Tab :: { viewId: String, groupId: String } -> ReactElement
const Tab = ({ viewId, groupId }) => {
    const handleClose = e => {
        e.stopPropagation()
        post(Action.CloseView(viewId, groupId))
    }

    const handleDragStart = e => {
        post(Action.SetDraggingView(viewId))
        e.dataTransfer.setData('application/json', JSON.stringify({ viewId, groupId }))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleMoveLeft = () => post(Action.MoveTab('left', viewId, groupId))
    const handleMoveRight = () => post(Action.MoveTab('right', viewId, groupId))
    const handleMoveToNewGroup = () => post(Action.MoveToNewGroup(viewId, groupId))
    const handleCloseMenu = () => post(Action.CloseView(viewId, groupId))

    const tabLayout = useSelector(S.tabLayout)
    const isDragging = useSelector(S.draggingViewId) === viewId
    const newGroupDisabled = useSelector(S.atMaxGroups)
    const { left: moveLeftDisabled, right: moveRightDisabled } = useSelector(s => S.tabMoveDisabled(s, viewId, groupId))
    const group = tabLayout.tabGroups.get(groupId)
    const view = group.views.get(viewId)
    const isActive = group.activeViewId === viewId
    const isActiveGroup = tabLayout.activeTabGroupId === groupId
    const { title } = view
    const tagName = view['@@tagName']
    const icon = VIEW_ICONS[tagName] || '○'

    const tabProps = {
        draggable: true,
        onDragStart: handleDragStart,
        onDragEnd: () => post(Action.SetDraggingView(undefined)),
        style: TabStyles.toTabStyle(tagName, isActive, isDragging, isActiveGroup),
        onClick: () => post(Action.SetActiveView(groupId, viewId)),
    }

    return (
        <ContextMenu.Root>
            <ContextMenu.Trigger>
                <Flex title={title} {...tabProps}>
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
            </ContextMenu.Trigger>
            <ContextMenu.Content>
                <ContextMenu.Item disabled={moveLeftDisabled} onSelect={handleMoveLeft}>
                    Move Left <Kbd>Ctrl+Shift+H</Kbd>
                </ContextMenu.Item>
                <ContextMenu.Item disabled={moveRightDisabled} onSelect={handleMoveRight}>
                    Move Right <Kbd>Ctrl+Shift+L</Kbd>
                </ContextMenu.Item>
                <ContextMenu.Item disabled={newGroupDisabled} onSelect={handleMoveToNewGroup}>
                    Move to New Group
                </ContextMenu.Item>
                <ContextMenu.Separator />
                <ContextMenu.Item onSelect={handleCloseMenu}>
                    Close <Kbd>W</Kbd>
                </ContextMenu.Item>
            </ContextMenu.Content>
        </ContextMenu.Root>
    )
}

// Tab bar with drag-and-drop support — self-selects group from state
// @sig TabBar :: { groupId: String } -> ReactElement
const TabBar = ({ groupId }) => {
    const handleDragOver = e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        post(Action.SetDropTarget(groupId))
    }

    const handleDragLeave = e => {
        if (!e.currentTarget.contains(e.relatedTarget)) post(Action.SetDropTarget(undefined))
    }

    // Handle tab drop — move or reorder view
    // @sig handleDrop :: DragEvent -> void
    const handleDrop = e => {
        const { clientX, currentTarget, dataTransfer } = e
        e.preventDefault()
        post(Action.SetDropTarget(undefined))
        const dragData = F.parseDragData(dataTransfer.getData('application/json'))
        if (!dragData) return
        const toIndex = F.toDropIndex(currentTarget, clientX, group.views.length)
        post(Action.MoveView(dragData.viewId, dragData.groupId, groupId, toIndex))
    }

    const tabLayout = useSelector(S.tabLayout)
    const group = tabLayout.tabGroups.get(groupId)
    const isDropTarget = useSelector(S.dropTargetGroupId) === groupId

    const style = {
        backgroundColor: isDropTarget ? 'var(--accent-3)' : 'var(--color-background)',
        minHeight: '40px',
        padding: 'var(--space-2) var(--space-2) 0 var(--space-2)',
        transition: 'background-color 0.1s',
    }

    return (
        <Flex align="end" style={style} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            {group.views.map(v => (
                <Tab key={v.id} viewId={v.id} groupId={groupId} />
            ))}
        </Flex>
    )
}

// Self-selecting report page — renders correct report type based on reportType
// @sig ReportPage :: { viewId: String, reportType: String } -> ReactElement
const ReportPage = ({ viewId, reportType }) =>
    reportType === 'holdings' ? <InvestmentReportPage viewId={viewId} /> : <CategoryReportPage viewId={viewId} />

// Renders the appropriate page component for the active view — self-selects group from state
// @sig ViewContent :: { groupId: String } -> ReactElement
const ViewContent = ({ groupId }) => {
    const tabLayout = useSelector(S.tabLayout)
    const { activeViewId, views } = tabLayout.tabGroups.get(groupId)

    if (!activeViewId) return <EmptyState />
    const activeView = views.get(activeViewId)
    if (!activeView) return <EmptyState />

    const { accountId, id: viewId, reportType } = activeView
    return activeView.match({
        Register: () => <RegisterPage accountId={accountId} />,
        Report: () => <ReportPage viewId={viewId} reportType={reportType} />,
        Reconciliation: () => (
            <Flex align="center" justify="center" style={EMPTY_STATE_STYLE}>
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
const EMPTY_STATE_STYLE = { height: '100%' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

// Container with tab bar and content area for a group of views
// @sig TabGroup :: { group: TabGroup } -> ReactElement
const TabGroup = ({ group }) => {
    const { activeViewId, id, width } = group
    const tabLayout = useSelector(S.tabLayout)
    const isActive = tabLayout.activeTabGroupId === id
    const activeView = group.views.get(activeViewId)
    const activeColor = TabStyles.toViewColor(activeView, isActive)

    const style = { width: `${width}%`, height: '100%', borderRight: '4px solid var(--color-background)' }
    const contentStyle = { flex: 1, overflow: 'auto', backgroundColor: activeColor, padding: '2px' }
    const innerStyle = { backgroundColor: 'var(--color-background)', height: '100%', overflow: 'auto' }

    return (
        <Flex direction="column" onClick={() => post(Action.SetActiveTabGroup(id))} style={style}>
            <TabBar groupId={id} />
            <Box style={contentStyle}>
                <Box style={innerStyle}>
                    <ViewContent groupId={id} />
                </Box>
            </Box>
        </Flex>
    )
}

export { TabGroup }
