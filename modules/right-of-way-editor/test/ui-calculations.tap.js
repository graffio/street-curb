import t from 'tap'
import { calculateDropdownPosition, findSegmentUnderTouch } from '../src/utils/ui-calculations.js'

/*
 * TDD tests for UI calculation functions
 * These tests should FAIL initially (RED phase), then pass after implementation (GREEN phase)
 */

t.test('Extract calculateDropdownPosition from CurbTable', t => {
    t.test('Given a button at position 100,50 with width 80', t => {
        t.test('When calculating the dropdown position', t => {
            const mockButton = { getBoundingClientRect: () => ({ bottom: 100, left: 50, width: 80 }) }

            const position = calculateDropdownPosition(mockButton)

            // Should match exact behavior from CurbTable.jsx lines 44-47
            t.equal(position.top, 104, 'Then the dropdown is positioned 4 pixels below the button')
            t.equal(position.left, 50, 'Then the dropdown is aligned with the button left edge')
            t.equal(position.width, 80, 'Then the dropdown matches the button width')
            t.end()
        })
        t.end()
    })

    t.test('Given a button at a different position', t => {
        t.test('When calculating the dropdown position', t => {
            const mockButton = { getBoundingClientRect: () => ({ bottom: 250, left: 125, width: 120 }) }

            const position = calculateDropdownPosition(mockButton)

            t.equal(position.top, 254, 'Then the dropdown is positioned 4 pixels below the button bottom')
            t.equal(position.left, 125, 'Then the dropdown is aligned with the button left edge')
            t.equal(position.width, 120, 'Then the dropdown matches the button width')
            t.end()
        })
        t.end()
    })

    t.end()
})

t.test('findSegmentUnderTouch for mobile interaction', t => {
    t.test('Given a touch at coordinate 150 on a container with segments', t => {
        t.test('When finding which segment is under the touch', t => {
            const mockContainer = {
                children: [
                    { classList: { contains: () => true }, offsetHeight: 100 }, // segment 0: 0-100
                    { classList: { contains: () => true }, offsetHeight: 80 }, // segment 1: 100-180
                    { classList: { contains: () => true }, offsetHeight: 60 }, // segment 2: 180-240
                ],
            }

            const segmentIndex = findSegmentUnderTouch(mockContainer, 150)

            t.equal(segmentIndex, 1, 'Then it returns the index of the second segment')
            t.end()
        })
        t.end()
    })

    t.test('Given a touch outside all segments', t => {
        t.test('When finding which segment is under the touch', t => {
            const mockContainer = {
                children: [
                    { classList: { contains: () => true }, offsetHeight: 100 },
                    { classList: { contains: () => true }, offsetHeight: 80 },
                ],
            }

            const segmentIndex = findSegmentUnderTouch(mockContainer, 300)

            t.equal(segmentIndex, -1, 'Then it returns -1 for no segment found')
            t.end()
        })
        t.end()
    })

    t.end()
})
