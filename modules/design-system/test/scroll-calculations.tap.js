/*
 * Scroll Calculations Tests
 *
 * Unit tests for pure scroll calculation functions using TAP framework in BDD format.
 * These tests verify the mathematical correctness of virtual scrolling calculations.
 */

import { test } from 'tap'
import {
    calculateCenterScrollPosition,
    calculateTopScrollPosition,
    calculateSnapPosition,
    calculateMaxScrollTop,
    calculateKeyboardScrollPosition,
} from '../src/components/VirtualScroller/scroll-calculations.js'

test('calculateCenterScrollPosition', async t => {
    t.test('Given a row index in the middle of a large dataset', async t => {
        t.test('When calculating center scroll position', async t => {
            const rowIndex = 100
            const rowHeight = 72
            const viewportHeight = 400
            const totalContentHeight = 1000 * 72 // 1000 rows

            const result = calculateCenterScrollPosition(rowIndex, rowHeight, viewportHeight, totalContentHeight)

            t.test('Then the scroll position should center the row in viewport', async t => {
                const expectedIdealScrollTop = rowIndex * rowHeight - viewportHeight / 2 + rowHeight / 2
                const expectedRowBoundaryScrollTop = Math.round(expectedIdealScrollTop / rowHeight) * rowHeight

                t.equal(result, expectedRowBoundaryScrollTop, 'scroll position is row-boundary aligned')
                t.equal(result % rowHeight, 0, 'result aligns to row boundary')
            })
        })
    })

    t.test('Given a row index near the beginning', async t => {
        t.test('When calculating center scroll position', async t => {
            const rowIndex = 2
            const rowHeight = 72
            const viewportHeight = 400
            const totalContentHeight = 1000 * 72

            const result = calculateCenterScrollPosition(rowIndex, rowHeight, viewportHeight, totalContentHeight)

            t.test('Then the scroll position should not go below zero', async t => {
                t.ok(result >= 0, 'scroll position is not negative')
            })
        })
    })

    t.test('Given a row index near the end', async t => {
        t.test('When calculating center scroll position for a smaller dataset', async t => {
            const rowIndex = 95
            const rowHeight = 72
            const viewportHeight = 400
            const totalContentHeight = 100 * 72 // Smaller dataset

            const result = calculateCenterScrollPosition(rowIndex, rowHeight, viewportHeight, totalContentHeight)

            t.test('Then the scroll position should not exceed maximum', async t => {
                const maxScrollTop = Math.max(0, totalContentHeight - viewportHeight)
                t.ok(result <= maxScrollTop, 'scroll position does not exceed maximum')
            })
        })
    })
})

test('calculateTopScrollPosition', async t => {
    t.test('Given a row index and row height', async t => {
        t.test('When calculating top scroll position', async t => {
            const rowIndex = 50
            const rowHeight = 72

            const result = calculateTopScrollPosition(rowIndex, rowHeight)

            t.test('Then the result should be simple multiplication', async t => {
                const expected = 50 * 72
                t.equal(result, expected, 'scroll position is index * rowHeight')
            })
        })
    })
})

