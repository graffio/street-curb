// ABOUTME: Cell renderers for transaction register table columns
// ABOUTME: TanStack Table components with search highlighting and formatting

import { containsIgnoreCase } from '@graffio/functional'
import React from 'react'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors/index.js'
import { formatCurrency, formatDate, formatPrice, formatQuantity } from '../utils/formatters.js'

// ---------------------------------------------------------------------------------------------------------------------
// Cell renderers
// ---------------------------------------------------------------------------------------------------------------------

// Render text with search matches highlighted
// @sig HighlightedText :: { text: String, searchQuery: String } -> ReactElement
const HighlightedText = ({ text, searchQuery }) => {
    // Find all occurrences of query in text, returning array of match segments
    // @sig findMatches :: (String, String, Number) -> [{ text: String, isMatch: Boolean }]
    const findMatches = (text, query, fromIndex = 0) => {
        const index = text.toLowerCase().indexOf(query.toLowerCase(), fromIndex)
        if (index === -1) return fromIndex < text.length ? [{ text: text.slice(fromIndex), isMatch: false }] : []

        const before = index > fromIndex ? [{ text: text.slice(fromIndex, index), isMatch: false }] : []
        const match = [{ text: text.slice(index, index + query.length), isMatch: true }]
        const rest = findMatches(text, query, index + query.length)
        return [...before, ...match, ...rest]
    }

    if (!searchQuery?.trim() || !text) return <span>{text || ''}</span>
    if (!containsIgnoreCase(searchQuery)(text)) return <span>{text}</span>

    const matches = findMatches(text, searchQuery)

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

// Cell renderer for date column with relative time below
// @sig DateCell :: { getValue: Function, table: Table } -> ReactElement
const DateCell = ({ getValue, table }) => {
    // Format relative time from date
    // @sig getRelativeTime :: Date -> String
    const getRelativeTime = date => {
        const now = new Date()
        const diffMs = now - date
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return '1 day ago'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7)
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30)
            return months === 1 ? '1 month ago' : `${months} months ago`
        }
        const years = Math.floor(diffDays / 365)
        return years === 1 ? '1 year ago' : `${years} years ago`
    }

    const value = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const date = typeof value === 'string' ? new Date(value) : value
    const formatted = formatDate(value)
    const relative = getRelativeTime(date)

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

    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>

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

// Cell renderer for category column, looks up name from Redux store
// @sig CategoryCell :: { getValue: Function, table: Table } -> ReactElement
const CategoryCell = ({ getValue, table }) => {
    const categoryId = getValue()
    const name = useSelector(state => S.categoryName(state, categoryId))
    const searchQuery = table.options.meta?.searchQuery

    return (
        <span style={{ display: 'block' }}>
            <HighlightedText text={name} searchQuery={searchQuery} />
        </span>
    )
}

// Map QIF action codes to human-readable labels
const ACTION_LABELS = {
    Buy: 'Buy',
    Sell: 'Sell',
    Div: 'Dividend',
    ReinvDiv: 'Reinvest Div',
    XIn: 'Transfer In',
    XOut: 'Transfer Out',
    ContribX: 'Contribution',
    WithdrwX: 'Withdrawal',
    ShtSell: 'Short Sell',
    CvrShrt: 'Cover Short',
    CGLong: 'LT Cap Gain',
    CGShort: 'ST Cap Gain',
    MargInt: 'Margin Int',
    ShrsIn: 'Shares In',
    ShrsOut: 'Shares Out',
    StkSplit: 'Stock Split',
    Exercise: 'Exercise',
    Expire: 'Expire',
}

// Cell renderer for investment action column with human-readable labels
// @sig ActionCell :: { getValue: Function, table: Table } -> ReactElement
const ActionCell = ({ getValue, table }) => {
    const code = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const label = ACTION_LABELS[code] || code || ''

    return (
        <span style={{ display: 'block' }}>
            <HighlightedText text={label} searchQuery={searchQuery} />
        </span>
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

    const chevronStyle = { cursor: 'pointer', userSelect: 'none', width: 16, display: 'inline-block' }

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
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatQuantity(value)}</span>
}

// Cell renderer for prices with 2-4 decimal places (trailing zeros after cents stripped)
// @sig PriceCell :: { getValue: Function } -> ReactElement
const PriceCell = ({ getValue }) => {
    const value = getValue()
    if (value == null) return <span style={{ textAlign: 'right', display: 'block' }}>—</span>
    return <span style={{ textAlign: 'right', display: 'block' }}>{formatPrice(value)}</span>
}

export {
    AccountCell,
    ACTION_LABELS,
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
