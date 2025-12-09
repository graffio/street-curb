/*
 * generate-entity-id.js - Deterministic entity ID generation
 *
 * Creates stable, unique IDs for entities by hashing their fields.
 * Same input always produces the same output (deterministic).
 *
 * @example
 * hashFields({ date: '2024-01-15', payee: 'Store', amount: -10 }) // => 'abc123def456'
 *
 * RECOMMENDED: Use hashFields directly + database UNIQUE constraints for collision handling.
 *
 * DEPRECATED: createIdGenerator with ordinal suffixes is session-bound (state resets on restart)
 * and doesn't help across imports. Prefer hashFields + database constraints instead.
 */

/*
 * Hash an object's fields to a 12-character hex string
 *
 * Uses djb2 hash algorithm (fast, good distribution for strings).
 * Not cryptographically secure, but sufficient for generating unique IDs.
 * Browser-compatible (no Node.js crypto dependency).
 *
 * @sig hashFields :: Object -> String
 */
const hashFields = fields => {
    // Sort keys for deterministic JSON regardless of object property order
    const str = JSON.stringify(fields, Object.keys(fields).sort())

    // djb2 hash: start with magic constant 5381, then for each char:
    // hash = hash * 33 XOR charCode (the shift-and-add is faster than multiply)
    let hash = 5381
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) ^ str.charCodeAt(i)

    // Convert to unsigned 32-bit int (>>> 0), then to 8-char hex string
    // Append string length (4-char hex) for extra uniqueness = 12 chars total
    return (hash >>> 0).toString(16).padStart(8, '0') + str.length.toString(16).padStart(4, '0')
}

/*
 * Create an ID generator for a specific entity type
 *
 * Returns a stateful function that tracks seen hashes and appends
 * ordinal suffixes for duplicate field combinations.
 *
 * @sig createIdGenerator :: String -> (Object -> String)
 */
const createIdGenerator = prefix => {
    const seenHashes = new Map()

    return fields => {
        const hash = hashFields(fields)
        const count = (seenHashes.get(hash) || 0) + 1
        seenHashes.set(hash, count)

        const id = `${prefix}_${hash}`
        return count === 1 ? id : `${id}-${count}`
    }
}

export { createIdGenerator, hashFields }
