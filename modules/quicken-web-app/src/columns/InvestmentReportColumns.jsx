// ABOUTME: Column definitions for investment holdings report
// ABOUTME: Displays HoldingsTreeNode tree with aggregate/holding data and stale price indicators

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { LookupTable } from '@graffio/functional'
import React from 'react'
import { formatCurrency, formatPercentage, formatPrice, formatQuantity } from '../utils/formatters.js'
import { HoldingsTreeNode } from '../types/holdings-tree-node.js'

const NUMERIC = { enableResizing: false, textAlign: 'right' }

// Predicates for node type detection (work on raw HoldingsTreeNode data)
const P = {
    // Checks if node is a Holding (vs Group) - for raw data from accessorFn
    // @sig isHolding :: HoldingsTreeNode -> Boolean
    isHolding: node => HoldingsTreeNode.Holding.is(node),

    // Checks if table row is a Holding node - for cell renderers
    // @sig isHoldingRow :: Row -> Boolean
    isHoldingRow: row => HoldingsTreeNode.Holding.is(row.original),
}

// Data accessors for accessorFn (receive raw HoldingsTreeNode)
const D = {
    // Get shares/quantity from node (cell renderer decides if aggregate is meaningful)
    // @sig toShares :: HoldingsTreeNode -> Number?
    toShares: node => (P.isHolding(node) ? node.holding.quantity : node.aggregate.shares),

    // Get market value from node
    // @sig toMarketValue :: HoldingsTreeNode -> Number?
    toMarketValue: node => (P.isHolding(node) ? node.holding.marketValue : node.aggregate.marketValue),

    // Get cost basis from node
    // @sig toCostBasis :: HoldingsTreeNode -> Number?
    toCostBasis: node => (P.isHolding(node) ? node.holding.costBasis : node.aggregate.costBasis),

    // Get average cost per share (cell renderer decides if aggregate is meaningful)
    // @sig toAverageCostPerShare :: HoldingsTreeNode -> Number?
    toAverageCostPerShare: node =>
        P.isHolding(node) ? node.holding.averageCostPerShare : node.aggregate.averageCostPerShare,

    // Get quote price from node (only for holdings)
    // @sig toQuotePrice :: HoldingsTreeNode -> Number?
    toQuotePrice: node => (P.isHolding(node) ? node.holding.quotePrice : null),

    // Get day gain/loss from node
    // @sig toDayGainLoss :: HoldingsTreeNode -> Number?
    toDayGainLoss: node => (P.isHolding(node) ? node.holding.dayGainLoss : node.aggregate.dayGainLoss),

    // Get day gain/loss percent from node
    // @sig toDayGainLossPercent :: HoldingsTreeNode -> Number?
    toDayGainLossPercent: node =>
        P.isHolding(node) ? node.holding.dayGainLossPercent : node.aggregate.dayGainLossPercent,

    // Get security symbol from node (only for holdings)
    // @sig toSecuritySymbol :: HoldingsTreeNode -> String?
    toSecuritySymbol: node => (P.isHolding(node) ? node.holding.securitySymbol : null),
}

// Row transformers for cell renderers (receive TanStack Row with .original)
const T = {
    // Get stale status from row (only holdings have stale prices)
    // @sig toIsStale :: Row -> Boolean
    toIsStale: row => (P.isHoldingRow(row) ? row.original.holding.isStale : false),

    // Get security symbol from row (only for holdings)
    // @sig toSecuritySymbol :: Row -> String?
    toSecuritySymbol: row => (P.isHoldingRow(row) ? row.original.holding.securitySymbol : null),

    // Get shares/quantity from row
    // @sig toShares :: Row -> Number?
    toShares: row => (P.isHoldingRow(row) ? row.original.holding.quantity : row.original.aggregate.shares),

    // Get first holding child from a group node (for security grouping where all children share values)
    // @sig toFirstHoldingChild :: HoldingsTreeNode -> Holding?
    toFirstHoldingChild: node => {
        const firstChild = node.children?.[0]
        return firstChild && P.isHolding(firstChild) ? firstChild.holding : null
    },
}

// Cell renderer for expandable tree row with holding/group name
// @sig ExpandableNameCell :: { row: Row, getValue: Function } -> ReactElement
const ExpandableNameCell = ({ row, getValue }) => {
    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const value = getValue()

    const chevronStyle = { cursor: 'pointer', userSelect: 'none', width: 20, flexShrink: 0, fontSize: 12 }
    const containerStyle = { display: 'flex', alignItems: 'center', paddingLeft: depth * 16, minWidth: 0 }
    const textStyle = {
        marginLeft: 4,
        fontWeight: depth === 0 ? 600 : 400,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    }

    return (
        <div style={containerStyle}>
            <span style={chevronStyle} onClick={() => canExpand && row.toggleExpanded()}>
                {canExpand ? (isExpanded ? '▼' : '▶') : ''}
            </span>
            <span style={textStyle}>{value}</span>
        </div>
    )
}

