// ABOUTME: Database operations for security prices
// ABOUTME: Imports prices from QIF entries and populates from transaction data

import { map } from '@graffio/functional'
import { hashFields } from '@graffio/functional/src/generate-entity-id.js'
import { Entry, Price } from '../../types/index.js'

/*
 * Generate deterministic price ID from securityId and date
 * @sig generatePriceId :: (String, String) -> String
 */
const generatePriceId = (securityId, dateString) => `prc_${hashFields({ securityId, date: dateString })}`

/*
 * Insert price into database (dedupes on collision)
 * @sig insertPrice :: (Database, Entry.Price, Security) -> String
 */
const insertPrice = (db, priceEntry, security) => {
    if (!Entry.Price.is(priceEntry)) throw new Error(`Expected Entry.Price; found: ${JSON.stringify(priceEntry)}`)

    const { id: securityId, symbol } = security
    const { price, date } = priceEntry
    const dateString = date.toISOString().split('T')[0]
    const id = generatePriceId(securityId, dateString)

    // Check if price already exists
    const existing = db.prepare('SELECT id, price FROM prices WHERE id = ?').get(id)
    if (!existing) {
        db.prepare(`INSERT INTO prices (id, securityId, date, price) VALUES (?, ?, ?, ?)`).run(
            id,
            securityId,
            dateString,
            price,
        )
        return id
    }

    // Keep existing, log conflict if different
    const { id: existingId, price: existingPrice } = existing
    if (existingPrice !== price)
        console.warn(`Price conflict for ${symbol} on ${dateString}: existing=${existingPrice}, new=${price}`)
    return existingId
}

/*
 * Import prices into database
 * @sig importPrices :: (Database, [Entry.Price], [Security]) -> [String]
 */
const importPrices = (db, prices, securities) => {
    // @sig addSecurityToMap :: Security -> void
    const addSecurityToMap = security => {
        const { name, symbol } = security
        if (symbol) securityMap.set(symbol, security)
        securityMap.set(name, security)
    }

    // @sig processPriceEntry :: Entry.Price -> void
    const processPriceEntry = priceEntry => {
        const { symbol } = priceEntry
        const security = securityMap.get(symbol)
        if (!security) throw new Error(`Security not found for symbol: ${symbol}`)
        results.push(insertPrice(db, priceEntry, security))
    }

    const securityMap = new Map()
    securities.forEach(addSecurityToMap)

    const results = []
    prices.forEach(processPriceEntry)

    return results
}

/*
 * Get all prices from database
 * @sig getAllPrices :: (Database) -> [Price]
 */
const getAllPrices = db => {
    const records = db.prepare('SELECT id, securityId, date, price FROM prices ORDER BY date DESC').all()
    return map(Price.from, records)
}

/*
 * Get price count
 * @sig getPriceCount :: (Database) -> Number
 */
const getPriceCount = db => db.prepare('SELECT COUNT(*) as count FROM prices').get().count

/*
 * Clear all prices from database
 * @sig clearPrices :: (Database) -> void
 */
const clearPrices = db => db.prepare('DELETE FROM prices').run()

/*
 * Populate prices from transaction data (all trade prices, not just latest)
 * @sig populatePricesFromTransactions :: (Database) -> void
 */
const populatePricesFromTransactions = db => {
    // @sig insertOrUpdatePrice :: (String, String, Number) -> void
    const insertOrUpdatePrice = (securityId, date, price) => {
        const id = generatePriceId(securityId, date)
        const existing = db.prepare('SELECT id, price FROM prices WHERE id = ?').get(id)

        if (!existing) {
            db.prepare('INSERT INTO prices (id, securityId, date, price) VALUES (?, ?, ?, ?)').run(
                id,
                securityId,
                date,
                price,
            )
            return
        }

        if (existing.price !== price) db.prepare('UPDATE prices SET price = ? WHERE id = ?').run(price, id)
    }

    // @sig processTransaction :: Object -> void
    const processTransaction = tx => {
        const { date, price, securityId } = tx
        insertOrUpdatePrice(securityId, date, price)
    }

    const sql = `
        SELECT DISTINCT securityId, date, price
        FROM transactions
        WHERE transactionType = 'investment' AND price IS NOT NULL AND price > 0
    `
    const transactions = db.prepare(sql).all()
    transactions.forEach(processTransaction)
}

export { insertPrice, getAllPrices, getPriceCount, importPrices, clearPrices, populatePricesFromTransactions }
