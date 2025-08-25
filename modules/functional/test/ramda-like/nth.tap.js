import { tap } from '@graffio/test-helpers'
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
const tests = {
    [`Given l = ${tap.stringify(l)}`]: {
        'When I call nth(1, l)': t => t.sameR(`Then I should get bar`, 'bar', nth(1, l)),
        'When I call nth(-1, l)': t => t.sameR(`Then I should get quux`, 'quux', nth(-1, l)),
        'When I call nth(-99, l)': t => t.sameR(`Then I should get undefined`, undefined, nth(-99, l)),
    },
    [`Given s = ${s}`]: {
        'When I call nth(1, s)': t => t.sameR(`Then I should get 'b'`, 'b', nth(1, s)),
        'When I call nth(-2, s)': t => t.sameR(`Then I should get 'c'`, 'c', nth(-1, s)),
        'When I call nth(-99, s)': t => t.sameR(`Then I should get ''`, '', nth(-99, s)),
    },
}

tap.describeTests({ mergeDeepRight: tests })
