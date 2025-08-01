/*
 * useVirtualScroll Hook
 *
 * A minimal React hook for implementing virtual scrolling with optional row snapping.
 *
 * Virtual scrolling optimizes rendering performance by only rendering visible items plus a small overscan buffer.
 * This hook acts as a wrapper around @tanstack/react-virtual, adding custom keyboard navigation and optional
 * row snapping functionality.
 *
 * CORE BEHAVIOR:
 * - Uses @tanstack/react-virtual for efficient item virtualization
 * - Renders only visible rows plus overscan buffer (default: 5 extra rows)
 * - Tracks scroll position and direction for parent component callbacks
 * - Manages refs for scroll container and scroll state tracking
 *
 * KEYBOARD NAVIGATION:
 * - Overrides browser's default arrow key scrolling (~40px jumps)
 * - Arrow keys scroll exactly one row height for precise navigation
 * - Prevents default scroll behavior to maintain consistent UX
 * - Distinguishes keyboard vs mouse scrolling for different snap behaviors
 *
 * OPTIONAL ROW SNAPPING:
 * - When enableSnap=true, snaps scroll position to nearest row boundaries
 * - Keyboard navigation: snaps immediately in the direction of movement
 * - Mouse scrolling: uses 50% rule (snap to closer boundary) after scroll ends
 * - Prevents jarring mid-row positions for better visual alignment
 *
 * EVENT HANDLING:
 * - Sets up scroll event listeners for snap detection
 * - Tracks scroll direction (up/down) for directional snapping
 * - Uses timeouts to detect end of scroll events
 * - Cleans up event listeners on unmount
 *
 * VIRTUAL ITEM MANAGEMENT:
 * - Provides virtualItems array with only visible items
 * - Each item has index, start, size properties for positioning
 * - Handles row mounting callbacks for parent component integration
 * - Calculates total height for proper scrollbar sizing
 *
 * @sig useVirtualScroll :: Config -> VirtualScrollState
 *     Config = {
 *         rowCount: Number,
 *         rowHeight: Number,
 *         overscan: Number?,
 *         enableSnap: Boolean?,
 *         onScroll: ScrollCallback?,
 *         onRowMount: RowMountCallback?
 *     }
 *     ScrollCallback = ({ scrollTop: Number, direction: 'up'|'down' }) -> void
 *     RowMountCallback = (Number, Element) -> void
 *     ScrollOptions = { behavior: 'instant'|'smooth'?, block: 'center'|'top'? }
 *     VirtualScrollState = {
 *         scrollRef: Ref,
 *         virtualItems: [VirtualItem],
 *         totalHeight: Number,
 *         handleRowMount: RowMountCallback,
 *         scrollToIndex: (Number, ScrollOptions?) -> void
 *     }
 */
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCallback, useEffect, useRef } from 'react'
import {
    calculateCenterScrollPosition,
    calculateTopScrollPosition,
    calculateSnapPosition,
    calculateMaxScrollTop,
    calculateKeyboardScrollPosition,
} from './scroll-calculations.js'

const useVirtualScroll = ({ rowCount, rowHeight, overscan = 5, enableSnap = false, onScroll, onRowMount }) => {
    /*
     * Snaps scroll position to nearest row boundary
     *
     * - direction 'up'  : always snap up (for up arrow key)
     * - direction 'down': always snap down (for down arrow key)
     * - direction null  : use 50% rule (for mouse scrolling)
     *
     * @sig snapToNearestRow :: Direction? -> void
     *     Direction = 'up' | 'down' | null
     */
    const snapToNearestRow = useCallback(
        (direction = null) => {
            if (!enableSnap) return
            if (!scrollRef.current) return

            const el = scrollRef.current
            el.scrollTop = calculateSnapPosition(el.scrollTop, rowHeight, direction)
        },
        [enableSnap, rowHeight],
    )

    // Callback wrapper for when virtual rows are mounted to DOM
    const handleRowMount = useCallback((index, el) => onRowMount?.(index, el), [onRowMount])

    const scrollToCenter = (el, index) => {
        const viewportHeight = el.clientHeight
        const totalContentHeight = rowCount * rowHeight
        return calculateCenterScrollPosition(index, rowHeight, viewportHeight, totalContentHeight)
    }

    const scrollToTop = index => calculateTopScrollPosition(index, rowHeight)

    // Programmatically scroll to a specific row index with options
    const scrollToIndex = useCallback(
        (index, options = {}) => {
            const el = scrollRef.current
            if (!el) return

            const { behavior = 'instant', block = 'center' } = options
            const scrollTop = block === 'center' ? scrollToCenter(el, index) : scrollToTop(index)
            el.scrollTo({ top: scrollTop, behavior })
        },
        [rowHeight, rowCount],
    )

    /*
     * Sets up mouse scroll snapping and custom keyboard navigation
     * Returns cleanup function for event listeners
     *
     * @sig setupScrollHandlers :: void -> (() -> void)?
     */
    const setupScrollHandlers = useCallback(() => {
        const handleScrollEnd = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                // Only snap for mouse scrolling - keyboard already snapped immediately
                if (!isKeyboardScroll.current) snapToNearestRow(null)
                isKeyboardScroll.current = false
            }, 0) // Immediate snap
        }

        const handleKeyDown = e => {
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

            e.preventDefault() // Override browser's default scroll distance
            isKeyboardScroll.current = true

            const el = scrollRef.current
            if (!el) return

            const currentScrollTop = el.scrollTop
            const direction = e.key === 'ArrowUp' ? 'up' : 'down'

            // Jump exactly one rowHeight (instead of browser's ~40px default)
            const maxScroll = calculateMaxScrollTop(el.scrollHeight, el.clientHeight)
            el.scrollTop = calculateKeyboardScrollPosition(currentScrollTop, rowHeight, direction, maxScroll)

            // Snap immediately since we jumped exact row boundary
            if (enableSnap) snapToNearestRow(direction)
        }

        const cleanup = () => {
            clearTimeout(timeoutId)
            scrollEl.removeEventListener('scroll', handleScrollEnd)
            scrollEl.removeEventListener('keydown', handleKeyDown)
        }

        let timeoutId
        const scrollEl = scrollRef.current
        if (!scrollEl) return

        scrollEl.addEventListener('scroll', handleScrollEnd)
        scrollEl.addEventListener('keydown', handleKeyDown)
        return cleanup
    }, [snapToNearestRow, rowHeight, enableSnap])

    const scrollRef = useRef(null) // Reference to scrollable container
    const lastScrollTop = useRef(0) // Previous scroll position for direction detection
    const isKeyboardScroll = useRef(false) // Flag to distinguish keyboard vs mouse scrolling

    const scrollTop = scrollRef.current?.scrollTop || 0
    const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'

    const virtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => rowHeight,
        overscan, // Extra rows to render outside viewport
    })

    const totalHeight = virtualizer.getTotalSize()

    useEffect(() => {
        lastScrollTop.current = scrollTop
        onScroll?.({ scrollTop, direction: scrollDirection })
    }, [scrollTop, onScroll, scrollDirection])

    useEffect(setupScrollHandlers, [setupScrollHandlers])

    return { scrollRef, virtualItems: virtualizer.getVirtualItems(), totalHeight, handleRowMount, scrollToIndex }
}

export default useVirtualScroll
