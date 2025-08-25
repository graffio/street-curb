import { tap } from '@graffio/test-helpers'
import { zipObject } from '../../index.js'

const toString = o => JSON.stringify(o).replace(/"/g, '').replace(/,/g, ', ')

const keys = ['a', 'b', 'c']
const values = [1, 2, 3]
const expected = { a: 1, b: 2, c: 3 }

const tests = {
    [`Given array keys = ${toString(keys)} and array values = ${toString(values)}`]: {
        'When I zipObject(keys, values)': t => {
            t.sameR(`Then I should get object ${toString(expected)}`, zipObject(keys, values), expected)
        },
    },
}

tap.describeTests({ zipObj: tests })
