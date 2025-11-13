import tap from 'tap'
import splitEvery from '../../src/ramda-like/split-every.js'

tap.test('splitEvery', t => {
    t.test('Given the array [1, 2, 3, 4]', t => {
        t.test('When I split the array', t => {
            const list = [1, 2, 3, 4]

            const expected1 = [[1], [2], [3], [4]]
            const expected2 = [
                [1, 2],
                [3, 4],
            ]
            const expected3 = [[1, 2, 3], [4]]
            const expected4 = [list]
            const expected5 = expected4

            t.same(splitEvery(1, list), expected1, `Then splitting by 1 should create [[1], [2], [3], [4]]`)
            t.same(splitEvery(2, list), expected2, `And  splitting by 2 should create [[1, 2], [3, 4]]`)
            t.same(splitEvery(3, list), expected3, `And  splitting by 3 should create [[1, 2, 3], [4]]`)
            t.same(splitEvery(4, list), expected4, `And  splitting by 4 should create [[1, 2, 3, 4]]`)
            t.same(splitEvery(5, list), expected5, `And  splitting by 5 should create [[1, 2, 3, 4]]`)
            t.end()
        })
        t.end()
    })

    t.test('Given the array []', t => {
        t.test('When I split the array', t => {
            t.same(splitEvery(3, []), [], `Then splitting by 3 should create []`)
            t.end()
        })
        t.end()
    })

    t.test('Given the string "abcd"', t => {
        t.test('When I split the string', t => {
            t.same(
                splitEvery(1, 'abcd'),
                ['a', 'b', 'c', 'd'],
                `Then splitting by 1 should create ['a', 'b', 'c', 'd']`,
            )
            t.same(splitEvery(2, 'abcd'), ['ab', 'cd'], `And  splitting by 2 should create ['ab', 'cd']        `)
            t.same(splitEvery(3, 'abcd'), ['abc', 'd'], `And  splitting by 3 should create ['abc', 'd']        `)
            t.same(splitEvery(4, 'abcd'), ['abcd'], `And  splitting by 4 should create ['abcd']            `)
            t.same(splitEvery(5, 'abcd'), ['abcd'], `And  splitting by 5 should create ['abcd']            `)
            t.end()
        })
        t.end()
    })

    t.test('Given the string ""', t => {
        t.test('When I split the string', t => {
            t.same(splitEvery(3, ''), [], `And  splitting by 2 should create []`)
            t.end()
        })
        t.end()
    })

    t.end()
})
