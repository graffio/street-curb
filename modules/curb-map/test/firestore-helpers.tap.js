import admin from 'firebase-admin'
import { test } from 'tap'
import { dateToServerTimestamp, serverTimestampToDate } from '../src/firestore/firestore-client-timestamps.js'

// Initialize Firebase Admin for testing (using a test project)
if (!admin.apps || admin.apps.length === 0) admin.initializeApp({ projectId: 'test-project' })

// Real server timestamp placeholder
const dateString = '2024-01-15T10:30:00Z'
const date = new Date(dateString)
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp()

test('Given a Date object is passed to serverTimestampToDate', t => {
    t.test('When the function processes the Date', t => {
        const result = serverTimestampToDate(date)

        t.equal(result, date, 'Then the Date object is returned unchanged')
        t.ok(result instanceof Date, 'Then the result is a Date instance')
        t.end()
    })
    t.end()
})

test('Given a Firestore Timestamp is passed to serverTimestampToDate', t => {
    t.test('When the function processes the Timestamp', t => {
        const timestamp = admin.firestore.Timestamp.fromDate(date)
        const result = serverTimestampToDate(timestamp)

        t.ok(result instanceof Date, 'Then a Date instance is returned')
        t.equal(result.getTime(), date.getTime(), 'Then the timestamp value is preserved')
        t.end()
    })
    t.end()
})

test('Given a server timestamp placeholder is passed to serverTimestampToDate', t => {
    t.test('When the function processes the placeholder', t => {
        const result = serverTimestampToDate(serverTimestamp)

        t.ok(result instanceof Date, 'Then a Date instance is returned')
        t.ok(result.getTime() > 0, 'Then a valid timestamp is returned')
        t.end()
    })
    t.end()
})

test('Given a string is passed to serverTimestampToDate', t => {
    t.test('When the function processes the string', t => {
        const result = serverTimestampToDate(dateString)

        t.ok(result instanceof Date, 'Then a Date instance is returned')
        t.equal(result.toISOString(), '2024-01-15T10:30:00.000Z', 'Then the ISO string is parsed correctly')
        t.end()
    })
    t.end()
})

test('Given null or undefined is passed to serverTimestampToDate', t => {
    t.test('When the function processes null', t => {
        const result = serverTimestampToDate(null)
        t.equal(result, null, 'Then null is returned')
        t.end()
    })

    t.test('When the function processes undefined', t => {
        const result = serverTimestampToDate(undefined)
        t.equal(result, null, 'Then null is returned')
        t.end()
    })
    t.end()
})

test('Given invalid input is passed to serverTimestampToDate', t => {
    t.test('When an invalid object is processed', t => {
        t.throws(() => {
            serverTimestampToDate({ invalid: 'object' })
        }, 'Then an error is thrown')
        t.end()
    })

    t.test('When an invalid date string is processed', t => {
        t.throws(() => {
            serverTimestampToDate('invalid-date-string')
        }, 'Then an error is thrown')
        t.end()
    })
    t.end()
})

test('Given a Date object is passed to dateToServerTimestamp', t => {
    t.test('When the function processes the Date', t => {
        const date = new Date('2024-01-15T10:30:00Z')
        const result = dateToServerTimestamp(date)

        t.ok(result instanceof admin.firestore.Timestamp, 'Then a Firestore Timestamp is returned')
        t.equal(result.toDate().getTime(), date.getTime(), 'Then the timestamp value is preserved')
        t.end()
    })
    t.end()
})

test('Given a server timestamp placeholder is passed to dateToServerTimestamp', t => {
    t.test('When the function processes the placeholder', t => {
        const result = dateToServerTimestamp(serverTimestamp)

        t.equal(result, serverTimestamp, 'Then the server timestamp is returned unchanged')
        t.end()
    })
    t.end()
})

test('Given a string is passed to dateToServerTimestamp', t => {
    t.test('When the function processes the string', t => {
        const dateString = '2024-01-15T10:30:00Z'
        const result = dateToServerTimestamp(dateString)

        t.ok(result instanceof admin.firestore.Timestamp, 'Then a Firestore Timestamp is returned')
        t.equal(result.toDate().toISOString(), '2024-01-15T10:30:00.000Z', 'Then the ISO string is parsed correctly')
        t.end()
    })
    t.end()
})

test('Given null or undefined is passed to dateToServerTimestamp', t => {
    t.test('When the function processes null', t => {
        const result = dateToServerTimestamp(null)
        t.equal(result, null, 'Then null is returned')
        t.end()
    })

    t.test('When the function processes undefined', t => {
        const result = dateToServerTimestamp(undefined)
        t.equal(result, null, 'Then null is returned')
        t.end()
    })
    t.end()
})

test('Given invalid input is passed to dateToServerTimestamp', t => {
    t.test('When an invalid object is processed', t => {
        t.throws(() => {
            dateToServerTimestamp({ invalid: 'object' })
        }, 'Then an error is thrown')
        t.end()
    })

    t.test('When an invalid date string is processed', t => {
        t.throws(() => {
            dateToServerTimestamp('invalid-date-string')
        }, 'Then an error is thrown')
        t.end()
    })
    t.end()
})

test('Given a round-trip conversion is performed', t => {
    t.test('When a Date is converted to Timestamp and back to Date', t => {
        const originalDate = new Date('2024-01-15T10:30:00Z')

        const timestamp = dateToServerTimestamp(originalDate)
        const convertedDate = serverTimestampToDate(timestamp)

        t.equal(convertedDate.getTime(), originalDate.getTime(), 'Then the timestamp is preserved')
        t.end()
    })

    t.test('When a server timestamp is converted to Date and back to Timestamp', t => {
        const serverDate = serverTimestampToDate(serverTimestamp)
        const serverTimestampBack = dateToServerTimestamp(serverDate)

        t.ok(serverTimestampBack instanceof admin.firestore.Timestamp, 'Then a Timestamp is returned')
        t.end()
    })
    t.end()
})
