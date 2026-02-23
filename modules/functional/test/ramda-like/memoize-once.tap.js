import tap from 'tap'
import { memoizeOnce } from '../../src/ramda-like/memoize-once.js'

tap.test('memoizeOnce', t => {
    t.test(
        'Given function add (x, y) => x + y and cacheKeyF = (x,y) => x + "|" +y and m = memoizeOnce(cacheKeyF, add)',
        t => {
            t.test('When I call m(2, 3)', t => {
                const cacheF = (x, y) => `${x}|${y}`

                let count = 0

                const add = (x, y) => {
                    count++
                    return x + y
                }

                const m = memoizeOnce(cacheF, add)
                let actual = m(2, 3)

                t.same(count, 1, 'Then add should have been called once')
                t.same(actual, 5, 'And I should get the result 5')

                actual = m(2, 3)

                t.same(count, 1, 'And if I call m(2,3) again, add should still only have been called once')
                t.same(actual, 5, 'And I should get the cached result 5')

                actual = m(4, 3)

                t.same(
                    count,
                    2,
                    'And if I call m(4,3), add should now have been called twice, and 2+3 should have been pushed out of the cache',
                )
                t.same(actual, 7, 'And I should get the result 7')

                actual = m(2, 3)

                t.same(
                    count,
                    3,
                    'And if I call m(2,3) once again, add should now have been called three times since 2+3 was pushed out of the cache by 4+3',
                )
                t.same(actual, 5, 'And I should get the result 5')

                t.end()
            })

            t.end()
        },
    )

    t.test('Given a cacheKeyF that returns an array of object references', t => {
        t.test('When the array elements are the same references on repeated calls', t => {
            let callCount = 0
            const objA = { a: 1 }
            const objB = { b: 2 }
            const objC = { c: 3 }

            const fn = input => {
                callCount++
                return input.a + input.b
            }

            const m = memoizeOnce(input => [input.x, input.y, input.z], fn)
            const input = { x: objA, y: objB, z: objC, a: 1, b: 2 }

            m(input)
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            m(input)
            t.equal(callCount, 1, 'Then the function is not called when array elements are unchanged')
            t.end()
        })

        t.test('When one array element changes reference', t => {
            let callCount = 0
            const objA = { a: 1 }
            const objB = { b: 2 }

            const fn = input => {
                callCount++
                return input.x.a
            }

            const m = memoizeOnce(input => [input.x, input.y], fn)

            m({ x: objA, y: objB })
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            m({ x: { a: 1 }, y: objB })
            t.equal(callCount, 2, 'Then the function is called when an element changes reference')
            t.end()
        })

        t.test('When the array changes length', t => {
            let callCount = 0
            const objA = { a: 1 }
            const objB = { b: 2 }
            const objC = { c: 3 }

            let items = [objA, objB, objC]
            const fn = () => {
                callCount++
                return items.length
            }

            const m = memoizeOnce(() => items, fn)

            m()
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            items = [objA, objB]
            m()
            t.equal(callCount, 2, 'Then the function is called when array length changes')
            t.end()
        })

        t.end()
    })

    t.test('Given a cacheKeyF that returns a scalar', t => {
        t.test('When the scalar value is unchanged', t => {
            let callCount = 0
            const fn = x => {
                callCount++
                return x * 2
            }

            const m = memoizeOnce(x => x, fn)

            m(5)
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            m(5)
            t.equal(callCount, 1, 'Then the scalar comparison still works via !==')

            m(10)
            t.equal(callCount, 2, 'Then the function is called when the scalar changes')
            t.end()
        })

        t.end()
    })

    t.test('Given a cacheKeyF that returns an empty array', t => {
        t.test('When called repeatedly', t => {
            let callCount = 0
            const fn = () => {
                callCount++
                return 'result'
            }

            const m = memoizeOnce(() => [], fn)

            m()
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            m()
            t.equal(callCount, 1, 'Then empty arrays match on repeated calls')
            t.end()
        })

        t.end()
    })

    t.test('Given a cacheKeyF that returns an array with undefined elements', t => {
        t.test('When undefined elements are stable', t => {
            let callCount = 0
            const fn = () => {
                callCount++
                return 'result'
            }

            const m = memoizeOnce(() => [undefined, undefined], fn)

            m()
            t.equal(callCount, 1, 'Then the function is called on the first invocation')

            m()
            t.equal(callCount, 1, 'Then undefined === undefined is a cache hit')
            t.end()
        })

        t.end()
    })

    t.end()
})
