import { test } from 'tap'
import memoizeOnceWithIdenticalParams from '../../src/ramda-like/memoize-once-with-identical-params.js'

test('memoizeOnceWithIdenticalParams', t => {
    t.test('Given I memoize a function with identical parameters', t => {
        t.test('When I call it multiple times with same args', t => {
            let callCount = 0
            const fn = (a, b) => {
                callCount++
                return a + b
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(1, 2)
            const result2 = memoized(1, 2)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, 3, 'Then first result is correct')
            t.equal(result2, 3, 'Then second result is correct')
            t.equal(result1, result2, 'Then results are identical')
            t.end()
        })

        t.test('When I call it with different args', t => {
            let callCount = 0
            const fn = (a, b) => {
                callCount++
                return a + b
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(1, 2)
            const result2 = memoized(3, 4)

            t.equal(callCount, 2, 'Then underlying function is called twice')
            t.equal(result1, 3, 'Then first result is correct')
            t.equal(result2, 7, 'Then second result is correct')
            t.end()
        })
        t.end()
    })

    t.test('Given I memoize a function that returns objects', t => {
        t.test('When I call it with identical object references', t => {
            let callCount = 0
            const obj1 = { a: 1 }
            const obj2 = { b: 2 }

            const fn = (o1, o2) => {
                callCount++
                return { ...o1, ...o2 }
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(obj1, obj2)
            const result2 = memoized(obj1, obj2)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, result2, 'Then results are the same object instance')
            t.end()
        })

        t.test('When I call it with different object references but same content', t => {
            let callCount = 0
            const fn = obj => {
                callCount++
                return { result: obj.value }
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized({ value: 1 })
            const result2 = memoized({ value: 1 }) // Different object, same content

            t.equal(callCount, 2, 'Then underlying function is called twice')
            t.not(result1, result2, 'Then results are different object instances')
            t.end()
        })
        t.end()
    })

    t.test('Given I memoize a function with various parameter counts', t => {
        t.test('When I call it with no parameters', t => {
            let callCount = 0
            const fn = () => {
                callCount++
                return 'no-args'
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized()
            const result2 = memoized()

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, 'no-args', 'Then result is correct')
            t.equal(result1, result2, 'Then results are identical')
            t.end()
        })

        t.test('When I call it with one parameter', t => {
            let callCount = 0
            const fn = x => {
                callCount++
                return x * 2
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(5)
            const result2 = memoized(5)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, 10, 'Then result is correct')
            t.equal(result1, result2, 'Then results are identical')
            t.end()
        })

        t.test('When I call it with many parameters', t => {
            let callCount = 0
            const fn = (a, b, c, d, e) => {
                callCount++
                return [a, b, c, d, e].join('-')
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(1, 2, 3, 4, 5)
            const result2 = memoized(1, 2, 3, 4, 5)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, '1-2-3-4-5', 'Then result is correct')
            t.equal(result1, result2, 'Then results are identical')
            t.end()
        })
        t.end()
    })

    t.test('Given I memoize a function with special values', t => {
        t.test('When I call it with null and undefined', t => {
            let callCount = 0
            const fn = (a, b) => {
                callCount++
                return `${a}-${b}`
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(null, undefined)
            const result2 = memoized(null, undefined)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.equal(result1, 'null-undefined', 'Then result is correct')
            t.equal(result1, result2, 'Then results are identical')
            t.end()
        })

        t.test('When I call it with different parameter counts', t => {
            let callCount = 0
            const fn = (...args) => {
                callCount++
                return args.length
            }

            const memoized = memoizeOnceWithIdenticalParams(fn)

            const result1 = memoized(1, 2)
            const result2 = memoized(1, 2, 3)

            t.equal(callCount, 2, 'Then underlying function is called twice')
            t.equal(result1, 2, 'Then first result is correct')
            t.equal(result2, 3, 'Then second result is correct')
            t.end()
        })
        t.end()
    })

    t.test('Given I want to test real-world usage', t => {
        t.test('When I use it with a pick-like function', t => {
            let callCount = 0
            const simplePick = (keys, obj) => {
                callCount++
                const result = {}
                keys.forEach(key => {
                    if (key in obj) result[key] = obj[key]
                })
                return result
            }

            const memoizedPick = memoizeOnceWithIdenticalParams(simplePick)

            const keys = ['a', 'b']
            const obj = { a: 1, b: 2, c: 3 }

            const result1 = memoizedPick(keys, obj)
            const result2 = memoizedPick(keys, obj)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.same(result1, { a: 1, b: 2 }, 'Then result is correct')
            t.equal(result1, result2, 'Then results are the same object instance')
            t.end()
        })

        t.test('When I use it with a map-like function', t => {
            let callCount = 0
            const simpleMap = (fn, arr) => {
                callCount++
                return arr.map(fn)
            }

            const memoizedMap = memoizeOnceWithIdenticalParams(simpleMap)

            const double = x => x * 2
            const arr = [1, 2, 3]

            const result1 = memoizedMap(double, arr)
            const result2 = memoizedMap(double, arr)

            t.equal(callCount, 1, 'Then underlying function is called only once')
            t.same(result1, [2, 4, 6], 'Then result is correct')
            t.equal(result1, result2, 'Then results are the same object instance')
            t.end()
        })
        t.end()
    })
    t.end()
})
