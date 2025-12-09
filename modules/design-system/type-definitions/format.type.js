/*
 * Format - Tagged sum type for value formatting specifications
 *
 * Represents formatting instructions as data, enabling:
 * - Serializable column definitions
 * - Type-safe pattern matching in format interpreters
 * - Consistent formatting across tables/reports
 *
 * Usage:
 *   const currencyFormat = Format.Currency('en-US', 'USD')
 *   const formatted = applyFormat(1234.56, currencyFormat) // '$1,234.56'
 */

// prettier-ignore
export const Format = {
    name: 'Format',
    kind: 'taggedSum',
    variants: {
        Boolean     : { trueValue: 'String?', falseValue: 'String?' }, // Format boolean as custom strings
        Currency    : { locale: 'String?', currency: 'String?'      }, // Format as currency using Intl.NumberFormat
        Custom      : { key: 'String'                               }, // Escape hatch for app-specific formatters
        Date        : { style: '/short|medium|long|full/?'          }, // Format as date using Intl.DateTimeFormat
        None        : {                                             }, // No formatting - display value as-is
        RelativeDate: {                                             }, // Format as relative time (e.g., "2 days ago")
    },
}
