// ABOUTME: Tests for FilterChipPopover pure logic functions
// ABOUTME: Covers keymap factory, item filtering, and index wrapping

import { test } from 'tap'
import { FilterChipPopover } from './filter-chip-popover.js'

const { createKeymap, toFilteredItems, toNextIndex, toPreviousIndex } = FilterChipPopover

test('createKeymap', t => {
    t.test('Given a keymap id, name, and handlers', t => {
        const handlers = { onDown: () => 'down', onUp: () => 'up', onEnter: () => 'enter', onEscape: () => 'escape' }

        t.test('When creating a keymap', t => {
            const keymap = createKeymap('chip-accounts', 'Account Filter', handlers)

            t.equal(keymap.id, 'chip-accounts', 'Then it has the correct id')
            t.equal(keymap.name, 'Account Filter', 'And it has the correct name')
            t.equal(keymap.priority, 10, 'And it has view-level priority')
            t.equal(keymap.intents.length, 4, 'And it has 4 intents')
            t.end()
        })

        t.test('When checking the ArrowDown intent', t => {
            const keymap = createKeymap('test', 'Test', handlers)
            const intent = keymap.intents.get('Move down')

            t.ok(intent, 'Then the Move down intent exists')
            t.same(intent.keys, ['ArrowDown'], 'And it is triggered by ArrowDown')
            t.equal(intent.action(), 'down', 'And it calls the onDown handler')
            t.end()
        })

        t.test('When checking the ArrowUp intent', t => {
            const keymap = createKeymap('test', 'Test', handlers)
            const intent = keymap.intents.get('Move up')

            t.ok(intent, 'Then the Move up intent exists')
            t.same(intent.keys, ['ArrowUp'], 'And it is triggered by ArrowUp')
            t.equal(intent.action(), 'up', 'And it calls the onUp handler')
            t.end()
        })

        t.test('When checking the Enter intent', t => {
            const keymap = createKeymap('test', 'Test', handlers)
            const intent = keymap.intents.get('Toggle')

            t.ok(intent, 'Then the Toggle intent exists')
            t.same(intent.keys, ['Enter'], 'And it is triggered by Enter')
            t.equal(intent.action(), 'enter', 'And it calls the onEnter handler')
            t.end()
        })

        t.test('When checking the Escape intent', t => {
            const keymap = createKeymap('test', 'Test', handlers)
            const intent = keymap.intents.get('Dismiss')

            t.ok(intent, 'Then the Dismiss intent exists')
            t.same(intent.keys, ['Escape'], 'And it is triggered by Escape')
            t.equal(intent.action(), 'escape', 'And it calls the onEscape handler')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('toFilteredItems', t => {
    const items = [
        { id: 'checking', label: 'Checking Account' },
        { id: 'savings', label: 'Savings Account' },
        { id: 'brokerage', label: 'Brokerage' },
    ]

    t.test('Given an empty search text', t => {
        t.test('When filtering items', t => {
            const result = toFilteredItems(items, '')

            t.equal(result.length, 3, 'Then all items are returned')
            t.end()
        })

        t.test('When filtering with whitespace-only text', t => {
            const result = toFilteredItems(items, '   ')

            t.equal(result.length, 3, 'Then all items are returned')
            t.end()
        })

        t.end()
    })

    t.test('Given a search text that matches some items', t => {
        t.test('When filtering by a substring', t => {
            const result = toFilteredItems(items, 'account')

            t.equal(result.length, 2, 'Then only matching items are returned')
            t.equal(result[0].id, 'checking', 'And the first match is Checking Account')
            t.equal(result[1].id, 'savings', 'And the second match is Savings Account')
            t.end()
        })

        t.test('When filtering is case-insensitive', t => {
            const result = toFilteredItems(items, 'BROKERAGE')

            t.equal(result.length, 1, 'Then the match is found regardless of case')
            t.equal(result[0].id, 'brokerage', 'And the correct item is returned')
            t.end()
        })

        t.end()
    })

    t.test('Given a search text that matches no items', t => {
        t.test('When filtering', t => {
            const result = toFilteredItems(items, 'xyz')

            t.equal(result.length, 0, 'Then an empty array is returned')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('toNextIndex', t => {
    t.test('Given a list of 5 items', t => {
        t.test('When moving down from index 0', t => {
            t.equal(toNextIndex(0, 5), 1, 'Then the index increments to 1')
            t.end()
        })

        t.test('When moving down from index 3', t => {
            t.equal(toNextIndex(3, 5), 4, 'Then the index increments to 4')
            t.end()
        })

        t.test('When moving down from the last index', t => {
            t.equal(toNextIndex(4, 5), 0, 'Then it wraps to 0')
            t.end()
        })

        t.end()
    })

    t.test('Given a list of 1 item', t => {
        t.test('When moving down from the only index', t => {
            t.equal(toNextIndex(0, 1), 0, 'Then it wraps back to 0')
            t.end()
        })

        t.end()
    })

    t.end()
})

test('toPreviousIndex', t => {
    t.test('Given a list of 5 items', t => {
        t.test('When moving up from index 4', t => {
            t.equal(toPreviousIndex(4, 5), 3, 'Then the index decrements to 3')
            t.end()
        })

        t.test('When moving up from index 1', t => {
            t.equal(toPreviousIndex(1, 5), 0, 'Then the index decrements to 0')
            t.end()
        })

        t.test('When moving up from index 0', t => {
            t.equal(toPreviousIndex(0, 5), 4, 'Then it wraps to the last index')
            t.end()
        })

        t.end()
    })

    t.test('Given a list of 1 item', t => {
        t.test('When moving up from the only index', t => {
            t.equal(toPreviousIndex(0, 1), 0, 'Then it wraps back to 0')
            t.end()
        })

        t.end()
    })

    t.end()
})
