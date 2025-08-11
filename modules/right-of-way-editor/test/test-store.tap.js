/**
 * Tap tests for vanilla Redux test store architecture
 * Demonstrates unified test data strategy following A001 coding standards
 */

import { test } from 'tap'
import { createStoreWithScenario } from './test-store.js'
import { selectSegments, selectUnknownRemaining } from '../src/store/curbStore.js'

test('Given a vanilla Redux test store architecture', t => {
    test('When creating an empty scenario', t => {
        const store = createStoreWithScenario('empty')
        const state = store.getState()

        const segments = selectSegments(state)
        const unknownRemaining = selectUnknownRemaining(state)

        t.equal(segments.length, 0, 'Then there are no segments')
        t.equal(unknownRemaining, 240, 'Then the full blockface length remains')
        t.equal(state.curb.blockfaceLength, 240, 'Then the blockface length is correct')
        t.equal(state.curb.isCollectionComplete, false, 'Then the collection is not complete')

        t.end()
    })

    test('When creating a single segment scenario', t => {
        const store = createStoreWithScenario('single')
        const state = store.getState()

        const segments = selectSegments(state)
        const unknownRemaining = selectUnknownRemaining(state)

        t.equal(segments.length, 1, 'Then there is one segment')
        t.equal(segments[0].type, 'Parking', 'Then the segment type is Parking')
        t.equal(segments[0].length, 100, 'Then the segment length is 100 feet')
        t.equal(unknownRemaining, 140, 'Then the remaining space is 140 feet')

        t.end()
    })

    test('When creating a multiple segments scenario', t => {
        const store = createStoreWithScenario('multiple')
        const state = store.getState()

        const segments = selectSegments(state)
        const unknownRemaining = selectUnknownRemaining(state)

        t.equal(segments.length, 3, 'Then there are three segments')

        t.equal(segments[0].type, 'Parking', 'Then the first segment is Parking')
        t.equal(segments[0].length, 80, 'Then the first segment is 80 feet')

        t.equal(segments[1].type, 'Loading', 'Then the second segment is Loading')
        t.equal(segments[1].length, 60, 'Then the second segment is 60 feet')

        t.equal(segments[2].type, 'Parking', 'Then the third segment is Parking')
        t.equal(segments[2].length, 50, 'Then the third segment is 50 feet')

        t.equal(unknownRemaining, 50, 'Then the remaining space is 50 feet')

        t.end()
    })

    test('When creating a full blockface scenario', t => {
        const store = createStoreWithScenario('full')
        const state = store.getState()

        const segments = selectSegments(state)
        const unknownRemaining = selectUnknownRemaining(state)
        const totalUsed = segments.reduce((sum, seg) => sum + seg.length, 0)

        t.equal(segments.length, 2, 'Then there are two segments')
        t.equal(unknownRemaining, 0, 'Then there is no remaining space')
        t.equal(state.curb.isCollectionComplete, true, 'Then the collection is complete')
        t.equal(totalUsed, 240, 'Then the segments use the entire blockface')

        t.end()
    })

    test('When using state access', t => {
        const emptyState = createStoreWithScenario('empty').getState()
        const multipleState = createStoreWithScenario('multiple').getState()

        t.equal(selectSegments(emptyState).length, 0, 'Then the empty state has no segments')
        t.equal(selectSegments(multipleState).length, 3, 'Then the multiple state has three segments')

        t.end()
    })

    t.end()
})
