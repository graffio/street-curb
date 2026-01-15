// ABOUTME: Pure matching functions for stable identity lookups
// ABOUTME: Builds lookup maps and finds matches without side effects

import { Signatures as SigT } from './signatures.js'

const P = {
    // Check if signature looks like a stock symbol (uppercase, no spaces)
    // @sig isSymbolSignature :: String -> Boolean
    isSymbolSignature: sig => !sig.includes(' ') && sig === sig.toUpperCase(),
}

const T = {
    // Add a security identity to the appropriate lookup map (appends to array for duplicates)
    // @sig addToSecurityLookup :: ({bySymbol, byName}, {id, signature, orphanedAt}) -> {bySymbol, byName}
    addToSecurityLookup: ({ bySymbol, byName }, { id, signature, orphanedAt }) => {
        const entry = { id, orphanedAt }
        const map = P.isSymbolSignature(signature) ? bySymbol : byName
        const existing = map.get(signature) || []
        map.set(signature, [...existing, entry])
        return { bySymbol, byName }
    },

    // Add a transaction identity to lookup map (appends to array for duplicates)
    // @sig addToTransactionLookup :: (Map, {id, signature, orphanedAt}) -> Map
    addToTransactionLookup: (map, { id, signature, orphanedAt }) => {
        const existing = map.get(signature) || []
        map.set(signature, [...existing, { id, orphanedAt }])
        return map
    },
}

// Build lookup maps for security matching from existing stableIdentities
// Includes orphaned securities so they can be restored
// @sig buildSecurityLookup :: Database -> {bySymbol: Map, byName: Map}
const buildSecurityLookup = db => {
    const stmt = db.prepare(`
        SELECT id, signature, orphanedAt FROM stableIdentities
        WHERE entityType = 'Security'
    `)
    const rows = stmt.all()
    return rows.reduce(T.addToSecurityLookup, { bySymbol: new Map(), byName: new Map() })
}

// Find matching entry for a security (symbol first, then name, shifts from array)
// Returns {id, orphanedAt} or null
// @sig findSecurityMatch :: ({bySymbol, byName}, Security) -> {id, orphanedAt} | null
const findSecurityMatch = ({ bySymbol, byName }, security) => {
    const sig = SigT.securitySignature(security)
    const entries = bySymbol.get(sig) || byName.get(sig)
    if (!entries || entries.length === 0) return null
    return entries.shift()
}

// Build lookup map for transaction matching (signature -> [{id, orphanedAt}] for duplicates)
// @sig buildTransactionLookup :: (Database, String) -> Map
const buildTransactionLookup = (db, entityType) => {
    const stmt = db.prepare(`
        SELECT id, signature, orphanedAt FROM stableIdentities
        WHERE entityType = ?
    `)
    const rows = stmt.all(entityType)
    return rows.reduce(T.addToTransactionLookup, new Map())
}

// Find matching stable ID for a transaction (shifts from duplicate array)
// @sig findTransactionMatch :: (Map, String) -> {id, orphanedAt} | null
const findTransactionMatch = (lookup, signature) => {
    const entries = lookup.get(signature)
    if (!entries || entries.length === 0) return null
    return entries.shift()
}

// Collect stableIds that weren't consumed during matching (orphan candidates)
// @sig collectUnmatchedIds :: Map -> [String]
const collectUnmatchedIds = lookup =>
    [...lookup.values()].flat().map(entry => (typeof entry === 'string' ? entry : entry.id))

// Build lookup map for split matching (signature -> [stableIds] for duplicates per D4)
// Split signature format per D20: transactionStableId|categoryStableId|amount
// @sig buildSplitLookup :: Database -> Map<String, [String]>
const buildSplitLookup = db => buildTransactionLookup(db, 'Split')

// Build lookup map for price matching (signature -> [stableIds] for duplicates)
// Price signature format per D14: securityStableId|date
// @sig buildPriceLookup :: Database -> Map<String, [String]>
const buildPriceLookup = db => buildTransactionLookup(db, 'Price')

// Build lookup map for lot matching (signature -> [stableIds])
// Lot signature format per D15: securityStableId|accountStableId|openDate|openTransactionStableId
// @sig buildLotLookup :: Database -> Map<String, [String]>
const buildLotLookup = db => buildTransactionLookup(db, 'Lot')

// Build lookup map for lot allocation matching (signature -> [stableIds])
// LotAllocation signature: lotStableId|transactionStableId
// @sig buildLotAllocationLookup :: Database -> Map<String, [String]>
const buildLotAllocationLookup = db => buildTransactionLookup(db, 'LotAllocation')

// Build lookup for simple name-based entities (accounts, categories, tags)
// Includes orphaned entities so they can be restored if they reappear
// @sig buildNameLookup :: (Database, String) -> Map<String, {id, orphanedAt}>
const buildNameLookup = (db, entityType) => {
    const stmt = db.prepare(`
        SELECT id, signature, orphanedAt FROM stableIdentities
        WHERE entityType = ?
    `)
    const rows = stmt.all(entityType)
    return new Map(rows.map(({ id, signature, orphanedAt }) => [signature, { id, orphanedAt }]))
}

// Track which stableIds were seen during import (for orphan detection)
// Handles both simple id values and {id, orphanedAt} objects from buildNameLookup
// @sig createSeenTracker :: Map -> {markSeen, getUnseen}
const createSeenTracker = lookup => {
    const extractId = v => (typeof v === 'object' && v.id ? v.id : v)
    const seen = new Set()
    return {
        markSeen: stableId => seen.add(stableId),
        getUnseen: () => [...lookup.values()].map(extractId).filter(id => !seen.has(id)),
    }
}

// Build security lookup with consumption tracking for orphan detection
// @sig buildSecurityLookupWithTracker :: Database -> {lookup, tracker}
const buildSecurityLookupWithTracker = db => {
    const lookup = buildSecurityLookup(db)
    const allEntries = [...lookup.bySymbol.values(), ...lookup.byName.values()].flat()
    const tracker = createSeenTracker(new Map(allEntries.map(e => [e.id, e])))
    return { lookup, tracker }
}

const Matching = {
    buildSecurityLookup,
    buildSecurityLookupWithTracker,
    findSecurityMatch,
    buildTransactionLookup,
    buildSplitLookup,
    buildPriceLookup,
    buildLotLookup,
    buildLotAllocationLookup,
    findTransactionMatch,
    collectUnmatchedIds,
    buildNameLookup,
    createSeenTracker,
}

export { Matching }
