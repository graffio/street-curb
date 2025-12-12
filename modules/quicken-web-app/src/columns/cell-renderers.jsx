/*
 * Cell Renderers for Transaction Register
 *
 * TanStack Table cell components for rendering transaction data.
 * Each renderer receives TanStack's cell context ({ getValue, row, column, table }).
 */

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

/*
 * Text highlighting for search matches
 */
const HighlightedText = ({ text, searchQuery }) => {
    if (!searchQuery?.trim() || !text) return <span>{text || ''}</span>

    const queryLower = searchQuery.toLowerCase()
    const textLower = text.toLowerCase()

    if (!textLower.includes(queryLower)) return <span>{text}</span>

    const matches = []
    let lastIndex = 0
    let index = textLower.indexOf(queryLower, lastIndex)

    while (index !== -1) {
        if (index > lastIndex) matches.push({ text: text.slice(lastIndex, index), isMatch: false })
        matches.push({ text: text.slice(index, index + searchQuery.length), isMatch: true })
        lastIndex = index + searchQuery.length
        index = textLower.indexOf(queryLower, lastIndex)
    }

    if (lastIndex < text.length) matches.push({ text: text.slice(lastIndex), isMatch: false })

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

/*
 * Cell renderer for date column (shows relative date below)
 */
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

/*
 * Cell renderer for payee column (shows memo below)
 */
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

/*
 * Cell renderer for currency values (conditional coloring, right-aligned)
 */
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

/*
 * Default cell - plain text with highlighting
 */
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

/*
 * Cell renderer for category column (fetches categories via useSelector)
 */
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
