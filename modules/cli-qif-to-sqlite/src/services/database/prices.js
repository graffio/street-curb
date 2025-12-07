import { map } from '@graffio/functional'
import { Entry, Price } from '../../types/index.js'

/*
 * Insert price into database
 * @sig insertPrice :: (Database, Entry.Price, Security) -> Number
 */
/*
 * Insert price into database
 * @sig insertPrice :: (Database, Entry.Price, Security) -> Number
 */

/*
 * Insert price into database
 * @sig insertPrice :: (Database, Entry.Price, Security) -> Number
 */
const insertPrice = (db, priceEntry, security) => {
    if (!Entry.Price.is(priceEntry)) throw new Error(`Expected Entry.Price; found: ${JSON.stringify(priceEntry)}`)

    const { price, date } = priceEntry
    const dateString = date.toISOString().split('T')[0]

    // Check if price already exists
    const existing = db
        .prepare('SELECT price FROM prices WHERE security_id = ? AND date = ?')
        .get(security.id, dateString)

    // Option: Keep existing, log conflict
    if (existing && existing.price !== price) {
        console.warn(`Price conflict for ${security.symbol} on ${dateString}: existing=${existing.price}, new=${price}`)
        return existing.id
    }

    // Same price, no conflict
    if (existing) return existing.id

    const stmt = db.prepare(`INSERT INTO prices (security_id, date, price) VALUES (?, ?, ?)`)
    const result = stmt.run(security.id, dateString, price)
    return result.lastInsertRowid
}

/*
 * Import prices into database
 * @sig importPrices :: (Database, [Entry.Price], [Security]) -> [Number]
 */
const importPrices = (db, prices, securities) => {
    const securityMap = new Map()
    securities.forEach(security => {
        if (security.symbol) securityMap.set(security.symbol, security)
        securityMap.set(security.name, security)
    })

    const results = []
    prices.forEach(price => {
        try {
            const security = securityMap.get(price.symbol)
            if (!security) throw new Error(`Security not found for symbol: ${price.symbol}`)

            results.push(insertPrice(db, price, security))
        } catch (error) {
            throw new Error(`Failed to import price for ${price.symbol}: ${error.message}`)
        }
    })

    return results
}

/*
 * Get all prices from database
 * @sig getAllPrices :: (Database) -> [Price]
 */
const getAllPrices = db => {
    const records = db.prepare('SELECT id, security_id, date, price FROM prices ORDER BY date DESC').all()
    // Map DB fields to JS fields
    return map(r => Price.from({ id: r.id, securityId: r.security_id, date: r.date, price: r.price }), records)
}

/*
 * Get price count
 * @sig getPriceCount :: (Database) -> Number
 */
const getPriceCount = db => {
    const result = db.prepare('SELECT COUNT(*) as count FROM prices').get()
    return result.count
}

/*
 * Clear all prices from database
 * @sig clearPrices :: (Database) -> void
 */
const clearPrices = db => db.prepare('DELETE FROM prices').run()

/*
 * Populate prices from transaction data
 * @sig populatePricesFromTransactions :: (Database) -> void
 */
const populatePricesFromTransactions = db => {
    // Get all investment transactions with price information
    const transactions = db
        .prepare(
            `
        SELECT DISTINCT security_id, date, price
        FROM transactions
        WHERE transaction_type = 'investment'
            AND price IS NOT NULL
            AND price > 0
        ORDER BY security_id, date DESC
    `,
        )
        .all()

    // Group by security_id and keep only the latest price per security
    const latestPrices = new Map()
    transactions.forEach(tx => {
        if (!latestPrices.has(tx.security_id) || tx.date > latestPrices.get(tx.security_id).date)
            latestPrices.set(tx.security_id, { date: tx.date, price: tx.price })
    })

    // Insert or update prices into the prices table
    latestPrices.forEach((priceData, securityId) => {
        // Check if a price exists for this security and date
        const existing = db
            .prepare('SELECT id, price FROM prices WHERE security_id = ? AND date = ?')
            .get(securityId, priceData.date)

        if (!existing)
            // No existing price for this security and date, insert new one
            db.prepare('INSERT INTO prices (security_id, date, price) VALUES (?, ?, ?)').run(
                securityId,
                priceData.date,
                priceData.price,
            )
        else if (existing.price !== priceData.price)
            // Existing price for this security and date, but different value, update it
            db.prepare('UPDATE prices SET price = ? WHERE security_id = ? AND date = ?').run(
                priceData.price,
                securityId,
                priceData.date,
            )
    })
}

export { insertPrice, getAllPrices, getPriceCount, importPrices, clearPrices, populatePricesFromTransactions }
