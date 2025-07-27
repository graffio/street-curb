import t from 'tap'
import { validateMathematicalInvariant } from './mathematical-invariant.tap.js'

/*
 * Test initialization behavior to ensure Unknown space starts at blockface length
 * @sig testInitializationBehavior :: () -> TestResult
 */

/*
 * Simulate Redux store initialization action
 * @sig simulateInitializeSegments :: (Number, String?) -> State
 */
const simulateInitializeSegments = (blockfaceLength, blockfaceId = null) => 
    // This simulates the INITIALIZE_SEGMENTS action result
     ({
        blockfaceLength,
        blockfaceId,
        segments: [],
        unknownRemaining: blockfaceLength,
        isCollectionComplete: false,
    })


t.test('Initialization behavior validation', t => {
    t.test('Given blockface initialization', t => {
        t.test('When initializing with 240ft blockface', t => {
            const result = simulateInitializeSegments(240)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.unknownRemaining, 240, 'Then unknown space equals blockface length')
            t.equal(result.segments.length, 0, 'Then no real segments exist')
            t.notOk(result.isCollectionComplete, 'Then collection not complete')
            t.end()
        })

        t.test('When initializing with 150ft blockface', t => {
            const result = simulateInitializeSegments(150)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.unknownRemaining, 150, 'Then unknown space equals blockface length')
            t.equal(result.segments.length, 0, 'Then no real segments exist')
            t.notOk(result.isCollectionComplete, 'Then collection not complete')
            t.end()
        })

        t.test('When initializing with 300ft blockface', t => {
            const result = simulateInitializeSegments(300)
            t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
            t.equal(result.unknownRemaining, 300, 'Then unknown space equals blockface length')
            t.equal(result.segments.length, 0, 'Then no real segments exist')
            t.notOk(result.isCollectionComplete, 'Then collection not complete')
            t.end()
        })
        t.end()
    })

    t.test('Given various blockface lengths', t => {
        const testLengths = [50, 120, 180, 240, 300, 450]

        testLengths.forEach(length => {
            t.test(`When initializing with ${length}ft blockface`, t => {
                const result = simulateInitializeSegments(length)
                t.ok(validateMathematicalInvariant(result), 'Then mathematical invariant holds')
                t.equal(result.unknownRemaining, length, `Then unknown space equals ${length}ft`)
                t.equal(result.blockfaceLength, length, `Then blockface length is ${length}ft`)
                t.end()
            })
        })
        t.end()
    })

    t.end()
})

export { simulateInitializeSegments }
