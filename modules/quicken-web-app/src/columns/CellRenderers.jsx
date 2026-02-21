// ABOUTME: Cell renderers for transaction register table columns
// ABOUTME: TanStack Table components with search highlighting and formatting
// COMPLEXITY: react-redux-separation — TanStack Table cell callbacks, not standard app components

import { containsIgnoreCase } from '@graffio/functional'
import React from 'react'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors.js'
import { Transaction } from '../types/index.js'
import { Formatters } from '../utils/formatters.js'

const { formatCurrency, formatDate, formatPrice, formatQuantity, formatRelativeTime, toHighlightSegments } = Formatters

// ---------------------------------------------------------------------------------------------------------------------
//
// Components
//
// ---------------------------------------------------------------------------------------------------------------------

// Render text with search matches highlighted
// @sig HighlightedText :: { text: String, searchQuery: String } -> ReactElement
const HighlightedText = ({ text, searchQuery }) => {
    if (!searchQuery?.trim() || !text) return <span>{text || ''}</span>
    if (!containsIgnoreCase(searchQuery)(text)) return <span>{text}</span>

    const matches = toHighlightSegments(text, searchQuery)

    return (
        <span>
            {matches.map((match, i) => (
                <span key={i} style={match.isMatch ? { backgroundColor: 'var(--ruby-6)' } : undefined}>
                    {match.text}
                </span>
            ))}
        </span>
    )
}

const ellipsisStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const chevronStyle = { cursor: 'pointer', userSelect: 'none', width: 20, display: 'inline-block', fontSize: 12 }

// Cell renderer for date column with relative time below
// @sig DateCell :: { getValue: Function, table: Table } -> ReactElement
const DateCell = ({ getValue, table }) => {
    const value = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const date = typeof value === 'string' ? new Date(value) : value
    const formatted = formatDate(value)
    const relative = formatRelativeTime(date)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ color: 'var(--gray-12)', ...ellipsisStyle }}>
                <HighlightedText text={formatted} searchQuery={searchQuery} />
            </div>
            <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)', ...ellipsisStyle }}>{relative}</div>
        </div>
    )
}

// Cell renderer for payee column with memo below
// Row is ViewRow.Detail with { transaction, computed } structure
// @sig PayeeCell :: { row: Row, table: Table } -> ReactElement
const PayeeCell = ({ row, table }) => {
    const searchQuery = table.options.meta?.searchQuery
    const { payee, memo } = row.original.transaction

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ color: 'var(--gray-12)', ...ellipsisStyle }}>
                <HighlightedText text={payee || 'Unknown Payee'} searchQuery={searchQuery} />
            </div>
            <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)', ...ellipsisStyle }}>
                <HighlightedText text={memo || ''} searchQuery={searchQuery} />
            </div>
        </div>
    )
}

// Cell renderer for currency values with conditional coloring
// @sig CurrencyCell :: { getValue: Function, table: Table } -> ReactElement
const CurrencyCell = ({ getValue, table }) => {
    const value = getValue()
    const searchQuery = table.options.meta?.searchQuery

    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

    const formatted = formatCurrency(value)
    const color = value >= 0 ? 'var(--green-11)' : 'var(--red-11)'

    return (
        <span style={{ color, fontWeight: '500', textAlign: 'right', display: 'block' }}>
            <HighlightedText text={formatted} searchQuery={searchQuery} />
        </span>
    )
}

// Default cell renderer with plain text and highlighting
// @sig DefaultCell :: { getValue: Function, column: Column, table: Table } -> ReactElement
const DefaultCell = ({ getValue, column, table }) => {
    const value = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const textAlign = column.columnDef.textAlign || 'left'

    return (
        <span style={{ textAlign, display: 'block' }}>
            <HighlightedText text={String(value ?? '')} searchQuery={searchQuery} />
        </span>
    )
}

// Cell renderer for category column — shows [Account Name] for transfers, category name otherwise
// @sig CategoryCell :: { getValue: Function, row: Row, table: Table } -> ReactElement
const CategoryCell = ({ getValue, row, table }) => {
    const categoryId = getValue()
    const transferAccountId = row.original.transaction.transferAccountId
    const categoryName = useSelector(state => S.categoryName(state, categoryId))
    const transferName = useSelector(state => (transferAccountId ? S.accountName(state, transferAccountId) : undefined))
    const name = transferName ? `[${transferName}]` : categoryName
    const searchQuery = table.options.meta?.searchQuery

    return (
        <span style={{ display: 'block' }}>
            <HighlightedText text={name} searchQuery={searchQuery} />
        </span>
    )
}

