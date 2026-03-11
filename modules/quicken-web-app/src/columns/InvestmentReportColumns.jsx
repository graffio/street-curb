// ABOUTME: Column definitions for investment positions report
// ABOUTME: Displays PositionTreeNode tree with aggregate/position data and stale price indicators
// COMPLEXITY: react-redux-separation — Cell renderers use conditional spread for stale styling (display-only)
// COMPLEXITY: require-action-registry — Chevron onClick retained for mouse; keyboard uses row:toggle-expand

import { LookupTable } from '@graffio/functional'
import React from 'react'
import { PositionTreeNode } from '@graffio/query-language'
import { ColumnDefinition } from '../types/index.js'
import { Formatters } from '../utils/formatters.js'

const { formatCurrency, formatPercentage, formatPrice, formatQuantity } = Formatters

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

// Predicates for node type detection (work on raw PositionTreeNode data)
const P = {
    // Checks if node is a Position (vs Group) - for raw data from accessorFn
    // @sig isPosition :: PositionTreeNode -> Boolean
    isPosition: node => PositionTreeNode.Position.is(node),

    // Checks if table row is a Position node - for cell renderers
    // @sig isPositionRow :: Row -> Boolean
    isPositionRow: row => PositionTreeNode.Position.is(row.original),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // --- Node-level accessors (for TanStack accessorFn — receive raw PositionTreeNode) ---

    // Returns display name — securityName for positions, id for groups
    // @sig toDisplayName :: PositionTreeNode -> String
    toDisplayName: node => (P.isPosition(node) ? node.position.securityName : node.id),

    // Extracts share quantity from position or aggregate
    // @sig toShares :: PositionTreeNode -> Number?
    toShares: node => (P.isPosition(node) ? node.position.quantity : node.aggregate.shares),

    // Extracts market value from position or aggregate
    // @sig toMarketValue :: PositionTreeNode -> Number?
    toMarketValue: node => (P.isPosition(node) ? node.position.marketValue : node.aggregate.marketValue),

    // Extracts cost basis from position or aggregate
    // @sig toCostBasis :: PositionTreeNode -> Number?
    toCostBasis: node => (P.isPosition(node) ? node.position.costBasis : node.aggregate.costBasis),

    // Extracts average cost per share from position or aggregate
    // @sig toAverageCostPerShare :: PositionTreeNode -> Number?
    toAverageCostPerShare: node =>
        P.isPosition(node) ? node.position.averageCostPerShare : node.aggregate.averageCostPerShare,

    // Extracts quote price (positions only, undefined for groups)
    // @sig toQuotePrice :: PositionTreeNode -> Number?
    toQuotePrice: node => (P.isPosition(node) ? node.position.quotePrice : undefined),

    // Extracts day gain/loss from position or aggregate
    // @sig toDayGainLoss :: PositionTreeNode -> Number?
    toDayGainLoss: node => (P.isPosition(node) ? node.position.dayGainLoss : node.aggregate.dayGainLoss),

    // Extracts day gain/loss percentage from position or aggregate
    // @sig toDayGainLossPercent :: PositionTreeNode -> Number?
    toDayGainLossPercent: node =>
        P.isPosition(node) ? node.position.dayGainLossPercent : node.aggregate.dayGainLossPercent,

    // Extracts security ticker symbol (positions only, undefined for groups)
    // @sig toSecuritySymbol :: PositionTreeNode -> String?
    toSecuritySymbol: node => (P.isPosition(node) ? node.position.securitySymbol : undefined),

    // --- Row-level accessors (for cell renderers — receive TanStack Row with .original) ---

    // Checks if position has a stale price quote
    // @sig toIsStale :: Row -> Boolean
    toIsStale: row => (P.isPositionRow(row) ? row.original.position.isStale : false),

    // Gets the first Position child's data (for showing security-level info on group rows)
    // @sig toFirstPositionChild :: PositionTreeNode -> Position?
    toFirstPositionChild: node => {
        const firstChild = node.children?.[0]
        return firstChild && P.isPosition(firstChild) ? firstChild.position : undefined
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Cell renderer for expandable tree row with position/group name
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

    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

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

    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPercentage(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    const style = { color, fontWeight: '500', textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }

    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Cell renderer for shares/quantity (shows aggregate only when grouping by security)
// @sig SharesCell :: { row: Row, table: Table } -> ReactElement
const SharesCell = ({ row, table }) => {
    const isPosition = P.isPositionRow(row)
    const groupBy = table.options.meta?.groupBy
    const showAggregate = groupBy === 'security'

    if (!isPosition && !showAggregate) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const value = isPosition ? row.original.position.quantity : row.original.aggregate.shares
    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatQuantity(value)}</span>
}

// Cell renderer for average cost per share (shows aggregate only when grouping by security)
// @sig AvgCostCell :: { row: Row, table: Table, getValue: Function } -> ReactElement
const AvgCostCell = ({ row, table, getValue }) => {
    const isPosition = P.isPositionRow(row)
    const groupBy = table.options.meta?.groupBy
    const showAggregate = groupBy === 'security'
    const isStale = T.toIsStale(row)

    if (!isPosition && !showAggregate) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const value = getValue()
    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPrice(value)
    const style = { textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }
    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Symbol cell (shows aggregate only when grouping by security - all children have same symbol)
// @sig SymbolCell :: { row: Row, table: Table } -> ReactElement
const SymbolCell = ({ row, table }) => {
    const isPosition = P.isPositionRow(row)
    const showAggregate = table.options.meta?.groupBy === 'security'

    const symbol = isPosition
        ? row.original.position.securitySymbol
        : showAggregate
          ? T.toFirstPositionChild(row.original)?.securitySymbol
          : undefined

    if (!symbol) return <span style={{ display: 'block' }}>—</span>
    return <span style={{ display: 'block', fontWeight: 500 }}>{symbol}</span>
}

// Price cell (shows aggregate only when grouping by security - all children have same price)
// @sig PriceCell :: { row: Row, table: Table, getValue: Function } -> ReactElement
const PriceCell = ({ row, table, getValue }) => {
    const isPosition = P.isPositionRow(row)
    const showAggregate = table.options.meta?.groupBy === 'security'
    const isStale = T.toIsStale(row)

    const value = isPosition ? getValue() : showAggregate ? T.toFirstPositionChild(row.original)?.quotePrice : undefined

    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

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
 * Column definitions for investment positions report
 * Row structure: PositionTreeNode (Group with aggregate, or Position with position)
 */
// prettier-ignore
const columns = LookupTable([
    ColumnDefinition.from({ id: 'name',      accessorFn: T.toDisplayName,                     header: 'Name',      size: 200, minSize: 150, cell: ExpandableNameCell,   enableResizing: true }),
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