test('calculateSnapPosition', async t => {
    t.test('Given a scroll position already aligned to row boundary', async t => {
        t.test('When calculating snap position', async t => {
            const currentScrollTop = 144 // Exactly 2 * 72
            const rowHeight = 72

            const result = calculateSnapPosition(currentScrollTop, rowHeight)

            t.test('Then the position should remain unchanged', async t => {
                t.equal(result, currentScrollTop, 'already aligned position unchanged')
            })
        })
    })

    t.test('Given a scroll position with upward keyboard direction', async t => {
        t.test('When calculating snap position', async t => {
            const currentScrollTop = 150 // Between rows 2 and 3
            const rowHeight = 72
            const direction = 'up'

            const result = calculateSnapPosition(currentScrollTop, rowHeight, direction)

            t.test('Then it should snap up to the previous row boundary', async t => {
                t.equal(result, 144, 'snaps up to row boundary')
            })
        })
    })

    t.test('Given a scroll position with downward keyboard direction', async t => {
        t.test('When calculating snap position', async t => {
            const currentScrollTop = 150 // Between rows 2 and 3
            const rowHeight = 72
            const direction = 'down'

            const result = calculateSnapPosition(currentScrollTop, rowHeight, direction)

            t.test('Then it should snap down to the next row boundary', async t => {
                t.equal(result, 216, 'snaps down to row boundary')
            })
        })
    })

    t.test('Given a scroll position using 50% rule for mouse scrolling', async t => {
        t.test('When the position is less than 50% through the row', async t => {
            const currentScrollTop = 150 // 6px into a 72px row (< 50%)
            const rowHeight = 72

            const result = calculateSnapPosition(currentScrollTop, rowHeight)

            t.test('Then it should snap to the previous row boundary', async t => {
                t.equal(result, 144, 'snaps to previous boundary with < 50% rule')
            })
        })

        t.test('When the position is more than 50% through the row', async t => {
            const currentScrollTop = 181 // 37px into a 72px row (> 50%)
            const rowHeight = 72

            const result = calculateSnapPosition(currentScrollTop, rowHeight)

            t.test('Then it should snap to the next row boundary', async t => {
                t.equal(result, 216, 'snaps to next boundary with > 50% rule')
            })
        })
    })
})

test('calculateMaxScrollTop', async t => {
    t.test('Given content taller than viewport', async t => {
        t.test('When calculating maximum scroll position', async t => {
            const totalContentHeight = 7200 // 100 rows * 72px
            const viewportHeight = 400

            const result = calculateMaxScrollTop(totalContentHeight, viewportHeight)

            t.test('Then it should return the difference', async t => {
                const expected = 7200 - 400
                t.equal(result, expected, 'max scroll is content height minus viewport height')
            })
        })
    })

    t.test('Given content shorter than viewport', async t => {
        t.test('When calculating maximum scroll position', async t => {
            const totalContentHeight = 200
            const viewportHeight = 400

            const result = calculateMaxScrollTop(totalContentHeight, viewportHeight)

            t.test('Then it should return zero', async t => {
                t.equal(result, 0, 'max scroll is zero when content fits in viewport')
            })
        })
    })
})

test('calculateKeyboardScrollPosition', async t => {
    t.test('Given an upward arrow key press', async t => {
        t.test('When calculating new scroll position', async t => {
            const currentScrollTop = 216 // Row 3
            const rowHeight = 72
            const direction = 'up'
            const maxScrollTop = 6800

            const result = calculateKeyboardScrollPosition(currentScrollTop, rowHeight, direction, maxScrollTop)

            t.test('Then it should move up by one row height', async t => {
                t.equal(result, 144, 'moves up by exactly one row height')
            })
        })
    })

    t.test('Given a downward arrow key press', async t => {
        t.test('When calculating new scroll position', async t => {
            const currentScrollTop = 144 // Row 2
            const rowHeight = 72
            const direction = 'down'
            const maxScrollTop = 6800

            const result = calculateKeyboardScrollPosition(currentScrollTop, rowHeight, direction, maxScrollTop)

            t.test('Then it should move down by one row height', async t => {
                t.equal(result, 216, 'moves down by exactly one row height')
            })
        })
    })

    t.test('Given an upward key press at the top', async t => {
        t.test('When calculating new scroll position', async t => {
            const currentScrollTop = 36 // Less than one row height
            const rowHeight = 72
            const direction = 'up'
            const maxScrollTop = 6800

            const result = calculateKeyboardScrollPosition(currentScrollTop, rowHeight, direction, maxScrollTop)

            t.test('Then it should not go below zero', async t => {
                t.equal(result, 0, 'does not scroll below zero')
            })
        })
    })

    t.test('Given a downward key press near the bottom', async t => {
        t.test('When calculating new scroll position', async t => {
            const currentScrollTop = 6800 - 36 // Near max scroll
            const rowHeight = 72
            const direction = 'down'
            const maxScrollTop = 6800

            const result = calculateKeyboardScrollPosition(currentScrollTop, rowHeight, direction, maxScrollTop)

            t.test('Then it should not exceed maximum scroll', async t => {
                t.equal(result, maxScrollTop, 'does not exceed maximum scroll')
            })
        })
    })
})
