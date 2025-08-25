import { tap } from '@graffio/test-helpers'
import diffObjects from '../../src/ramda-like/diff-objects.js'

const a = { a: 1, b: { c: 5, d: [1, 2, 3], e: { f: 6 } } }
const b = { a: 1, b: { d: [1, 2, 3], e: { f: 8, f1: 8 } }, x: { g: 5 } }
const aClone = JSON.parse(JSON.stringify(a))

const expected1 = { deleted: [], changed: [], added: [] }
const expected2 = { deleted: ['b.c'], changed: ['b.e.f'], added: ['b.e.f1', 'x'] }

const s = tap.stringify
const tests = {
    [`Given a: ${s(a)} and b: ${s(b)}`]: {
        'When I call diffObjects(a, a) -- both the same object': t => {
            t.sameR(`Then I should get ${s(expected1)}`, diffObjects(a, a), expected1)
        },
        'When I call diffObjects(a, clone(a)) -- cloned a': t => {
            t.sameR(`Then I should get ${s(expected1)}`, diffObjects(a, aClone), expected1)
        },
        'When I call diffObjects(a, b)': t => {
            t.sameR(`Then I should get ${s(expected2)}`, diffObjects(a, b), expected2)
        },
    },
}

tap.describeTests({ diffObjects: tests })
