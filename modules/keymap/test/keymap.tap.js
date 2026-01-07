// ABOUTME: Tests for keymap module - key normalization and resolution
// ABOUTME: Covers normalizeKey, Keymap.resolve, Keymap.collectAvailable

import { test } from 'tap'
import { LookupTable } from '@graffio/functional'
import { Intent } from '../src/types/intent.js'
import { Keymap } from '../src/types/keymap.js'
import { normalizeKey } from '../src/keymap.js'

// Helper to create a LookupTable of intents
const intents = (...items) => LookupTable(items, Intent, 'description')

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

test('Keymap.resolve', t => {
    const registerKeymap = Keymap.from({
        id: 'register',
        priority: 10,
        intents: intents(
            Intent.from({ description: 'Move down', keys: ['j', 'ArrowDown'], action: 'ArrowDown' }),
            Intent.from({ description: 'Move up', keys: ['k', 'ArrowUp'], action: 'ArrowUp' }),
        ),
    })

    const globalKeymap = Keymap.from({
        id: 'global',
        priority: 0,
        intents: intents(Intent.from({ description: 'Save', keys: ['cmd+s'], action: () => {} })),
    })

    t.test('Given keymaps sorted by priority', t => {
        const keymaps = [registerKeymap, globalKeymap]

        t.test('When I resolve a key that matches', t => {
            const result = Keymap.resolve('j', keymaps, null)
            t.same(result, { description: 'Move down', action: 'ArrowDown' }, 'Then it returns the intent')
            t.end()
        })

        t.test('When I resolve a key that does not match', t => {
            const result = Keymap.resolve('x', keymaps, null)
            t.equal(result, null, 'Then it returns null')
            t.end()
        })
        t.end()
    })

    t.test('Given a keymap with activeWhen', t => {
        const conditionalKeymap = Keymap.from({
            id: 'register-123',
            priority: 10,
            activeWhen: activeId => activeId === 'register-123',
            intents: intents(Intent.from({ description: 'Delete item', keys: ['Delete'], action: () => {} })),
        })
        const keymaps = [conditionalKeymap, globalKeymap]

        t.test('When activeWhen returns true', t => {
            const result = Keymap.resolve('Delete', keymaps, 'register-123')
            t.equal(result.description, 'Delete item', 'Then the keymap participates')
            t.end()
        })

        t.test('When activeWhen returns false', t => {
            const result = Keymap.resolve('Delete', keymaps, 'other-view')
            t.equal(result, null, 'Then the keymap is skipped')
            t.end()
        })
        t.end()
    })

    t.test('Given a blocking keymap', t => {
        const modalKeymap = Keymap.from({
            id: 'modal',
            priority: 100,
            blocking: true,
            intents: intents(Intent.from({ description: 'Confirm', keys: ['Enter'], action: () => {} })),
        })
        const keymaps = [modalKeymap, globalKeymap]

        t.test('When I resolve a key the modal handles', t => {
            const result = Keymap.resolve('Enter', keymaps, null)
            t.equal(result.description, 'Confirm', 'Then it returns the modal intent')
            t.end()
        })

        t.test('When I resolve a key the modal does not handle', t => {
            const result = Keymap.resolve('cmd+s', keymaps, null)
            t.same(result, { blocked: true }, 'Then it returns blocked')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('Keymap.collectAvailable', t => {
    const registerKeymap = Keymap.from({
        id: 'register',
        priority: 10,
        intents: intents(
            Intent.from({ description: 'Move down', keys: ['j'], action: 'ArrowDown' }),
            Intent.from({ description: 'Move up', keys: ['k'], action: 'ArrowUp' }),
        ),
    })

    const globalKeymap = Keymap.from({
        id: 'global',
        priority: 0,
        intents: intents(
            Intent.from({ description: 'Save', keys: ['cmd+s'], action: () => {} }),

            // duplicate description - tests that higher priority keymap wins
            Intent.from({ description: 'Move down', keys: ['ArrowDown'], action: 'ArrowDown' }),
        ),
    })

    t.test('Given multiple keymaps', t => {
        const keymaps = [registerKeymap, globalKeymap]

        t.test('When I collect available keybindings', t => {
            const result = Keymap.collectAvailable(keymaps, null)

            t.equal(result.length, 3, 'Then it returns unique descriptions')
            t.same(result[0], { description: 'Move down', keys: ['j'], from: 'register' }, 'Then higher priority wins')
            t.same(result[1], { description: 'Move up', keys: ['k'], from: 'register' })
            t.same(result[2], { description: 'Save', keys: ['cmd+s'], from: 'global' })
            t.end()
        })
        t.end()
    })

    t.test('Given a blocking keymap', t => {
        const modalKeymap = Keymap.from({
            id: 'modal',
            priority: 100,
            blocking: true,
            intents: intents(Intent.from({ description: 'Confirm', keys: ['Enter'], action: () => {} })),
        })
        const keymaps = [modalKeymap, registerKeymap, globalKeymap]

        t.test('When I collect available keybindings', t => {
            const result = Keymap.collectAvailable(keymaps, null)

            t.equal(result.length, 1, 'Then it stops at blocking keymap')
            t.equal(result[0].description, 'Confirm', 'Then only blocking keymap intents are included')
            t.end()
        })
        t.end()
    })

    t.test('Given a keymap with activeWhen that is false', t => {
        const conditionalKeymap = Keymap.from({
            id: 'conditional',
            priority: 50,
            activeWhen: () => false,
            intents: intents(Intent.from({ description: 'Hidden', keys: ['h'], action: () => {} })),
        })
        const keymaps = [conditionalKeymap, globalKeymap]

        t.test('When I collect available keybindings', t => {
            const result = Keymap.collectAvailable(keymaps, null)

            t.ok(!result.some(r => r.description === 'Hidden'), 'Then inactive keymap intents are excluded')
            t.end()
        })
        t.end()
    })
    t.end()
})
