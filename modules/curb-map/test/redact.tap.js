// ABOUTME: Tests for universal redact() function that redacts PII fields in Tagged types
// ABOUTME: Validates email, displayName, and phoneNumber redaction with recursive support

import { redact } from '@graffio/cli-type-generator'
import { LookupTable } from '@graffio/functional'
import tap from 'tap'
import { Action } from '../src/types/action.js'
import { OrganizationMember } from '../src/types/organization-member.js'
import { User } from '../src/types/user.js'

// Valid test IDs (12+ chars after prefix)
const TEST_USER_ID = 'usr_123456789abc'

tap.test('Given a Tagged type with PII fields', t => {
    t.test('When redacting Action.UserCreated with email and displayName', t => {
        t.test('Then it redacts email to show first character and domain', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jeff Smith', 'jeff@example.com')
            const redacted = redact(action)

            t.equal(redacted.email, 'j***@example.com', 'email should be redacted')
            t.end()
        })

        t.test('Then it redacts displayName to show first letter of each word', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jeff Smith', 'jeff@example.com')
            const redacted = redact(action)

            t.equal(redacted.displayName, 'J*** S***', 'displayName should be redacted')
            t.end()
        })

        t.test('Then it preserves non-PII fields', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jeff Smith', 'jeff@example.com')
            const redacted = redact(action)

            t.equal(redacted.userId, TEST_USER_ID, 'userId should not be redacted')
            t.equal(redacted['@@tagName'], 'UserCreated', '@@tagName should be preserved')
            t.end()
        })

        t.test('Then it returns a valid Action.UserCreated instance', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jeff Smith', 'jeff@example.com')
            const redacted = redact(action)

            t.ok(Action.UserCreated.is(redacted), 'should be a UserCreated instance')
            t.end()
        })

        t.end()
    })

    t.test('When redacting User with email and displayName', t => {
        t.test('Then it redacts both PII fields', t => {
            const now = new Date()
            const user = User.from({
                id: TEST_USER_ID,
                email: 'jeff@example.com',
                displayName: 'Jeff Smith',
                organizations: LookupTable([], OrganizationMember, 'organizationId'),
                createdAt: now,
                createdBy: TEST_USER_ID,
                updatedAt: now,
                updatedBy: TEST_USER_ID,
            })
            const redacted = redact(user)

            t.equal(redacted.email, 'j***@example.com', 'email should be redacted')
            t.equal(redacted.displayName, 'J*** S***', 'displayName should be redacted')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Given an already-redacted value', t => {
    t.test('When calling redact() on it again', t => {
        t.test('Then it returns the same object (idempotent)', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jeff Smith', 'jeff@example.com')
            const redacted1 = redact(action)
            const redacted2 = redact(redacted1)

            t.equal(redacted2, redacted1, 'should return same object reference')
            t.ok(redacted2.__redacted, 'should have __redacted marker')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Given edge cases', t => {
    t.test('When PII fields are null or undefined', t => {
        t.test('Then output equals input (no change)', t => {
            const action1 = Action.UserUpdated(TEST_USER_ID, undefined)
            const redacted1 = redact(action1)

            t.equal(redacted1, action1, 'should return same object when displayName is undefined')
            t.end()
        })

        t.end()
    })

    t.test('When value is not a Tagged type', t => {
        t.test('Then it returns the value unchanged', t => {
            t.equal(redact('string'), 'string', 'should return primitive strings')
            t.equal(redact(123), 123, 'should return numbers')
            t.equal(redact(null), null, 'should return null')
            t.same(redact({ plain: 'object' }), { plain: 'object' }, 'should return plain objects')
            t.end()
        })

        t.end()
    })

    t.end()
})

tap.test('Given displayName variations', t => {
    t.test('When displayName has multiple words', t => {
        t.test('Then each word gets first-letter treatment', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Jean-Paul de la Cruz', 'jp@example.com')
            const redacted = redact(action)

            t.equal(redacted.displayName, 'J***-P*** d*** l*** C***', 'should redact each word')
            t.end()
        })

        t.end()
    })

    t.test('When displayName is a single name', t => {
        t.test('Then it shows first letter only', t => {
            const action = Action.UserCreated(TEST_USER_ID, 'Madonna', 'madonna@example.com')
            const redacted = redact(action)

            t.equal(redacted.displayName, 'M***', 'should show first letter')
            t.end()
        })

        t.end()
    })

    t.end()
})
