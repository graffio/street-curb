// ABOUTME: Tests for FocusRegistry commands infrastructure module
// ABOUTME: Verifies register, unregister, and focus behavior with DOM element stubs

import tap from 'tap'
import { FocusRegistry } from '../../src/commands/data-sources/focus-registry.js'

tap.test('Given a registered element', t => {
    t.beforeEach(() => FocusRegistry.clear())

    t.test('When focus is called with its id', t => {
        let focused = false
        const el = { isConnected: true, focus: () => (focused = true) }
        FocusRegistry.register('input_1', el)
        FocusRegistry.focus('input_1')

        t.ok(focused, 'Then the element receives focus')
        t.end()
    })

    t.test('When the element is replaced with a new one', t => {
        let firstFocused = false
        let secondFocused = false
        const el1 = { isConnected: true, focus: () => (firstFocused = true) }
        const el2 = { isConnected: true, focus: () => (secondFocused = true) }

        FocusRegistry.register('input_1', el1)
        FocusRegistry.register('input_1', el2)
        FocusRegistry.focus('input_1')

        t.notOk(firstFocused, 'Then the first element does not receive focus')
        t.ok(secondFocused, 'Then the second element receives focus')
        t.end()
    })

    t.end()
})

tap.test('Given an unregistered element', t => {
    t.beforeEach(() => FocusRegistry.clear())

    t.test('When focus is called after unregister', t => {
        let focused = false
        const el = { isConnected: true, focus: () => (focused = true) }
        FocusRegistry.register('input_1', el)
        FocusRegistry.unregister('input_1')
        FocusRegistry.focus('input_1')

        t.notOk(focused, 'Then the element does not receive focus')
        t.end()
    })

    t.test('When unregister is called for an unknown id', t => {
        t.doesNotThrow(() => FocusRegistry.unregister('unknown_id'), 'Then no error is thrown')
        t.end()
    })

    t.end()
})

tap.test('Given an unknown focus id', t => {
    t.beforeEach(() => FocusRegistry.clear())

    t.test('When focus is called', t => {
        t.doesNotThrow(() => FocusRegistry.focus('nonexistent'), 'Then no error is thrown')
        t.end()
    })

    t.end()
})

tap.test('Given a disconnected element', t => {
    t.beforeEach(() => FocusRegistry.clear())

    t.test('When focus is called on a disconnected element', t => {
        let focused = false
        const el = { isConnected: false, focus: () => (focused = true) }
        FocusRegistry.register('stale_1', el)
        FocusRegistry.focus('stale_1')

        t.notOk(focused, 'Then the element does not receive focus')
        t.end()
    })

    t.end()
})
