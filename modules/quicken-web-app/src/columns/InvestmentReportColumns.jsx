// ABOUTME: Column definitions for investment holdings report
// ABOUTME: Displays HoldingsTreeNode tree with aggregate/holding data and stale price indicators
// COMPLEXITY: react-redux-separation — Cell renderers use conditional spread for stale styling (display-only)

import { LookupTable } from '@graffio/functional'
import React from 'react'
import { ColumnDefinition, HoldingsTreeNode } from '../types/index.js'
import { Formatters } from '../utils/formatters.js'

const { formatCurrency, formatPercentage, formatPrice, formatQuantity } = Formatters

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

// Predicates for node type detection (work on raw HoldingsTreeNode data)
const P = {
    // Checks if node is a Holding (vs Group) - for raw data from accessorFn
    // @sig isHolding :: HoldingsTreeNode -> Boolean
    isHolding: node => HoldingsTreeNode.Holding.is(node),

    // Checks if table row is a Holding node - for cell renderers
    // @sig isHoldingRow :: Row -> Boolean
    isHoldingRow: row => HoldingsTreeNode.Holding.is(row.original),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // --- Node-level accessors (for TanStack accessorFn — receive raw HoldingsTreeNode) ---

    // Extracts share quantity from holding or aggregate
    // @sig toShares :: HoldingsTreeNode -> Number?
    toShares: node => (P.isHolding(node) ? node.holding.quantity : node.aggregate.shares),

    // Extracts market value from holding or aggregate
    // @sig toMarketValue :: HoldingsTreeNode -> Number?
    toMarketValue: node => (P.isHolding(node) ? node.holding.marketValue : node.aggregate.marketValue),

    // Extracts cost basis from holding or aggregate
    // @sig toCostBasis :: HoldingsTreeNode -> Number?
    toCostBasis: node => (P.isHolding(node) ? node.holding.costBasis : node.aggregate.costBasis),

    // Extracts average cost per share from holding or aggregate
    // @sig toAverageCostPerShare :: HoldingsTreeNode -> Number?
    toAverageCostPerShare: node =>
        P.isHolding(node) ? node.holding.averageCostPerShare : node.aggregate.averageCostPerShare,

    // Extracts quote price (holdings only, null for groups)
    // @sig toQuotePrice :: HoldingsTreeNode -> Number?
    toQuotePrice: node => (P.isHolding(node) ? node.holding.quotePrice : null),

    // Extracts day gain/loss from holding or aggregate
    // @sig toDayGainLoss :: HoldingsTreeNode -> Number?
    toDayGainLoss: node => (P.isHolding(node) ? node.holding.dayGainLoss : node.aggregate.dayGainLoss),

    // Extracts day gain/loss percentage from holding or aggregate
    // @sig toDayGainLossPercent :: HoldingsTreeNode -> Number?
    toDayGainLossPercent: node =>
        P.isHolding(node) ? node.holding.dayGainLossPercent : node.aggregate.dayGainLossPercent,

    // Extracts security ticker symbol (holdings only, null for groups)
    // @sig toSecuritySymbol :: HoldingsTreeNode -> String?
    toSecuritySymbol: node => (P.isHolding(node) ? node.holding.securitySymbol : null),

    // --- Row-level accessors (for cell renderers — receive TanStack Row with .original) ---

    // Checks if holding has a stale price quote
    // @sig toIsStale :: Row -> Boolean
    toIsStale: row => (P.isHoldingRow(row) ? row.original.holding.isStale : false),

    // Gets the first Holding child's data (for showing security-level info on group rows)
    // @sig toFirstHoldingChild :: HoldingsTreeNode -> Holding?
    toFirstHoldingChild: node => {
        const firstChild = node.children?.[0]
        return firstChild && P.isHolding(firstChild) ? firstChild.holding : null
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------------------------------------------------
//
// Constants
//
// ---------------------------------------------------------------------------------------------------------------------

const NUMERIC = { enableResizing: false, textAlign: 'right' }
const staleStyle = { fontStyle: 'italic' }

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

/*
 * Column definitions for investment holdings report
 * Row structure: HoldingsTreeNode (Group with aggregate, or Holding with holding)
 */
// prettier-ignore
const columns = LookupTable([
    ColumnDefinition.from({ id: 'name',      accessorKey: 'key',                              header: 'Name',      size: 200, minSize: 150, cell: ExpandableNameCell,   enableResizing: true }),
    ColumnDefinition.from({ id: 'symbol',    accessorFn: T.toSecuritySymbol,                  header: 'Symbol',    size: 80,  minSize: 60,  cell: SymbolCell,           enableResizing: true }),
    ColumnDefinition.from({ id: 'dayPct',    accessorFn: T.toDayGainLossPercent,              header: 'Day %',     size: 80,  minSize: 60,  cell: StalePercentageCell,  ...NUMERIC }),
    ColumnDefinition.from({ id: 'dayGain',   accessorFn: T.toDayGainLoss,                     header: 'Day Gain',  size: 100, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
    ColumnDefinition.from({ id: 'price',     accessorFn: T.toQuotePrice,                      header: 'Price',     size: 90,  minSize: 70,  cell: PriceCell,            ...NUMERIC }),
    ColumnDefinition.from({ id: 'avgCost',   accessorFn: T.toAverageCostPerShare,             header: 'Avg Cost',  size: 90,  minSize: 70,  cell: AvgCostCell,          ...NUMERIC }),
    ColumnDefinition.from({ id: 'costBasis', accessorFn: T.toCostBasis,                       header: 'Cost Basis',size: 110, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
    ColumnDefinition.from({ id: 'shares',    accessorFn: T.toShares,                          header: 'Shares',    size: 90,  minSize: 70,  cell: SharesCell,           ...NUMERIC }),
    ColumnDefinition.from({ id: 'mktValue',  accessorFn: T.toMarketValue,                     header: 'Mkt Value', size: 110, minSize: 80,  cell: StaleCurrencyCell,    ...NUMERIC }),
], ColumnDefinition, 'id')

export { columns as InvestmentReportColumns }
