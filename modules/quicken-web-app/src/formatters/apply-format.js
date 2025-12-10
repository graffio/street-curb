/*
 * applyFormat - Interpreter for Format tagged type
 *
 * Pattern matches on Format variants to apply formatting logic.
 * This is app-specific because it includes custom formatters like signedAmount.
 *
 * @sig applyFormat :: (Any, Format?) -> String
 */

import { store } from '../store/index.js'

/*
 * Calculate relative time from date
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

/*
 * Format amount with sign prefix (for transaction amounts)
 * @sig formatSignedAmount :: Number -> String
 */
const formatSignedAmount = amount => {
    const absAmount = Math.abs(amount)
    const formatted = absAmount.toFixed(2)
    return amount >= 0 ? `+$${formatted}` : `-$${formatted}`
}

/*
 * Resolve categoryId to category name from Redux store
 * @sig formatCategoryName :: String -> String
 */
const formatCategoryName = categoryId => {
    const categories = store.getState().categories
    return categories?.get(categoryId)?.name ?? ''
}

/*
 * Registry of custom formatters by key
 */
const customFormatters = { signedAmount: formatSignedAmount, categoryName: formatCategoryName }

/*
 * Parse date from various inputs
 * @sig parseDate :: Any -> Date
 */
const parseDate = value => {
    if (value instanceof Date) return value
    if (typeof value === 'string') return new Date(value)
    return new Date(value)
}

/*
 * Apply a Format spec to a value
 * @sig applyFormat :: (Any, Format?) -> String
 */
const applyFormat = (value, format) => {
    // Handle null/undefined values
    if (value == null) return ''

    // Handle undefined/null format - return string representation
    if (format == null) return String(value)

    return format.match({
        None: () => String(value),

        Currency: ({ locale, currency }) => {
            const effectiveLocale = locale ?? 'en-US'
            const effectiveCurrency = currency ?? 'USD'
            return new Intl.NumberFormat(effectiveLocale, { style: 'currency', currency: effectiveCurrency }).format(
                value,
            )
        },

        Date: ({ style }) => {
            const date = parseDate(value)
            const effectiveStyle = style ?? 'medium'
            const options = { dateStyle: effectiveStyle }
            return new Intl.DateTimeFormat('en-US', options).format(date)
        },

        RelativeDate: () => {
            const date = parseDate(value)
            return getRelativeTime(date)
        },

        Boolean: ({ trueValue, falseValue }) => {
            if (value) return trueValue ?? 'true'
            return falseValue ?? 'false'
        },

        Custom: ({ key }) => {
            const formatter = customFormatters[key]
            if (formatter) return formatter(value)
            return String(value)
        },
    })
}

export { applyFormat, customFormatters }
