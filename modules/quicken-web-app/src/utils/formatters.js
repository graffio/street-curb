// ABOUTME: Shared formatting utilities for currency, dates, and numbers
// ABOUTME: Centralizes Intl formatters to avoid duplicate object creation

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })

/*
 * Format a value as US currency
 *
 * @sig formatCurrency :: Number -> String
 */
const formatCurrency = value => currencyFormatter.format(value)

/*
 * Format a date string using medium date style (e.g., "Dec 24, 2025")
 * Parses YYYY-MM-DD as local date to avoid timezone shift
 *
 * @sig formatDate :: String -> String
 */
const formatDate = dateStr => {
    // Parse YYYY-MM-DD as local date (not UTC) by replacing hyphens with slashes
    const localDate = dateStr.includes('-') ? new Date(dateStr.replace(/-/g, '/')) : new Date(dateStr)
    return dateFormatter.format(localDate)
}

/*
 * Format a Date object as short date (e.g., "Dec 24, 2025")
 *
 * @sig formatShortDate :: Date? -> String?
 */
const formatShortDate = date => {
    if (!date || !(date instanceof Date)) return undefined
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/*
 * Format a date range for display (e.g., "Dec 1, 2025 – Dec 24, 2025")
 *
 * @sig formatDateRange :: (Date?, Date?) -> String?
 */
const formatDateRange = (start, end) => {
    const startStr = formatShortDate(start)
    const endStr = formatShortDate(end)
    if (!startStr || !endStr) return undefined
    return `${startStr} – ${endStr}`
}

/*
 * Format a Date as relative time (e.g., "3 days ago", "2 weeks ago")
 *
 * @sig formatRelativeTime :: Date -> String
 */
const formatRelativeTime = date => {
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

/*
 * Format a number with up to 3 decimal places (for share quantities)
 *
 * @sig formatQuantity :: Number -> String
 */
const formatQuantity = value => value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 })

/*
 * Format a price with 4 decimal places, stripping trailing zeros after cents
 *
 * @sig formatPrice :: Number -> String
 */
const formatPrice = value => {
    const raw = value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4 })
    return raw.replace(/(\.\d{2})00$/, '$1').replace(/(\.\d{2}\d)0$/, '$1')
}

/*
 * Format a decimal as a percentage (e.g., 0.1234 -> "12.34%")
 *
 * @sig formatPercentage :: Number -> String
 */
const formatPercentage = value => {
    const pct = value * 100
    const formatted = pct.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${formatted}%`
}

/*
 * Format currency for sidebar display (treats near-zero as $0.00, parenthesizes negatives)
 *
 * @sig toFormattedBalance :: Number -> String
 */
const toFormattedBalance = balance => {
    const rounded = Math.round(balance * 100) / 100
    if (rounded === 0) return '$0.00'
    const formatted = Math.abs(rounded).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    return rounded < 0 ? `(${formatted})` : formatted
}

/*
 * Format day change with sign (returns undefined for zero or undefined)
 *
 * @sig toFormattedDayChange :: Number -> String?
 */
const toFormattedDayChange = change => {
    if (change === 0 || change === undefined) return undefined
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
}

/*
 * Gets color token for day change direction
 *
 * @sig toDayChangeColor :: Number -> String
 */
const toDayChangeColor = change => (change > 0 ? 'green' : 'red')

/*
 * Split text into segments with match/non-match flags for search highlighting
 *
 * @sig toHighlightSegments :: (String, String) -> [{ text: String, isMatch: Boolean }]
 */
const toHighlightSegments = (text, query, fromIndex = 0) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase(), fromIndex)
    if (index === -1) return fromIndex < text.length ? [{ text: text.slice(fromIndex), isMatch: false }] : []

    const before = index > fromIndex ? [{ text: text.slice(fromIndex, index), isMatch: false }] : []
    const match = [{ text: text.slice(index, index + query.length), isMatch: true }]
    const rest = toHighlightSegments(text, query, index + query.length)
    return [...before, ...match, ...rest]
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const Formatters = {
    formatCurrency,
    formatDate,
    formatDateRange,
    formatPercentage,
    formatPrice,
    formatQuantity,
    formatRelativeTime,
    formatShortDate,
    toDayChangeColor,
    toFormattedBalance,
    toFormattedDayChange,
    toHighlightSegments,
}

export { Formatters }
