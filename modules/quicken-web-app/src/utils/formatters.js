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
    if (!date || !(date instanceof Date)) return null
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
    if (!startStr || !endStr) return null
    return `${startStr} – ${endStr}`
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
 * Format day change with sign (returns null for zero/nil)
 *
 * @sig toFormattedDayChange :: Number -> String?
 */
const toFormattedDayChange = change => {
    if (change === 0 || change == null) return null
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
}

/*
 * Gets color token for day change direction
 *
 * @sig toDayChangeColor :: Number -> String
 */
const toDayChangeColor = change => (change > 0 ? 'green' : 'red')

const Formatters = {
    formatCurrency,
    formatDate,
    formatDateRange,
    formatPercentage,
    formatPrice,
    formatQuantity,
    formatShortDate,
    toDayChangeColor,
    toFormattedBalance,
    toFormattedDayChange,
}

export { Formatters }
