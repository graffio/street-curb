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
 *
 * @sig formatDate :: String -> String
 */
const formatDate = dateStr => dateFormatter.format(new Date(dateStr))

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

export { formatCurrency, formatDate, formatDateRange, formatPrice, formatQuantity, formatShortDate }
