import { tap } from '@graffio/test-helpers'
import splitEvery from '../../src/ramda-like/split-every.js'

tap.describeTests({
    splitEvery: {
        'Given the array [1, 2, 3, 4]': {
            'When I split the array': t => {
                const list = [1, 2, 3, 4]

                const expected1 = [[1], [2], [3], [4]]
                const expected2 = [
                    [1, 2],
                    [3, 4],
                ]
                const expected3 = [[1, 2, 3], [4]]
                const expected4 = [list]
                const expected5 = expected4

                t.sameR(`Then splitting by 1 should create [[1], [2], [3], [4]]`, splitEvery(1, list), expected1)
                t.sameR(`And  splitting by 2 should create [[1, 2], [3, 4]]`, splitEvery(2, list), expected2)
                t.sameR(`And  splitting by 3 should create [[1, 2, 3], [4]]`, splitEvery(3, list), expected3)
                t.sameR(`And  splitting by 4 should create [[1, 2, 3, 4]]`, splitEvery(4, list), expected4)
                t.sameR(`And  splitting by 5 should create [[1, 2, 3, 4]]`, splitEvery(5, list), expected5)
            },
        },
        'Given the array []': {
            'When I split the array': t => {
                t.sameR(`Then splitting by 3 should create []`, splitEvery(3, []), [])
            },
        },
        'Given the string "abcd"': {
            'When I split the string': t => {
                t.sameR(`Then splitting by 1 should create ['a', 'b', 'c', 'd']`, splitEvery(1, 'abcd'), [
                    'a',
                    'b',
                    'c',
                    'd',
                ])
                t.sameR(`And  splitting by 2 should create ['ab', 'cd']        `, splitEvery(2, 'abcd'), ['ab', 'cd'])
                t.sameR(`And  splitting by 3 should create ['abc', 'd']        `, splitEvery(3, 'abcd'), ['abc', 'd'])
                t.sameR(`And  splitting by 4 should create ['abcd']            `, splitEvery(4, 'abcd'), ['abcd'])
                t.sameR(`And  splitting by 5 should create ['abcd']            `, splitEvery(5, 'abcd'), ['abcd'])
            },
        },
        'Given the string ""': {
            'When I split the string': t => {
                t.sameR(`And  splitting by 2 should create []`, splitEvery(3, ''), [])
            },
        },
    },
})