// Base style for stale values
const staleStyle = { fontStyle: 'italic' }

// Cell renderer for currency with stale indicator
// @sig StaleCurrencyCell :: { row: Row, getValue: Function } -> ReactElement
const StaleCurrencyCell = ({ row, getValue }) => {
    const value = getValue()
    const isStale = T.toIsStale(row)

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatCurrency(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    const style = { color, fontWeight: '500', textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }

    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Cell renderer for percentage with stale indicator and color coding
// @sig StalePercentageCell :: { row: Row, getValue: Function } -> ReactElement
const StalePercentageCell = ({ row, getValue }) => {
    const value = getValue()
    const isStale = T.toIsStale(row)

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPercentage(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    const style = { color, fontWeight: '500', textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }

    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Cell renderer for shares/quantity (shows aggregate only when grouping by security)
// @sig SharesCell :: { row: Row, table: Table } -> ReactElement
const SharesCell = ({ row, table }) => {
    const isHolding = P.isHoldingRow(row)
    const groupBy = table.options.meta?.groupBy
    const showAggregate = groupBy === 'security'

    if (!isHolding && !showAggregate) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const value = isHolding ? row.original.holding.quantity : row.original.aggregate.shares
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatQuantity(value)}</span>
}

// Cell renderer for average cost per share (shows aggregate only when grouping by security)
// @sig AvgCostCell :: { row: Row, table: Table, getValue: Function } -> ReactElement
const AvgCostCell = ({ row, table, getValue }) => {
    const isHolding = P.isHoldingRow(row)
    const groupBy = table.options.meta?.groupBy
    const showAggregate = groupBy === 'security'
    const isStale = T.toIsStale(row)

    if (!isHolding && !showAggregate) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const value = getValue()
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPrice(value)
    const style = { textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }
    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Symbol cell (shows aggregate only when grouping by security - all children have same symbol)
// @sig SymbolCell :: { row: Row, table: Table } -> ReactElement
const SymbolCell = ({ row, table }) => {
    const isHolding = P.isHoldingRow(row)
    const showAggregate = table.options.meta?.groupBy === 'security'

    const symbol = isHolding
        ? row.original.holding.securitySymbol
        : showAggregate
          ? T.toFirstHoldingChild(row.original)?.securitySymbol
          : null

    if (!symbol) return <span style={{ display: 'block' }}>—</span>
    return <span style={{ display: 'block', fontWeight: 500 }}>{symbol}</span>
}

// Price cell (shows aggregate only when grouping by security - all children have same price)
// @sig PriceCell :: { row: Row, table: Table, getValue: Function } -> ReactElement
const PriceCell = ({ row, table, getValue }) => {
    const isHolding = P.isHoldingRow(row)
    const showAggregate = table.options.meta?.groupBy === 'security'
    const isStale = T.toIsStale(row)

    const value = isHolding ? getValue() : showAggregate ? T.toFirstHoldingChild(row.original)?.quotePrice : null

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPrice(value)
    const style = { textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }
    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

/*
 * Column definitions for investment holdings report
 * Row structure: HoldingsTreeNode (Group with aggregate, or Holding with holding)
 */
// prettier-ignore
const columns = LookupTable([
    ColumnDefinition.from({ id: 'name',      accessorKey: 'key',                              header: 'Name',      size: 200, minSize: 150, cell: ExpandableNameCell,   enableResizing: true }),
    ColumnDefinition.from({ id: 'symbol',    accessorFn: D.toSecuritySymbol,                  header: 'Symbol',    size: 80,  minSize: 60,  cell: SymbolCell,           enableResizing: true }),
    ColumnDefinition.from({ id: 'dayPct',    accessorFn: D.toDayGainLossPercent,              header: 'Day %',     size: 80,  minSize: 60,  cell: StalePercentageCell,  ...NUMERIC }),
    ColumnDefinition.from({ id: 'dayGain',   accessorFn: D.toDayGainLoss,                     header: 'Day Gain',  size: 100, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
    ColumnDefinition.from({ id: 'price',     accessorFn: D.toQuotePrice,                      header: 'Price',     size: 90,  minSize: 70,  cell: PriceCell,            ...NUMERIC }),
    ColumnDefinition.from({ id: 'avgCost',   accessorFn: D.toAverageCostPerShare,             header: 'Avg Cost',  size: 90,  minSize: 70,  cell: AvgCostCell,          ...NUMERIC }),
    ColumnDefinition.from({ id: 'costBasis', accessorFn: D.toCostBasis,                       header: 'Cost Basis',size: 110, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
    ColumnDefinition.from({ id: 'shares',    accessorFn: D.toShares,                          header: 'Shares',    size: 90,  minSize: 70,  cell: SharesCell,           ...NUMERIC }),
    ColumnDefinition.from({ id: 'mktValue',  accessorFn: D.toMarketValue,                     header: 'Mkt Value', size: 110, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
], ColumnDefinition, 'id')

const InvestmentReportColumns = { columns }

export { InvestmentReportColumns }
