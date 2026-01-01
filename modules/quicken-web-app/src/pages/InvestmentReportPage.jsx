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

const pageContainerStyle = { height: '100%' }

const dimensionLayouts = {
    account: { title: 'Holdings by Account', subtitle: 'View portfolio positions by account' },
    security: { title: 'Holdings by Security', subtitle: 'View portfolio positions by security' },
    securityType: { title: 'Holdings by Type', subtitle: 'View portfolio positions by security type' },
    goal: { title: 'Holdings by Goal', subtitle: 'View portfolio positions by investment goal' },
}

// Shared column widths for holdings sub-table
const COL_WIDTHS = { security: 220, account: 120, shares: 80, cost: 80, price: 80, value: 100, gain: 100 }

// Shared styles for holdings sub-table
const CELL_STYLE = { padding: 'var(--space-1) var(--space-2)', borderBottom: '1px solid var(--gray-4)' }
const RIGHT_CELL = { ...CELL_STYLE, textAlign: 'right' }
const STALE_STYLE = { fontStyle: 'italic' }
const CONTAINER_STYLE = {
    backgroundColor: 'var(--gray-2)',
    borderRadius: 'var(--radius-2)',
    margin: '0 var(--space-4)',
    padding: 'var(--space-2)',
    maxHeight: '200px',
    overflowY: 'auto',
}
const TABLE_STYLE = { width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-1)', tableLayout: 'fixed' }
const HEADER_STYLE = {
    textAlign: 'left',
    padding: 'var(--space-1) var(--space-2)',
    borderBottom: '1px solid var(--gray-6)',
    color: 'var(--gray-11)',
    fontWeight: 500,
}
const RIGHT_HEADER_STYLE = { ...HEADER_STYLE, textAlign: 'right' }

const P = {
    // Rows can expand if they have children (tree) or are leaves with holdings (sub-component)
    // @sig canExpand :: Row -> Boolean
    canExpand: row => {
        const { children, value } = row.original
        return (children && children.length > 0) || (value && value.length > 0)
    },
}

const T = {
    // Get children from a tree node for DataTable getChildRows prop
    // @sig toChildRows :: TreeNode -> [TreeNode]
    toChildRows: row => row.children,

    // Generate header style with width
    // @sig toHeaderStyle :: Number -> Style
    toHeaderStyle: width => ({ ...HEADER_STYLE, width }),

    // Generate right-aligned header style with width
    // @sig toRightHeaderStyle :: Number -> Style
    toRightHeaderStyle: width => ({ ...RIGHT_HEADER_STYLE, width }),
}

/*
 * Single holding row in the sub-table
 *
 * @sig HoldingRow :: ({ holding: EnrichedHolding }) -> ReactElement
 */
const HoldingRow = ({ holding }) => {
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
    const { account, cost, gain, price, security, shares, value } = COL_WIDTHS
    const staleCell = isStale ? STALE_STYLE : {}
    const gainColor = unrealizedGainLoss >= 0 ? 'var(--green-11)' : 'var(--red-11)'

    return (
        <tr>
            <td style={{ ...CELL_STYLE, width: security }}>
                <div style={{ fontWeight: 500 }}>{securitySymbol || '—'}</div>
                <div style={{ fontSize: 'var(--font-size-1)', color: 'var(--gray-11)' }}>{securityName || ''}</div>
            </td>
            <td style={{ ...CELL_STYLE, width: account }}>{accountName}</td>
            <td style={{ ...RIGHT_CELL, width: shares }}>{quantity.toFixed(3)}</td>
            <td style={{ ...RIGHT_CELL, ...staleCell, width: cost }}>${avgCostPerShare.toFixed(2)}</td>
            <td style={{ ...RIGHT_CELL, ...staleCell, width: price }}>
                ${quotePrice.toFixed(2)}
                {isStale ? '*' : ''}
            </td>
            <td style={{ ...RIGHT_CELL, ...staleCell, width: value }}>
                ${marketValue.toFixed(2)}
                {isStale ? '*' : ''}
            </td>
            <td style={{ ...RIGHT_CELL, color: gainColor, ...staleCell, width: gain }}>
                ${unrealizedGainLoss.toFixed(2)}
                {isStale ? '*' : ''}
            </td>
        </tr>
    )
}

/*
 * Sub-table showing individual holdings when a tree row is expanded
 *
 * @sig HoldingsSubTable :: ({ holdings: [EnrichedHolding] }) -> ReactElement
 */
const HoldingsSubTable = ({ holdings }) => {
    const { account, cost, gain, price, security, shares, value } = COL_WIDTHS

    if (!holdings || holdings.length === 0) return <div style={CONTAINER_STYLE}>No holdings</div>

    return (
        <div style={CONTAINER_STYLE}>
            <table style={TABLE_STYLE}>
                <thead>
                    <tr>
                        <th style={T.toHeaderStyle(security)}>Security</th>
                        <th style={T.toHeaderStyle(account)}>Account</th>
                        <th style={T.toRightHeaderStyle(shares)}>Shares</th>
                        <th style={T.toRightHeaderStyle(cost)}>Avg Cost</th>
                        <th style={T.toRightHeaderStyle(price)}>Price</th>
                        <th style={T.toRightHeaderStyle(value)}>Mkt Value</th>
                        <th style={T.toRightHeaderStyle(gain)}>Gain/Loss</th>
                    </tr>
                </thead>
                <tbody>
                    {holdings.map((holding, i) => (
                        <HoldingRow key={i} holding={holding} />
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/*
 * Investment holdings report with hierarchical tree display
 *
 * @sig InvestmentReportPage :: ({ viewId: String, height?: String }) -> ReactElement
 */
const InvestmentReportPage = ({ viewId, height = '100%' }) => {
    const [, setLayout] = useChannel(layoutChannel)
    const holdings = useSelector(state => enrichedHoldingsAsOf(state, viewId))
    const groupBy = useSelector(state => S.groupBy(state, viewId))
    const [expanded, setExpanded] = useState({})

    const holdingsTree = useMemo(() => buildHoldingsTree(groupBy || 'account', holdings), [groupBy, holdings])
    const renderSubComponent = useCallback(({ row }) => <HoldingsSubTable holdings={row.original.value} />, [])
    const handleExpandedChange = useCallback(
        updater => setExpanded(prev => (typeof updater === 'function' ? updater(prev) : updater)),
        [],
    )

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
                getChildRows={T.toChildRows}
                getRowCanExpand={P.canExpand}
                renderSubComponent={renderSubComponent}
                expanded={expanded}
                onExpandedChange={handleExpandedChange}
            />
        </Flex>
    )
}

export default InvestmentReportPage
export { InvestmentReportPage }
