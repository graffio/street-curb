// ABOUTME: Price type definition for security price history
// ABOUTME: Daily price quotes with staleness detection

import { FieldTypes } from './field-types.js'

export const Price = {
    name: 'Price',
    kind: 'tagged',
    fields: { id: FieldTypes.priceId, securityId: FieldTypes.securityId, date: 'String', price: 'Number' },
}

// Checks if a price is stale relative to target date
// @sig isStale :: (String, String, Number) -> Boolean
Price.isStale = (priceDate, targetDate, staleDays = 1) => {
    const diffMs = new Date(targetDate) - new Date(priceDate)
    return diffMs / (1000 * 60 * 60 * 24) > staleDays
}
