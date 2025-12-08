/*
 * VirtualScroller - A minimal virtual scrolling component
 *
 * This component provides a React wrapper around the useVirtualScroll hook, creating a complete
 * virtual scrolling solution for rendering large lists efficiently. It delegates all virtualization
 * logic to useVirtualScroll.js, which handles the complex calculations and optimizations.
 *
 * COMPONENT RESPONSIBILITIES:
 * - Renders the scrollable container with proper styling and focus management
 * - Creates absolutely positioned virtual rows based on calculated positions
 * - Provides default row rendering with zebra striping and styling
 * - Handles keyboard accessibility (tabIndex for arrow key navigation)
 * - Manages the virtual container sizing for proper scrollbar behavior
 * - Exposes scrollToRow method via ref for programmatic navigation with smooth scrolling
 * - Supports row highlighting for navigation and search result indication
 *
 * DELEGATION TO useVirtualScroll.js:
 * - All virtual scrolling calculations and state management
 * - @tanstack/react-virtual integration and configuration
 * - Keyboard navigation overrides (precise row-by-row scrolling)
 * - Optional row snapping functionality for aligned positioning
 * - Scroll event handling and direction tracking
 * - Performance optimizations (overscan buffer, ref management)
 * - Row mounting callbacks for parent component integration
 *
 * The hook returns virtualItems (visible rows), totalHeight (for scrollbar), scrollRef (container),
 * handleRowMount (callback handler), and scrollToIndex (programmatic navigation), which this component
 * uses to render the virtual list and expose navigation functionality.
 *
 * @sig VirtualScroller :: Props -> ReactElement
 *     Props = {
 *         rowCount: Number,
 *         rowHeight: Number,
 *         renderRow: RenderRowFunc?,
 *         height: Number?,
 *         overscan: Number?,
 *         enableSnap: Boolean?,
 *         onScroll: ScrollCallback?,
 *         onRowMount: RowMountCallback?,
 *         highlightedRow: Number?
 *     }
 *     RenderRowFunc = (Number) -> ReactElement
 *     ScrollCallback = ({ scrollTop: Number, direction: up|down }) -> void
 *     RowMountCallback = (Number, Element) -> void
 */
import { Box } from '@radix-ui/themes'
import PropTypes from 'prop-types'
import React from 'react'
import useVirtualScroll from './useVirtualScroll'

const VirtualScroller = React.forwardRef(
    (
        {
            rowCount,
            rowHeight,
            renderRow,
            height = 600,
            overscan = 5,
            enableSnap = false,
            onScroll,
            onRowMount,
            highlightedRow,
        },
        ref,
    ) => {
        /*
         * Renders individual virtual row with absolute positioning
         *
         * @sig renderVirtualRow :: VirtualItem -> ReactElement
         *     VirtualItem = { key: String, index: Number, start: Number, measureElement: Function? }
         */
        const renderVirtualRow = vRow => {
            const onMountOrUnmount = el => {
                if (vRow.measureElement) vRow.measureElement(el)
                handleRowMount(vRow.index, el)
            }

            const isHighlighted = vRow.index === highlightedRow
            const isEven = vRow.index % 2 === 0
            const backgroundColor = isEven ? 'var(--accent-3)' : 'var(--color-background)'

            const style = {
                transform: `translateY(${vRow.start}px)`,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                background: backgroundColor,
            }

            const props = { position: 'absolute', top: 0, left: 0, height: `${vRow.size}px`, width: '100%' }

            return (
                <Box key={vRow.key} ref={onMountOrUnmount} {...props} style={style}>
                    {renderRow ? renderRow(vRow.index, { isHighlighted }) : `Row ${vRow.index}`}
                </Box>
            )
        }

        const scrollData = useVirtualScroll({ rowCount, rowHeight, overscan, enableSnap, onScroll, onRowMount })
        const { scrollRef, virtualItems, totalHeight, handleRowMount, scrollToIndex } = scrollData

        // Expose scrollToIndex method via ref
        React.useImperativeHandle(
            ref,
            () => ({
                scrollToRow: (index, options = { behavior: 'smooth', block: 'center' }) => {
                    scrollToIndex(index, options)
                },
            }),
            [scrollToIndex],
        )

        return (
            <Box style={{ height }}>
                <Box
                    ref={scrollRef}
                    style={{ height: '100%', overflow: 'auto', outline: 'none' }}
                    tabIndex={0}
                    data-testid="virtual-scroller"
                >
                    <Box style={{ width: '100%', position: 'relative', height: totalHeight }}>
                        {virtualItems.map(renderVirtualRow)}
                    </Box>
                </Box>
            </Box>
        )
    },
)

VirtualScroller.propTypes = {
    rowCount: PropTypes.number.isRequired,
    rowHeight: PropTypes.number.isRequired,
    renderRow: PropTypes.func,
    height: PropTypes.number,
    overscan: PropTypes.number,
    enableSnap: PropTypes.bool,
    onScroll: PropTypes.func,
    onRowMount: PropTypes.func,
    highlightedRow: PropTypes.number,
}

export { VirtualScroller }
