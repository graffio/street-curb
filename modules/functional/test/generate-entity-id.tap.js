/*
 * generate-entity-id.tap.js - Tests for deterministic entity ID generation
 *
 * Tests the createIdGenerator function that produces stable IDs from entity
 * fields using hashing, with ordinal suffixes for duplicates.
 */

import { test } from 'tap'
import { createIdGenerator } from '../src/generate-entity-id.js'

test('createIdGenerator', t => {
    t.test('Given a transaction with unique fields', t => {
        t.test('When generating an ID', t => {
            const generator = createIdGenerator('txn')
            const fields = { date: '2024-01-15', payee: 'Coffee Shop', amount: -5.5, memo: 'Morning latte' }

            const id = generator(fields)

            t.match(id, /^txn_[a-z0-9]{12}$/, 'Then it returns txn_<12-char-hash>')
            t.end()
        })
        t.end()
    })

    t.test('Given the same fields called twice', t => {
        t.test('When generating IDs', t => {
            const generator = createIdGenerator('txn')
            const fields = { date: '2024-01-15', payee: 'Coffee Shop', amount: -5.5 }

            const id1 = generator(fields)
            const id2 = generator(fields)

            t.match(id1, /^txn_[a-z0-9]{12}$/, 'Then first ID has no suffix')
            t.match(id2, /^txn_[a-z0-9]{12}-2$/, 'And second ID has -2 suffix')
            t.ok(id2.startsWith(id1.slice(0, 16)), 'And both share the same hash prefix')
            t.end()
        })
        t.end()
    })

    t.test('Given three identical transactions', t => {
        t.test('When generating IDs', t => {
            const generator = createIdGenerator('txn')
            const fields = { date: '2024-01-15', payee: 'Duplicate', amount: -10 }

            const id1 = generator(fields)
            const id2 = generator(fields)
            const id3 = generator(fields)

            t.match(id1, /^txn_[a-z0-9]{12}$/, 'Then first has no suffix')
            t.match(id2, /^txn_[a-z0-9]{12}-2$/, 'And second has -2 suffix')
            t.match(id3, /^txn_[a-z0-9]{12}-3$/, 'And third has -3 suffix')
            t.end()
        })
        t.end()
    })

    t.test('Given different transactions', t => {
        t.test('When generating IDs', t => {
            const generator = createIdGenerator('txn')
            const fields1 = { date: '2024-01-15', payee: 'Store A', amount: -10 }
            const fields2 = { date: '2024-01-15', payee: 'Store B', amount: -10 }

            const id1 = generator(fields1)
            const id2 = generator(fields2)

            t.not(id1, id2, 'Then they produce different IDs')
            t.match(id1, /^txn_[a-z0-9]{12}$/, 'And first has no suffix')
            t.match(id2, /^txn_[a-z0-9]{12}$/, 'And second has no suffix')
            t.end()
        })
        t.end()
    })

    t.test('Given different prefixes', t => {
        t.test('When generating IDs for different entity types', t => {
            const txnGenerator = createIdGenerator('txn')
            const catGenerator = createIdGenerator('cat')
            const fields = { name: 'Test' }

            const txnId = txnGenerator(fields)
            const catId = catGenerator(fields)

            t.match(txnId, /^txn_/, 'Then transaction ID has txn_ prefix')
            t.match(catId, /^cat_/, 'And category ID has cat_ prefix')
            t.end()
        })
        t.end()
    })

    t.test('Given deterministic hashing', t => {
        t.test('When generating ID for same fields with fresh generator', t => {
            const generator1 = createIdGenerator('txn')
            const generator2 = createIdGenerator('txn')
            const fields = { date: '2024-01-15', payee: 'Test', amount: -5 }

            const id1 = generator1(fields)
            const id2 = generator2(fields)

            t.equal(id1, id2, 'Then both generators produce identical IDs')
            t.end()
        })
        t.end()
    })

    t.end()
})
