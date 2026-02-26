// ABOUTME: Tests for ActionRegistry — module-level singleton for Command Pattern key dispatch
// ABOUTME: Covers register, unregister, resolve (LIFO), clear, and context filtering

import { test } from 'tap'
import { ActionRegistry } from '../src/action-registry.js'

test('ActionRegistry.resolve', t => {
    t.beforeEach(() => ActionRegistry.clear())

    t.test('Given a single registration', t => {
        t.test('When resolving an action that was registered', t => {
            const execute = () => {}
            ActionRegistry.register('table-1', [{ id: 'navigate:down', description: 'Move down', execute }])

            const result = ActionRegistry.resolve('navigate:down', 'table-1')
            t.equal(result.id, 'navigate:down', 'Then it returns the action')
            t.equal(result.execute, execute, 'Then execute is the registered function')
            t.end()
        })

        t.test('When resolving an action that was not registered', t => {
            ActionRegistry.register('table-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])

            const result = ActionRegistry.resolve('navigate:up', 'table-1')
            t.equal(result, undefined, 'Then it returns undefined')
            t.end()
        })
        t.end()
    })

    t.test('Given multiple registrations for the same actionId', t => {
        t.test('When the later registration matches the active context', t => {
            const tableExecute = () => 'table'
            const popoverExecute = () => 'popover'

            ActionRegistry.register('table-1', [
                { id: 'navigate:down', description: 'Move down', execute: tableExecute },
            ])
            ActionRegistry.register('popover-1', [
                { id: 'navigate:down', description: 'Move down', execute: popoverExecute },
            ])

            const result = ActionRegistry.resolve('navigate:down', 'popover-1')
            t.equal(result.execute, popoverExecute, 'Then LIFO returns the later registration')
            t.end()
        })

        t.test('When the earlier registration matches the active context', t => {
            const tableExecute = () => 'table'
            const popoverExecute = () => 'popover'

            ActionRegistry.register('table-1', [
                { id: 'navigate:down', description: 'Move down', execute: tableExecute },
            ])
            ActionRegistry.register('popover-1', [
                { id: 'navigate:down', description: 'Move down', execute: popoverExecute },
            ])

            const result = ActionRegistry.resolve('navigate:down', 'table-1')
            t.equal(result.execute, tableExecute, 'Then it returns the matching context')
            t.end()
        })
        t.end()
    })

    t.test('Given a context filter', t => {
        t.test('When no registration matches the active context', t => {
            ActionRegistry.register('table-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])

            const result = ActionRegistry.resolve('navigate:down', 'other-context')
            t.equal(result, undefined, 'Then it returns undefined')
            t.end()
        })

        t.test('When an undefined context registration exists', t => {
            const globalExecute = () => 'global'
            ActionRegistry.register(undefined, [
                { id: 'toggle-shortcuts', description: 'Toggle shortcuts', execute: globalExecute },
            ])

            const result = ActionRegistry.resolve('toggle-shortcuts', 'any-context')
            t.equal(result.execute, globalExecute, 'Then undefined context matches any active context')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('ActionRegistry.register cleanup function', t => {
    t.beforeEach(() => ActionRegistry.clear())

    t.test('Given two registrations with the same context', t => {
        t.test('When I call the first cleanup function', t => {
            const tableExecute = () => 'table'
            const popoverExecute = () => 'popover'

            const cleanupTable = ActionRegistry.register('view-1', [
                { id: 'navigate:down', description: 'Move down', execute: tableExecute },
            ])
            ActionRegistry.register('view-1', [
                { id: 'navigate:down', description: 'Move down', execute: popoverExecute },
            ])

            cleanupTable()
            const result = ActionRegistry.resolve('navigate:down', 'view-1')
            t.equal(result.execute, popoverExecute, 'Then only the first batch is removed')
            t.end()
        })

        t.test('When I call the second cleanup function', t => {
            const tableExecute = () => 'table'
            const popoverExecute = () => 'popover'

            ActionRegistry.register('view-1', [
                { id: 'navigate:down', description: 'Move down', execute: tableExecute },
            ])
            const cleanupPopover = ActionRegistry.register('view-1', [
                { id: 'navigate:down', description: 'Move down', execute: popoverExecute },
            ])

            cleanupPopover()
            const result = ActionRegistry.resolve('navigate:down', 'view-1')
            t.equal(result.execute, tableExecute, 'Then the earlier registration is revealed')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('ActionRegistry.unregister', t => {
    t.beforeEach(() => ActionRegistry.clear())

    t.test('Given a registered context', t => {
        t.test('When I unregister that context', t => {
            ActionRegistry.register('table-1', [
                { id: 'navigate:down', description: 'Move down', execute: () => {} },
                { id: 'navigate:up', description: 'Move up', execute: () => {} },
            ])

            ActionRegistry.unregister('table-1')
            const result = ActionRegistry.resolve('navigate:down', 'table-1')
            t.equal(result, undefined, 'Then all actions for that context are removed')
            t.end()
        })

        t.test('When other contexts remain', t => {
            const otherExecute = () => 'other'
            ActionRegistry.register('table-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])
            ActionRegistry.register('table-2', [
                { id: 'navigate:down', description: 'Move down', execute: otherExecute },
            ])

            ActionRegistry.unregister('table-1')
            const result = ActionRegistry.resolve('navigate:down', 'table-2')
            t.equal(result.execute, otherExecute, 'Then other registrations are preserved')
            t.end()
        })
        t.end()
    })
    t.end()
})

test('ActionRegistry.collectForContext with modal registrations', t => {
    t.beforeEach(() => ActionRegistry.clear())

    t.test('Given no modal registrations', t => {
        t.test('When collecting for a context', t => {
            ActionRegistry.register(undefined, [{ id: 'file:open', description: 'Open File', execute: () => {} }])
            ActionRegistry.register('view-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])

            const result = ActionRegistry.collectForContext('view-1')
            t.equal(result.length, 2, 'Then it returns global + context actions')
            t.end()
        })
        t.end()
    })

    t.test('Given a modal registration exists', t => {
        t.test('When collecting for a context', t => {
            ActionRegistry.register(undefined, [{ id: 'file:open', description: 'Open File', execute: () => {} }])
            ActionRegistry.register('view-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])
            ActionRegistry.register(
                undefined,
                [
                    { id: 'dismiss', description: 'Close', execute: () => {} },
                    { id: 'select', description: 'Select', execute: () => {} },
                ],
                { modal: true },
            )

            const result = ActionRegistry.collectForContext('view-1')
            t.equal(result.length, 2, 'Then it returns only modal actions')
            t.ok(
                result.every(r => r.modal),
                'Then all returned actions are modal',
            )
            t.end()
        })

        t.test('When the modal cleanup runs', t => {
            ActionRegistry.register(undefined, [{ id: 'file:open', description: 'Open File', execute: () => {} }])
            ActionRegistry.register('view-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])
            const cleanup = ActionRegistry.register(
                undefined,
                [{ id: 'dismiss', description: 'Close', execute: () => {} }],
                { modal: true },
            )

            cleanup()
            const result = ActionRegistry.collectForContext('view-1')
            t.equal(result.length, 2, 'Then normal context filtering resumes')
            t.notOk(
                result.some(r => r.modal),
                'Then no modal actions remain',
            )
            t.end()
        })
        t.end()
    })
    t.end()
})

test('ActionRegistry.clear', t => {
    t.test('Given registrations exist', t => {
        t.test('When I clear the registry', t => {
            ActionRegistry.register('table-1', [{ id: 'navigate:down', description: 'Move down', execute: () => {} }])
            ActionRegistry.register('popover-1', [{ id: 'select', description: 'Select', execute: () => {} }])

            ActionRegistry.clear()

            const result1 = ActionRegistry.resolve('navigate:down', 'table-1')
            const result2 = ActionRegistry.resolve('select', 'popover-1')
            t.equal(result1, undefined, 'Then all registrations are removed')
            t.equal(result2, undefined, 'Then all contexts are removed')
            t.end()
        })
        t.end()
    })
    t.end()
})
