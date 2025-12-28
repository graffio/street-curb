// ABOUTME: Column definitions for investment holdings report
// ABOUTME: Displays positions with market values, gains/losses, and stale price indicators

import { ColumnDefinition } from '@graffio/design-system/src/types/column-definition.js'
import { LookupTable } from '@graffio/functional'
import React from 'react'
import { formatCurrency, formatPercentage, formatPrice, formatQuantity } from '../utils/formatters.js'

// Cell renderer for expandable tree row with holding/group name
// @sig ExpandableNameCell :: { row: Row, getValue: Function } -> ReactElement
const ExpandableNameCell = ({ row, getValue }) => {
    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const value = getValue()

    const chevronStyle = { cursor: 'pointer', userSelect: 'none', width: 16, display: 'inline-block' }
    const indentStyle = { paddingLeft: depth * 16 }

    return (
        <div style={{ display: 'flex', alignItems: 'center', ...indentStyle }}>
            <span style={chevronStyle} onClick={() => canExpand && row.toggleExpanded()}>
                {canExpand ? (isExpanded ? '▼' : '▶') : ''}
            </span>
            <span style={{ marginLeft: 4, fontWeight: depth === 0 ? 600 : 400 }}>{value}</span>
        </div>
    )
}

// Base style for stale values
const staleStyle = { fontStyle: 'italic' }

// Cell renderer for currency with stale indicator
// @sig StaleCurrencyCell :: { row: Row, getValue: Function } -> ReactElement
const StaleCurrencyCell = ({ row, getValue }) => {
    const value = getValue()
    const isStale = row.original.isStale ?? row.original.aggregate?.isStale ?? false

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
    const isStale = row.original.isStale ?? row.original.aggregate?.isStale ?? false

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPercentage(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'
    const style = { color, fontWeight: '500', textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }

    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Cell renderer for price with stale indicator
// @sig StalePriceCell :: { row: Row, getValue: Function } -> ReactElement
const StalePriceCell = ({ row, getValue }) => {
    const value = getValue()
    const isStale = row.original.isStale ?? row.original.aggregate?.isStale ?? false

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatPrice(value)
    const style = { textAlign: 'right', display: 'block', ...(isStale ? staleStyle : {}) }

    return <span style={style}>{isStale ? `${formatted}*` : formatted}</span>
}

// Cell renderer for aggregate quantity (shares from aggregate)
// @sig AggregateQuantityCell :: { row: Row } -> ReactElement
const AggregateQuantityCell = ({ row }) => {
    const value = row.original.aggregate?.shares ?? row.original.quantity
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatQuantity(value)}</span>
}

// Symbol cell for tree nodes showing ticker and name
// @sig SymbolCell :: { row: Row } -> ReactElement
const SymbolCell = ({ row }) => {
    const symbol = row.original.securitySymbol ?? ''
    const name = row.original.securityName ?? ''

    // Only show if there's a symbol (i.e., for individual holdings, not groups)
    if (!symbol) return <span style={{ display: 'block' }}>—</span>

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ display: 'block', fontWeight: 500 }}>{symbol}</span>
            {name && (
                <span style={{ display: 'block', color: 'var(--gray-11)', fontSize: 'var(--font-size-1)' }}>
                    {name}
                </span>
            )}
        </div>
    )
}

// Market value percentage cell
// @sig MarketValuePctCell :: { row: Row } -> ReactElement
const MarketValuePctCell = ({ row }) => {
    const value = row.original.marketValuePct ?? row.original.aggregate?.marketValuePct
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatPercentage(value)}</span>
}

/*
 * Column definitions for investment holdings report
 * Row structure for tree: TreeNode with { key, value, children, aggregate }
 * Row structure for leaves: EnrichedHolding
 */
// prettier-ignore
const investmentReportColumns = LookupTable([
    ColumnDefinition.from({ id: 'name',          accessorKey: 'key',                          header: 'Name',            size: 200, minSize: 150, cell: ExpandableNameCell,   enableResizing: true }),
    ColumnDefinition.from({ id: 'symbol',        accessorKey: 'securitySymbol',               header: 'Symbol',          size: 80,  minSize: 60,  cell: SymbolCell,           enableResizing: true }),
    ColumnDefinition.from({ id: 'dayGainLossPct',accessorKey: 'aggregate.dayGainLossPct',     header: 'Day %',           size: 80,  minSize: 60,  cell: StalePercentageCell,  enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'dayGainLoss',   accessorKey: 'aggregate.dayGainLoss',        header: 'Day Gain',        size: 100, minSize: 80,  cell: StaleCurrencyCell,    enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'quotePrice',    accessorKey: 'aggregate.quotePrice',         header: 'Price',           size: 90,  minSize: 70,  cell: StalePriceCell,       enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'avgCost',       accessorKey: 'aggregate.avgCostPerShare',    header: 'Avg Cost',        size: 90,  minSize: 70,  cell: StalePriceCell,       enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'costBasis',     accessorKey: 'aggregate.costBasis',          header: 'Cost Basis',      size: 110, minSize: 80,  cell: StaleCurrencyCell,    enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'shares',        accessorKey: 'aggregate.shares',             header: 'Shares',          size: 90,  minSize: 70,  cell: AggregateQuantityCell,enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'marketValue',   accessorKey: 'aggregate.marketValue',        header: 'Mkt Value',       size: 110, minSize: 80,  cell: StaleCurrencyCell,    enableResizing: false, textAlign: 'right' }),
    ColumnDefinition.from({ id: 'marketValuePct',accessorKey: 'aggregate.marketValuePct',     header: 'Mkt %',           size: 70,  minSize: 50,  cell: MarketValuePctCell,   enableResizing: false, textAlign: 'right' }),
], ColumnDefinition, 'id')

export { investmentReportColumns }
