// ABOUTME: Module-level singleton registry for keyboard actions (Command Pattern)
// ABOUTME: Components register actions on mount; keymap-routing resolves actions by id + context

import { filter, find } from '@graffio/functional'

// ---------------------------------------------------------------------------------------------------------------------
//
// Predicates
//
// ---------------------------------------------------------------------------------------------------------------------

const P = {
    // Checks if a registration matches the given action ID and is valid for the active context
    // @sig isMatchingAction :: (String, String?) -> Registration -> Boolean
    isMatchingAction:
        (actionId, activeContext) =>
        ({ id, context }) =>
            id === actionId && (context === undefined || context === activeContext),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Transformers
//
// ---------------------------------------------------------------------------------------------------------------------

const T = {
    // Snapshot of registration IDs+contexts for change detection
    // @sig toSnapshot :: [Registration] -> String
    toSnapshot: regs =>
        regs
            .map(r => r.id + '\0' + (r.context ?? ''))
            .sort()
            .join('\n'),
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Effects
//
// ---------------------------------------------------------------------------------------------------------------------

const E = {
    // Processes pending change notification — fires onChange if registration set actually changed
    // @sig handlePendingNotify :: () -> void
    handlePendingNotify: () => {
        pendingNotify = false
        const snapshot = T.toSnapshot(registrations)
        if (snapshot === lastNotifiedSnapshot) return
        lastNotifiedSnapshot = snapshot
        onChange?.()
    },

    // Batches change notifications via microtask and deduplicates by content
    // Inline ref callbacks fire cleanup+register on every re-render — same net registration set.
    // Without dedup, this causes: register → onChange → re-render → register → onChange → infinite loop.
    // @sig emitChange :: () -> void
    emitChange: () => {
        if (pendingNotify) return
        pendingNotify = true
        queueMicrotask(E.handlePendingNotify)
    },
}

// ---------------------------------------------------------------------------------------------------------------------
//
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let registrations = []
let nextBatchId = 0
let onChange
let pendingNotify = false
let lastNotifiedSnapshot = ''

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const ActionRegistry = {
    // Appends actions for a context; returns cleanup function that removes only this batch
    // @sig register :: (String?, [{ id, description, execute }]) -> (() -> void)
    register: (context, actions) => {
        const batchId = nextBatchId++
        const entries = actions.map(({ id, description, execute }) => ({ batchId, context, id, description, execute }))
        registrations = [...registrations, ...entries]
        E.emitChange()
        return () => {
            registrations = filter(r => r.batchId !== batchId, registrations)
            E.emitChange()
        }
    },

    // Removes all actions registered under a context
    // @sig unregister :: String -> void
    unregister: context => {
        registrations = filter(r => r.context !== context, registrations)
        E.emitChange()
    },

    // Sets the change listener — called (via microtask) when registered action set actually changes
    // @sig setOnChange :: (() -> void) -> void
    setOnChange: fn => (onChange = fn),

    // Finds the last-registered action matching id + context (LIFO)
    // @sig resolve :: (String, String?) -> { id, description, execute, context }?
    resolve: (actionId, activeContext) =>
        find(P.isMatchingAction(actionId, activeContext), [...registrations].reverse()),

    // Returns all actions available for a given context (includes global actions with undefined context)
    // @sig collectForContext :: String? -> [{ id, description, context }]
    collectForContext: activeContext =>
        filter(r => r.context === undefined || r.context === activeContext, registrations),

    // Empties the registry (test-only)
    // @sig clear :: () -> void
    clear: () => {
        registrations = []
        nextBatchId = 0
        lastNotifiedSnapshot = ''
    },
}

export { ActionRegistry }
