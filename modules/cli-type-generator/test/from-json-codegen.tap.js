// ABOUTME: Tests for FromJson codegen — verifies generated fromJSON code strings
// ABOUTME: Run with: yarn tap test/from-json-codegen.tap.js

import t from 'tap'
import { FromJson } from '../src/codegen/from-json.js'

t.test('generateFromJSONForTagged', t => {
    t.test('Given a Tagged type with no Tagged fields', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTagged('Color', { name: 'String', hex: 'String' })
            t.match(code, /Color\.fromJSON/, 'Then generates Color.fromJSON')
            t.match(code, /json == null/, 'Then guards null/undefined')
            t.match(code, /Color\._from/, 'Then delegates to _from')
            t.notMatch(code, /revived/, 'Then skips spread (no fields to revive)')
            t.end()
        })
        t.end()
    })

    t.test('Given a Tagged type with a required Tagged field', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTagged('ComputedRow', {
                name: 'String',
                expression: 'PivotExpression',
            })
            t.match(
                code,
                /revived\.expression = PivotExpression\.fromJSON\(revived\.expression\)/,
                'Then revives expression unconditionally',
            )
            t.notMatch(code, /if \(revived\.expression\)/, 'Then does NOT guard required field')
            t.end()
        })
        t.end()
    })

    t.test('Given a Tagged type with an optional Tagged field', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTagged('Query', { name: 'String', filter: 'IRFilter?' })
            t.match(code, /if \(revived\.filter\) revived\.filter = IRFilter\.fromJSON/, 'Then guards optional field')
            t.end()
        })
        t.end()
    })

    t.test('Given a Tagged type with an array of Tagged field', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTagged('Container', { name: 'String', items: '[Item]' })
            t.match(
                code,
                /revived\.items = revived\.items\.map\(item => Item\.fromJSON\(item\)\)/,
                'Then maps array items through fromJSON',
            )
            t.notMatch(code, /if \(revived\.items\)/, 'Then does NOT guard required array')
            t.end()
        })
        t.end()
    })

    t.test('Given a Tagged type with an optional array of Tagged field', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTagged('Query', { name: 'String', computed: '[ComputedRow]?' })
            t.match(
                code,
                /if \(revived\.computed\) revived\.computed = revived\.computed\.map/,
                'Then guards optional array',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})

t.test('generateFromJSONForTaggedSum', t => {
    t.test('Given a TaggedSum with no Tagged fields', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTaggedSum('DateRange', {
                Year: { year: 'Number' },
                Range: { start: 'String', end: 'String' },
            })
            t.match(code, /@@tagName/, 'Then checks @@tagName')
            t.match(code, /throw new TypeError/, 'Then throws on missing @@tagName')
            t.match(code, /DateRange\[tag\]\._from/, 'Then dispatches via @@tagName')
            t.notMatch(code, /revived/, 'Then skips spread (no fields to revive)')
            t.end()
        })
        t.end()
    })

    t.test('Given a TaggedSum with Tagged fields across variants', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTaggedSum('Query', {
                TypeA: { name: 'String', filter: 'IRFilter?', grouping: 'IRGrouping' },
                TypeB: { name: 'String', filter: 'IRFilter?' },
            })
            t.match(code, /if \(revived\.filter\)/, 'Then guards filter (present in multiple variants)')
            t.match(code, /if \(revived\.grouping\)/, 'Then guards grouping (only in TypeA, absent in TypeB)')
            t.match(code, /IRFilter\.fromJSON/, 'Then calls IRFilter.fromJSON')
            t.match(code, /IRGrouping\.fromJSON/, 'Then calls IRGrouping.fromJSON')
            t.end()
        })
        t.end()
    })

    t.test('Given a TaggedSum with self-referencing fields', t => {
        t.test('When generating fromJSON', t => {
            const code = FromJson.generateFromJSONForTaggedSum('IRFilter', {
                Equals: { field: 'String', value: 'String' },
                And: { filters: '[IRFilter]' },
                Not: { filter: 'IRFilter' },
            })
            t.match(code, /IRFilter\.fromJSON/, 'Then uses self-reference for recursive revival')
            t.match(
                code,
                /revived\.filters\.map\(item => IRFilter\.fromJSON\(item\)\)/,
                'Then maps array through self fromJSON',
            )
            t.match(
                code,
                /revived\.filter\) revived\.filter = IRFilter\.fromJSON/,
                'Then revives single self-reference',
            )
            t.end()
        })
        t.end()
    })

    t.end()
})
