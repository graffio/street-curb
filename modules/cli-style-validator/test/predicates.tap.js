// ABOUTME: Tests for COMPLEXITY comment parsing in shared predicates
// ABOUTME: Covers permanent exemptions, TODO deferrals, and malformed comments

import t from 'tap'
import { PS } from '../src/lib/predicates.js'

t.test('Given parseComplexityComments', t => {
    t.test('When the source has a permanent COMPLEXITY comment', t => {
        const code = '// COMPLEXITY: lines — this is a barrel file\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 1, 'Then one comment should be parsed')
        t.equal(comments[0].rule, 'lines', 'Then the rule should be extracted')
        t.equal(comments[0].reason, 'this is a barrel file', 'Then the reason should be extracted')
        t.equal(comments[0].expires, undefined, 'Then expires should be undefined for permanent')
        t.equal(comments[0].error, undefined, 'Then there should be no error')
        t.end()
    })

    t.test('When the source has a COMPLEXITY-TODO comment with expiration', t => {
        const code = '// COMPLEXITY-TODO: functions — refactoring in #123 (expires 2025-06-15)\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 1, 'Then one comment should be parsed')
        t.equal(comments[0].rule, 'functions', 'Then the rule should be extracted')
        t.equal(comments[0].reason, 'refactoring in #123', 'Then the reason should be extracted')
        t.equal(comments[0].expires, '2025-06-15', 'Then the expiration date should be extracted')
        t.equal(comments[0].error, undefined, 'Then there should be no error')
        t.end()
    })

    t.test('When the source has multiple COMPLEXITY comments', t => {
        const code = `// COMPLEXITY: lines — barrel file
// COMPLEXITY-TODO: functions — cleanup in #456 (expires 2025-03-01)
const x = 1`
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 2, 'Then two comments should be parsed')
        t.equal(comments[0].rule, 'lines', 'Then the first rule should be lines')
        t.equal(comments[1].rule, 'functions', 'Then the second rule should be functions')
        t.end()
    })

    t.test('When a COMPLEXITY comment is missing a reason', t => {
        const code = '// COMPLEXITY: lines\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 1, 'Then one comment should be parsed')
        t.equal(comments[0].rule, 'lines', 'Then the rule should be extracted')
        t.match(comments[0].error, /reason/i, 'Then there should be an error about missing reason')
        t.end()
    })

    t.test('When a COMPLEXITY-TODO comment is missing expiration date', t => {
        const code = '// COMPLEXITY-TODO: lines — some reason\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 1, 'Then one comment should be parsed')
        t.equal(comments[0].rule, 'lines', 'Then the rule should be extracted')
        t.match(comments[0].error, /expires/i, 'Then there should be an error about missing expiration')
        t.end()
    })

    t.test('When a COMPLEXITY-TODO comment has an invalid date format', t => {
        const code = '// COMPLEXITY-TODO: lines — some reason (expires 15-06-2025)\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 1, 'Then one comment should be parsed')
        t.match(comments[0].error, /date/i, 'Then there should be an error about invalid date')
        t.end()
    })

    t.test('When the source has no COMPLEXITY comments', t => {
        const code = '// Regular comment\nconst x = 1'
        const comments = PS.parseComplexityComments(code)

        t.equal(comments.length, 0, 'Then no comments should be parsed')
        t.end()
    })

    t.end()
})

t.test('Given isExempt', t => {
    t.test('When the source has a permanent COMPLEXITY comment for the rule', t => {
        const code = '// COMPLEXITY: aboutme-comment — generated file\nconst x = 1'
        const result = PS.isExempt(code, 'aboutme-comment')

        t.equal(result, true, 'Then the rule should be exempt')
        t.end()
    })

    t.test('When the source has a COMPLEXITY comment for a different rule', t => {
        const code = '// COMPLEXITY: lines — barrel file\nconst x = 1'
        const result = PS.isExempt(code, 'aboutme-comment')

        t.equal(result, false, 'Then the rule should not be exempt')
        t.end()
    })

    t.test('When the source has a COMPLEXITY-TODO (not permanent)', t => {
        const code = '// COMPLEXITY-TODO: aboutme-comment — fixing later (expires 2025-06-15)\nconst x = 1'
        const result = PS.isExempt(code, 'aboutme-comment')

        t.equal(result, false, 'Then isExempt should return false (TODO is not permanent)')
        t.end()
    })

    t.end()
})

t.test('Given getExemptionStatus', t => {
    t.test('When the source has a permanent COMPLEXITY comment', t => {
        const code = '// COMPLEXITY: lines — barrel file\nconst x = 1'
        const status = PS.getExemptionStatus(code, 'lines')

        t.equal(status.exempt, true, 'Then exempt should be true')
        t.equal(status.deferred, false, 'Then deferred should be false')
        t.equal(status.reason, 'barrel file', 'Then reason should be included')
        t.end()
    })

    t.test('When the source has a non-expired COMPLEXITY-TODO', t => {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        const dateStr = futureDate.toISOString().split('T')[0]
        const code = `// COMPLEXITY-TODO: functions — cleanup pending (expires ${dateStr})\nconst x = 1`
        const status = PS.getExemptionStatus(code, 'functions')

        t.equal(status.exempt, false, 'Then exempt should be false')
        t.equal(status.deferred, true, 'Then deferred should be true')
        t.equal(status.expired, false, 'Then expired should be false')
        t.equal(status.reason, 'cleanup pending', 'Then reason should be included')
        t.ok(status.daysRemaining >= 29, 'Then daysRemaining should be approximately 30')
        t.ok(status.warning, 'Then warning should be present')
        t.end()
    })

    t.test('When the source has an expired COMPLEXITY-TODO', t => {
        const code = '// COMPLEXITY-TODO: style-objects — moving to CSS (expires 2020-01-01)\nconst x = 1'
        const status = PS.getExemptionStatus(code, 'style-objects')

        t.equal(status.exempt, false, 'Then exempt should be false')
        t.equal(status.deferred, false, 'Then deferred should be false (expired)')
        t.equal(status.expired, true, 'Then expired should be true')
        t.end()
    })

    t.test('When the source has no COMPLEXITY comment for the rule', t => {
        const code = 'const x = 1'
        const status = PS.getExemptionStatus(code, 'lines')

        t.equal(status.exempt, false, 'Then exempt should be false')
        t.equal(status.deferred, false, 'Then deferred should be false')
        t.equal(status.expired, false, 'Then expired should be false')
        t.end()
    })

    t.test('When the COMPLEXITY comment has a parse error', t => {
        const code = '// COMPLEXITY: lines\nconst x = 1'
        const status = PS.getExemptionStatus(code, 'lines')

        t.equal(status.exempt, false, 'Then exempt should be false')
        t.ok(status.error, 'Then error should be present')
        t.end()
    })

    t.end()
})
