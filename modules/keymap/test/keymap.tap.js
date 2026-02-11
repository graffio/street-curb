// ABOUTME: Tests for keymap module - key normalization
// ABOUTME: Covers normalizeKey utility

import { test } from 'tap'
import { normalizeKey } from '../src/keymap.js'

// Helper to create mock KeyboardEvent
const mockEvent = (key, { metaKey = false, ctrlKey = false, altKey = false, shiftKey = false } = {}) => ({
    key,
    metaKey,
    ctrlKey,
    altKey,
    shiftKey,
})

test('normalizeKey', t => {
    t.test('Given a simple letter key', t => {
        t.test('When I normalize it', t => {
            const result = normalizeKey(mockEvent('j'))
            t.equal(result, 'j', 'Then it returns the lowercase letter')
            t.end()
        })
        t.end()
    })

    t.test('Given a special key', t => {
        t.test('When I normalize ArrowDown', t => {
            const result = normalizeKey(mockEvent('ArrowDown'))
            t.equal(result, 'ArrowDown', 'Then it returns the key name unchanged')
            t.end()
        })

        t.test('When I normalize Escape', t => {
            const result = normalizeKey(mockEvent('Escape'))
            t.equal(result, 'Escape', 'Then it returns the key name unchanged')
            t.end()
        })
        t.end()
    })

    t.test('Given a key with modifiers', t => {
        t.test('When I normalize cmd+s', t => {
            const result = normalizeKey(mockEvent('s', { metaKey: true }))
            t.equal(result, 'cmd+s', 'Then it includes cmd prefix')
            t.end()
        })

        t.test('When I normalize ctrl+z', t => {
            const result = normalizeKey(mockEvent('z', { ctrlKey: true }))
            t.equal(result, 'ctrl+z', 'Then it includes ctrl prefix')
            t.end()
        })

        t.test('When I normalize alt+x', t => {
            const result = normalizeKey(mockEvent('x', { altKey: true }))
            t.equal(result, 'alt+x', 'Then it includes alt prefix')
            t.end()
        })

        t.test('When I normalize shift+a', t => {
            const result = normalizeKey(mockEvent('A', { shiftKey: true }))
            t.equal(result, 'shift+a', 'Then it includes shift prefix and lowercases key')
            t.end()
        })
        t.end()
    })

    t.test('Given multiple modifiers', t => {
        t.test('When I normalize cmd+shift+s', t => {
            const result = normalizeKey(mockEvent('S', { metaKey: true, shiftKey: true }))
            t.equal(result, 'cmd+shift+s', 'Then modifiers are in alphabetical order')
            t.end()
        })

        t.test('When I normalize alt+cmd+ctrl+shift+x', t => {
            const mods = { altKey: true, metaKey: true, ctrlKey: true, shiftKey: true }
            const result = normalizeKey(mockEvent('X', mods))
            t.equal(result, 'alt+cmd+ctrl+shift+x', 'Then all modifiers are in alphabetical order')
            t.end()
        })
        t.end()
    })
    t.end()
})
