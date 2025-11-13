import tap from 'tap'
import { nth } from '../../index.js'

const l = ['foo', 'bar', 'baz', 'quux']
const s = 'abc'

/*

 *      const listOrString = ;
 *      R.nth(1, listOrString); //=> 'bar'
 *      R.nth(-1, listOrString); //=> 'quux'
 *      R.nth(-99, listOrString); //=> undefined
 *
 *      R.nth(2, 'abc'); //=> 'c'
 *      R.nth(3, 'abc'); //=> ''
 * @symb R.nth(-1, [a, b, c]) = c
 * @symb R.nth(0, [a, b, c]) = a
 * @symb R.nth(1, [a, b, c]) = b
 */

tap.test('nth', t => {
    t.test(`Given l = ${JSON.stringify(l)}`, t => {
        t.test('When I call nth(1, l)', t => {
            t.same(nth(1, l), 'bar', `Then I should get bar`)
            t.end()
        })

        t.test('When I call nth(-1, l)', t => {
            t.same(nth(-1, l), 'quux', `Then I should get quux`)
            t.end()
        })

        t.test('When I call nth(-99, l)', t => {
            t.same(nth(-99, l), undefined, `Then I should get undefined`)
            t.end()
        })

        t.end()
    })

    t.test(`Given s = ${s}`, t => {
        t.test('When I call nth(1, s)', t => {
            t.same(nth(1, s), 'b', `Then I should get 'b'`)
            t.end()
        })

        t.test('When I call nth(-2, s)', t => {
            t.same(nth(-2, s), 'b', `Then I should get 'b'`)
            t.end()
        })

        t.test('When I call nth(-99, s)', t => {
            t.same(nth(-99, s), '', `Then I should get ''`)
            t.end()
        })

        t.end()
    })

    t.end()
})
