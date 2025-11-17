/**
 * Tests for blockface diff logic
 * Compares two blockfaces and identifies changes to segments
 */

import { test } from 'tap'
import { Blockface, Segment } from '../src/types/index.js'
import { diffBlockfaces } from '../src/utils/diff-blockface.js'

// Valid segment IDs for testing
const seg1 = 'seg_000000000001'
const seg2 = 'seg_000000000002'
const seg3 = 'seg_000000000003'
const seg4 = 'seg_000000000004'

const createBlockface = segments =>
    Blockface.from({
        id: 'blk_000000000001',
        sourceId: 'test-source',
        organizationId: 'org_000000000001',
        projectId: 'prj_000000000001',
        geometry: null,
        streetName: 'Test St',
        segments,
        createdAt: new Date(),
        createdBy: 'usr_000000000001',
        updatedAt: new Date(),
        updatedBy: 'usr_000000000001',
    })

test('Given identical blockfaces', t => {
    t.test('When comparing a blockface to itself', t => {
        const blockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Loading', 30)])

        const result = diffBlockfaces(blockface, blockface)

        t.same(result.added, [], 'Then no segments are added')
        t.same(result.modified, [], 'Then no segments are modified')
        t.same(result.removed, [], 'Then no segments are removed')
        t.end()
    })

    t.end()
})

test('Given a new blockface with no previous version', t => {
    t.test('When diffing against null', t => {
        const newBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Loading', 30)])

        const result = diffBlockfaces(null, newBlockface)

        t.equal(result.added.length, 2, 'Then both segments are marked as added')
        t.equal(result.added[0].index, 0, 'Then the first segment is at index 0')
        t.equal(result.added[0].segment.id, seg1, 'Then the first segment has the correct ID')
        t.equal(result.added[1].index, 1, 'Then the second segment is at index 1')
        t.equal(result.added[1].segment.id, seg2, 'Then the second segment has the correct ID')
        t.same(result.modified, [], 'Then no segments are modified')
        t.same(result.removed, [], 'Then no segments are removed')
        t.end()
    })

    t.end()
})

test('Given a blockface with a segment added', t => {
    t.test('When a segment is added at the end', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50)])
        const newBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Loading', 30)])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.added.length, 1, 'Then one segment is added')
        t.equal(result.added[0].index, 1, 'Then the new segment is at index 1')
        t.equal(result.added[0].segment.id, seg2, 'Then the new segment has the correct ID')
        t.same(result.modified, [], 'Then no segments are modified')
        t.same(result.removed, [], 'Then no segments are removed')
        t.end()
    })

    t.test('When a segment is inserted in the middle', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg3, 'Loading', 30)])
        const newBlockface = createBlockface([
            Segment(seg1, 'Parking', 50),
            Segment(seg2, 'Bus Stop', 20),
            Segment(seg3, 'Loading', 30),
        ])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.added.length, 1, 'Then one segment is added')
        t.equal(result.added[0].index, 1, 'Then the new segment is at index 1')
        t.equal(result.added[0].segment.id, seg2, 'Then the inserted segment has the correct ID')
        t.end()
    })

    t.end()
})

test('Given a blockface with a segment removed', t => {
    t.test('When the last segment is deleted', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Loading', 30)])
        const newBlockface = createBlockface([Segment(seg1, 'Parking', 50)])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.removed.length, 1, 'Then one segment is removed')
        t.equal(result.removed[0].index, 1, 'Then the removed segment was at index 1')
        t.equal(result.removed[0].segment.id, seg2, 'Then the removed segment has the correct ID')
        t.same(result.added, [], 'Then no segments are added')
        t.same(result.modified, [], 'Then no segments are modified')
        t.end()
    })

    t.end()
})

test('Given a blockface with a segment modified', t => {
    t.test('When a segment use type changes', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Loading', 30)])
        const newBlockface = createBlockface([Segment(seg1, 'Parking', 50), Segment(seg2, 'Bus Stop', 30)])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.modified.length, 1, 'Then one modification is detected')
        t.equal(result.modified[0].index, 1, 'Then the modification is at index 1')
        t.equal(result.modified[0].field, 'use', 'Then the use field changed')
        t.equal(result.modified[0].oldValue, 'Loading', 'Then the old use was Loading')
        t.equal(result.modified[0].newValue, 'Bus Stop', 'Then the new use is Bus Stop')
        t.same(result.added, [], 'Then no segments are added')
        t.same(result.removed, [], 'Then no segments are removed')
        t.end()
    })

    t.test('When a segment length changes', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50)])
        const newBlockface = createBlockface([Segment(seg1, 'Parking', 60)])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.modified.length, 1, 'Then one modification is detected')
        t.equal(result.modified[0].index, 0, 'Then the modification is at index 0')
        t.equal(result.modified[0].field, 'length', 'Then the length field changed')
        t.equal(result.modified[0].oldValue, 50, 'Then the old length was 50')
        t.equal(result.modified[0].newValue, 60, 'Then the new length is 60')
        t.end()
    })

    t.test('When both use and length change on the same segment', t => {
        const oldBlockface = createBlockface([Segment(seg1, 'Parking', 50)])
        const newBlockface = createBlockface([Segment(seg1, 'Loading', 60)])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.modified.length, 2, 'Then two modifications are detected')
        t.equal(result.modified[0].field, 'use', 'Then the use field changed')
        t.equal(result.modified[1].field, 'length', 'Then the length field changed')
        t.end()
    })

    t.end()
})

test('Given a blockface with multiple simultaneous changes', t => {
    t.test('When segments are added, removed, and modified in one update', t => {
        const oldBlockface = createBlockface([
            Segment(seg1, 'Parking', 50),
            Segment(seg2, 'Loading', 30),
            Segment(seg3, 'Bus Stop', 20),
        ])
        const newBlockface = createBlockface([
            Segment(seg1, 'Parking', 60), // length modified
            Segment(seg4, 'Disabled', 25), // added
            Segment(seg3, 'Loading', 20), // use modified
        ])

        const result = diffBlockfaces(oldBlockface, newBlockface)

        t.equal(result.modified.length, 2, 'Then two modifications are detected')
        t.equal(result.added.length, 1, 'Then one segment is added')
        t.equal(result.removed.length, 1, 'Then one segment is removed')
        t.equal(result.removed[0].segment.id, seg2, 'Then segment 2 is removed')
        t.equal(result.added[0].segment.id, seg4, 'Then segment 4 is added')
        t.end()
    })

    t.end()
})
