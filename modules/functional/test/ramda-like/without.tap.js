import tap from 'tap'
import without from '../../src/ramda-like/without.js'

tap.test('without', t => {
    t.test('Given a = [1, 2, 3, 4]', t => {
        t.test('When I remove [1,3]', t => {
            t.same(without([1, 3], [1, 2, 3, 4]), [2, 4], 'Then I should get [2,4]')
            t.end()
        })
        t.end()
    })

    t.test('Given a = [1, [2, 3], 4]', t => {
        t.test('When I remove [[2,3]]', t => {
            t.same(
                without([[2, 3]], [1, [2, 3], 4]),
                [1, [2, 3], 4],
                'Then I should be unchanged because the two [2,3] subarray are NOT identical (by JS standards)',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})
