export const Price = {
    name: 'Price',
    kind: 'tagged',
    fields: { id: /^prc_[a-f0-9]{12}$/, securityId: /^sec_[a-f0-9]{12}$/, date: 'String', price: 'Number' },
}

// Checks if a price is stale relative to target date
// @sig isStale :: (String, String, Number) -> Boolean
Price.isStale = (priceDate, targetDate, staleDays = 1) => {
    const diffMs = new Date(targetDate) - new Date(priceDate)
    return diffMs / (1000 * 60 * 60 * 24) > staleDays
}
