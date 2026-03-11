// ABOUTME: Tests for parseTaggedValue — runtime helper for TaggedSum JSON deserialization
// ABOUTME: Run with: yarn tap test/parse-tagged-value.tap.js

import t from 'tap'
import { RuntimeForGeneratedTypes } from '../runtime-for-generated-types.js'

const { parseTaggedValue } = RuntimeForGeneratedTypes

// Minimal TaggedSum mock — real generated types have this structure
const Color = {
    Red: value => ({ '@@tagName': 'Red', '@@typeName': 'Color', value, constructor: Color.Red }),
    Green: value => ({ '@@tagName': 'Green', '@@typeName': 'Color', value, constructor: Color.Green }),
}
Color.Red._from = input => Color.Red(input.value)
Color.Green._from = input => Color.Green(input.value)

const VARIANT_MAP = { Red: Color.Red, Green: Color.Green }

t.test('parseTaggedValue', t => {
    t.test('Given a plain object with @@tagName', t => {
        t.test('When the tag matches a known variant', t => {
            const plain = { '@@tagName': 'Red', value: 255 }
            const result = parseTaggedValue(plain, VARIANT_MAP)
            t.equal(result['@@tagName'], 'Red', 'Then result has correct tag')
            t.equal(result.value, 255, 'Then result has correct value')
            t.end()
        })
        t.end()
    })

    t.test('Given a plain object with unknown @@tagName', t => {
        t.test('When the tag is not in the variant map', t => {
            const plain = { '@@tagName': 'Blue', value: 100 }
            t.throws(
                () => parseTaggedValue(plain, VARIANT_MAP),
                /unknown variant 'Blue'/,
                'Then throws with variant name',
            )
            t.end()
        })
        t.end()
    })

    t.test('Given a plain object without @@tagName', t => {
        t.test('When @@tagName is missing', t => {
            const plain = { value: 255 }
            t.throws(() => parseTaggedValue(plain, VARIANT_MAP), /missing @@tagName/, 'Then throws descriptive error')
            t.end()
        })
        t.end()
    })

    t.test('Given null or undefined input', t => {
        t.test('When input is null', t => {
            t.equal(parseTaggedValue(null, VARIANT_MAP), null, 'Then returns null (passthrough for optional fields)')
            t.end()
        })
        t.test('When input is undefined', t => {
            t.equal(parseTaggedValue(undefined, VARIANT_MAP), undefined, 'Then returns undefined')
            t.end()
        })
        t.end()
    })

    t.end()
})
