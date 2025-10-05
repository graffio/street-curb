import admin from 'firebase-admin'
import * as F from 'firebase/firestore'
import { test } from 'tap'
import { FirestoreAdminFacade } from '../src/firestore-facade/firestore-admin-facade.js'
import { FirestoreClientFacade } from '../src/firestore-facade/firestore-client-facade.js'

const adapters = [
    {
        label: 'admin facade converters',
        dateToTimestamp: FirestoreAdminFacade.dateToTimestamp,
        timestampToDate: FirestoreAdminFacade.timestampToDate,
        TimestampClass: admin.firestore.Timestamp,
        makeServerTimestamp: () => admin.firestore.FieldValue.serverTimestamp(),
    },
    {
        label: 'client facade converters',
        dateToTimestamp: FirestoreClientFacade.dateToTimestamp,
        timestampToDate: FirestoreClientFacade.timestampToDate,
        TimestampClass: F.Timestamp,
        makeServerTimestamp: () => F.serverTimestamp(),
    },
]

const sampleDateString = '2024-01-15T10:30:00Z'
const sampleDate = new Date(sampleDateString)

test('Given timestamp converters', t => {
    adapters.forEach(({ label, dateToTimestamp, timestampToDate, TimestampClass, makeServerTimestamp }) => {
        t.test(`Given ${label} When converting dates`, tt => {
            const timestamp = dateToTimestamp(sampleDate)

            tt.ok(timestamp instanceof TimestampClass, 'Then a Firestore timestamp is produced')
            tt.equal(timestamp.toDate().getTime(), sampleDate.getTime(), 'Then the original instant is preserved')
            tt.end()
        })

        t.test(`Given ${label} When converting strings`, tt => {
            const timestamp = dateToTimestamp(sampleDateString)

            tt.ok(timestamp instanceof TimestampClass, 'Then the converter returns a Firestore timestamp')
            tt.equal(
                timestamp.toDate().toISOString(),
                '2024-01-15T10:30:00.000Z',
                'Then the ISO string is parsed correctly',
            )
            tt.end()
        })

        t.test(`Given ${label} When converting nullish inputs`, tt => {
            tt.equal(dateToTimestamp(null), null, 'Then null stays null')
            tt.equal(dateToTimestamp(undefined), null, 'Then undefined becomes null')
            tt.equal(timestampToDate(null), null, 'Then null stays null when decoding')
            tt.equal(timestampToDate(undefined), null, 'Then undefined becomes null when decoding')
            tt.end()
        })

        t.test(`Given ${label} When decoding timestamps`, tt => {
            const encoded = dateToTimestamp(sampleDate)
            const decoded = timestampToDate(encoded)

            tt.ok(decoded instanceof Date, 'Then a Date is returned')
            tt.equal(decoded.getTime(), sampleDate.getTime(), 'Then the instant is preserved')
            tt.end()
        })

        t.test(`Given ${label} When decoding server placeholders`, tt => {
            const placeholder = makeServerTimestamp()
            const decoded = timestampToDate(placeholder)

            tt.ok(decoded instanceof Date, 'Then the placeholder is converted to a Date')
            tt.ok(decoded.getTime() > 0, 'Then the Date represents a valid time')
            tt.end()
        })

        t.test(`Given ${label} When invalid inputs are provided`, tt => {
            tt.throws(
                () => dateToTimestamp({ invalid: true }),
                /Invalid date format/,
                'Then invalid date objects throw',
            )
            tt.throws(() => dateToTimestamp('not-a-date'), /Invalid date format/, 'Then invalid strings throw')
            tt.throws(
                () => timestampToDate({ invalid: true }),
                /Invalid timestamp format/,
                'Then invalid timestamp objects throw',
            )
            tt.throws(() => timestampToDate('not-a-date'), /Invalid timestamp format/, 'Then invalid strings throw')
            tt.end()
        })

        t.test(`Given ${label} When performing a round-trip conversion`, tt => {
            const encoded = dateToTimestamp(sampleDate)
            const decoded = timestampToDate(encoded)

            tt.equal(decoded.getTime(), sampleDate.getTime(), 'Then round-tripping preserves the instant')
            tt.end()
        })
    })

    t.end()
})
