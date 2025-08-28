import tap from 'tap'
import compact from '../../src/ramda-like/compact.js'

const a = [3, undefined, null, {}, 'a']
const expected = [3, {}, 'a']

tap.test('Compact', t => {
    t.test(`Given a = ${JSON.stringify(a)}`, t => {
        t.test(`When I call compact(a)`, t => {
            const result = compact(a)
            t.same(result, expected, `Then I should get ${JSON.stringify(expected)}`)
            t.end()
        })

        t.end()
    })

    t.end()
})
