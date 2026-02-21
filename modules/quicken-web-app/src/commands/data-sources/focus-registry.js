// ABOUTME: Plain JS registry for imperative DOM focus management
// ABOUTME: Components register elements via ref callbacks; keyboard system calls focus(id)

const registry = {}

// ---------------------------------------------------------------------------------------------------------------------
//
// Exports
//
// ---------------------------------------------------------------------------------------------------------------------

const FocusRegistry = {
    // Stores a DOM element reference for later focus by id
    // @sig register :: (String, Element) -> void
    register: (id, element) => (registry[id] = element),

    // Removes a DOM element reference by id
    // @sig unregister :: (String) -> void
    unregister: id => delete registry[id],

    // Returns a registered element if it exists and is still in the DOM, or undefined
    // @sig get :: (String) -> Element?
    get: id => {
        const el = registry[id]
        return el?.isConnected ? el : undefined
    },

    // Focuses a registered element if it exists and is still in the DOM
    // Silent no-op when id is unknown — keyboard system may call focus before component mounts
    // @sig focus :: (String) -> void
    focus: id => {
        const el = registry[id]
        if (el?.isConnected) el.focus()
    },

    // Removes all registered elements (used for test isolation)
    // @sig clear :: () -> void
    clear: () => {
        const ids = Object.keys(registry)
        ids.forEach(id => delete registry[id])
    },
}

export { FocusRegistry }
