// ABOUTME: Truncates an array with a '+N more' suffix when it exceeds a max length
// ABOUTME: Used for displaying filter chip details with overflow counts

// Truncates items to max length, replacing overflow with '+N more'
// @sig truncateWithCount :: ([a], Number) -> [a | String]
const truncateWithCount = (items, max) => {
    if (items.length <= max) return items
    const shown = items.slice(0, max - 1)
    return [...shown, `+${items.length - shown.length} more`]
}

export { truncateWithCount }