// Cell renderer for investment action column — shows transfer account as subtitle when present
// @sig ActionCell :: { getValue: Function, row: Row, table: Table } -> ReactElement
const ActionCell = ({ getValue, row, table }) => {
    const code = getValue()
    const transferAccountId = row.original.transaction.transferAccountId
    const transferName = useSelector(state => (transferAccountId ? S.accountName(state, transferAccountId) : undefined))
    const searchQuery = table.options.meta?.searchQuery
    const label = Transaction.ACTION_LABELS[code] || code || ''

    if (!transferName)
        return (
            <span style={{ display: 'block' }}>
                <HighlightedText text={label} searchQuery={searchQuery} />
            </span>
        )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ color: 'var(--gray-12)', ...ellipsisStyle }}>
                <HighlightedText text={label} searchQuery={searchQuery} />
            </div>
            <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)', ...ellipsisStyle }}>
                <HighlightedText text={transferName} searchQuery={searchQuery} />
            </div>
        </div>
    )
}

// Cell renderer for expandable tree row with category name
// @sig ExpandableCategoryCell :: { row: Row, getValue: Function } -> ReactElement
const ExpandableCategoryCell = ({ row, getValue }) => {
    const canExpand = row.getCanExpand()
    const isExpanded = row.getIsExpanded()
    const depth = row.depth
    const value = getValue()

    // Show last segment of path for display (e.g., "Food:Groceries" -> "Groceries")
    const displayName = value?.includes(':') ? value.split(':').pop() : value

    const indentStyle = { paddingLeft: depth * 16 }

    return (
        <div style={{ display: 'flex', alignItems: 'center', ...indentStyle }}>
            <span style={chevronStyle} onClick={() => canExpand && row.toggleExpanded()}>
                {canExpand ? (isExpanded ? '▼' : '▶') : ''}
            </span>
            <span style={{ marginLeft: 4, fontWeight: depth === 0 ? 600 : 400 }}>{displayName}</span>
        </div>
    )
}

// Cell renderer for security column, shows ticker and name (e.g., "VTIVX - Vanguard Target Retirement 2045")
// @sig SecurityCell :: { getValue: Function, table: Table } -> ReactElement
const SecurityCell = ({ getValue, table }) => {
    const securityId = getValue()
    const symbol = useSelector(state => S.securitySymbol(state, securityId))
    const name = useSelector(state => S.securityName(state, securityId))
    const searchQuery = table.options.meta?.searchQuery

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <div style={{ color: 'var(--gray-12)', ...ellipsisStyle }}>
                <HighlightedText text={name || ''} searchQuery={searchQuery} />
            </div>
            <div style={{ color: 'var(--gray-11)', fontSize: 'var(--font-size-1)', ...ellipsisStyle }}>
                <HighlightedText text={symbol || ''} searchQuery={searchQuery} />
            </div>
        </div>
    )
}

// Cell renderer for account column, looks up name from Redux store
// @sig AccountCell :: { getValue: Function, table: Table } -> ReactElement
const AccountCell = ({ getValue, table }) => {
    const accountId = getValue()
    const name = useSelector(state => S.accountName(state, accountId))
    const searchQuery = table.options.meta?.searchQuery

    return (
        <span style={{ display: 'block' }}>
            <HighlightedText text={name || accountId || ''} searchQuery={searchQuery} />
        </span>
    )
}

// Cell renderer for share quantity with 3 decimal places
// @sig QuantityCell :: { getValue: Function } -> ReactElement
const QuantityCell = ({ getValue }) => {
    const value = getValue()
    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatQuantity(value)}</span>
}

// Cell renderer for prices with 2-4 decimal places (trailing zeros after cents stripped)
// @sig PriceCell :: { getValue: Function } -> ReactElement
const PriceCell = ({ getValue }) => {
    const value = getValue()
    if (value === undefined) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatPrice(value)}</span>
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const CellRenderers = {
    AccountCell,
    ACTION_LABELS: Transaction.ACTION_LABELS,
    ActionCell,
    CategoryCell,
    CurrencyCell,
    DateCell,
    DefaultCell,
    ExpandableCategoryCell,
    PayeeCell,
    PriceCell,
    QuantityCell,
    SecurityCell,
}

export { CellRenderers }
