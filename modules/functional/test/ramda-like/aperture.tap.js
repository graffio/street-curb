import tap from 'tap'
import { aperture } from '../../index.js'

const as = [1, 2, 3, 4, 5]
const expected1 = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
]
const expected2 = [
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
]

const s = JSON.stringify

tap.test('aperture', t => {
    t.test(`Given array a = ${s(as)}`, t => {
        t.test('When I call aperture(2, as)', t => {
            const result = aperture(2, as)
            t.same(result, expected1, `Then I should get ${s(expected1)}`)
            t.end()
        })

        t.test('When I call aperture(3, as)', t => {
            const result = aperture(3, as)
            t.same(result, expected2, `Then I should get ${s(expected2)}`)
            t.end()
        })

        t.test('When I call aperture(7, as)', t => {
            const result = aperture(7, as)
            t.same(result, [], `Then I should get []`)
            t.end()
        })

        t.end()
    })

    t.end()
})
