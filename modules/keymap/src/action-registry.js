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
// Module-level state
//
// ---------------------------------------------------------------------------------------------------------------------

let registrations = []
let nextBatchId = 0

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
        return () => (registrations = filter(r => r.batchId !== batchId, registrations))
    },

    // Removes all actions registered under a context
    // @sig unregister :: String -> void
    unregister: context => (registrations = filter(r => r.context !== context, registrations)),

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
    },
}

export { ActionRegistry }
