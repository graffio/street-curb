// ABOUTME: Investment holdings report page with hierarchical tree display
// ABOUTME: Displays portfolio positions grouped by account, security, type, or goal

import { DataTable, Flex, layoutChannel, useChannel } from '@graffio/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { investmentReportColumns } from '../columns/index.js'
import { FilterChipRow, investmentGroupByOptions } from '../components/index.js'
import { enrichedHoldingsAsOf } from '../store/selectors/index.js'
import * as S from '../store/selectors/index.js'
import { buildHoldingsTree } from '../utils/holdings-tree.js'

const pageContainerStyle = { padding: 'var(--space-4)', height: '100%' }

const dimensionLayouts = {
    account: { title: 'Holdings by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Holdings by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Holdings by Goal', subtitle: 'View portfolio positions by investment goal' },
}

/*
 * Investment holdings report with hierarchical tree display
 *
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height = '100%' }) => {
    // Get children from a tree node for DataTable getChildRows prop
    // @sig getChildRows :: TreeNode -> [TreeNode]
    const getChildRows = row => row.children

    // Rows can expand if they have children (tree) or are leaves with holdings (sub-component)
    // @sig getRowCanExpand :: Row -> Boolean
    const getRowCanExpand = row => {
        const { children, value } = row.original
        const hasChildren = children && children.length > 0
        const hasHoldings = value && value.length > 0
        return hasChildren || hasHoldings
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Hooks (selectors)
    // -----------------------------------------------------------------------------------------------------------------
    const [, setLayout] = useChannel(layoutChannel)
    const holdings = useSelector(state => enrichedHoldingsAsOf(state, viewId))
    const groupBy = useSelector(state => S.groupBy(state, viewId))

    // -----------------------------------------------------------------------------------------------------------------
    // Local state for expanded rows
    // -----------------------------------------------------------------------------------------------------------------
    const [expanded, setExpanded] = useState({})

    // -----------------------------------------------------------------------------------------------------------------
    // Memos (data transformations)
    // -----------------------------------------------------------------------------------------------------------------

    // Build aggregated tree from holdings by selected dimension
    const holdingsTree = useMemo(() => buildHoldingsTree(groupBy || 'account', holdings), [groupBy, holdings])

    // -----------------------------------------------------------------------------------------------------------------
    // Callbacks
    // -----------------------------------------------------------------------------------------------------------------
    const handleExpandedChange = useCallback(
        updater => setExpanded(prev => (typeof updater === 'function' ? updater(prev) : updater)),
        [],
    )

    // Render holdings list when leaf row is expanded
    // @sig renderSubComponent :: { row: Row } -> ReactElement
    const renderSubComponent = useCallback(({ row }) => <HoldingsSubTable holdings={row.original.value} />, [])

    // -----------------------------------------------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------------------------------------------
    useEffect(() => setLayout(dimensionLayouts[groupBy] || dimensionLayouts.account), [setLayout, groupBy])

    return (
        <Flex direction="column" style={pageContainerStyle}>
            <FilterChipRow
                viewId={viewId}
                showGroupBy
                showAsOfDate
                showCategories={false}
                groupByOptions={investmentGroupByOptions}
            />
            <DataTable
                columns={investmentReportColumns}
                data={holdingsTree}
                height={height}
                rowHeight={40}
                getChildRows={getChildRows}
                getRowCanExpand={getRowCanExpand}
                renderSubComponent={renderSubComponent}
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
            />
        </Flex>
    )
}

/*
 * Sub-table showing individual holdings when a tree row is expanded
 *
 * @sig HoldingsSubTable :: ({ holdings: [EnrichedHolding] }) -> ReactElement
 */
const HoldingsSubTable = ({ holdings }) => {
    // Render a single holding row
    // @sig renderHoldingRow :: (EnrichedHolding, Number) -> ReactElement
    const renderHoldingRow = (holding, i) => {
        const {
            accountName,
            avgCostPerShare,
            isStale,
            marketValue,
            quantity,
            quotePrice,
            securityName,
            securitySymbol,
            unrealizedGainLoss,
        } = holding
        const staleCell = isStale ? staleStyle : {}
        const gainColor = unrealizedGainLoss >= 0 ? 'var(--green-11)' : 'var(--red-11)'

        return (
            <tr key={i}>
                <td style={{ ...cellStyle, width: security }}>
                    <div style={{ fontWeight: 500 }}>{securitySymbol || '—'}</div>
                    <div style={{ fontSize: 'var(--font-size-1)', color: 'var(--gray-11)' }}>{securityName || ''}</div>
                </td>
                <td style={{ ...cellStyle, width: account }}>{accountName}</td>
                <td style={{ ...rightCell, width: shares }}>{quantity.toFixed(3)}</td>
                <td style={{ ...rightCell, ...staleCell, width: cost }}>${avgCostPerShare.toFixed(2)}</td>
                <td style={{ ...rightCell, ...staleCell, width: price }}>
                    ${quotePrice.toFixed(2)}
                    {isStale ? '*' : ''}
                </td>
                <td style={{ ...rightCell, ...staleCell, width: value }}>
                    ${marketValue.toFixed(2)}
                    {isStale ? '*' : ''}
                </td>
                <td style={{ ...rightCell, color: gainColor, ...staleCell, width: gain }}>
                    ${unrealizedGainLoss.toFixed(2)}
                    {isStale ? '*' : ''}
                </td>
            </tr>
        )
    }

    // Column widths for consistent layout
    const { account, cost, gain, price, security, shares, value } = {
        security: 220,
        account: 120,
        shares: 80,
        cost: 80,
        price: 80,
        value: 100,
        gain: 100,
    }

    const containerStyle = {
        backgroundColor: 'var(--gray-2)',
        borderRadius: 'var(--radius-2)',
        margin: '0 var(--space-4)',
        padding: 'var(--space-2)',
        maxHeight: '200px',
        overflowY: 'auto',
    }

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 'var(--font-size-1)',
        tableLayout: 'fixed',
    }

    const headerStyle = {
        textAlign: 'left',
        padding: 'var(--space-1) var(--space-2)',
        borderBottom: '1px solid var(--gray-6)',
        color: 'var(--gray-11)',
        fontWeight: 500,
    }

    const cellStyle = { padding: 'var(--space-1) var(--space-2)', borderBottom: '1px solid var(--gray-4)' }
    const rightCell = { ...cellStyle, textAlign: 'right' }
    const staleStyle = { fontStyle: 'italic' }

    if (!holdings || holdings.length === 0) return <div style={containerStyle}>No holdings</div>

    return (
        <div style={containerStyle}>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={{ ...headerStyle, width: security }}>Security</th>
                        <th style={{ ...headerStyle, width: account }}>Account</th>
                        <th style={{ ...headerStyle, textAlign: 'right', width: shares }}>Shares</th>
                        <th style={{ ...headerStyle, textAlign: 'right', width: cost }}>Avg Cost</th>
                        <th style={{ ...headerStyle, textAlign: 'right', width: price }}>Price</th>
                        <th style={{ ...headerStyle, textAlign: 'right', width: value }}>Mkt Value</th>
                        <th style={{ ...headerStyle, textAlign: 'right', width: gain }}>Gain/Loss</th>
                    </tr>
                </thead>
                <tbody>{holdings.map(renderHoldingRow)}</tbody>
            </table>
        </div>
    )
}

export default InvestmentReportPage
export { InvestmentReportPage }
