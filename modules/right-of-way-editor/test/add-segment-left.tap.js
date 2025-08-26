import t from 'tap'
import rootReducer from '../src/store/reducer.js'
import { addSegmentLeft } from '../src/store/actions.js'

const createMockState = (segments, unknownRemaining = 0, blockfaceLength = 240) => ({
    curb: {
        segments,
        unknownRemaining,
        blockfaceLength,
        blockfaceId: null,
        isCollectionComplete: unknownRemaining === 0,
    },
})

t.test('addSegmentLeft Redux action', async t => {
    await t.test('Given a segment with sufficient length', async t => {
        await t.test('When dispatching addSegmentLeft for current segment', async t => {
            const initialSegments = [{ id: 's1', type: 'Parking', length: 30 }]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(0, 10)
            const result = rootReducer(initialState, action)

            t.equal(result.curb.segments.length, 2, 'Then two segments exist')
            t.equal(result.curb.segments[0].length, 10, 'Then the first segment has the desired length')
            t.equal(result.curb.segments[1].length, 20, 'Then the second segment has the remaining length')
            t.equal(result.curb.segments[0].type, 'Parking', 'Then the new segment has the default type')
            t.equal(result.curb.segments[1].type, 'Parking', 'Then the original segment type is preserved')
        })

        await t.test('When dispatching addSegmentLeft for previous segment', async t => {
            const initialSegments = [
                { id: 's1', type: 'Loading', length: 25 },
                { id: 's2', type: 'NoParking', length: 5 },
            ]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(1, 10)
            const result = rootReducer(initialState, action)

            t.equal(result.curb.segments.length, 3, 'Then three segments exist')
            t.equal(result.curb.segments[0].length, 15, 'Then the first segment is reduced by the desired length')
            t.equal(result.curb.segments[1].length, 10, 'Then the new segment has the desired length')
            t.equal(result.curb.segments[2].length, 5, 'Then the target segment is unchanged')
            t.equal(result.curb.segments[1].type, 'Parking', 'Then the new segment has the default type')
        })
    })

    await t.test('Given segments with insufficient space', async t => {
        await t.test('When trying to split a segment that is too small', async t => {
            const initialSegments = [{ id: 's1', type: 'Parking', length: 10 }]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(0, 10)
            const result = rootReducer(initialState, action)

            t.same(result.curb.segments, initialSegments, 'Then the segments remain unchanged')
        })

        await t.test('When both current and previous segments are too small', async t => {
            const initialSegments = [
                { id: 's1', type: 'Loading', length: 10 },
                { id: 's2', type: 'NoParking', length: 5 },
            ]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(1, 10)
            const result = rootReducer(initialState, action)

            t.same(result.curb.segments, initialSegments, 'Then the segments remain unchanged')
        })
    })

    await t.test('Given invalid inputs', async t => {
        await t.test('When providing an invalid segment index', async t => {
            const initialSegments = [{ id: 's1', type: 'Parking', length: 30 }]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(5, 10)
            const result = rootReducer(initialState, action)

            t.same(result.curb.segments, initialSegments, 'Then the segments remain unchanged')
        })

        await t.test('When providing a negative index', async t => {
            const initialSegments = [{ id: 's1', type: 'Parking', length: 30 }]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(-1, 10)
            const result = rootReducer(initialState, action)

            t.same(result.curb.segments, initialSegments, 'Then the segments remain unchanged')
        })
    })

    await t.test('Given default desired length', async t => {
        await t.test('When not specifying desired length', async t => {
            const initialSegments = [{ id: 's1', type: 'Parking', length: 30 }]
            const initialState = createMockState(initialSegments)

            const action = addSegmentLeft(0) // No desiredLength specified
            const result = rootReducer(initialState, action)

            t.equal(result.curb.segments.length, 2, 'Then two segments exist')
            t.equal(result.curb.segments[0].length, 10, 'Then the first segment has the default length of 10')
            t.equal(result.curb.segments[1].length, 20, 'Then the second segment has the remaining length')
        })
    })
})
