/*
 * Scroll Calculations - Pure mathematical functions for virtual scrolling
 *
 * This module contains pure functions for calculating scroll positions, snap positions,
 * and other virtual scrolling mathematics. These functions are separated from the React
 * hook to enable easier testing and reuse.
 *
 * All functions in this module are pure - they take inputs and return outputs without
 * side effects, making them easy to test and reason about.
 */

/*
 * Calculate scroll position to center a row in the viewport
 *
 * @sig calculateCenterScrollPosition :: (Number, Number, Number, Number) -> Number
 *     rowIndex, rowHeight, viewportHeight, totalContentHeight -> scrollTop
 */
const calculateCenterScrollPosition = (rowIndex, rowHeight, viewportHeight, totalContentHeight) => {
    // Calculate ideal scroll position to center the row
    const idealScrollTop = rowIndex * rowHeight - viewportHeight / 2 + rowHeight / 2

    // Round to nearest row boundary to prevent partial row cutoffs
    const rowBoundaryScrollTop = Math.round(idealScrollTop / rowHeight) * rowHeight

    // Constrain scroll position to valid bounds
    const maxScrollTop = Math.max(0, totalContentHeight - viewportHeight)
    return Math.max(0, Math.min(rowBoundaryScrollTop, maxScrollTop))
}

/*
 * Calculate scroll position to align a row to the top
 *
 * @sig calculateTopScrollPosition :: (Number, Number) -> Number
 *     rowIndex, rowHeight -> scrollTop
 */
const calculateTopScrollPosition = (rowIndex, rowHeight) => rowIndex * rowHeight

/*
 * Calculate snap position based on current scroll and direction
 *
 * @sig calculateSnapPosition :: (Number, Number, Direction?) -> Number
 *     currentScrollTop, rowHeight, direction -> newScrollTop
 *     Direction = 'up' | 'down' | null
 */
const calculateSnapPosition = (currentScrollTop, rowHeight, direction = null) => {
    const mod = currentScrollTop % rowHeight
    if (mod === 0) return currentScrollTop // Already aligned

    // Directional snapping for keyboard
    if (direction === 'up') return currentScrollTop - mod
    if (direction === 'down') return currentScrollTop + (rowHeight - mod)

    // 50% rule for mouse scrolling
    if (mod > rowHeight / 2) return currentScrollTop + (rowHeight - mod)
    return currentScrollTop - mod
}

/*
 * Calculate maximum scroll position for a given content and viewport
 *
 * @sig calculateMaxScrollTop :: (Number, Number) -> Number
 *     totalContentHeight, viewportHeight -> maxScrollTop
 */
const calculateMaxScrollTop = (totalContentHeight, viewportHeight) => Math.max(0, totalContentHeight - viewportHeight)

/*
 * Calculate keyboard scroll position with bounds checking
 *
 * @sig calculateKeyboardScrollPosition :: (Number, Number, Direction, Number) -> Number
 *     currentScrollTop, rowHeight, direction, maxScrollTop -> newScrollTop
 *     Direction = 'up' | 'down'
 */
const calculateKeyboardScrollPosition = (currentScrollTop, rowHeight, direction, maxScrollTop) => {
    if (direction === 'up') return Math.max(0, currentScrollTop - rowHeight)
    if (direction === 'down') return Math.min(maxScrollTop, currentScrollTop + rowHeight)
    return currentScrollTop
}

export {
    calculateCenterScrollPosition,
    calculateTopScrollPosition,
    calculateSnapPosition,
    calculateMaxScrollTop,
    calculateKeyboardScrollPosition,
}
