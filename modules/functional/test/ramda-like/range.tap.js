import tap from 'tap'
import * as F from '../../index.js'

tap.test('ramda-like range', t => {
    t.test('Given I want a range of numbers', t => {
        t.test('When I give the range 0-5', t => {
            t.same(F.range(0, 5), [0, 1, 2, 3, 4], 'Then I should get [0, 1, 2, 3, 4]')
            t.end()
        })

        t.test('When I give the range 4-7', t => {
            t.same(F.range(4, 7), [4, 5, 6], 'Then I should get [4, 5, 6]')
            t.end()
        })

        t.test('When I give the range 7-3', t => {
            t.same(F.range(7, 3), [], 'Then I should get [] since the range is out of order')
            t.end()
        })

        t.test('When I give the range a-z', t => {
            t.throws(
                () => F.range('a', 'z'),
                /Both arguments to range must be numbers/,
                'Then it should throw because the range is non-numeric',
            )
            t.end()
        })

        t.end()
    })

    t.end()
})
