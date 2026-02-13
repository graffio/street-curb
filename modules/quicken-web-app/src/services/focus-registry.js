// ABOUTME: Plain JS registry for imperative DOM focus management
// ABOUTME: Components register elements via ref callbacks; keyboard system calls focus(id)

const registry = {}

// Stores a DOM element reference for later focus by id
// @sig register :: (String, Element) -> void
const register = (id, element) => (registry[id] = element)

// Removes a DOM element reference by id
// @sig unregister :: (String) -> void
const unregister = id => delete registry[id]

// Focuses a registered element if it exists and is still in the DOM
// Silent no-op when id is unknown — keyboard system may call focus before component mounts
// @sig focus :: (String) -> void
const focus = id => {
    const el = registry[id]
    if (el && el.isConnected) el.focus()
}

// Removes all registered elements (used for test isolation)
// @sig clear :: () -> void
const clear = () => {
    const ids = Object.keys(registry)
    ids.forEach(id => delete registry[id])
}

const FocusRegistry = { register, unregister, focus, clear }
export { FocusRegistry }
