// ABOUTME: Cell renderers for transaction register table columns
// ABOUTME: TanStack Table components with search highlighting and formatting

import React from 'react'
import { useSelector } from 'react-redux'
import * as S from '../store/selectors/index.js'

// ---------------------------------------------------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------------------------------------------------

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

/*
 * Format relative time from date
 * @sig getRelativeTime :: Date -> String
 */
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

// ---------------------------------------------------------------------------------------------------------------------
// Cell renderers
// ---------------------------------------------------------------------------------------------------------------------

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

// Render text with search matches highlighted
// @sig HighlightedText :: { text: String, searchQuery: String } -> ReactElement
const HighlightedText = ({ text, searchQuery }) => {
    if (!searchQuery?.trim() || !text) return <span>{text || ''}</span>
    if (!text.toLowerCase().includes(searchQuery.toLowerCase())) return <span>{text}</span>

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
    const value = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const date = typeof value === 'string' ? new Date(value) : value
    const formatted = dateFormatter.format(date)
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
// @sig PayeeCell :: { row: Row, table: Table } -> ReactElement
const PayeeCell = ({ row, table }) => {
    const searchQuery = table.options.meta?.searchQuery
    const { payee, memo } = row.original

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
    const formatted = currencyFormatter.format(value)
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
    const categories = useSelector(S.categories)
    const categoryId = getValue()
    const searchQuery = table.options.meta?.searchQuery
    const categoryName = categories?.get(categoryId)?.name ?? ''

    return (
        <span style={{ display: 'block' }}>
            <HighlightedText text={categoryName} searchQuery={searchQuery} />
        </span>
    )
}

export { DateCell, PayeeCell, CurrencyCell, DefaultCell, CategoryCell }
